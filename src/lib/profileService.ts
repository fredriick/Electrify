import { getSupabaseClient, getSupabaseSessionClient } from './auth';

/*
 * IMPORTANT: The database function update_notification_preferences needs to be updated
 * to handle all notification fields AND have proper permissions.
 * 
 * Run this SQL to fix the function:
 * 
 * CREATE OR REPLACE FUNCTION update_notification_preferences(
 *     user_id text,
 *     preferences jsonb
 * )
 * RETURNS jsonb
 * LANGUAGE plpgsql
 * SECURITY DEFINER
 * AS $$
 * BEGIN
 *   UPDATE public.suppliers 
 *   SET email_notifications = COALESCE(preferences->>'email_notifications', 'true')::boolean,
 *       sms_notifications = COALESCE(preferences->>'sms_notifications', 'false')::boolean,
 *       push_notifications = COALESCE(preferences->>'push_notifications', 'true')::boolean,
 *       order_updates = COALESCE(preferences->>'order_updates', 'true')::boolean,
 *       product_recommendations = COALESCE(preferences->>'product_recommendations', 'true')::boolean,
 *       price_drops = COALESCE(preferences->>'price_drops', 'false')::boolean,
 *       new_products = COALESCE(preferences->>'new_products', 'true')::boolean,
 *       promotional_emails = COALESCE(preferences->>'promotional_emails', 'false')::boolean,
 *       newsletter = COALESCE(preferences->>'newsletter', 'true')::boolean,
 *       security_alerts = COALESCE(preferences->>'security_alerts', 'true')::boolean,
 *       review_notifications = COALESCE(preferences->>'review_notifications', 'true')::boolean,
 *       updated_at = NOW()
 *   WHERE id = user_id::uuid;
 *   
 *   RETURN preferences;
 * END;
 * $$;
 * 
 * The key change is adding SECURITY DEFINER to bypass RLS policies.
 */

export interface SupplierProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  country?: string;
  state?: string;
  avatar_url?: string;
  account_type: 'individual' | 'company';
  shop_name?: string;
  
  // Individual fields
  individual_first_name?: string;
  individual_last_name?: string;
  individual_phone?: string;
  
  // Company fields
  company_name?: string;
  company_description?: string;
  company_phone?: string;
  company_website?: string;
  company_address?: string;
  contact_person?: string;
  contact_person_phone?: string;
  contact_person_email?: string;
  business_license?: string;
  tax_id?: string;
  business_registration_number?: string;
  business_type?: string;
  industry_category?: string;
  
  // Business document fields
  business_license_document?: string;
  tax_certificate_document?: string;
  
  // Shop logo
  shop_logo?: string;
  
  // Shipping and return fields
  shipping_address?: string;
  shipping_phone?: string;
  shipping_email?: string;
  shipping_method?: string;
  handling_time?: string;
  shipping_zone?: string;
  return_address?: string;
  return_phone?: string;
  return_email?: string;
  
  // Payment fields
  bank_name?: string;
  account_number?: string;
  iban?: string;
  swift_code?: string;
  bank_document?: string;
  
  // Profile document fields
  government_id_document?: string;
  proof_of_address_document?: string;
  
  // Verification and status
  is_verified: boolean;
  is_active: boolean;
  verification_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  
  // Preferences
  notification_preferences?: any; // Keep for backward compatibility during migration
  user_preferences?: any;
  
  // Notification preferences (new column-based approach)
  email_notifications?: boolean;
  sms_notifications?: boolean;
  push_notifications?: boolean;
  order_updates?: boolean;
  product_recommendations?: boolean;
  price_drops?: boolean;
  new_products?: boolean;
  promotional_emails?: boolean;
  newsletter?: boolean;
  security_alerts?: boolean;
  review_notifications?: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ProfileCompletion {
  totalSections: number;
  completedSections: number;
  percentage: number;
  sections: {
    shop: { completed: boolean; status: 'verified' | 'pending' | 'rejected' };
    business: { completed: boolean; status: 'verified' | 'pending' | 'rejected' };
    shipping: { completed: boolean; status: 'verified' | 'pending' | 'rejected' };
    payment: { completed: boolean; status: 'verified' | 'pending' | 'rejected' };
    profile: { completed: boolean; status: 'verified' | 'pending' | 'rejected' };
  };
}

class ProfileService {
  async getSupplierProfile(supplierId: string): Promise<SupplierProfile | null> {
    const supabaseClient = getSupabaseClient();
    
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data: supplier, error } = await supabaseClient
        .from('suppliers')
        .select('*')
        .eq('id', supplierId)
        .single();

      if (error) {
        console.error('ProfileService: Error fetching supplier profile:', error);
        return null;
      }

      
      return supplier;
    } catch (error) {
      console.error('ProfileService: Error fetching supplier profile:', error);
      return null;
    }
  }

  async updateSupplierProfile(supplierId: string, updates: Partial<SupplierProfile>): Promise<{ success: boolean; error?: string }> {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { error } = await supabaseClient
        .from('suppliers')
        .update(updates)
        .eq('id', supplierId);

      if (error) {
        console.error('Error updating supplier profile:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating supplier profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  // New method that accepts a pre-authenticated client
  async updateSupplierProfileWithClient(supplierId: string, updates: Partial<SupplierProfile>, supabaseClient: any): Promise<{ success: boolean; error?: string }> {
    try {
    
      // Check if this is a notification preferences update
      const notificationFields = [
        'email_notifications', 'sms_notifications', 'push_notifications',
        'order_updates', 'product_recommendations', 'price_drops',
        'new_products', 'promotional_emails', 'newsletter',
        'security_alerts', 'review_notifications'
      ];
      
      const isNotificationUpdate = notificationFields.some(field => field in updates);
      
      if (isNotificationUpdate) {
        
        // Convert the updates to the format expected by our function
        const notificationPreferences = {
          email_notifications: updates.email_notifications,
          sms_notifications: updates.sms_notifications,
          push_notifications: updates.push_notifications,
          order_updates: updates.order_updates,
          product_recommendations: updates.product_recommendations,
          price_drops: updates.price_drops,
          new_products: updates.new_products,
          promotional_emails: updates.promotional_emails,
          newsletter: updates.newsletter,
          security_alerts: updates.security_alerts,
          review_notifications: updates.review_notifications
        };
        
        // Filter out undefined values
        const cleanPreferences = Object.fromEntries(
          Object.entries(notificationPreferences).filter(([_, value]) => value !== undefined)
        );
        
        
        // Call our fixed function
        const { data, error } = await supabaseClient.rpc('update_notification_preferences', {
          user_id: supplierId,
          preferences: cleanPreferences
        });
        
        // Debug: Check what the function actually returned
        
        if (error) {
          console.error('❌ ProfileService: Error calling update_notification_preferences:', error);
          return { success: false, error: error.message };
        }
        
        
        // Debug: Check if the function actually updated the database
        const { data: checkData, error: checkError } = await supabaseClient
          .from('suppliers')
          .select('updated_at, email_notifications')
          .eq('id', supplierId)
          .single();
        
        if (checkError) {
          console.error('❌ ProfileService: Error checking database update:', checkError);
        } else {
        }
        
        // Add a small delay to ensure the database transaction is committed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify the update by fetching the updated record
        const fieldsToVerify = Object.keys(cleanPreferences);
        
        // Simple verification query without complex filters
        const { data: verifyData, error: verifyError } = await supabaseClient
          .from('suppliers')
          .select(fieldsToVerify.join(', '))
          .eq('id', supplierId)
          .single();
        
        if (verifyError) {
          console.error('❌ ProfileService: Error verifying notification update:', verifyError);
        } else {
          
          // Check if each field was actually updated
          for (const field of fieldsToVerify) {
            const expectedValue = cleanPreferences[field];
            const actualValue = verifyData[field];
            
            if (expectedValue !== actualValue) {
              console.error(`❌ ProfileService: Notification field ${field} was not updated correctly!`);
              return { success: false, error: `Field ${field} was not updated correctly` };
            }
          }
        }
        
        return { success: true };
      }
    
      // Debug: Log the exact SQL being generated for non-notification updates
      
      const { error } = await supabaseClient
        .from('suppliers')
        .update(updates)
        .eq('id', supplierId);

      if (error) {
        console.error('❌ ProfileService: Error updating supplier profile:', error);
        return { success: false, error: error.message };
      }

      
      // Verify the update by fetching the updated record
      // Select the actual fields that were updated
      const fieldsToVerify = Object.keys(updates);
      
      const { data: verifyData, error: verifyError } = await supabaseClient
        .from('suppliers')
        .select(fieldsToVerify.join(', '))
        .eq('id', supplierId)
        .single();
      
      if (verifyError) {
        console.error('❌ ProfileService: Error verifying update:', verifyError);
      } else {
        
        // Check if each field was actually updated
        for (const field of fieldsToVerify) {
          const expectedValue = updates[field as keyof SupplierProfile];
          const actualValue = verifyData[field];
          
          if (expectedValue !== actualValue) {
            console.error(`❌ ProfileService: Field ${field} was not updated correctly!`);
            return { success: false, error: `Field ${field} was not updated correctly` };
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ ProfileService: Exception updating supplier profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  async uploadShopLogo(supplierId: string, file: File, supabaseClient: any): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'File must be an image' };
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'File size must be less than 5MB' };
      }
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `shop-logo-${supplierId}-${Date.now()}.${fileExt}`;
      const filePath = `shop-logos/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseClient.storage
        .from('shop-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('❌ ProfileService: Error uploading logo:', uploadError);
        return { success: false, error: uploadError.message };
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabaseClient.storage
        .from('shop-logos')
        .getPublicUrl(filePath);
      
      
      // Update profile with logo URL
      const updateResult = await this.updateSupplierProfileWithClient(supplierId, { shop_logo: publicUrl }, supabaseClient);
      
      if (!updateResult.success) {
        // If profile update fails, delete the uploaded file
        await supabaseClient.storage
          .from('shop-logos')
          .remove([filePath]);
        
        return { success: false, error: 'Failed to update profile with logo URL' };
      }
      
      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('❌ ProfileService: Exception uploading shop logo:', error);
      return { success: false, error: 'Failed to upload logo' };
    }
  }

  async uploadBusinessDocument(supplierId: string, file: File, documentType: 'business_license' | 'tax_certificate', supabaseClient: any): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      
      // Validate file type (PDF or image)
      if (!file.type.startsWith('application/pdf') && !file.type.startsWith('image/')) {
        return { success: false, error: 'File must be a PDF or image' };
      }
      
      // Validate file size (max 10MB for documents)
      if (file.size > 10 * 1024 * 1024) {
        return { success: false, error: 'File size must be less than 10MB' };
      }
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentType}-${supplierId}-${Date.now()}.${fileExt}`;
      const filePath = `business-documents/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseClient.storage
        .from('business-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('❌ ProfileService: Error uploading document:', uploadError);
        return { success: false, error: uploadError.message };
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabaseClient.storage
        .from('business-documents')
        .getPublicUrl(filePath);
      
      
      // Update profile with document URL
      const updateField = documentType === 'business_license' ? 'business_license_document' : 'tax_certificate_document';
      const updateResult = await this.updateSupplierProfileWithClient(supplierId, { [updateField]: publicUrl }, supabaseClient);
      
      if (!updateResult.success) {
        // If profile update fails, delete the uploaded file
        await supabaseClient.storage
          .from('business-documents')
          .remove([filePath]);
        
        return { success: false, error: 'Failed to update profile with document URL' };
      }
      
      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('❌ ProfileService: Exception uploading business document:', error);
      return { success: false, error: 'Failed to upload document' };
    }
  }

  calculateProfileCompletion(profile: SupplierProfile): ProfileCompletion {
    const sections = {
      shop: { completed: false, status: 'pending' as 'pending' | 'verified' },
      business: { completed: false, status: 'pending' as 'pending' | 'verified' },
      shipping: { completed: false, status: 'pending' as 'pending' | 'verified' },
      payment: { completed: false, status: 'pending' as 'pending' | 'verified' },
      profile: { completed: false, status: 'pending' as 'pending' | 'verified' }
    };

    // Shop Information
    if (profile.shop_name && profile.email && profile.phone) {
      sections.shop.completed = true;
      sections.shop.status = profile.is_verified ? 'verified' : 'pending';
    }

    // Business Information
    if (profile.account_type === 'company') {
      if (profile.company_name && profile.business_license && profile.tax_id) {
        sections.business.completed = true;
        // For company accounts, check if required documents are uploaded
        if (profile.business_license_document && profile.tax_certificate_document) {
          sections.business.status = profile.is_verified ? 'verified' : 'pending';
        } else {
          // Documents not uploaded, should be pending
          sections.business.status = 'pending';
        }
      }
    } else {
      if (profile.individual_first_name && profile.individual_last_name && profile.individual_phone) {
        sections.business.completed = true;
        sections.business.status = profile.is_verified ? 'verified' : 'pending';
      }
    }

    // Shipping Information (using company address as shipping address)
    if (profile.company_address || (profile.country && profile.state)) {
      sections.shipping.completed = true;
      sections.shipping.status = 'pending';
    }

    // Payment Information (check if payment info exists)
    if ((profile as any).payment_info && Object.keys((profile as any).payment_info).length > 0) {
      sections.payment.completed = true;
      sections.payment.status = 'pending';
    }

    // Profile Information
    if (profile.first_name && profile.last_name && profile.phone && profile.avatar_url) {
      sections.profile.completed = true;
      sections.profile.status = profile.is_verified ? 'verified' : 'pending';
    }

    const completedSections = Object.values(sections).filter(section => section.completed).length;
    const totalSections = Object.keys(sections).length;
    const percentage = Math.round((completedSections / totalSections) * 100);

    return {
      totalSections,
      completedSections,
      percentage,
      sections
    };
  }

  getSellerType(profile: SupplierProfile): 'individual' | 'company' {
    return profile.account_type || 'individual';
  }

  getSellerTypeLabel(profile: SupplierProfile): string {
    return profile.account_type === 'company' ? 'Company Seller' : 'Individual Seller';
  }

  getShopName(profile: SupplierProfile): string {
    return profile.shop_name || profile.company_name || 'My Shop';
  }

  getBusinessName(profile: SupplierProfile): string {
    if (profile.account_type === 'company') {
      return profile.company_name || 'Unnamed Company';
    } else {
      return `${profile.individual_first_name || ''} ${profile.individual_last_name || ''}`.trim() || 'Individual Seller';
    }
  }

  getContactInfo(profile: SupplierProfile): {
    email: string;
    phone: string;
    website?: string;
  } {
    return {
      email: profile.email,
      phone: profile.phone || profile.individual_phone || profile.company_phone || '',
      website: profile.company_website
    };
  }

  getBusinessInfo(profile: SupplierProfile): {
    name: string;
    type: string;
    license: string;
    taxId: string;
    address: string;
  } {
    if (profile.account_type === 'company') {
      return {
        name: profile.company_name || '',
        type: profile.business_type || 'Corporation',
        license: profile.business_license || '',
        taxId: profile.tax_id || '',
        address: profile.company_address || ''
      };
    } else {
      return {
        name: `${profile.individual_first_name || ''} ${profile.individual_last_name || ''}`.trim(),
        type: 'Individual',
        license: 'N/A',
        taxId: 'N/A',
        address: `${profile.country || ''}, ${profile.state || ''}`.trim()
      };
    }
  }

  getShippingInfo(profile: SupplierProfile): {
    address: string;
    phone: string;
    email: string;
  } {
    return {
      address: profile.company_address || `${profile.country || ''}, ${profile.state || ''}`.trim(),
      phone: profile.company_phone || profile.individual_phone || profile.phone || '',
      email: profile.contact_person_email || profile.email
    };
  }

  getPaymentInfo(profile: SupplierProfile): any {
    return (profile as any).payment_info || {};
  }

  // Helper function to format verification status
  getVerificationStatusLabel(status: string): string {
    switch (status) {
      case 'approved':
        return 'Verified';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      case 'suspended':
        return 'Suspended';
      default:
        return 'Pending';
    }
  }

  // Helper function to get verification status color
  getVerificationStatusColor(status: string): string {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'suspended':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  async uploadBankDocument(supplierId: string, file: File, supabaseClient: any): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      
      // Validate file type (PDF or image)
      if (!file.type.startsWith('application/pdf') && !file.type.startsWith('image/')) {
        return { success: false, error: 'File must be a PDF or image' };
      }
      
      // Validate file size (max 10MB for documents)
      if (file.size > 10 * 1024 * 1024) {
        return { success: false, error: 'File size must be less than 10MB' };
      }
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `bank-document-${supplierId}-${Date.now()}.${fileExt}`;
      const filePath = `business-documents/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseClient.storage
        .from('business-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('❌ ProfileService: Error uploading bank document:', uploadError);
        return { success: false, error: uploadError.message };
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabaseClient.storage
        .from('business-documents')
        .getPublicUrl(filePath);
      
      
      // Update profile with document URL
      const updateResult = await this.updateSupplierProfileWithClient(supplierId, { bank_document: publicUrl }, supabaseClient);
      
      if (!updateResult.success) {
        // If profile update fails, delete the uploaded file
        await supabaseClient.storage
          .from('business-documents')
          .remove([filePath]);
        
        return { success: false, error: 'Failed to update profile with bank document URL' };
      }
      
      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('❌ ProfileService: Exception uploading bank document:', error);
      return { success: false, error: 'Failed to upload bank document' };
    }
  }

  async uploadProfileDocument(supplierId: string, file: File, documentType: 'government_id' | 'proof_of_address', supabaseClient: any): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      
      // Debug - Authentication Context

      // Check if we can get the current user from the client
      try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
      } catch (authError) {
      }
      
      // Validate file type (PDF or image)
      if (!file.type.startsWith('application/pdf') && !file.type.startsWith('image/')) {
        return { success: false, error: 'File must be a PDF or image' };
      }
      
      // Validate file size (max 10MB for documents)
      if (file.size > 10 * 1024 * 1024) {
        return { success: false, error: 'File size must be less than 10MB' };
      }
      
      // Generate unique filename with correct folder structure for RLS policy
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentType}-${Date.now()}.${fileExt}`;
      const filePath = `profile-documents/${supplierId}/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseClient.storage
        .from('profile-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('❌ ProfileService: Error uploading profile document:', uploadError);
        return { success: false, error: uploadError.message };
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabaseClient.storage
        .from('profile-documents')
        .getPublicUrl(filePath);
      
      
      // Return success with URL - let the calling function handle database update
      // This matches the business document upload pattern
      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('❌ ProfileService: Exception uploading profile document:', error);
      return { success: false, error: 'Failed to upload profile document' };
    }
  }

  async uploadAvatar(supplierId: string, file: File, supabaseClient: any): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      
      // Validate file type (image only)
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'File must be an image' };
      }
      
      // Validate file size (max 5MB for avatar)
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'File size must be less than 5MB' };
      }
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${supplierId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Debug - File path construction
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseClient.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('❌ ProfileService: Error uploading avatar:', uploadError);
        return { success: false, error: uploadError.message };
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabaseClient.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      
      // Update profile with avatar URL
      const updateResult = await this.updateSupplierProfileWithClient(supplierId, { avatar_url: publicUrl }, supabaseClient);
      
      if (!updateResult.success) {
        // If profile update fails, delete the uploaded file
        await supabaseClient.storage
          .from('avatars')
          .remove([filePath]);
        
        return { success: false, error: 'Failed to update profile with avatar URL' };
      }
      
      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('❌ ProfileService: Exception uploading avatar:', error);
      return { success: false, error: 'Failed to upload avatar' };
    }
  }
}

export const profileService = new ProfileService(); 