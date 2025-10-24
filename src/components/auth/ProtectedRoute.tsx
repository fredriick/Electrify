'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { canAccessRoute, getRedirectPath } from '@/lib/auth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  fallback
}) => {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    console.log('🔍 ProtectedRoute useEffect:', { 
      loading, 
      user: !!user, 
      profile: !!profile, 
      profileRole: profile?.role,
      pathname,
      requiredRoles,
      isInitialized
    })

    // Add a small delay to ensure auth has time to initialize properly
    const timer = setTimeout(() => {
      setIsInitialized(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isInitialized) return // Wait for initialization
    
    if (loading) return // Wait for auth to initialize

    // If no user, redirect to login
    if (!user) {
      console.log('🔍 ProtectedRoute: No user, redirecting to login')
      router.push('/login')
      return
    }

    // If profile not loaded yet, wait a bit longer
    if (!profile) {
      console.log('🔍 ProtectedRoute: No profile yet, waiting...')
      return
    }

    console.log('🔍 ProtectedRoute: Checking route access for role:', profile.role, 'pathname:', pathname)

    // Check if user can access this route
    const canAccess = canAccessRoute(profile, pathname)
    console.log('🔍 ProtectedRoute: Can access route:', canAccess)
    
    if (!canAccess) {
      const redirectPath = getRedirectPath(profile)
      console.log('🔍 ProtectedRoute: Cannot access route, redirecting to:', redirectPath)
      router.push(redirectPath)
      return
    }

    // Check if user has required roles
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.includes(profile.role)
      console.log('🔍 ProtectedRoute: Required roles:', requiredRoles, 'User role:', profile.role, 'Has required role:', hasRequiredRole)
      
      if (!hasRequiredRole) {
        const redirectPath = getRedirectPath(profile)
        console.log('🔍 ProtectedRoute: Missing required role, redirecting to:', redirectPath)
        router.push(redirectPath)
        return
      }
    }

    console.log('🔍 ProtectedRoute: Access granted!')
  }, [user, profile, loading, pathname, router, requiredRoles, isInitialized])

  // Show loading spinner while checking auth
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Show fallback or loading while redirecting
  if (!user || !profile) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Check if user can access this route
  if (!canAccessRoute(profile, pathname)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Check if user has required roles
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(profile.role)
    if (!hasRequiredRole) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )
    }
  }

  return <>{children}</>
}

// Convenience components for different user types
export const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['CUSTOMER']}>
    {children}
  </ProtectedRoute>
)

export const SupplierRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['SUPPLIER']}>
    {children}
  </ProtectedRoute>
)

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN']}>
    {children}
  </ProtectedRoute>
)

export const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['super_admin']}>
    {children}
  </ProtectedRoute>
) 