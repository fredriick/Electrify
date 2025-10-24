import { getSupabaseClient } from './auth';

export interface BaseUserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerProfile extends BaseUserProfile {
  country?: string;
  state?: string;
  notification_preferences?: any;
  user_preferences?: any;
}

export interface SupplierProfile extends BaseUserProfile {
  country?: string;
  state?: string;
  account_type?: 'individual' | 'company';
  
  // Individual seller fields
  individual_first_name?: string;
  individual_last_name?: string;
  individual_phone?: string;
  
  // Company seller fields
  company_name?: string;
  company_description?: string;
  company_phone?: string;
  company_website?: string;
  company_address?: string;
  contact_person?: string;
  contact_person_phone?: string;
  contact_person_email?: string;
  
  // Business verification fields
  business_license?: string;
  tax_id?: string;
  business_registration_number?: string;
  business_type?: string;
  industry_category?: string;
  
  // Payment and financial fields
  payment_info?: any;
  bank_account_info?: any;
  
  // Verification and status
  verification_status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  verification_documents?: any;
  
  // Preferences
  notification_preferences?: any;
  user_preferences?: any;
}

export interface AdminProfile extends BaseUserProfile {
  permissions?: any;
}

export interface SuperAdminProfile extends BaseUserProfile {
  system_permissions?: any;
}

export type UserProfile = CustomerProfile | SupplierProfile | AdminProfile | SuperAdminProfile;

class UserService {
  /**
   * Get user profile based on their role
   */
  async getUserProfile(userId: string, role: string): Promise<UserProfile | null> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.error('Supabase client not initialized');
        return null;
      }

      let tableName: string;
      
      switch (role) {
        case 'CUSTOMER':
          tableName = 'customers';
          break;
        case 'SUPPLIER':
          tableName = 'suppliers';
          break;
        case 'ADMIN':
          tableName = 'admins';
          break;
        case 'SUPER_ADMIN':
          tableName = 'super_admins';
          break;
        default:
          throw new Error(`Unknown role: ${role}`);
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error(`Error fetching ${tableName} profile:`, error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  /**
   * Update user profile based on their role
   */
  async updateUserProfile(userId: string, role: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.error('Supabase client not initialized');
        return false;
      }

      let tableName: string;
      
      switch (role) {
        case 'CUSTOMER':
          tableName = 'customers';
          break;
        case 'SUPPLIER':
          tableName = 'suppliers';
          break;
        case 'ADMIN':
          tableName = 'admins';
          break;
        case 'SUPER_ADMIN':
          tableName = 'super_admins';
          break;
        default:
          throw new Error(`Unknown role: ${role}`);
      }

      const { error } = await supabase
        .from(tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error(`Error updating ${tableName} profile:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return false;
    }
  }

  /**
   * Create user profile based on their role
   */
  async createUserProfile(userId: string, role: string, profileData: Partial<UserProfile>): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.error('Supabase client not initialized');
        return false;
      }

      let tableName: string;
      
      switch (role) {
        case 'CUSTOMER':
          tableName = 'customers';
          break;
        case 'SUPPLIER':
          tableName = 'suppliers';
          break;
        case 'ADMIN':
          tableName = 'admins';
          break;
        case 'SUPER_ADMIN':
          tableName = 'super_admins';
          break;
        default:
          throw new Error(`Unknown role: ${role}`);
      }

      const { error } = await supabase
        .from(tableName)
        .insert({
          id: userId,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error(`Error creating ${tableName} profile:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      return false;
    }
  }

  /**
   * Get display name for user
   */
  getDisplayName(profile: UserProfile | null): string {
    if (!profile) return 'User';
    
    // Handle supplier profiles with account type
    if ('account_type' in profile && profile.account_type) {
      if (profile.account_type === 'company' && profile.company_name) {
        return profile.company_name;
      } else if (profile.account_type === 'individual') {
        if (profile.individual_first_name && profile.individual_last_name) {
          return `${profile.individual_first_name} ${profile.individual_last_name}`;
        }
        if (profile.individual_first_name) {
          return profile.individual_first_name;
        }
        if (profile.individual_last_name) {
          return profile.individual_last_name;
        }
      }
    }
    
    // Fallback to regular profile fields
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    
    if (profile.first_name) {
      return profile.first_name;
    }
    
    if (profile.last_name) {
      return profile.last_name;
    }
    
    return profile.email || 'User';
  }

  /**
   * Check if user is verified
   */
  isUserVerified(profile: UserProfile | null): boolean {
    return profile?.is_verified || false;
  }

  /**
   * Check if user is active
   */
  isUserActive(profile: UserProfile | null): boolean {
    return profile?.is_active || false;
  }
}

export const userService = new UserService(); 