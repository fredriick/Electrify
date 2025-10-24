import { getSupabaseClient, supabase } from '@/lib/auth';

export interface ProductApprovalUpdate {
  productId: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  adminNotes?: string;
  rejectionReason?: string;
}

export interface ProductApprovalResult {
  success: boolean;
  message: string;
  error?: string;
}

// Helper function to get authenticated client
const getAuthenticatedClient = async () => {
  console.log('🔍 getAuthenticatedClient: Starting authentication check...')
  
  // First try to get the authenticated client
  let client = getSupabaseClient()
  
  if (client) {
    console.log('✅ Found getSupabaseClient() instance')
    
    // Check if this client has a valid session
    const { data: { session }, error: sessionError } = await client.auth.getSession()
    console.log('📋 Session check result:', { session: !!session, error: sessionError })
    
    if (session?.user) {
      console.log('✅ Using authenticated client with user:', session.user.id)
      
      // Check if user is an admin
      const { data: adminCheck, error: adminError } = await client
        .from('admins')
        .select('id')
        .eq('id', session.user.id)
        .single()
      
      if (adminCheck || adminError?.code === 'PGRST116') {
        console.log('✅ User is admin, using admin client')
        // For admin users, we'll use a special approach
        return { client, isAdmin: true }
      }
      
      // Check if user is a super admin
      const { data: superAdminCheck, error: superAdminError } = await client
        .from('super_admins')
        .select('id')
        .eq('id', session.user.id)
        .single()
      
      if (superAdminCheck || superAdminError?.code === 'PGRST116') {
        console.log('✅ User is super admin, using admin client')
        // For super admin users, we'll use a special approach
        return { client, isAdmin: true }
      }
      
      return { client, isAdmin: false }
    } else {
      console.log('❌ Session exists but no user:', session)
      
      // Try to refresh the session
      console.log('🔄 Attempting to refresh session...')
      const { data: { session: refreshedSession }, error: refreshError } = await client.auth.refreshSession()
      console.log('📋 Session refresh result:', { session: !!refreshedSession, error: refreshError })
      
      if (refreshedSession?.user) {
        console.log('✅ Session refreshed successfully, user:', refreshedSession.user.id)
        
        // Check if refreshed user is an admin
        const { data: adminCheck, error: adminError } = await client
          .from('admins')
          .select('id')
          .eq('id', refreshedSession.user.id)
          .single()
        
        if (adminCheck || adminError?.code === 'PGRST116') {
          console.log('✅ Refreshed user is admin, using admin client')
          return { client, isAdmin: true }
        }
        
        // Check if refreshed user is a super admin
        const { data: superAdminCheck, error: superAdminError } = await client
          .from('super_admins')
          .select('id')
          .eq('id', refreshedSession.user.id)
          .single()
        
        if (superAdminCheck || superAdminError?.code === 'PGRST116') {
          console.log('✅ Refreshed user is super admin, using admin client')
          return { client, isAdmin: true }
        }
        
        return { client, isAdmin: false }
      }
    }
  }
  
  // If we get here, try using the static supabase client
  console.log('🔄 Trying static supabase client...')
  const { data: { session }, error: staticSessionError } = await supabase.auth.getSession()
  console.log('📋 Static client session check:', { session: !!session, error: staticSessionError })
  
  if (session?.user) {
    console.log('✅ Static client has valid session, user:', session.user.id)
    
    // Check if user is an admin
    const { data: adminCheck, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('id', session.user.id)
      .single()
    
    if (adminCheck || adminError?.code === 'PGRST116') {
      console.log('✅ Static client user is admin, using admin client')
      return { client: supabase, isAdmin: true }
    }
    
    // Check if user is a super admin
    const { data: superAdminCheck, error: superAdminError } = await supabase
      .from('super_admins')
      .select('id')
      .eq('id', session.user.id)
      .single()
    
    if (superAdminCheck || superAdminError?.code === 'PGRST116') {
      console.log('✅ Static client user is super admin, using admin client')
      return { client: supabase, isAdmin: true }
    }
    
    return { client: supabase, isAdmin: false }
  }
  
  // Try to refresh the static client session
  console.log('🔄 Attempting to refresh static client session...')
  const { data: { session: refreshedStaticSession }, error: refreshStaticError } = await supabase.auth.refreshSession()
  console.log('📋 Static client session refresh result:', { session: !!refreshedStaticSession, error: refreshStaticError })
  
  if (refreshedStaticSession?.user) {
    console.log('✅ Static client session refreshed successfully, user:', refreshedStaticSession.user.id)
    
    // Check if refreshed user is an admin
    const { data: adminCheck, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('id', refreshedStaticSession.user.id)
      .single()
    
    if (adminCheck || adminError?.code === 'PGRST116') {
      console.log('✅ Refreshed static client user is admin, using admin client')
      return { client: supabase, isAdmin: true }
    }
    
    // Check if refreshed user is a super admin
    const { data: superAdminCheck, error: superAdminError } = await supabase
      .from('super_admins')
      .select('id')
      .eq('id', refreshedStaticSession.user.id)
      .single()
    
    if (superAdminCheck || superAdminError?.code === 'PGRST116') {
      console.log('✅ Refreshed static client user is super admin, using admin client')
      return { client: supabase, isAdmin: true }
    }
    
    return { client: supabase, isAdmin: false }
  }
  
  console.log('⚠️ No authenticated client available, using static client (this will likely fail RLS)')
  return { client: supabase, isAdmin: false }
}

export class ProductApprovalService {

  /**
   * Update product approval status
   * 
   * This function automatically manages the is_active field based on approval status:
   * - pending: is_active = false (default, hidden from home page)
   * - under_review: is_active = false (hidden during review)
   * - approved: is_active = true (automatically activated, visible on home page)
   * - rejected: is_active = false (hidden from home page)
   * 
   * This ensures that only approved AND active products appear on the home page,
   * maintaining the proper workflow: pending → review → approved (active) or rejected (inactive)
   */
  async updateProductApproval(update: ProductApprovalUpdate): Promise<ProductApprovalResult> {
    try {
      console.log('🔄 Starting product approval update:', update);
      
      // Get authenticated client
      const authResult = await getAuthenticatedClient();
      if (!authResult?.client) {
        console.error('❌ No authenticated client available');
        return {
          success: false,
          message: 'Authentication failed',
          error: 'No authenticated client available'
        };
      }
      
      const supabaseClient = authResult.client;
      const isAdmin = authResult.isAdmin;
      
      const updateData: any = {
        approval_status: update.status,
        updated_at: new Date().toISOString()
      };

      // Add admin notes if provided
      if (update.adminNotes) {
        updateData.admin_notes = update.adminNotes;
      }

      // Add rejection reason if rejecting
      if (update.status === 'rejected' && update.rejectionReason) {
        updateData.rejection_reason = update.rejectionReason;
        updateData.rejected_at = new Date().toISOString();
      }

      // Add approval metadata
      if (update.status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        // Automatically activate approved products so they show on the home page
        updateData.is_active = true;
        // Also set the boolean is_approved field for home page filtering
        updateData.is_approved = true;
        console.log('✅ Setting is_active = true and is_approved = true for approved product');
      }

      // Deactivate rejected products
      if (update.status === 'rejected') {
        updateData.is_active = false;
        updateData.is_approved = false;
        console.log('❌ Setting is_active = false and is_approved = false for rejected product');
      }

      // Keep products inactive during review
      if (update.status === 'under_review') {
        updateData.is_active = false;
        updateData.is_approved = false;
        console.log('⏳ Setting is_active = false and is_approved = false for product under review');
      }

      // Get current user for reviewed_by
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        updateData.reviewed_by = user.id;
        console.log('👤 Current user ID:', user.id);
      } else {
        console.log('⚠️ No current user found');
      }

      console.log('📝 Update data:', updateData);
      console.log('🎯 Product ID to update:', update.productId);

      const { data, error } = await supabaseClient
        .from('products')
        .update(updateData)
        .eq('id', update.productId)
        .select();

      console.log('📊 Update response - data:', data);
      console.log('📊 Update response - error:', error);

      if (error) {
        console.error('❌ Error updating product approval status:', error);
        return {
          success: false,
          message: 'Failed to update product approval status',
          error: error.message
        };
      }

      console.log('✅ Product approval update successful');
      return {
        success: true,
        message: `Product ${update.status} successfully`
      };
    } catch (error) {
      console.error('❌ Error in updateProductApproval:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get products pending approval
   */
  async getPendingProducts() {
    try {
      const authResult = await getAuthenticatedClient();
      if (!authResult?.client) {
        console.error('❌ No authenticated client available');
        return [];
      }
      
      const supabaseClient = authResult.client;
      
      const { data, error } = await supabaseClient
        .from('products')
        .select(`
          *,
          suppliers(
            id,
            shop_name,
            company_name
          )
        `)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending products:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getPendingProducts:', error);
      throw error;
    }
  }

  /**
   * Get products by approval status
   */
  async getProductsByStatus(status: 'pending' | 'under_review' | 'approved' | 'rejected') {
    try {
      const authResult = await getAuthenticatedClient();
      if (!authResult?.client) {
        console.error('❌ No authenticated client available');
        return [];
      }
      
      const supabaseClient = authResult.client;
      
      const { data, error } = await supabaseClient
        .from('products')
        .select(`
          *,
          suppliers(
            id,
            shop_name,
            company_name
          )
        `)
        .eq('approval_status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching ${status} products:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error in getProductsByStatus(${status}):`, error);
      throw error;
    }
  }

  /**
   * Get all products with approval status
   */
  async getAllProductsWithApprovalStatus() {
    try {
      const authResult = await getAuthenticatedClient();
      if (!authResult?.client) {
        console.error('❌ No authenticated client available');
        return [];
      }
      
      const supabaseClient = authResult.client;
      
      const { data, error } = await supabaseClient
        .from('products')
        .select(`
          *,
          suppliers(
            id,
            shop_name,
            company_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all products:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getAllProductsWithApprovalStatus:', error);
      throw error;
    }
  }

  /**
   * Fix inconsistent product approval states
   * This function can be used to fix existing products that have inconsistent
   * approval_status, is_active, and is_approved values
   */
  async fixInconsistentProducts(): Promise<ProductApprovalResult> {
    try {
      console.log('🔧 Starting to fix inconsistent product approval states...');
      
      const authResult = await getAuthenticatedClient();
      if (!authResult?.client || !authResult.isAdmin) {
        console.error('❌ Admin access required to fix inconsistent products');
        return {
          success: false,
          message: 'Admin access required',
          error: 'Insufficient permissions'
        };
      }
      
      const supabaseClient = authResult.client;
      
      // Fix approved products that are inactive
      const { data: approvedInactive, error: approvedError } = await supabaseClient
        .from('products')
        .update({ 
          is_active: true,
          is_approved: true 
        })
        .eq('approval_status', 'approved')
        .eq('is_active', false)
        .select('id, name');
      
      if (approvedError) {
        console.error('❌ Error fixing approved inactive products:', approvedError);
      } else {
        console.log('✅ Fixed approved inactive products:', approvedInactive);
      }
      
      // Fix rejected/under_review products that are active
      const { data: rejectedActive, error: rejectedError } = await supabaseClient
        .from('products')
        .update({ 
          is_active: false,
          is_approved: false 
        })
        .in('approval_status', ['rejected', 'under_review'])
        .eq('is_active', true)
        .select('id, name');
      
      if (rejectedError) {
        console.error('❌ Error fixing rejected/under_review active products:', rejectedError);
      } else {
        console.log('✅ Fixed rejected/under_review active products:', rejectedActive);
      }
      
      console.log('🔧 Finished fixing inconsistent product approval states');
      return {
        success: true,
        message: 'Inconsistent product approval states fixed successfully'
      };
      
    } catch (error) {
      console.error('❌ Error in fixInconsistentProducts:', error);
      return {
        success: false,
        message: 'Failed to fix inconsistent products',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Fix specific issue: products with approval_status = 'approved' but is_approved = false
   * This targets the exact issue where products are approved but the boolean flag is wrong
   */
  async fixApprovedProductsBooleanFlag(): Promise<ProductApprovalResult> {
    try {
      console.log('🔧 Starting to fix approved products with wrong boolean flag...');
      
      const authResult = await getAuthenticatedClient();
      if (!authResult?.client || !authResult.isAdmin) {
        console.error('❌ Admin access required to fix approved products boolean flag');
        return {
          success: false,
          message: 'Admin access required',
          error: 'Insufficient permissions'
        };
      }
      
      const supabaseClient = authResult.client;
      
      // Find products with approval_status = 'approved' but is_approved = false
      const { data: inconsistentApproved, error: findError } = await supabaseClient
        .from('products')
        .select('id, name, approval_status, is_approved, is_active')
        .eq('approval_status', 'approved')
        .eq('is_approved', false);
      
      if (findError) {
        console.error('❌ Error finding inconsistent approved products:', findError);
        return {
          success: false,
          message: 'Failed to find inconsistent approved products',
          error: findError.message
        };
      }
      
      if (!inconsistentApproved || inconsistentApproved.length === 0) {
        console.log('✅ No products with approval_status = approved but is_approved = false found');
        return {
          success: true,
          message: 'No inconsistent approved products found - all are already correct!'
        };
      }
      
      console.log('🔍 Found inconsistent approved products:', inconsistentApproved);
      
      // Fix these products by setting is_approved = true and is_active = true
      const { data: fixedProducts, error: updateError } = await supabaseClient
        .from('products')
        .update({ 
          is_approved: true,
          is_active: true 
        })
        .eq('approval_status', 'approved')
        .eq('is_approved', false)
        .select('id, name');
      
      if (updateError) {
        console.error('❌ Error fixing approved products boolean flag:', updateError);
        return {
          success: false,
          message: 'Failed to fix approved products boolean flag',
          error: updateError.message
        };
      }
      
      console.log('✅ Successfully fixed approved products boolean flag:', fixedProducts);
      return {
        success: true,
        message: `Fixed ${fixedProducts?.length || 0} approved products with wrong boolean flag`
      };
      
    } catch (error) {
      console.error('❌ Error in fixApprovedProductsBooleanFlag:', error);
      return {
        success: false,
        message: 'Failed to fix approved products boolean flag',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const productApprovalService = new ProductApprovalService();
