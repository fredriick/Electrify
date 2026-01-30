import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';


  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.delete(name);
        },
      },
    }
  );

  // First, check if user is already authenticated (from email verification)
  const { data: { user: existingUser } } = await supabase.auth.getUser();

  if (existingUser) {

    // Check if the user is a supplier and needs to be verified
    // First, try to find the user in each role-specific table
    let profile = null;
    let userRole = null;
    let isVerified = false;

    // Check suppliers table first (for seller registration flow)
    const { data: supplierProfile, error: supplierError } = await supabase
      .from('suppliers')
      .select('is_verified, role')
      .eq('id', existingUser.id)
      .single();


    if (supplierProfile && !supplierError) {
      profile = supplierProfile;
      userRole = supplierProfile.role || 'SUPPLIER';
      isVerified = supplierProfile.is_verified;
    } else {
      // Check customers table
      const { data: customerProfile, error: customerError } = await supabase
        .from('customers')
        .select('is_verified, role')
        .eq('id', existingUser.id)
        .single();


      if (customerProfile && !customerError) {
        profile = customerProfile;
        userRole = customerProfile.role || 'CUSTOMER';
        isVerified = customerProfile.is_verified;
      } else {
        // Check admins table
        const { data: adminProfile, error: adminError } = await supabase
          .from('admins')
          .select('is_verified, role')
          .eq('id', existingUser.id)
          .single();


        if (adminProfile && !adminError) {
          profile = adminProfile;
          userRole = adminProfile.role || 'ADMIN';
          isVerified = adminProfile.is_verified;
        } else {
          // Check super_admins table
          const { data: superAdminProfile, error: superAdminError } = await supabase
            .from('super_admins')
            .select('is_verified, role')
            .eq('id', existingUser.id)
            .single();


          if (superAdminProfile && !superAdminError) {
            profile = superAdminProfile;
            userRole = superAdminProfile.role || 'SUPER_ADMIN';
            isVerified = superAdminProfile.is_verified;
          } else {
          }
        }
      }
    }

    // Log the redirect decision

    // If user is not verified, update verification status in the appropriate table
    if (!isVerified) {
      let tableName = '';
      switch (userRole) {
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
          break;
      }


      if (tableName) {
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ is_verified: true })
          .eq('id', existingUser.id);

        if (updateError) {
          console.error('Error updating verification status:', updateError);
        } else {
        }
      } else {
      }
    } else {
    }

    // Redirect based on user role
    if (userRole === 'SUPPLIER') {
      return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
    } else if (userRole === 'CUSTOMER') {
      return NextResponse.redirect(new URL('/', requestUrl.origin));
    } else if (userRole === 'ADMIN') {
      console.log('Auth callback - Redirecting admin to /admin-dashboard');
      return NextResponse.redirect(new URL('/admin-dashboard', requestUrl.origin));
    } else if (userRole === 'SUPER_ADMIN') {
      console.log('Auth callback - Redirecting super admin to /super-admin-dashboard');
      return NextResponse.redirect(new URL('/super-admin-dashboard', requestUrl.origin));
    } else {
      console.log('Auth callback - No role found, redirecting to:', next);
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  if (code) {
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(new URL('/login?error=verification_failed', requestUrl.origin));
      }

      if (data.user) {
        // Check if the user is a supplier and needs to be verified
        // First, try to find the user in each role-specific table
        let profile = null;
        let userRole = null;
        let isVerified = false;

        // Check suppliers table first (for seller registration flow)
        const { data: supplierProfile, error: supplierError } = await supabase
          .from('suppliers')
          .select('is_verified, role')
          .eq('id', data.user.id)
          .single();


        if (supplierProfile && !supplierError) {
          profile = supplierProfile;
          userRole = supplierProfile.role || 'SUPPLIER';
          isVerified = supplierProfile.is_verified;
        } else {
          // Check customers table
          const { data: customerProfile, error: customerError } = await supabase
            .from('customers')
            .select('is_verified, role')
            .eq('id', data.user.id)
            .single();


          if (customerProfile && !customerError) {
            profile = customerProfile;
            userRole = customerProfile.role || 'CUSTOMER';
            isVerified = customerProfile.is_verified;
          } else {
            // Check admins table
            const { data: adminProfile, error: adminError } = await supabase
              .from('admins')
              .select('is_verified, role')
              .eq('id', data.user.id)
              .single();


            if (adminProfile && !adminError) {
              profile = adminProfile;
              userRole = adminProfile.role || 'ADMIN';
              isVerified = adminProfile.is_verified;
            } else {
              // Check super_admins table
              const { data: superAdminProfile, error: superAdminError } = await supabase
                .from('super_admins')
                .select('is_verified, role')
                .eq('id', data.user.id)
                .single();


              if (superAdminProfile && !superAdminError) {
                profile = superAdminProfile;
                userRole = superAdminProfile.role || 'SUPER_ADMIN';
                isVerified = superAdminProfile.is_verified;
              } else {
              }
            }
          }
        }

        // Log the redirect decision
        console.log('Auth callback - User ID:', data.user.id);
        console.log('Auth callback - User email:', data.user.email);

        // If user is not verified, update verification status in the appropriate table
        if (!isVerified) {
          let tableName = '';
          switch (userRole) {
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
              break;
          }

          console.log('Auth callback - User ID:', data.user.id);

          if (tableName) {
            const { error: updateError } = await supabase
              .from(tableName)
              .update({ is_verified: true })
              .eq('id', data.user.id);

            if (updateError) {
              console.error('Error updating verification status:', updateError);
            } else {
            }
          } else {
          }
        } else {
        }

        // Redirect based on user role
        if (userRole === 'SUPPLIER') {
          return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
        } else if (userRole === 'CUSTOMER') {
          return NextResponse.redirect(new URL('/', requestUrl.origin));
        } else if (userRole === 'ADMIN') {
          console.log('Auth callback - Redirecting admin to /admin-dashboard');
          return NextResponse.redirect(new URL('/admin-dashboard', requestUrl.origin));
        } else if (userRole === 'SUPER_ADMIN') {
          console.log('Auth callback - Redirecting super admin to /super-admin-dashboard');
          return NextResponse.redirect(new URL('/super-admin-dashboard', requestUrl.origin));
        } else {
          console.log('Auth callback - No role found, redirecting to:', next);
          return NextResponse.redirect(new URL(next, requestUrl.origin));
        }
      }
    } catch (error) {
      console.error('Error in auth callback:', error);
      return NextResponse.redirect(new URL('/login?error=verification_failed', requestUrl.origin));
    }
  }

  // If no code, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
} 