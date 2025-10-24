import { getSupabaseClient } from './auth';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'supplier' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  joinDate: string;
  lastLogin: string;
  avatar?: string;
  phone?: string;
  company?: string;
  orders?: number;
  products?: number;
  isVerified?: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingApproval: number;
  suspended: number;
}

class AdminUserService {
  async getAllUsers(): Promise<AdminUser[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log('🔍 AdminUserService: Fetching all users...');

      // Fetch users from all role-specific tables
      const [customersResult, suppliersResult, adminsResult, superAdminsResult] = await Promise.all([
        supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('suppliers')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('admins')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('super_admins')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      console.log('🔍 AdminUserService: Query results:', {
        customers: customersResult.data?.length || 0,
        suppliers: suppliersResult.data?.length || 0,
        admins: adminsResult.data?.length || 0,
        superAdmins: superAdminsResult.data?.length || 0
      });

      // Transform customers
      const customers: AdminUser[] = (customersResult.data || []).map((customer: any) => ({
        id: customer.id,
        name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown Customer',
        email: customer.email,
        role: 'customer' as const,
        status: customer.is_active ? 'active' : 'inactive',
        joinDate: customer.created_at,
        lastLogin: customer.updated_at, // Using updated_at as proxy for last login
        avatar: customer.avatar_url,
        phone: customer.phone,
        isVerified: customer.is_verified
      }));

      // Transform suppliers
      const suppliers: AdminUser[] = (suppliersResult.data || []).map((supplier: any) => ({
        id: supplier.id,
        name: supplier.account_type === 'company' 
          ? supplier.company_name || `${supplier.first_name || ''} ${supplier.last_name || ''}`.trim() || 'Unknown Supplier'
          : `${supplier.first_name || ''} ${supplier.last_name || ''}`.trim() || 'Unknown Supplier',
        email: supplier.email,
        role: 'supplier' as const,
        status: supplier.is_active ? 'active' : 'inactive',
        joinDate: supplier.created_at,
        lastLogin: supplier.updated_at, // Using updated_at as proxy for last login
        avatar: supplier.avatar_url,
        phone: supplier.account_type === 'company' ? supplier.company_phone : supplier.individual_phone,
        company: supplier.account_type === 'company' ? supplier.company_name : undefined,
        isVerified: supplier.is_verified
      }));

      // Transform admins
      const admins: AdminUser[] = (adminsResult.data || []).map((admin: any) => ({
        id: admin.id,
        name: `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || 'Unknown Admin',
        email: admin.email,
        role: 'admin' as const,
        status: admin.is_active ? 'active' : 'inactive',
        joinDate: admin.created_at,
        lastLogin: admin.updated_at, // Using updated_at as proxy for last login
        avatar: admin.avatar_url,
        phone: admin.phone,
        isVerified: admin.is_verified
      }));

      // Transform super admins
      const superAdmins: AdminUser[] = (superAdminsResult.data || []).map((superAdmin: any) => ({
        id: superAdmin.id,
        name: `${superAdmin.first_name || ''} ${superAdmin.last_name || ''}`.trim() || 'Unknown Super Admin',
        email: superAdmin.email,
        role: 'super_admin' as const,
        status: superAdmin.is_active ? 'active' : 'inactive',
        joinDate: superAdmin.created_at,
        lastLogin: superAdmin.updated_at, // Using updated_at as proxy for last login
        avatar: superAdmin.avatar_url,
        phone: superAdmin.phone,
        isVerified: superAdmin.is_verified
      }));

      // Combine all users
      const allUsers = [...customers, ...suppliers, ...admins, ...superAdmins];

      console.log('✅ AdminUserService: Total users fetched:', allUsers.length);
      return allUsers;

    } catch (error) {
      console.error('❌ AdminUserService: Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async getUserStats(): Promise<UserStats> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log('🔍 AdminUserService: Fetching user stats...');

      // Get counts from all role-specific tables
      const [customersResult, suppliersResult, adminsResult, superAdminsResult] = await Promise.all([
        supabase
          .from('customers')
          .select('id, is_active, is_verified')
          .order('created_at', { ascending: false }),
        supabase
          .from('suppliers')
          .select('id, is_active, is_verified, verification_status')
          .order('created_at', { ascending: false }),
        supabase
          .from('admins')
          .select('id, is_active, is_verified')
          .order('created_at', { ascending: false }),
        supabase
          .from('super_admins')
          .select('id, is_active, is_verified')
          .order('created_at', { ascending: false })
      ]);

      // Calculate stats
      const allUsers = [
        ...(customersResult.data || []),
        ...(suppliersResult.data || []),
        ...(adminsResult.data || []),
        ...(superAdminsResult.data || [])
      ];

      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter(user => user.is_active).length;
      const pendingApproval = allUsers.filter(user => !user.is_verified).length;
      const suspended = allUsers.filter(user => !user.is_active).length;

      console.log('✅ AdminUserService: User stats calculated:', {
        totalUsers,
        activeUsers,
        pendingApproval,
        suspended
      });

      return {
        totalUsers,
        activeUsers,
        pendingApproval,
        suspended
      };

    } catch (error) {
      console.error('❌ AdminUserService: Error fetching user stats:', error);
      throw new Error('Failed to fetch user stats');
    }
  }

  async updateUserStatus(userId: string, role: string, status: 'active' | 'inactive'): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log('🔍 AdminUserService: Updating user status:', { userId, role, status });

      let tableName = '';
      switch (role) {
        case 'customer':
          tableName = 'customers';
          break;
        case 'supplier':
          tableName = 'suppliers';
          break;
        case 'admin':
          tableName = 'admins';
          break;
        case 'super_admin':
          tableName = 'super_admins';
          break;
        default:
          throw new Error('Invalid role');
      }

      const { error } = await supabase
        .from(tableName)
        .update({ is_active: status === 'active' })
        .eq('id', userId);

      if (error) {
        console.error('❌ AdminUserService: Error updating user status:', error);
        return false;
      }

      console.log('✅ AdminUserService: User status updated successfully');
      return true;

    } catch (error) {
      console.error('❌ AdminUserService: Error updating user status:', error);
      return false;
    }
  }

  async deleteUser(userId: string, role: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log('🔍 AdminUserService: Deleting user:', { userId, role });

      // Delete from role-specific table (this will cascade to users table)
      let tableName = '';
      switch (role) {
        case 'customer':
          tableName = 'customers';
          break;
        case 'supplier':
          tableName = 'suppliers';
          break;
        case 'admin':
          tableName = 'admins';
          break;
        case 'super_admin':
          tableName = 'super_admins';
          break;
        default:
          throw new Error('Invalid role');
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('❌ AdminUserService: Error deleting user:', error);
        return false;
      }

      console.log('✅ AdminUserService: User deleted successfully');
      return true;

    } catch (error) {
      console.error('❌ AdminUserService: Error deleting user:', error);
      return false;
    }
  }
}

export const adminUserService = new AdminUserService();


