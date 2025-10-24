'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { authService, UserProfile, AuthState, supabase, getSupabaseClient, getSupabaseSessionClient } from '@/lib/auth'

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, profile: Partial<UserProfile>) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (newPassword: string) => Promise<{ error: any }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ data: any; error: any }>
  uploadAvatar: (file: File) => Promise<{ data: { publicUrl: any } | null; error: any } | { publicUrl: null; error: Error }>
  refreshProfile: () => Promise<void>
  forceAuthReset: () => Promise<void>
  setProfile: (profile: UserProfile | null) => void
  isInitialized: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    error: null,
  })
  
  // Add a flag to prevent flash of incorrect content
  const [isInitialized, setIsInitialized] = useState(false)

  // Add a flag to prevent multiple simultaneous profile fetches
  const [isFetchingProfile, setIsFetchingProfile] = useState(false)

  // Add a flag to prevent multiple initializations
  const [hasInitialized, setHasInitialized] = useState(false)

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    // Prevent multiple simultaneous profile fetches
    if (isFetchingProfile) {
      return
    }

    try {
      setIsFetchingProfile(true)
      
      // Create a fresh authenticated client for profile fetching
      const storageType = typeof window !== 'undefined' ? localStorage.getItem('auth-storage-type') : null;
      const supabaseClient = storageType === 'sessionStorage' ? getSupabaseSessionClient() : getSupabaseClient();
      
      // Add a timeout to prevent hanging - increased to 15 seconds
      const profilePromise = authService.getProfile(userId, supabaseClient)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 15000)
      )
      
      const profile = await Promise.race([profilePromise, timeoutPromise]) as UserProfile | null
      
      if (profile) {
        setAuthState(prev => ({ ...prev, profile, loading: false }))
        
        // Auto-sync verification status if profile was found
        await syncVerificationStatus({ id: userId }, profile)
      } else {
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setAuthState(prev => ({ ...prev, loading: false }))
    } finally {
      setIsFetchingProfile(false)
    }
  }

  // Initialize auth state - only run once
  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized) {
      return;
    }

    const initializeAuth = async () => {
      try {
        setHasInitialized(true);
        
        // Add a small delay to prevent flash of incorrect content
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Mark as initialized after delay
        setIsInitialized(true);
        
        // Check which storage type was used for login
        const storageType = typeof window !== 'undefined' ? localStorage.getItem('auth-storage-type') : null;
        
        // Use the same client that was used for login
        let supabaseClient;
        if (storageType === 'sessionStorage') {
          supabaseClient = getSupabaseSessionClient();
        } else {
          supabaseClient = getSupabaseClient();
        }
        
        if (!supabaseClient) {
          console.error('❌ AuthContext: No Supabase client available');
          setAuthState(prev => ({ ...prev, loading: false }));
          return;
        }
        
        // Get current session from the same client
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.error('❌ AuthContext: Error getting session:', error);
          setAuthState(prev => ({ ...prev, loading: false }));
          return;
        }

        if (session?.user) {
          setAuthState(prev => ({ 
            ...prev, 
            user: session.user,
            session: session,
            loading: true // Keep loading true until profile is fetched
          }))
          
          // Fetch profile after setting user
          await fetchProfile(session.user.id)
        } else {
          setAuthState(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('❌ AuthContext: Error in initializeAuth:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    }

    initializeAuth()

    // Listen to auth changes - only set up once
    let subscription: any = null;
    if (!hasInitialized) {
      const { data: { subscription: authSubscription } } = authService.onAuthStateChange(
        async (event, session) => {
          // Only process auth changes if we're not already fetching profile
          if (isFetchingProfile) {
            return;
          }
          
          if (session?.user) {
            setAuthState(prev => ({ 
              ...prev, 
              user: session.user, 
              session,
              loading: true // Keep loading true until profile is fetched
            }))
            
            // Fetch user profile
            await fetchProfile(session.user.id)
          } else {
            // Only clear auth state if this is a sign out event
            if (event === 'SIGNED_OUT') {
              setAuthState({
                user: null,
                session: null,
                profile: null,
                loading: false,
                error: null,
              })
            }
            // For TOKEN_REFRESHED with no session, don't clear immediately
            // This might be a temporary state during refresh
          }
        }
      )
      subscription = authSubscription;
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    }
  }, [hasInitialized]) // Only depend on hasInitialized to run once

  // Auth methods
  const signUp = async (email: string, password: string, profile: Partial<UserProfile>) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    const result = await authService.signUp(email, password, profile)
    
    if (result.error) {
      console.error('SignUp error:', result.error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: result.error.message 
      }))
    } else {
      // Update the auth state with the user and profile data from the signup result
      if (result.data?.user && result.data?.profile) {
        setAuthState(prev => ({ 
          ...prev, 
          user: result.data.user,
          session: result.data.session,
          profile: result.data.profile,
          loading: false 
        }))
      } else {
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    }
    
    return result
  }

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    
    const result = await authService.signIn(email, password, rememberMe)
    
    if (result.error) {
      console.error('SignIn error:', result.error)
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: result.error.message 
      }))
    } else {
      // Update user state immediately if we have the user data
      if (result.data?.user) {
        setAuthState(prev => ({ 
          ...prev, 
          user: result.data.user,
          session: result.data.session,
          loading: false 
        }))
      } else {
        // Fallback: The auth state change listener will handle updating user/session
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    }
    
    return result
  }

  // Auto-sync verification status between Supabase Auth and custom database
  const syncVerificationStatus = async (user: any, profile: any) => {
    try {
      const supabaseClient = await import('@/lib/auth').then(m => m.getSupabaseClient());
      if (!supabaseClient) return;

      // Check if user is verified in Supabase Auth
      const { data: { user: authUser } } = await supabaseClient.auth.getUser();
      
      if (authUser?.email_confirmed_at && !profile.is_verified) {
        
        // Update verification status in the appropriate table
        let tableName = 'customers';
        if (profile.role === 'SUPPLIER') {
          tableName = 'suppliers';
        } else if (profile.role === 'ADMIN') {
          tableName = 'admins';
        } else if (profile.role === 'SUPER_ADMIN') {
          tableName = 'super_admins';
        }

        const { error: updateError } = await supabaseClient
          .from(tableName)
          .update({ is_verified: true })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error auto-syncing verification status:', updateError);
        } else {
          // Refresh profile to get updated status
          const updatedProfile = await authService.getProfile(user.id);
          if (updatedProfile) {
            setAuthState(prev => ({ ...prev, profile: updatedProfile }));
          }
        }
      }
    } catch (error) {
      console.error('Error in auto-sync verification status:', error);
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true }))
    
    const result = await authService.signOut()
    
    if (result.error) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: result.error.message 
      }))
    } else {
      setAuthState({
        user: null,
        session: null,
        profile: null,
        loading: false,
        error: null,
      })
    }
    
    return result
  }

  const resetPassword = async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    const result = await authService.resetPassword(email)
    
    if (result.error) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: result.error.message 
      }))
    } else {
      setAuthState(prev => ({ ...prev, loading: false }))
    }
    
    return result
  }

  const updatePassword = async (newPassword: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    const result = await authService.updatePassword(newPassword, authState.session)
    
    if (result.error) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: result.error.message 
      }))
    } else {
      setAuthState(prev => ({ ...prev, loading: false }))
    }
    
    return result
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!authState.user) {
      return { data: null, error: new Error('No user logged in') }
    }

    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    const result = await authService.updateProfile(authState.user.id, updates)
    
    if (result.error) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: result.error.message 
      }))
    } else {
      setAuthState(prev => ({ 
        ...prev, 
        profile: result.data,
        loading: false 
      }))
    }
    
    return result
  }

  const uploadAvatar = async (file: File) => {
    if (!authState.user) {
      return { publicUrl: null, error: new Error('No user logged in') }
    }

    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    const result = await authService.uploadAvatar(authState.user.id, file)
    
    if (result.error) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: result.error.message 
      }))
    } else {
      // Update profile with new avatar URL
      if (result.data?.publicUrl) {
        setAuthState(prev => ({ 
          ...prev, 
          profile: prev.profile ? { ...prev.profile, avatar_url: result.data.publicUrl } : null,
          loading: false 
        }))
      } else {
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    }
    
    return result
  }

  const refreshProfile = async () => {
    if (!authState.user) return
    
    setAuthState(prev => ({ ...prev, loading: true }))
    await fetchProfile(authState.user.id)
  }

  // Set profile directly (useful for login flows)
  const setProfile = (profile: UserProfile | null) => {
    setAuthState(prev => ({ 
      ...prev, 
      profile, 
      loading: false 
    }));
  }

  // Force a complete authentication reset
  const forceAuthReset = async () => {
    
    try {
      // Clear all local state first
      setAuthState({
        user: null,
        session: null,
        profile: null,
        loading: false,
        error: null,
      });
      
      // Try to sign out from Supabase (in case there's a hidden session)
      try {
        // Use the supabase instance that's already imported
        await supabase.auth.signOut();
      } catch (signOutError) {
      }
      
      // Clear any stored tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
        // Also clear any other potential storage keys
        localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/https?:\/\//, '') + '-auth-token');
        sessionStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/https?:\/\//, '') + '-auth-token');
      }
      
      
      // Force a page reload to clear any remaining state
      window.location.reload();
    } catch (error) {
      console.error('❌ ForceAuthReset: Error during reset:', error);
    }
  };

  const value: AuthContextType = {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    uploadAvatar,
    refreshProfile,
    setProfile,
    forceAuthReset,
    isInitialized,
  }

  return (
    <AuthContext.Provider value={value}>
      {!isInitialized ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Initializing...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
} 
