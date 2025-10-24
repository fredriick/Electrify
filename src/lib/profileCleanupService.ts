import { getSupabaseClient } from './auth';

export interface ProfileCleanupResult {
  success: boolean;
  message: string;
  deletedProfile?: {
    table: string;
    email: string;
    id: string;
  };
}

class ProfileCleanupService {
  /**
   * Clean up incorrect customer profile for a user who should be a supplier
   * This is useful when a user was accidentally created as a customer instead of a supplier
   */
  async cleanupIncorrectCustomerProfile(userId: string, userEmail: string): Promise<ProfileCleanupResult> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        success: false,
        message: 'Supabase client not initialized'
      };
    }

    try {
      console.log('🧹 ProfileCleanupService: Starting cleanup for user:', userId, userEmail);

      // Check if customer profile exists
      const { data: customerProfile, error: customerError } = await supabase
        .from('customers')
        .select('id, email')
        .eq('id', userId)
        .single();

      if (customerProfile && !customerError) {
        console.log('🧹 Found customer profile to delete:', customerProfile);

        // Delete the customer profile
        const { error: deleteError } = await supabase
          .from('customers')
          .delete()
          .eq('id', userId);

        if (deleteError) {
          console.error('❌ Error deleting customer profile:', deleteError);
          return {
            success: false,
            message: `Failed to delete customer profile: ${deleteError.message}`
          };
        }

        console.log('✅ Successfully deleted customer profile');
        return {
          success: true,
          message: 'Customer profile deleted successfully',
          deletedProfile: {
            table: 'customers',
            email: customerProfile.email,
            id: customerProfile.id
          }
        };
      } else if (customerError && customerError.code === 'PGRST116') {
        // No customer profile found
        console.log('ℹ️ No customer profile found for user');
        return {
          success: true,
          message: 'No customer profile found to delete'
        };
      } else {
        console.error('❌ Error checking customer profile:', customerError);
        return {
          success: false,
          message: `Error checking customer profile: ${customerError?.message || 'Unknown error'}`
        };
      }
    } catch (error) {
      console.error('❌ ProfileCleanupService: Unexpected error:', error);
      return {
        success: false,
        message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Check for profile conflicts across all role tables
   */
  async checkProfileConflicts(userId: string): Promise<{
    conflicts: Array<{ table: string; data: any }>;
    hasConflicts: boolean;
  }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { conflicts: [], hasConflicts: false };
    }

    const conflicts: Array<{ table: string; data: any }> = [];

    try {
      // Check all role tables
      const tables = ['customers', 'suppliers', 'admins', 'super_admins'];
      
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('id, email')
          .eq('id', userId)
          .single();

        if (data && !error) {
          conflicts.push({ table, data });
        }
      }

      return {
        conflicts,
        hasConflicts: conflicts.length > 0
      };
    } catch (error) {
      console.error('❌ Error checking profile conflicts:', error);
      return { conflicts: [], hasConflicts: false };
    }
  }
}

export const profileCleanupService = new ProfileCleanupService();


