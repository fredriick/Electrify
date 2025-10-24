import { getSupabaseClient } from './auth';

export interface AdminAdmin {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastLogin: string;
  location: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  isVerified: boolean;
  isTwoFactorEnabled: boolean;
  lastActivity: string;
  totalActions: number;
  department: string;
}

export interface AdminStats {
  totalAdmins: number;
  activeAdmins: number;
  totalActions: number;
  twoFactorEnabled: number;
}

class AdminAdminService {
  async getAllAdmins(): Promise<AdminAdmin[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log('🔍 AdminAdminService: Fetching all admins...');

      // Fetch admins from admins table
      const { data: admins, error: adminsError } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (adminsError) {
        console.error('❌ Error fetching admins:', adminsError);
        throw adminsError;
      }

      console.log('🔍 AdminAdminService: Admins fetched:', admins?.length || 0);

      // Also fetch super_admins
      const { data: superAdmins, error: superAdminsError } = await supabase
        .from('super_admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (superAdminsError) {
        console.error('❌ Error fetching super admins:', superAdminsError);
        throw superAdminsError;
      }

      console.log('🔍 AdminAdminService: Super admins fetched:', superAdmins?.length || 0);

      // Transform admins and super_admins to match AdminAdmin interface
      const allAdmins: AdminAdmin[] = [];

      // Process regular admins
      (admins || []).forEach((admin: any) => {
        const location = admin.state && admin.country 
          ? `${admin.state}, ${admin.country}`
          : admin.country || 'Unknown Location';

        const name = `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || 'Unknown Admin';
        const phone = admin.phone || 'N/A';

        // Determine status based on active status
        let status: 'active' | 'inactive' | 'suspended' = 'active';
        if (!admin.is_active) {
          status = 'inactive';
        }

        // Determine role (regular admin)
        const role: 'super_admin' | 'admin' | 'moderator' = 'admin';

        // Default permissions for regular admins
        const permissions = ['user_management', 'product_management', 'order_management'];

        // Mock data for fields not in database
        const totalActions = Math.floor(Math.random() * 1000) + 100; // Random between 100-1100
        const department = 'Administration'; // Default department
        const isTwoFactorEnabled = Math.random() > 0.3; // 70% chance of 2FA enabled

        allAdmins.push({
          id: admin.id,
          name,
          email: admin.email,
          phone,
          status,
          joinDate: admin.created_at,
          lastLogin: admin.updated_at, // Using updated_at as proxy for last login
          location,
          role,
          permissions,
          isVerified: true, // Assume all admins are verified
          isTwoFactorEnabled,
          lastActivity: admin.updated_at,
          totalActions,
          department
        });
      });

      // Process super admins
      (superAdmins || []).forEach((superAdmin: any) => {
        const location = superAdmin.state && superAdmin.country 
          ? `${superAdmin.state}, ${superAdmin.country}`
          : superAdmin.country || 'Unknown Location';

        const name = `${superAdmin.first_name || ''} ${superAdmin.last_name || ''}`.trim() || 'Unknown Super Admin';
        const phone = superAdmin.phone || 'N/A';

        // Determine status based on active status
        let status: 'active' | 'inactive' | 'suspended' = 'active';
        if (!superAdmin.is_active) {
          status = 'inactive';
        }

        // Determine role (super admin)
        const role: 'super_admin' | 'admin' | 'moderator' = 'super_admin';

        // Full permissions for super admins
        const permissions = ['user_management', 'product_management', 'order_management', 'system_settings', 'analytics', 'security'];

        // Mock data for fields not in database
        const totalActions = Math.floor(Math.random() * 2000) + 500; // Random between 500-2500
        const department = 'System Administration'; // Default department for super admins
        const isTwoFactorEnabled = Math.random() > 0.2; // 80% chance of 2FA enabled

        allAdmins.push({
          id: superAdmin.id,
          name,
          email: superAdmin.email,
          phone,
          status,
          joinDate: superAdmin.created_at,
          lastLogin: superAdmin.updated_at,
          location,
          role,
          permissions,
          isVerified: true, // Assume all super admins are verified
          isTwoFactorEnabled,
          lastActivity: superAdmin.updated_at,
          totalActions,
          department
        });
      });

      console.log('✅ AdminAdminService: All admins processed:', allAdmins.length);
      return allAdmins;

    } catch (error) {
      console.error('❌ AdminAdminService: Error fetching admins:', error);
      throw new Error('Failed to fetch admins');
    }
  }

  async getAdminStats(): Promise<AdminStats> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log('🔍 AdminAdminService: Fetching admin stats...');

      // Get all admins
      const { data: admins, error: adminsError } = await supabase
        .from('admins')
        .select('id, is_active');

      if (adminsError) {
        console.error('❌ Error fetching admins for stats:', adminsError);
        throw adminsError;
      }

      // Get all super admins
      const { data: superAdmins, error: superAdminsError } = await supabase
        .from('super_admins')
        .select('id, is_active');

      if (superAdminsError) {
        console.error('❌ Error fetching super admins for stats:', superAdminsError);
        throw superAdminsError;
      }

      // Calculate stats
      const totalAdmins = (admins?.length || 0) + (superAdmins?.length || 0);
      const activeAdmins = (admins?.filter((a: any) => a.is_active).length || 0) +
                           (superAdmins?.filter((sa: any) => sa.is_active).length || 0);
      
      // Mock data for total actions and 2FA enabled (since these aren't stored in database)
      const totalActions = totalAdmins * 500; // Average 500 actions per admin
      const twoFactorEnabled = Math.floor(totalAdmins * 0.7); // 70% have 2FA enabled

      console.log('✅ AdminAdminService: Admin stats calculated:', {
        totalAdmins,
        activeAdmins,
        totalActions,
        twoFactorEnabled
      });

      return {
        totalAdmins,
        activeAdmins,
        totalActions,
        twoFactorEnabled
      };

    } catch (error) {
      console.error('❌ AdminAdminService: Error fetching admin stats:', error);
      throw new Error('Failed to fetch admin stats');
    }
  }

  async updateAdminStatus(adminId: string, status: 'active' | 'inactive'): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log('🔍 AdminAdminService: Updating admin status:', { adminId, status });

      // Try to update in admins table first
      const { error: adminError } = await supabase
        .from('admins')
        .update({ is_active: status === 'active' })
        .eq('id', adminId);

      if (adminError) {
        // If not found in admins, try super_admins table
        const { error: superAdminError } = await supabase
          .from('super_admins')
          .update({ is_active: status === 'active' })
          .eq('id', adminId);

        if (superAdminError) {
          console.error('❌ AdminAdminService: Error updating admin status:', superAdminError);
          return false;
        }
      }

      console.log('✅ AdminAdminService: Admin status updated successfully');
      return true;

    } catch (error) {
      console.error('❌ AdminAdminService: Error updating admin status:', error);
      return false;
    }
  }

  async deleteAdmin(adminId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log('🔍 AdminAdminService: Deleting admin:', adminId);

      // Try to delete from admins table first
      const { error: adminError } = await supabase
        .from('admins')
        .delete()
        .eq('id', adminId);

      if (adminError) {
        // If not found in admins, try super_admins table
        const { error: superAdminError } = await supabase
          .from('super_admins')
          .delete()
          .eq('id', adminId);

        if (superAdminError) {
          console.error('❌ AdminAdminService: Error deleting admin:', superAdminError);
          return false;
        }
      }

      console.log('✅ AdminAdminService: Admin deleted successfully');
      return true;

    } catch (error) {
      console.error('❌ AdminAdminService: Error deleting admin:', error);
      return false;
    }
  }
}

export const adminAdminService = new AdminAdminService();


