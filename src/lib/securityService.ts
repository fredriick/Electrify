import { supabase, getSupabaseClient, getSupabaseSessionClient } from './auth';

export interface PasswordUpdateResult {
  success: boolean;
  error?: string;
}

class SecurityService {
  // Get the appropriate Supabase client based on storage type
  private getCurrentSupabaseClient() {
    const storageType = typeof window !== 'undefined' ? localStorage.getItem('auth-storage-type') : null;
    if (storageType === 'sessionStorage') {
      return getSupabaseSessionClient();
    } else {
      return getSupabaseClient();
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<PasswordUpdateResult> {
    const storageType = typeof window !== 'undefined' ? localStorage.getItem('auth-storage-type') : null;
    console.log('Using auth storage type:', storageType || 'localStorage (default)');
    
    const supabaseClient = this.getCurrentSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Get current user first
      console.log('Getting current user from Supabase...');
      const { data: { user: currentUser }, error: getUserError } = await supabaseClient.auth.getUser();
      
      if (getUserError || !currentUser) {
        console.error('Error getting current user:', getUserError);
        return {
          success: false,
          error: 'User session not found. Please log in again.'
        };
      }

      if (!currentUser.email) {
        return {
          success: false,
          error: 'User email not found. Please log in again.'
        };
      }

      // Verify the current password by attempting to sign in with current email
      console.log('Attempting to verify current password for email:', currentUser.email);
      
      const { data: { user }, error: signInError } = await supabaseClient.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword
      });

      if (signInError) {
        console.error('Sign in error during password verification:', signInError);
        console.error('Error details:', {
          message: signInError.message,
          status: signInError.status,
          name: signInError.name
        });
        return {
          success: false,
          error: 'Current password is incorrect'
        };
      }

      if (!user) {
        console.error('No user returned after successful sign in');
        return {
          success: false,
          error: 'User not found'
        };
      }

      console.log('Current password verified successfully for user:', user.id);

      // Update the password
      console.log('Updating password for user:', user.id);
      
      const { error: updateError } = await supabaseClient.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('Error updating password:', updateError);
        console.error('Update error details:', {
          message: updateError.message,
          status: updateError.status,
          name: updateError.name
        });
        return {
          success: false,
          error: updateError.message || 'Failed to update password'
        };
      }

      console.log('Password updated successfully for user:', user.id);

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in password update:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  async validatePassword(password: string): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Check for number
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Check for special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async getCurrentUser() {
    const supabaseClient = this.getCurrentSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data: { user }, error } = await supabaseClient.auth.getUser();
      
      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Helper function to check if passwords match
  passwordsMatch(password1: string, password2: string): boolean {
    return password1 === password2;
  }

  // Helper function to check if password is strong enough
  async isPasswordStrong(password: string): Promise<boolean> {
    const validation = await this.validatePassword(password);
    return validation.isValid;
  }
}

export const securityService = new SecurityService(); 