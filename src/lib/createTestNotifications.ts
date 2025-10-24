// Temporary script to create test notifications for admin dashboard
// This can be run in the browser console to test the notification system

import { getSupabaseClient } from '@/lib/auth';

export async function createTestNotifications() {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) {
    console.error('Supabase client not initialized');
    return;
  }

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('No authenticated user found');
      return;
    }

    // Create test notifications
    const testNotifications = [
      {
        user_id: user.id,
        title: 'Test Admin Notification',
        message: 'This is a test notification for the admin dashboard',
        type: 'INFO',
        is_read: false,
        metadata: { test: true, created_by: 'admin_test_script' }
      },
      {
        user_id: user.id,
        title: 'System Status Update',
        message: 'All systems are running normally',
        type: 'SUCCESS',
        is_read: false,
        metadata: { system_status: 'normal', timestamp: new Date().toISOString() }
      },
      {
        user_id: user.id,
        title: 'Security Alert',
        message: 'Test security alert for admin dashboard',
        type: 'ALERT',
        is_read: false,
        metadata: { alert_type: 'test', severity: 'low' }
      }
    ];

    const { data, error } = await supabaseClient
      .from('notifications')
      .insert(testNotifications);

    if (error) {
      console.error('Error creating test notifications:', error);
    } else {
      console.log('Test notifications created successfully:', data);
    }
  } catch (error) {
    console.error('Error in createTestNotifications:', error);
  }
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).createTestNotifications = createTestNotifications;
}
