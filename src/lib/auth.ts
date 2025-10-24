import { createClient } from '@supabase/supabase-js'
import { User, Session, AuthError } from '@supabase/supabase-js'

// Initialize Supabase client with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create Supabase client with fallback for SSR
let supabase: any = null
let supabaseSessionStorage: any = null

// Function to initialize Supabase client with localStorage (persistent)
const initializeSupabase = () => {
  if (typeof window === 'undefined') {
    return null
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return null
  }

  // Check if the anon key is complete (should be around 200+ characters)
  if (supabaseAnonKey.length < 200) {
    console.error('Supabase anon key appears to be truncated')
    return null
  }

  try {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: localStorage, // Persistent storage
        autoRefreshToken: true,
        persistSession: true
      }
    })
    return client
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    return null
  }
}

// Function to initialize Supabase client with sessionStorage (temporary)
const initializeSupabaseSessionStorage = () => {
  if (typeof window === 'undefined') {
    return null
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables for sessionStorage client')
    return null
  }

  try {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: sessionStorage, // Temporary storage (clears when browser closes)
        autoRefreshToken: true,
        persistSession: true
      }
    })
    return client
  } catch (error) {
    console.error('Error creating Supabase sessionStorage client:', error)
    return null
  }
}

// Initialize on client side
if (typeof window !== 'undefined') {
  supabase = initializeSupabase()
  supabaseSessionStorage = initializeSupabaseSessionStorage()
}

export { supabase, supabaseSessionStorage }

// Function to get Supabase client with proper initialization
export const getSupabaseClient = () => {
  if (supabase) {
    return supabase
  }

  // Try to initialize if not already done
  if (typeof window !== 'undefined') {
    const client = initializeSupabase()
    if (client) {
      supabase = client
      return supabase
    }
  }

  console.error('Supabase client not initialized. Environment variables may be missing.')
  return null
}

// Function to get Supabase client with sessionStorage
export const getSupabaseSessionClient = () => {
  if (supabaseSessionStorage) {
    return supabaseSessionStorage
  }

  // Try to initialize if not already done
  if (typeof window !== 'undefined') {
    const client = initializeSupabaseSessionStorage()
    if (client) {
      supabaseSessionStorage = client
      return supabaseSessionStorage
    }
  }

  console.error('Supabase sessionStorage client not initialized. Environment variables may be missing.')
  return null
}

// Function to get the appropriate client based on storage preference
export const getSupabaseClientByStorage = (useSessionStorage: boolean = false) => {
  if (useSessionStorage) {
    return getSupabaseSessionClient()
  }
  return getSupabaseClient()
}

// User types
// Import the new role-specific interfaces
import { 
  UserProfile as NewUserProfile, 
  CustomerProfile, 
  SupplierProfile, 
  AdminProfile, 
  SuperAdminProfile 
} from './userService';

// Keep the old interface for backward compatibility during transition
export interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  phone?: string
  date_of_birth?: string
  address?: string
  avatar_url?: string
  role: 'CUSTOMER' | 'SUPPLIER' | 'ADMIN' | 'SUPER_ADMIN'
  account_type?: 'individual' | 'company'
  shop_name?: string
  business_name?: string
  business_address?: string
  business_phone?: string
  business_website?: string
  tax_id?: string
  country?: string
  state?: string
  shop_logo?: string
  is_verified?: boolean
  notification_preferences?: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    orderUpdates: boolean
    productRecommendations: boolean
    priceDrops: boolean
    newProducts: boolean
    promotions: boolean
    newsletter: boolean
    securityAlerts: boolean
    reviews: boolean
  }
  user_preferences?: {
    language: string
    currency: string
    timezone: string
    theme: string
    emailFrequency: string
    privacyLevel: string
  }
  created_at: string
  updated_at: string
}

// Export the new interfaces for use in components
export type { 
  CustomerProfile, 
  SupplierProfile, 
  AdminProfile, 
  SuperAdminProfile 
};

export interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

// Authentication functions
export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, profile: Partial<UserProfile> & {
    // Supplier-specific fields
    shop_name?: string;
    individual_first_name?: string;
    individual_last_name?: string;
    individual_phone?: string;
    company_name?: string;
    company_description?: string;
    company_phone?: string;
    company_website?: string;
    company_address?: string;
    contact_person?: string;
    contact_person_phone?: string;
    contact_person_email?: string;
    business_license?: string;
    business_registration_number?: string;
    business_type?: string;
    industry_category?: string;
  }) {
    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) {
      return { data: null, error: new Error('Supabase client not initialized. Please check your environment variables.') }
    }

    // Convert role to uppercase to match database enum
    const normalizedRole = profile.role?.toUpperCase() as 'CUSTOMER' | 'SUPPLIER' | 'ADMIN' | 'SUPER_ADMIN' || 'CUSTOMER'

    try {
      // Note: We can't check for existing users on client-side due to admin API restrictions
      // Supabase will handle duplicate email errors automatically

      const { data, error } = await supabaseClient.auth.signUp({
        email: email.trim().toLowerCase(), // Normalize email
        password,
        options: {
          data: {
            // Store profile data for later profile creation
            first_name: profile.first_name,
            last_name: profile.last_name,
            phone: profile.phone,
            country: profile.country,
            state: profile.state,
            role: normalizedRole,
            account_type: profile.account_type,
            // Additional fields for suppliers (if needed later)
            shop_name: profile.shop_name,
            company_name: profile.company_name,
            company_description: profile.company_description,
            company_phone: profile.company_phone,
            company_website: profile.company_website,
            company_address: profile.company_address,
            contact_person: profile.contact_person,
            contact_person_phone: profile.contact_person_phone,
            contact_person_email: profile.contact_person_email,
            business_license: profile.business_license,
            tax_id: profile.tax_id,
            business_registration_number: profile.business_registration_number,
            business_type: profile.business_type,
            industry_category: profile.industry_category,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Supabase auth signup error:', error)
        
        // Handle specific error cases
        if (error.message?.includes('already registered')) {
          return { 
            data: null, 
            error: new Error('An account with this email already exists. Please try signing in instead.') 
          }
        }
        
        if (error.message?.includes('invalid')) {
          return { 
            data: null, 
            error: new Error('Please enter a valid email address.') 
          }
        }
        
        // Handle email rate limit error
        if (error.message?.includes('email rate limit exceeded') || 
            error.message?.includes('rate limit') ||
            error.message?.includes('AuthApiError')) {
          console.log('🚨 Rate limit error detected in auth.ts:', error.message);
          return { 
            data: null, 
            error: new Error('EMAIL_RATE_LIMIT_EXCEEDED') 
          }
        }
        
        // Handle HTTP 429 (Too Many Requests) error
        if (error.status === 429 || error.statusCode === 429) {
          console.log('🚨 HTTP 429 error detected in auth.ts:', error.status, error.statusCode);
          return { 
            data: null, 
            error: new Error('EMAIL_RATE_LIMIT_EXCEEDED') 
          }
        }
        
        throw error
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required - don't create profile yet
        
        // Store registration data temporarily (this will be handled by the email confirmation callback)
        // For now, return success with just the user data, no profile
        return { 
          data: { 
            user: data.user,
            session: null, // No session until email is confirmed
            profile: null, // Profile will be created after email confirmation
            requiresEmailConfirmation: true
          }, 
          error: null 
        }
      } else if (data.user && data.session) {
        // Email confirmation not required (auto-confirm enabled) - create profile immediately
        
        // Create user profile in users table
        const userData = {
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          phone: profile.phone || '',
          country: profile.country || '',
          state: profile.state || '',
          account_type: profile.account_type || 'individual',
          shop_name: profile.shop_name || '',
          company_name: profile.company_name || '',
          
          // Individual seller fields
          individual_first_name: profile.individual_first_name || '',
          individual_last_name: profile.individual_last_name || '',
          individual_phone: profile.individual_phone || profile.phone || '',
          
          // Company seller fields
          company_description: profile.company_description || '',
          company_phone: profile.company_phone || profile.phone || '',
          company_website: profile.company_website || '',
          company_address: profile.company_address || profile.business_address || '',
          contact_person: profile.contact_person || '',
          contact_person_phone: profile.contact_person_phone || profile.phone || '',
          contact_person_email: profile.contact_person_email || data.user.email || '',
          
          // Business verification fields
          business_license: profile.business_license || '',
          tax_id: profile.tax_id || '',
          business_registration_number: profile.business_registration_number || '',
          business_type: profile.business_type || '',
          industry_category: profile.industry_category || '',
          
          is_verified: false,
          is_active: true
        };
        
        
        const { data: functionResult, error: profileError } = await supabaseClient
          .rpc('handle_user_registration', {
            user_id: data.user.id,
            user_email: data.user.email,
            user_role: normalizedRole,
            user_data: userData
          })

        if (profileError) {
          console.error('Profile creation error:', profileError);
          console.error('Error code:', profileError.code);
          console.error('Error message:', profileError.message);
          console.error('Error details:', profileError.details);
          console.error('Error hint:', profileError.hint);
          
          // Don't try to cleanup auth user - let Supabase handle it
          // The auth user will be automatically cleaned up if needed
          throw profileError;
        }


        // Create profile data for return
        const profileData = {
          id: data.user.id,
          email: data.user.email || '',
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          full_name: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          phone: profile.phone || '',
          role: normalizedRole as 'CUSTOMER' | 'SUPPLIER' | 'ADMIN' | 'SUPER_ADMIN',
          account_type: profile.account_type || 'individual',
          business_name: profile.business_name || profile.company_name || '',
          business_address: profile.business_address || profile.company_address || '',
          business_phone: profile.business_phone || profile.company_phone || profile.phone || '',
          business_website: profile.business_website || profile.company_website || '',
          tax_id: profile.tax_id || '',
          country: profile.country || '',
          state: profile.state || '',
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Return success with user data
        return { 
          data: { 
            user: data.user,
            session: data.session,
            profile: profileData
          }, 
          error: null 
        }
      }

      // If no user data, return error
      return { 
        data: null, 
        error: new Error('User creation failed - no user data returned') 
      }
    } catch (error) {
      console.error('Signup error details:', error)
      
      // Handle rate limit errors in catch block as well
      if (error instanceof Error) {
        if (error.message?.includes('email rate limit exceeded') || 
            error.message?.includes('rate limit') ||
            error.message?.includes('429') ||
            error.message?.includes('AuthApiError')) {
          return { 
            data: null, 
            error: new Error('EMAIL_RATE_LIMIT_EXCEEDED') 
          }
        }
      }
      
      return { data: null, error: error as AuthError }
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string, rememberMe: boolean = false) {
    const supabaseClient = rememberMe ? getSupabaseClient() : getSupabaseSessionClient()
    if (!supabaseClient) {
      return { data: null, error: new Error('Supabase client not initialized. Please check your environment variables.') }
    }

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Store the storage preference for session detection
      if (typeof window !== 'undefined') {
        const storageKey = rememberMe ? 'localStorage' : 'sessionStorage'
        localStorage.setItem('auth-storage-type', storageKey)
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  },

  // Sign out
  async signOut() {
    const localStorageClient = getSupabaseClient()
    const sessionStorageClient = getSupabaseSessionClient()
    
    if (!localStorageClient || !sessionStorageClient) {
      console.error('Supabase client not initialized during signOut')
      return { error: new Error('Supabase client not initialized. Please check your environment variables.') }
    }

    try {
      
      // Sign out from both storage types
      const [localStorageResult, sessionStorageResult] = await Promise.allSettled([
        localStorageClient.auth.signOut(),
        sessionStorageClient.auth.signOut()
      ])
      
      // Check for errors
      if (localStorageResult.status === 'rejected') {
        console.error('localStorage signOut error:', localStorageResult.reason)
      }
      if (sessionStorageResult.status === 'rejected') {
        console.error('sessionStorage signOut error:', sessionStorageResult.reason)
      }
      
      
      // Clear any custom session data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user-session')
        localStorage.removeItem('auth-storage-type')
        sessionStorage.clear()
      }
      
      return { error: null }
    } catch (error) {
      console.error('Error during signOut:', error)
      return { error: error as AuthError }
    }
  },

  // Reset password
  async resetPassword(email: string) {
    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) {
      return { error: new Error('Supabase client not initialized. Please check your environment variables.') }
    }

    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  },

  // Update password
  async updatePassword(newPassword: string, session?: any) {
    // Use the same supabase instance that AuthContext uses
    if (!supabase) {
      return { error: new Error('Supabase client not initialized. Please check your environment variables.') }
    }

    try {
      
      // Use passed session if available, otherwise try to get it from supabase
      let currentSession = session
      let currentUser = session?.user
      
      if (!currentSession) {
        const { data: { session: supabaseSession }, error: sessionError } = await supabase.auth.getSession()
        currentSession = supabaseSession
        currentUser = supabaseSession?.user
      }
      
      if (!currentUser) {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        currentUser = user
      }
      
      if (!currentUser) {
        console.error('❌ No authenticated user found for password update')
        return { error: new Error('Authentication session expired. Please log out and log back in.') }
      }
      
      
      // If we have a session, try to set it on the client
      if (currentSession) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token
        })
        if (setSessionError) {
          console.warn('⚠️ Failed to set session on client:', setSessionError)
        } else {
        }
      }
      
      // Try to refresh the session to ensure it's valid
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError) {
        console.warn('⚠️ Session refresh failed, but continuing:', refreshError)
      } else {
      }
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('❌ Password update error:', error)
      return { error: error as AuthError }
    }
  },

  // Get current user profile
  async getProfile(userId: string, supabaseClient?: any): Promise<UserProfile | null> {
    // Use passed client or fallback to default client
    const client = supabaseClient || getSupabaseClient()
    if (!client) {
      console.error('Supabase client not initialized')
      return null
    }

    try {
      
      // First, get the user's role from the session to determine which table to check
      const { data: { session } } = await client.auth.getSession()
      let userRole = session?.user?.user_metadata?.role || 'CUSTOMER'
      
      // If user metadata doesn't have a role, try to determine it by checking tables
      // But only check tables that are likely to exist and accessible
      if (!userRole || userRole === 'CUSTOMER') {
        // For customers, check if they might be a supplier first (most common case)
        try {
          const { data: supplierCheck, error: supplierError } = await client
            .from('suppliers')
            .select('id')
            .eq('id', userId)
            .single()
          
          if (supplierCheck && !supplierError) {
            userRole = 'SUPPLIER'
          } else if (supplierError && supplierError.code === '406') {
            // If suppliers table returns 406, skip all admin checks
            // This user is likely a customer
            userRole = 'CUSTOMER'
          }
        } catch (error) {
          // If suppliers table is not accessible, assume customer
          userRole = 'CUSTOMER'
        }
      }
      
      // Handle admin users - if role is ADMIN, we need to check admin tables
      if (userRole === 'ADMIN') {
        try {
          const { data: adminProfile, error: adminError } = await client
            .from('admins')
            .select('*')
            .eq('id', userId)
            .single()

          if (adminProfile && !adminError) {
            const profileWithRole = {
              ...adminProfile,
              role: 'ADMIN' as const
            }
            return profileWithRole as UserProfile
          }

          // If admin table returns 406 or doesn't exist, fall back to customer
          if (adminError && (adminError.code === '406' || adminError.code === 'PGRST116')) {
            console.warn('⚠️ Admin table not accessible, falling back to customer profile')
            userRole = 'CUSTOMER'
          }
        } catch (adminError) {
          console.warn('⚠️ Admin table not accessible, falling back to customer profile')
          userRole = 'CUSTOMER'
        }
      }
      
      // Handle super admin users
      if (userRole === 'SUPER_ADMIN') {
        try {
          const { data: superAdminProfile, error: superAdminError } = await client
            .from('super_admins')
            .select('*')
            .eq('id', userId)
            .single()

          if (superAdminProfile && !superAdminError) {
            const profileWithRole = {
              ...superAdminProfile,
              role: 'SUPER_ADMIN' as const
            }
            return profileWithRole as UserProfile
          }

          // If super_admin table returns 406 or doesn't exist, fall back to customer
          if (superAdminError && (superAdminError.code === '406' || superAdminError.code === 'PGRST116')) {
            console.warn('⚠️ Super admin table not accessible, falling back to customer profile')
            userRole = 'CUSTOMER'
          }
        } catch (superAdminError) {
          console.warn('⚠️ Super admin table not accessible, falling back to customer profile')
          userRole = 'CUSTOMER'
        }
      }
      
      // Check the appropriate table based on user role
      if (userRole === 'SUPPLIER') {
        const { data: supplierProfile, error: supplierError } = await client
          .from('suppliers')
          .select('*')
          .eq('id', userId)
          .single()

        if (supplierProfile) {
          const profileWithRole = {
            ...supplierProfile,
            role: 'SUPPLIER' as const
          }
          return profileWithRole as UserProfile
        }

        if (supplierError && supplierError.code !== 'PGRST116') {
          console.error('❌ getProfile: Error fetching supplier profile:', supplierError)
        }
      } else if (userRole === 'CUSTOMER') {
        try {
          const { data: customerProfile, error: customerError } = await client
            .from('customers')
            .select('*')
            .eq('id', userId)
            .single()

          
          if (customerError) {
            console.error('❌ getProfile: Customer query error details:', {
              code: customerError.code,
              message: customerError.message,
              details: customerError.details,
              hint: customerError.hint
            })
          }

          if (customerProfile) {
            const profileWithRole = {
              ...customerProfile,
              role: 'CUSTOMER' as const
            }
            return profileWithRole as UserProfile
          }

          if (customerError && customerError.code !== 'PGRST116') {
            console.error('❌ getProfile: Error fetching customer profile:', customerError)
          }
        } catch (customerError) {
          if (customerError && typeof customerError === 'object' && 'code' in customerError && customerError.code === '42P17') {
            console.warn('⚠️ getProfile: RLS recursion detected in customers table, skipping customer profile check')
          } else {
            console.error('❌ getProfile: Error checking customer profile:', customerError)
          }
        }
      }

      // If no profile found, try to create one using the RPC function
      
      try {
        const userMetadata = session?.user?.user_metadata
        
        if (userRole === 'CUSTOMER') {
          const userData = {
            first_name: userMetadata?.first_name || '',
            last_name: userMetadata?.last_name || '',
            phone: userMetadata?.phone || '',
            country: userMetadata?.country || '',
            state: userMetadata?.state || '',
            is_verified: false,
            is_active: true
          }
          
          
          const { data: functionResult, error: profileError } = await client
            .rpc('handle_user_registration', {
              user_id: userId,
              user_email: session?.user?.email || 'unknown@example.com',
              user_role: userRole,
              user_data: userData
            })

          if (profileError) {
            console.error('❌ getProfile: Error creating customer profile via RPC:', profileError)
            console.error('❌ getProfile: RPC error details:', {
              code: profileError.code,
              message: profileError.message,
              details: profileError.details,
              hint: profileError.hint
            })
            return null
          }

          
          // Now try to fetch the newly created profile
          const { data: newProfile, error: fetchError } = await client
            .from('customers')
            .select('*')
            .eq('id', userId)
            .single()

          if (fetchError) {
            console.error('❌ getProfile: Error fetching newly created profile:', fetchError)
            return null
          }

          if (newProfile) {
            const profileWithRole = {
              ...newProfile,
              role: 'CUSTOMER' as const
            }
            return profileWithRole as UserProfile
          }
        } else if (userRole === 'SUPPLIER') {
          // Create supplier profile directly
          
          // First, check if there's an incorrect customer profile and clean it up
          const { data: existingCustomer, error: customerCheckError } = await client
            .from('customers')
            .select('id')
            .eq('id', userId)
            .single();
          
          if (existingCustomer && !customerCheckError) {
            console.log('🧹 getProfile: Found incorrect customer profile, cleaning up...');
            const { error: deleteError } = await client
              .from('customers')
              .delete()
              .eq('id', userId);
            
            if (deleteError) {
              console.error('❌ getProfile: Error deleting incorrect customer profile:', deleteError);
            } else {
              console.log('✅ getProfile: Successfully deleted incorrect customer profile');
            }
          }
          
          const supplierData = {
            id: userId,
            email: session?.user?.email || 'unknown@example.com',
            first_name: userMetadata?.first_name || '',
            last_name: userMetadata?.last_name || '',
            phone: userMetadata?.phone || '',
            country: userMetadata?.country || '',
            state: userMetadata?.state || '',
            account_type: userMetadata?.account_type || 'individual',
            company_name: userMetadata?.company_name || '',
            company_description: userMetadata?.company_description || '',
            company_phone: userMetadata?.company_phone || '',
            company_website: userMetadata?.company_website || '',
            company_address: userMetadata?.company_address || '',
            contact_person: userMetadata?.contact_person || '',
            contact_person_phone: userMetadata?.contact_person_phone || '',
            contact_person_email: userMetadata?.contact_person_email || '',
            business_license: userMetadata?.business_license || '',
            tax_id: userMetadata?.tax_id || '',
            business_registration_number: userMetadata?.business_registration_number || '',
            business_type: userMetadata?.business_type || '',
            industry_category: userMetadata?.industry_category || '',
            individual_first_name: userMetadata?.individual_first_name || '',
            individual_last_name: userMetadata?.individual_last_name || '',
            individual_phone: userMetadata?.individual_phone || '',
            is_verified: false,
            is_active: true,
            notification_preferences: {},
            user_preferences: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { data: newSupplierProfile, error: supplierError } = await client
            .from('suppliers')
            .insert(supplierData)
            .select()
            .single();

          if (supplierError) {
            console.error('❌ getProfile: Error creating supplier profile:', supplierError);
            console.error('❌ getProfile: Supplier error details:', {
              code: supplierError.code,
              message: supplierError.message,
              details: supplierError.details,
              hint: supplierError.hint
            });
            return null;
          }

          if (newSupplierProfile) {
            console.log('✅ getProfile: Supplier profile created successfully');
            const profileWithRole = {
              ...newSupplierProfile,
              role: 'SUPPLIER' as const
            };
            return profileWithRole as UserProfile;
          }
        }
      } catch (createError) {
        console.error('❌ getProfile: Error during profile creation:', createError)
      }

      return null
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) {
      return { data: null, error: new Error('Supabase client not initialized. Please check your environment variables.') }
    }

    try {
      // First, get the current profile to determine which table to update
      const currentProfile = await this.getProfile(userId)
      if (!currentProfile) {
        return { data: null, error: new Error('Profile not found') }
      }

      let tableName: string
      switch (currentProfile.role) {
        case 'CUSTOMER':
          tableName = 'customers'
          break
        case 'SUPPLIER':
          tableName = 'suppliers'
          break
        case 'ADMIN':
          tableName = 'admins'
          break
        case 'SUPER_ADMIN':
          tableName = 'super_admins'
          break
        default:
          return { data: null, error: new Error('Invalid role') }
      }

      const { data, error } = await supabaseClient
        .from(tableName)
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { data: { ...data, role: currentProfile.role }, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  // Upload avatar
  async uploadAvatar(userId: string, file: File) {
    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabaseClient.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabaseClient.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update user profile with new avatar URL
      // First, get the current profile to determine which table to update
      const currentProfile = await this.getProfile(userId)
      if (!currentProfile) {
        throw new Error('Profile not found')
      }

      let tableName: string
      switch (currentProfile.role) {
        case 'CUSTOMER':
          tableName = 'customers'
          break
        case 'SUPPLIER':
          tableName = 'suppliers'
          break
        case 'ADMIN':
          tableName = 'admins'
          break
        case 'SUPER_ADMIN':
          tableName = 'super_admins'
          break
        default:
          throw new Error('Invalid role')
      }

      const { error: updateError } = await supabaseClient
        .from(tableName)
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }

      return { data: { publicUrl }, error: null }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      return { data: null, error: error as Error }
    }
  },

  async getNotificationPreferences(userId: string, profile?: any) {
    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized')
    }

    try {
      
      // Use passed profile or get it if not provided
      let currentProfile = profile
      if (!currentProfile) {
        currentProfile = await this.getProfile(userId)
      }
      
      // If no profile found, try RPC function directly (bypasses RLS)
      if (!currentProfile) {
        
        try {
          const { data: rpcData, error: rpcError } = await supabaseClient
            .rpc('get_customer_notification_preferences', {
              customer_id: userId
            })

          if (!rpcError) {
            console.log('✅ getNotificationPreferences: RPC query successful (no profile)')
            return { data: rpcData, error: null }
          }

          console.error('❌ getNotificationPreferences: RPC query failed (no profile):', rpcError)
          // Return default preferences as fallback
          return { 
            data: {
              emailNotifications: true,
              smsNotifications: false,
              pushNotifications: true,
              orderUpdates: true,
              productRecommendations: true,
              priceDrops: false,
              newProducts: true,
              promotions: false,
              newsletter: true,
              securityAlerts: true,
              reviews: true
            }, 
            error: null 
          }
        } catch (rpcError) {
          console.error('❌ getNotificationPreferences: RPC fallback failed (no profile):', rpcError)
          // Return default preferences as final fallback
          return { 
            data: {
              emailNotifications: true,
              smsNotifications: false,
              pushNotifications: true,
              orderUpdates: true,
              productRecommendations: true,
              priceDrops: false,
              newProducts: true,
              promotions: false,
              newsletter: true,
              securityAlerts: true,
              reviews: true
            }, 
            error: null 
          }
        }
      }

      // Only allow customers to access notification preferences
      if (currentProfile.role as string !== 'CUSTOMER') {
        console.error('❌ getNotificationPreferences: User is not a customer. Role:', currentProfile.role)
        throw new Error('Notification preferences are only available for customers')
      }

      // Notification preferences are only for customers
      const tableName = 'customers'

      
      // Try direct query first
      const { data, error } = await supabaseClient
        .from(tableName)
        .select('notification_preferences')
        .eq('id', userId)
        .single()

      
      // If direct query fails due to RLS, try RPC function
      if (error && (error.code === 'PGRST116' || error.code === '42501' || error.message?.includes('406'))) {
        
        try {
          const { data: rpcData, error: rpcError } = await supabaseClient
            .rpc('get_customer_notification_preferences', {
              customer_id: userId
            })

          if (!rpcError) {
            console.log('✅ getNotificationPreferences: RPC query successful')
            return { data: rpcData, error: null }
          }

          console.error('❌ getNotificationPreferences: RPC query failed:', rpcError)
          throw rpcError
          
        } catch (rpcError) {
          console.error('❌ getNotificationPreferences: RPC fallback failed:', rpcError)
          // Return default preferences as final fallback
          return { 
            data: {
              emailNotifications: true,
              smsNotifications: false,
              pushNotifications: true,
              orderUpdates: true,
              productRecommendations: true,
              priceDrops: false,
              newProducts: true,
              promotions: false,
              newsletter: true,
              securityAlerts: true,
              reviews: true
            }, 
            error: null 
          }
        }
      }
      
      // If no data found (profile doesn't exist in database), return default preferences
      if (error && error.code === 'PGRST116') {
        return { 
          data: {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            orderUpdates: true,
            productRecommendations: true,
            priceDrops: false,
            newProducts: true,
            promotions: false,
            newsletter: true,
            securityAlerts: true,
            reviews: true
          }, 
          error: null 
        }
      }
      
      if (error) {
        console.error('❌ getNotificationPreferences: Database query error:', error)
        throw error
      }

      return { 
        data: data?.notification_preferences || {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          orderUpdates: true,
          productRecommendations: true,
          priceDrops: false,
          newProducts: true,
          promotions: false,
          newsletter: true,
          securityAlerts: true,
          reviews: true
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
      return { data: null, error: error as Error }
    }
  },

  async updateNotificationPreferences(userId: string, preferences: any, profile?: any) {
    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized')
    }

    try {
      
      // Use passed profile or get it if not provided
      let currentProfile = profile
      if (!currentProfile) {
        currentProfile = await this.getProfile(userId)
      }
      
      if (!currentProfile) {
        console.error('❌ updateNotificationPreferences: Profile not found for user:', userId)
        
        try {
          const { data: rpcData, error: rpcError } = await supabaseClient
            .rpc('update_customer_notification_preferences', {
              customer_id: userId,
              notification_preferences: preferences
            })

          if (!rpcError) {
            console.log('✅ updateNotificationPreferences: RPC update successful (no profile)')
            return { data: rpcData, error: null }
          }

          console.error('❌ updateNotificationPreferences: RPC failed (no profile):', rpcError)
          throw new Error('Failed to update notification preferences via RPC')
        } catch (rpcError) {
          console.error('❌ updateNotificationPreferences: RPC fallback failed (no profile):', rpcError)
          throw new Error('Profile not found and RPC failed')
        }
      }

      // Only allow customers to access notification preferences
      if (currentProfile.role as string !== 'CUSTOMER') {
        console.error('❌ updateNotificationPreferences: User is not a customer. Role:', currentProfile.role)
        throw new Error('Notification preferences are only available for customers')
      }

      // Notification preferences are only for customers
      const tableName = 'customers'
      console.log('🔍 updateNotificationPreferences: Using customers table')

      console.log('🔍 updateNotificationPreferences: Updating database for user:', userId, 'in table:', tableName)
      
      // First try direct update with proper error handling
      const { data, error } = await supabaseClient
        .from(tableName)
        .update({ 
          notification_preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('notification_preferences')
        .single()

      console.log('🔍 updateNotificationPreferences: Database update result:', { data, error })
      
      // If direct update fails, try alternative approaches (RLS, permissions, etc.)
      if (error) {
        console.log('🔍 updateNotificationPreferences: Direct update failed, trying alternative approaches')
        console.log('🔍 updateNotificationPreferences: Error details:', { 
          code: error.code, 
          message: error.message, 
          details: error.details 
        })
        
        try {
          // Try using upsert instead of update
          console.log('🔍 updateNotificationPreferences: Trying upsert approach')
          const upsertData = {
            id: userId,
            email: currentProfile.email || 'unknown@example.com',
            first_name: currentProfile.first_name || '',
            last_name: currentProfile.last_name || '',
            phone: currentProfile.phone || '',
            country: currentProfile.country || '',
            state: currentProfile.state || '',
            notification_preferences: preferences,
            updated_at: new Date().toISOString(),
            is_active: true,
            is_verified: false
          }
          
          const { data: upsertResult, error: upsertError } = await supabaseClient
            .from(tableName)
            .upsert(upsertData, { 
              onConflict: 'id',
              ignoreDuplicates: false 
            })
            .select('notification_preferences')
            .single()

          if (!upsertError) {
            console.log('✅ updateNotificationPreferences: Upsert successful')
            return { data: upsertResult?.notification_preferences, error: null }
          }

          console.log('🔍 updateNotificationPreferences: Upsert failed, trying RPC function')
          console.log('🔍 updateNotificationPreferences: Upsert error details:', { 
            code: upsertError.code, 
            message: upsertError.message, 
            details: upsertError.details 
          })
          
          // Try using a custom RPC function if it exists
          console.log('🔍 updateNotificationPreferences: Calling RPC function with:', { customer_id: userId, notification_preferences: preferences })
          const { data: rpcData, error: rpcError } = await supabaseClient
            .rpc('update_customer_notification_preferences', {
              customer_id: userId,
              notification_preferences: preferences
            })

          if (!rpcError) {
            console.log('✅ updateNotificationPreferences: RPC update successful')
            return { data: preferences, error: null }
          }

          console.error('❌ updateNotificationPreferences: All update methods failed')
          console.error('❌ Upsert error:', upsertError)
          console.error('❌ RPC error:', rpcError)
          
          // If all methods fail, throw the original error
          throw error
          
        } catch (fallbackError) {
          console.error('❌ updateNotificationPreferences: All fallback methods failed:', fallbackError)
          throw error // Throw the original error
        }
      }
      
      if (error) {
        console.error('❌ updateNotificationPreferences: Database update error:', error)
        throw error
      }

      return { data: data?.notification_preferences, error: null }
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      return { data: null, error: error as Error }
    }
  },

  getDefaultNotificationPreferences() {
    return {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      orderUpdates: true,
      productRecommendations: true,
      priceDrops: false,
      newProducts: true,
      promotions: false,
      newsletter: true,
      securityAlerts: true,
      reviews: true
    }
  },



  async getUserPreferences(userId: string, profile?: any) {
    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized')
    }

    try {
      let currentProfile = profile
      if (!currentProfile) {
        currentProfile = await this.getProfile(userId)
      }
      
      // If no profile found, try RPC function directly (bypasses RLS)
      if (!currentProfile) {
        
        try {
          const { data: rpcData, error: rpcError } = await supabaseClient
            .rpc('get_customer_user_preferences', {
              customer_id: userId
            })

          if (!rpcError) {
            console.log('✅ getUserPreferences: RPC successful (no profile)')
            return { data: rpcData, error: null }
          }

          console.error('❌ getUserPreferences: RPC failed (no profile):', rpcError)
          throw new Error('Failed to get user preferences via RPC')
        } catch (rpcError) {
          console.error('❌ getUserPreferences: RPC fallback failed (no profile):', rpcError)
          throw new Error('Profile not found and RPC failed')
        }
      }

      if (currentProfile.role as string !== 'CUSTOMER') {
        console.error('❌ getUserPreferences: User is not a customer. Role:', currentProfile.role)
        throw new Error('User preferences are only available for customers')
      }

      const tableName = 'customers'
      
      // First try direct select
      const { data, error } = await supabaseClient
        .from(tableName)
        .select('user_preferences')
        .eq('id', userId)
        .single()

      
      // If direct select fails, try RPC function
      if (error) {
        
        try {
          const { data: rpcData, error: rpcError } = await supabaseClient
            .rpc('get_customer_user_preferences', {
              customer_id: userId
            })

          if (!rpcError) {
            console.log('✅ getUserPreferences: RPC successful')
            return { data: rpcData, error: null }
          }

          console.error('❌ getUserPreferences: RPC failed:', rpcError)
          throw error
        } catch (rpcError) {
          console.error('❌ getUserPreferences: RPC fallback failed:', rpcError)
          throw error
        }
      }

      return { 
        data: data?.user_preferences || this.getDefaultUserPreferences(), 
        error: null 
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      return { data: null, error: error as Error }
    }
  },

  async updateUserPreferences(userId: string, preferences: any, profile?: any) {
    const supabaseClient = getSupabaseClient()
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized')
    }

    try {
      console.log('🔍 updateUserPreferences: Starting for user ID:', userId)
      console.log('🔍 updateUserPreferences: Preferences to update:', preferences)
      console.log('🔍 updateUserPreferences: Profile passed:', !!profile)
      
      let currentProfile = profile
      if (!currentProfile) {
        console.log('🔍 updateUserPreferences: No profile passed, fetching...')
        currentProfile = await this.getProfile(userId)
      }
      
      console.log('🔍 updateUserPreferences: Profile result:', { 
        profileExists: !!currentProfile, 
        profileRole: currentProfile?.role,
        profileId: currentProfile?.id 
      })
      
      // If no profile found, try RPC function directly (bypasses RLS)
      if (!currentProfile) {
        console.log('🔍 updateUserPreferences: Profile not found for user:', userId)
        console.log('🔍 updateUserPreferences: Trying RPC function directly without profile...')
        
        try {
          const { data: rpcData, error: rpcError } = await supabaseClient
            .rpc('update_customer_user_preferences', {
              customer_id: userId,
              user_preferences: preferences
            })

          if (!rpcError) {
            return { data: rpcData, error: null }
          }

          console.error('❌ updateUserPreferences: RPC failed (no profile):', rpcError)
          throw new Error('Failed to update user preferences via RPC')
        } catch (rpcError) {
          console.error('❌ updateUserPreferences: RPC fallback failed (no profile):', rpcError)
          throw new Error('Profile not found and RPC failed')
        }
      }

      if (currentProfile.role as string !== 'CUSTOMER') {
        console.error('❌ updateUserPreferences: User is not a customer. Role:', currentProfile.role)
        throw new Error('User preferences are only available for customers')
      }

      const tableName = 'customers'
      console.log('🔍 updateUserPreferences: Updating database for user:', userId, 'in table:', tableName)
      
      // First try direct update with proper error handling
      const { data, error } = await supabaseClient
        .from(tableName)
        .update({ 
          user_preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('user_preferences')
        .single()

      console.log('🔍 updateUserPreferences: Database update result:', { data, error })
      
      // If direct update fails, try alternative approaches (RLS, permissions, etc.)
      if (error) {
        console.log('🔍 updateUserPreferences: Direct update failed, trying alternative approaches')
        console.log('🔍 updateUserPreferences: Error details:', { 
          code: error.code, 
          message: error.message, 
          details: error.details 
        })
        
        try {
          // Try using upsert instead of update
          console.log('🔍 updateUserPreferences: Trying upsert approach')
          const upsertData = {
            id: userId,
            email: currentProfile.email || 'unknown@example.com',
            first_name: currentProfile.first_name || '',
            last_name: currentProfile.last_name || '',
            phone: currentProfile.phone || '',
            country: currentProfile.country || '',
            state: currentProfile.state || '',
            user_preferences: preferences,
            updated_at: new Date().toISOString(),
            is_active: true,
            is_verified: false,
            created_at: currentProfile.created_at || new Date().toISOString()
          }
          
          const { data: upsertResult, error: upsertError } = await supabaseClient
            .from(tableName)
            .upsert(upsertData, { 
              onConflict: 'id',
              ignoreDuplicates: false 
            })
            .select('user_preferences')
            .single()

          if (!upsertError) {
            console.log('✅ updateUserPreferences: Upsert successful')
            return { data: upsertResult?.user_preferences, error: null }
          }

          console.log('🔍 updateUserPreferences: Upsert failed, trying RPC function')
          console.log('🔍 updateUserPreferences: Upsert error details:', { 
            code: upsertError.code, 
            message: upsertError.message, 
            details: upsertError.details 
          })
          
          // Try using a custom RPC function if it exists
          console.log('🔍 updateUserPreferences: Calling RPC function with:', { customer_id: userId, user_preferences: preferences })
          const { data: rpcData, error: rpcError } = await supabaseClient
            .rpc('update_customer_user_preferences', {
              customer_id: userId,
              user_preferences: preferences
            })

          if (!rpcError) {
            console.log('✅ updateUserPreferences: RPC update successful')
            return { data: preferences, error: null }
          }

          console.error('❌ updateUserPreferences: All update methods failed')
          console.error('❌ Upsert error:', upsertError)
          console.error('❌ RPC error:', rpcError)
          
          throw error
          
        } catch (fallbackError) {
          console.error('❌ updateUserPreferences: All fallback methods failed:', fallbackError)
          throw error
        }
      }
      
      if (error) {
        console.error('❌ updateUserPreferences: Database update error:', error)
        throw error
      }

      return { data: data?.user_preferences, error: null }
    } catch (error) {
      console.error('Error updating user preferences:', error)
      return { data: null, error: error as Error }
    }
  },

  getDefaultUserPreferences() {
    return {
      language: "English",
      currency: "USD",
      timezone: "America/New_York",
      theme: "system",
      emailFrequency: "daily",
      privacyLevel: "standard"
    }
  },

  // Get current session
  async getSession() {
    // Check both storage types to find existing session
    const localStorageClient = getSupabaseClient()
    const sessionStorageClient = getSupabaseSessionClient()
    
    if (!localStorageClient || !sessionStorageClient) {
      return { session: null, error: new Error('Supabase client not initialized. Please check your environment variables.') }
    }

    try {
      // First check localStorage (persistent sessions)
      const { data: { session: localStorageSession }, error: localStorageError } = await localStorageClient.auth.getSession()
      
      if (localStorageSession && !localStorageError) {
        console.log('Found session in localStorage')
        return { session: localStorageSession, error: null }
      }

      // Then check sessionStorage (temporary sessions)
      const { data: { session: sessionStorageSession }, error: sessionStorageError } = await sessionStorageClient.auth.getSession()
      
      if (sessionStorageSession && !sessionStorageError) {
        console.log('Found session in sessionStorage')
        return { session: sessionStorageSession, error: null }
      }

      // No session found in either storage
      console.log('No session found in either storage')
      return { session: null, error: null }
    } catch (error) {
      return { session: null, error: error as AuthError }
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const localStorageClient = getSupabaseClient()
    const sessionStorageClient = getSupabaseSessionClient()
    
    if (!localStorageClient || !sessionStorageClient) {
      console.error('Supabase client not initialized')
      return { data: { subscription: { unsubscribe: () => {} } } }
    }

    // Determine which client to use based on storage preference
    const storageType = typeof window !== 'undefined' ? localStorage.getItem('auth-storage-type') : null;
    const primaryClient = storageType === 'sessionStorage' ? sessionStorageClient : localStorageClient;
    

    // Listen to the primary client only to avoid conflicts
    const subscription = primaryClient.auth.onAuthStateChange(callback)

    return subscription
  },
}

// Role-based access control
export const hasRole = (user: UserProfile | null, requiredRoles: string[]): boolean => {
  if (!user) return false;
  return requiredRoles.some(role => user.role === role.toUpperCase());
}

export const isCustomer = (user: UserProfile | null): boolean => hasRole(user, ['CUSTOMER'])
export const isSupplier = (user: UserProfile | null): boolean => hasRole(user, ['SUPPLIER', 'SELLER'])
export const isAdmin = (user: UserProfile | null): boolean => hasRole(user, ['ADMIN', 'SUPER_ADMIN'])
export const isSuperAdmin = (user: UserProfile | null): boolean => hasRole(user, ['SUPER_ADMIN'])

// Route protection helpers
export const getRedirectPath = (user: UserProfile | null): string => {
  if (!user) return '/login'
  
  switch (user.role) {
    case 'CUSTOMER':
      return '/'
    case 'SUPPLIER':
      return '/dashboard'
    case 'ADMIN':
      return '/admin-dashboard'
    case 'SUPER_ADMIN':
      return '/super-admin-dashboard'
    default:
      return '/'
  }
}

export const canAccessRoute = (user: UserProfile | null, route: string): boolean => {
  if (!user) return false

  // Public routes
  const publicRoutes = ['/', '/login', '/register', '/reset-password']
  if (publicRoutes.includes(route)) return true

  // Role-based route access
  switch (user.role) {
    case 'CUSTOMER':
      return !route.startsWith('/admin') && !route.startsWith('/super-admin') && !route.startsWith('/dashboard')
    case 'SUPPLIER':
      return route.startsWith('/dashboard') || route.startsWith('/profile') || route.startsWith('/account-settings')
    case 'ADMIN':
      return route.startsWith('/admin')
    case 'SUPER_ADMIN':
      return route.startsWith('/super-admin')
    default:
      return false
  }
} 