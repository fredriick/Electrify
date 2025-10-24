// Test function for seller notifications
// This can be called from the browser console to test the seller notification system

import { notificationService } from '@/lib/notificationService';
import { useAuth } from '@/contexts/AuthContext';

// Function to test seller notifications
export async function testSellerNotifications() {
  console.log('🧪 Testing seller notification system...');
  
  // Get current user from auth context
  const { user } = useAuth();
  
  if (!user?.id) {
    console.error('❌ No user found. Please make sure you are logged in as a seller.');
    return;
  }
  
  console.log('👤 Current user ID:', user.id);
  
  try {
    // Test 1: Create a test notification
    console.log('📝 Creating test notification...');
    const createResult = await notificationService.createTestNotification(user.id);
    console.log('✅ Test notification created:', createResult);
    
    // Test 2: Fetch notifications
    console.log('📥 Fetching notifications...');
    const notifications = await notificationService.getNotifications(user.id, 10);
    console.log('📋 Notifications found:', notifications.length, notifications);
    
    // Test 3: Get unread count
    console.log('🔢 Getting unread count...');
    const unreadCount = await notificationService.getUnreadCount(user.id);
    console.log('🔴 Unread count:', unreadCount);
    
    // Test 4: Create sample notifications
    console.log('📦 Creating sample notifications...');
    const sampleResult = await notificationService.createSampleNotifications(user.id);
    console.log('✅ Sample notifications created:', sampleResult);
    
    // Test 5: Fetch notifications again
    console.log('📥 Fetching notifications again...');
    const updatedNotifications = await notificationService.getNotifications(user.id, 10);
    console.log('📋 Updated notifications:', updatedNotifications.length, updatedNotifications);
    
    console.log('🎉 Seller notification test completed!');
    
  } catch (error) {
    console.error('❌ Error testing seller notifications:', error);
  }
}

// Function to create a test notification for the current seller
export async function createSellerTestNotification() {
  const { user } = useAuth();
  
  if (!user?.id) {
    console.error('❌ No user found. Please make sure you are logged in as a seller.');
    return;
  }
  
  console.log('📝 Creating test notification for seller:', user.id);
  
  try {
    const result = await notificationService.createTestNotification(user.id);
    console.log('✅ Test notification created:', result);
    
    if (result) {
      console.log('🔄 Please refresh the seller dashboard to see the notification.');
    }
  } catch (error) {
    console.error('❌ Error creating test notification:', error);
  }
}

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testSellerNotifications = testSellerNotifications;
  (window as any).createSellerTestNotification = createSellerTestNotification;
}
