"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Save,
  CheckCircle,
  Camera
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getSupabaseSessionClient } from "@/lib/auth";

export default function UserSettingsPage() {
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // User profile data - initialize with real data from AuthContext
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    country: "",
    state: "",
    avatar: null as string | null
  });












  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      if (section === 'profile') {
        
        if (!user || !profile) {
          throw new Error('User not authenticated or profile not found');
        }
        
        // Test user permissions
        const supabaseClient = getSupabaseSessionClient();
        const { data: testData, error: testError } = await supabaseClient
          .from('customers')
          .select('id, first_name, last_name')
          .eq('id', profile.id)
          .limit(1);
        
        if (testError) {
          console.error('❌ Permission test failed:', testError);
          throw new Error(`Permission test failed: ${testError.message}`);
        }
        
        // Prepare the update data
        const updateData = {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          date_of_birth: profileData.dateOfBirth || null,
          address: profileData.address || null,
          country: profileData.country,
          state: profileData.state,
          avatar_url: profileData.avatar,
          updated_at: new Date().toISOString()
        };
        
        
        // Update customer profile in database
        const { data, error } = await supabaseClient
          .from('customers')
          .update(updateData)
          .eq('id', profile?.id)
          .select('*');
        

        if (error) {
          console.error('❌ Failed to update profile:', error);
          throw new Error(`Failed to update profile: ${error.message}`);
        }

        if (!data || data.length === 0) {
          console.error('❌ Database update returned no data - update may have failed');
          throw new Error('Database update returned no data - update may have failed');
        }

        
        // Refresh the profile from the database to show updated data
        try {
          await refreshProfile();
        } catch (refreshError) {
          console.warn('⚠️ Profile refresh failed, but data was saved:', refreshError);
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
      alert(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
  };



  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({ ...prev, avatar: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };



  // Load real profile data when available
  useEffect(() => {
    if (profile) {
      
      // Handle the case where full name might be stored in first_name
      let firstName = profile.first_name || "";
      let lastName = profile.last_name || "";
      
      // If last_name is empty but first_name contains full name, split it
      if (!lastName && firstName.includes(' ')) {
        const nameParts = firstName.split(' ');
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      }
      
      setProfileData({
        firstName: firstName,
        lastName: lastName,
        email: profile.email || "",
        phone: profile.phone || "",
        dateOfBirth: profile.date_of_birth || "",
        address: profile.address || "",
        state: profile.state || "",
        country: profile.country || "",
        avatar: profile.avatar_url || null
      });
      
      // Mark as initialized once we have profile data
      setIsInitializing(false);
    }
  }, [profile?.id]);



  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user?.id, authLoading, router]);

  // Show loading while initializing
  if (isInitializing) {
  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading settings...</p>
          </div>
        </div>
    );
  }

  // Show error if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Please log in to access settings.</p>
            </div>
            </div>
    );
  }


  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Success/Error Messages */}
        {saved && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-green-800 dark:text-green-200">Settings saved successfully!</span>
            </div>
          </div>
        )}

        {/* Profile Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 lg:p-6">
            <div className="flex items-center mb-6">
              <User className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h2>
            </div>
            
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      {profileData.avatar ? (
                        <img 
                          src={profileData.avatar} 
                          alt="Profile" 
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-gray-400" />
                      )}
                  </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Profile Photo</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Upload a new profile photo
                    </p>
                  </div>
                </div>
                
                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleProfileChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleProfileChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
                </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                </div>
                
                {/* Location Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Location Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Country
                      </label>
                      <select
                        value={profileData.country}
                        onChange={(e) => handleProfileChange('country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Country</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Italy">Italy</option>
                        <option value="Spain">Spain</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Kenya">Kenya</option>
                        <option value="South Africa">South Africa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        State/Province
                      </label>
                      <select
                        value={profileData.state}
                        onChange={(e) => handleProfileChange('state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select State</option>
                        {profileData.country === "United States" && (
                          <>
                            <option value="California">California</option>
                            <option value="New York">New York</option>
                            <option value="Texas">Texas</option>
                            <option value="Florida">Florida</option>
                            <option value="Illinois">Illinois</option>
                          </>
                        )}
                        {profileData.country === "Nigeria" && (
                          <>
                            <option value="Lagos">Lagos</option>
                            <option value="Abuja">Abuja</option>
                            <option value="Kano">Kano</option>
                            <option value="Rivers">Rivers</option>
                            <option value="Kaduna">Kaduna</option>
                          </>
                        )}
                        {profileData.country === "Canada" && (
                          <>
                            <option value="Ontario">Ontario</option>
                            <option value="Quebec">Quebec</option>
                            <option value="British Columbia">British Columbia</option>
                            <option value="Alberta">Alberta</option>
                          </>
                        )}
                        {profileData.country === "Kenya" && (
                          <>
                            <option value="Nairobi">Nairobi</option>
                            <option value="Mombasa">Mombasa</option>
                            <option value="Kisumu">Kisumu</option>
                          </>
                        )}
                        {profileData.country === "South Africa" && (
                          <>
                            <option value="Gauteng">Gauteng</option>
                            <option value="Western Cape">Western Cape</option>
                            <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => handleProfileChange('address', e.target.value)}
                        placeholder="Enter your street address"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                  </div>
            </div>
            
                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-600">
                    <button 
                    onClick={() => handleSave('profile')}
                    disabled={saving}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
                </div>
              </div>
            </div>
        </div>
      </div>
  );
} 