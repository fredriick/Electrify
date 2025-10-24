"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CollapsibleCard, StatusType } from "@/components/ui/CollapsibleCard";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { 
  Users, 
  CheckCircle, 
  Store, 
  UploadCloud, 
  FileCheck2, 
  Clock,
  Building2,
  Truck,
  CreditCard,
  Settings,
  Bell,
  User,
  FileText,
  AlertCircle
} from "lucide-react";
import { useAppSelector, useAppDispatch } from '@/store/store';
import { setStoreName } from '@/store/slices/storeSettingsSlice';
import { useAuth } from '@/contexts/AuthContext';
import { profileService, SupplierProfile, ProfileCompletion } from '@/lib/profileService';
import { getSupabaseClient, getSupabaseSessionClient } from '@/lib/auth';
import { 
  validateEmail, 
  validatePhone, 
  validateRequired, 
  validateUrl, 
  validateTaxId, 
  validateAccountNumber, 
  validateRoutingNumber,
  validateFile,
  ValidationError 
} from '@/lib/validation';

export default function ProfilePage() {
  const storeName = useAppSelector((state) => state.storeSettings.storeName);
  const dispatch = useAppDispatch();
  const { user, profile: authProfile, loading: authLoading, refreshProfile } = useAuth();
  
  // Profile data state
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Accordion state - only one section open at a time
  const [openSection, setOpenSection] = useState<string | null>('shop-info');
  
  // Success states for each section
  const [shopSuccess, setShopSuccess] = useState(false);
  const [businessSuccess, setBusinessSuccess] = useState(false);
  const [shippingSuccess, setShippingSuccess] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  // Error states for each section
  const [shopErrors, setShopErrors] = useState<ValidationError[]>([]);
  const [businessErrors, setBusinessErrors] = useState<ValidationError[]>([]);
  const [shippingErrors, setShippingErrors] = useState<ValidationError[]>([]);
  const [paymentErrors, setPaymentErrors] = useState<ValidationError[]>([]);
  const [profileErrors, setProfileErrors] = useState<ValidationError[]>([]);

  // Shop Info state
  const [shopName, setShopName] = useState(storeName);
  const [shopEmail, setShopEmail] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [shopWebsite, setShopWebsite] = useState("");
  const [customerCareEmail, setCustomerCareEmail] = useState("");
  const [customerCarePhone, setCustomerCarePhone] = useState("");
  const [shopLogo, setShopLogo] = useState<string | null>(null);
  const [shopLogoPreview, setShopLogoPreview] = useState<string | null>(null);
  const [shopLogoFile, setShopLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Business Info state
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [taxId, setTaxId] = useState("");
  const [businessLicense, setBusinessLicense] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [legalRepFullName, setLegalRepFullName] = useState("");
  const [legalRepIdType, setLegalRepIdType] = useState("Passport");
  const [businessDocuments, setBusinessDocuments] = useState<{ [key: string]: File | null }>({
    license: null,
    taxCertificate: null,
  });
  
  const [uploadedDocuments, setUploadedDocuments] = useState<{ [key: string]: string | null }>({
    license: null,
    taxCertificate: null,
    bankDocument: null,
  });

  // Shipping Info state
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingEmail, setShippingEmail] = useState("");
  const [shippingMethod, setShippingMethod] = useState("Standard");
  const [handlingTime, setHandlingTime] = useState("1-2 business days");
  const [shippingZone, setShippingZone] = useState("Domestic");
  const [returnAddress, setReturnAddress] = useState("");
  const [returnPhone, setReturnPhone] = useState("");
  const [returnEmail, setReturnEmail] = useState("");
  const [useBusinessAddress, setUseBusinessAddress] = useState(false);

  // Payment Info state
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [iban, setIban] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [accountType, setAccountType] = useState("Business Checking");
  const [paymentDocuments, setPaymentDocuments] = useState<{ [key: string]: File | null }>({
    bankDocument: null,
  });

  // Profile & Account state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Profile Required Documents Upload and Approval State
  const [isProfileNewUser, setIsProfileNewUser] = useState(true);
  const [isProfilePendingApproval, setIsProfilePendingApproval] = useState(false);
  const profileRequiredDocs = [
    { key: 'idDocument', label: 'Government-issued ID' },
    { key: 'proofOfAddress', label: 'Proof of Address' },
  ];
  const [profileDocuments, setProfileDocuments] = useState<{ [key: string]: File | null }>({
    idDocument: null,
    proofOfAddress: null,
  });
  
  // State for existing uploaded documents (URLs)
  const [existingProfileDocuments, setExistingProfileDocuments] = useState<{ [key: string]: string | null }>({
    idDocument: null,
    proofOfAddress: null,
  });

  
  // Notification Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [productRecommendations, setProductRecommendations] = useState(false);
  const [priceDrops, setPriceDrops] = useState(true);
  const [newProducts, setNewProducts] = useState(false);
  const [promotions, setPromotions] = useState(true);
  const [newsletter, setNewsletter] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [reviews, setReviews] = useState(true);
  
  // Notification save state
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  // Status states for each section
  const [shopStatus, setShopStatus] = useState<StatusType>('verified');
  const [businessStatus, setBusinessStatus] = useState<StatusType>('pending');
  const [shippingStatus, setShippingStatus] = useState<StatusType>('rejected');
  const [paymentStatus, setPaymentStatus] = useState<StatusType>('pending');
  const [profileStatus, setProfileStatus] = useState<StatusType>('pending');
  const [notificationStatus, setNotificationStatus] = useState<StatusType>('none');

  // Section completion tracking
  const [sectionCompletion, setSectionCompletion] = useState({
    shop: false,
    business: false,
    shipping: false,
    payment: false,
    profile: false
  });

  // Calculate completion status based on real profile data
  const calculateCompletionPercentage = () => {
    if (!profileCompletion) return 0;
    return profileCompletion.percentage;
  };

  const completedSections = profileCompletion?.completedSections || 0;
  const totalSections = profileCompletion?.totalSections || 5;
  const completionPercentage = calculateCompletionPercentage();

  // Update return address when business address is selected
  useEffect(() => {
    if (useBusinessAddress) {
      setReturnAddress(businessAddress);
      setReturnPhone(shopPhone); // Use shop phone as return phone
      setReturnEmail(shopEmail); // Use shop email as return email
    }
  }, [useBusinessAddress, businessAddress, shopPhone, shopEmail]);

  // Update section completion status
  useEffect(() => {
    const newCompletion = {
      shop: Boolean(shopName?.trim() && shopEmail?.trim() && customerCareEmail?.trim() && !shopErrors.length),
      business: Boolean(businessName?.trim() && businessAddress?.trim() && legalRepFullName?.trim() && !businessErrors.length),
      shipping: Boolean(shippingAddress?.trim() && returnAddress?.trim() && returnPhone?.trim() && returnEmail?.trim() && !shippingErrors.length),
      payment: Boolean(bankName?.trim() && accountNumber?.trim() && iban?.trim() && swiftCode?.trim() && !paymentErrors.length),
      profile: Boolean(name?.trim() && email?.trim() && username?.trim() && !profileErrors.length)
    };
    setSectionCompletion(newCompletion);
  }, [
    shopName, shopEmail, customerCareEmail, shopErrors,
    businessName, businessAddress, legalRepFullName, businessErrors,
    shippingAddress, returnAddress, returnPhone, returnEmail, shippingErrors,
    bankName, accountNumber, iban, swiftCode, paymentErrors,
    name, email, username, profileErrors
  ]);

  // Update status based on real profile completion data
  useEffect(() => {
    if (profileCompletion) {
      setShopStatus(profileCompletion.sections.shop.status);
      setBusinessStatus(profileCompletion.sections.business.status);
      setShippingStatus(profileCompletion.sections.shipping.status);
      setPaymentStatus(profileCompletion.sections.payment.status);
      setProfileStatus(profileCompletion.sections.profile.status);
    }
  }, [profileCompletion]);

  // Add seller type state and detection
  const [sellerType, setSellerType] = useState<'individual' | 'company'>('company'); // Default to company for demo, in real app this would come from user profile
  const [formInitialized, setFormInitialized] = useState(false);

  // Add seller type detection from real profile data
  useEffect(() => {
    if (profile) {
      const userSellerType = profileService.getSellerType(profile);
      setSellerType(userSellerType);
    }
  }, [profile]);

  // File upload handlers
  const handleFileChange = (setter: (value: string | null) => void, setPreview: (value: string | null) => void) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setter(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
      }
    };

  // Special handler for shop logo that stores the File object
  const handleShopLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setShopLogo(file.name);
      setShopLogoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setShopLogoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
      }
    };

  const handleDocumentChange = (documents: { [key: string]: File | null }, setDocuments: (docs: { [key: string]: File | null }) => void) =>
    (key: string, file: File | null) => {
      setDocuments({ ...documents, [key]: file });
    };

  const handleProfileDocChange = (key: string, file: File | null) => {
    setProfileDocuments(prev => ({ ...prev, [key]: file }));
  };

  const handleAvatarChange = (file: File | null) => {
    if (file) {
      setAvatarFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  // Validation functions
  const validateShopInfo = () => {
    const errors: ValidationError[] = [];
    
    const nameError = validateRequired(shopName, 'Shop Name');
    if (nameError) errors.push({ field: 'shopName', message: nameError });
    
    const emailError = validateEmail(shopEmail);
    if (emailError) errors.push({ field: 'shopEmail', message: emailError });
    
    const phoneError = validatePhone(shopPhone);
    if (phoneError) errors.push({ field: 'shopPhone', message: phoneError });
    
    const urlError = validateUrl(shopWebsite);
    if (urlError) errors.push({ field: 'shopWebsite', message: urlError });
    
    const customerCareEmailError = validateEmail(customerCareEmail);
    if (customerCareEmailError) errors.push({ field: 'customerCareEmail', message: customerCareEmailError });
    
    const customerCarePhoneError = validatePhone(customerCarePhone);
    if (customerCarePhoneError) errors.push({ field: 'customerCarePhone', message: customerCarePhoneError });
    
    // Check if shop phone and customer care phone are the same
    if (shopPhone && customerCarePhone && shopPhone === customerCarePhone) {
      errors.push({ field: 'customerCarePhone', message: 'Customer care phone must be different from shop phone' });
    }
    
    setShopErrors(errors);
    return errors.length === 0;
  };

  const validateBusinessInfo = () => {
    const errors: ValidationError[] = [];
    
    const nameError = validateRequired(businessName, 'Business Name');
    if (nameError) errors.push({ field: 'businessName', message: nameError });
    
    const addressError = validateRequired(businessAddress, 'Business Address');
    if (addressError) errors.push({ field: 'businessAddress', message: addressError });
    
    const taxIdError = validateTaxId(taxId);
    if (taxIdError) errors.push({ field: 'taxId', message: taxIdError });
    
    const legalRepNameError = validateRequired(legalRepFullName, 'Legal Representative Full Name');
    if (legalRepNameError) errors.push({ field: 'legalRepFullName', message: legalRepNameError });
    
    setBusinessErrors(errors);
    return errors.length === 0;
  };

  const validateShippingInfo = () => {
    const errors: ValidationError[] = [];
    
    const addressError = validateRequired(shippingAddress, 'Shipping Address');
    if (addressError) errors.push({ field: 'shippingAddress', message: addressError });
    
    const phoneError = validatePhone(shippingPhone);
    if (phoneError) errors.push({ field: 'shippingPhone', message: phoneError });
    
    const emailError = validateEmail(shippingEmail);
    if (emailError) errors.push({ field: 'shippingEmail', message: emailError });
    
    const returnAddressError = validateRequired(returnAddress, 'Return Address');
    if (returnAddressError) errors.push({ field: 'returnAddress', message: returnAddressError });
    
    const returnPhoneError = validatePhone(returnPhone);
    if (returnPhoneError) errors.push({ field: 'returnPhone', message: returnPhoneError });
    
    const returnEmailError = validateEmail(returnEmail);
    if (returnEmailError) errors.push({ field: 'returnEmail', message: returnEmailError });
    
    // Ensure shipping and return phone numbers are different
    if (shippingPhone && returnPhone && shippingPhone === returnPhone) {
      errors.push({ field: 'returnPhone', message: 'Return phone number must be different from shipping phone number' });
    }
    
    setShippingErrors(errors);
    return errors.length === 0;
  };

  const validatePaymentInfo = () => {
    const errors: ValidationError[] = [];
    
    const bankError = validateRequired(bankName, 'Bank Name');
    if (bankError) errors.push({ field: 'bankName', message: bankError });
    
    const accountError = validateAccountNumber(accountNumber);
    if (accountError) errors.push({ field: 'accountNumber', message: accountError });
    
    const ibanError = validateRequired(iban, 'IBAN');
    if (ibanError) errors.push({ field: 'iban', message: ibanError });
    
    const swiftError = validateRequired(swiftCode, 'SWIFT Code');
    if (swiftError) errors.push({ field: 'swiftCode', message: swiftError });
    
    setPaymentErrors(errors);
    return errors.length === 0;
  };

  const validateProfileInfo = () => {
    const errors: ValidationError[] = [];
    
    const nameError = validateRequired(name, 'First Name');
    if (nameError) errors.push({ field: 'name', message: nameError });
    
    const usernameError = validateRequired(username, 'Last Name');
    if (usernameError) errors.push({ field: 'username', message: usernameError });
    
    const emailError = validateEmail(email);
    if (emailError) errors.push({ field: 'email', message: emailError });
    
    const phoneError = validatePhone(phone);
    if (phoneError) errors.push({ field: 'phone', message: phoneError });
    
    setProfileErrors(errors);
    return errors.length === 0;
  };

  // Form submission handlers
  const handleShopSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShopInfo()) {
      try {
        
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        
        // Get authenticated client
        const storageType = typeof window !== 'undefined' ? localStorage.getItem('auth-storage-type') : null;
        
        const supabaseClient = storageType === 'sessionStorage' ? getSupabaseSessionClient() : getSupabaseClient();
        
        // Check if client is authenticated
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        // Prepare shop data updates
        const shopUpdates = {
          shop_name: shopName,
          email: shopEmail,
          phone: shopPhone,
          company_website: shopWebsite,
          contact_person_email: customerCareEmail,
          contact_person_phone: customerCarePhone,
        };
        
        
        // Handle logo upload if there's a new logo file
        if (shopLogoFile) {
          setUploadingLogo(true);
          
          try {
            const logoResult = await profileService.uploadShopLogo(user.id, shopLogoFile, supabaseClient);
            
            if (logoResult.success) {
              // Clear the file state after successful upload
              setShopLogoFile(null);
              // Refresh the profile in AuthContext to show the new logo in the sidebar
              try {
                await refreshProfile();
              } catch (error) {
                console.error('❌ Error refreshing profile:', error);
              }
            } else {
              console.error('❌ Logo upload failed:', logoResult.error);
              alert(`Logo upload failed: ${logoResult.error}`);
              setUploadingLogo(false);
              return;
            }
          } catch (error) {
            console.error('❌ Logo upload error:', error);
            alert(`Logo upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setUploadingLogo(false);
            return;
          } finally {
            setUploadingLogo(false);
          }
        }
        
        // Save to database
        
        const result = await profileService.updateSupplierProfileWithClient(user.id, shopUpdates, supabaseClient);
        
        if (result.success) {
          // Update Redux store
      dispatch(setStoreName(shopName));
          
          // Show success message
      setShopSuccess(true);
      setTimeout(() => setShopSuccess(false), 2500);
          
          // Don't refresh profile data immediately - the form already has the correct values
          // This prevents overwriting user input with potentially stale database values
        } else {
          // Show error message
          console.error('❌ Save failed:', result.error);
          alert(`Failed to save shop info: ${result.error}`);
        }
      } catch (error) {
        console.error('❌ Error saving shop info:', error);
        alert(`Failed to save shop info: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleBusinessSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateBusinessInfo()) {
      try {
        // Get authenticated client
        const storageType = typeof window !== 'undefined' ? localStorage.getItem('auth-storage-type') : null;
        const supabaseClient = storageType === 'sessionStorage' ? getSupabaseSessionClient() : getSupabaseClient();
        
        // Prepare business data updates
        const businessUpdates = {
          company_name: businessName,
          business_type: businessType,
          tax_id: taxId,
          business_license: businessLicense,
          company_address: businessAddress,
          legal_rep_full_name: legalRepFullName,
          legal_rep_id_type: legalRepIdType,
        };
        
        // Handle business document uploads if there are new files
        if (businessDocuments.license) {
          const licenseResult = await profileService.uploadBusinessDocument(user!.id, businessDocuments.license, 'business_license', supabaseClient);
          
          if (licenseResult.success) {
            // Don't clear the file state yet - let the profile refresh handle it
          } else {
            console.error('❌ Business license upload failed:', licenseResult.error);
            alert(`Business license upload failed: ${licenseResult.error}`);
            return;
          }
        }
        
        if (businessDocuments.taxCertificate) {
          const taxResult = await profileService.uploadBusinessDocument(user!.id, businessDocuments.taxCertificate, 'tax_certificate', supabaseClient);
          
          if (taxResult.success) {
            // Don't clear the file state yet - let the profile refresh handle it
          } else {
            console.error('❌ Tax certificate upload failed:', taxResult.error);
            alert(`Tax certificate upload failed: ${taxResult.error}`);
            return;
          }
        }
        
        // Save to database
        const result = await profileService.updateSupplierProfileWithClient(user!.id, businessUpdates, supabaseClient);
        
        if (result.success) {
          // Show success message
      setBusinessSuccess(true);
      setTimeout(() => setBusinessSuccess(false), 2500);
          
          // Refresh profile data
          await fetchProfileData();
        } else {
          // Show error message
          alert(`Failed to save business info: ${result.error}`);
        }
      } catch (error) {
        console.error('Error saving business info:', error);
        alert('Failed to save business info. Please try again.');
      }
    }
  };

  const handleShippingSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShippingInfo()) {
      try {
        // Get authenticated client
        const storageType = typeof window !== 'undefined' ? localStorage.getItem('auth-storage-type') : null;
        const supabaseClient = storageType === 'sessionStorage' ? getSupabaseSessionClient() : getSupabaseClient();
        
        // Prepare shipping data updates
        const shippingUpdates = {
          shipping_address: shippingAddress,
          shipping_phone: shippingPhone,
          shipping_email: shippingEmail,
          shipping_method: shippingMethod,
          handling_time: handlingTime,
          shipping_zone: shippingZone,
          return_address: returnAddress,
          return_phone: returnPhone,
          return_email: returnEmail,
        };
        
        // Save to database
        const result = await profileService.updateSupplierProfileWithClient(user!.id, shippingUpdates, supabaseClient);
        
        if (result.success) {
          // Show success message
      setShippingSuccess(true);
      setTimeout(() => setShippingSuccess(false), 2500);
          
          // Refresh profile data
          await fetchProfileData();
        } else {
          // Show error message
          alert(`Failed to save shipping info: ${result.error}`);
        }
      } catch (error) {
        console.error('Error saving shipping info:', error);
        alert('Failed to save shipping info. Please try again.');
      }
    }
  };

  const handlePaymentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePaymentInfo()) {
      try {
        
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        
        // Get authenticated client
        const storageType = typeof window !== 'undefined' ? localStorage.getItem('auth-storage-type') : null;
        const supabaseClient = storageType === 'sessionStorage' ? getSupabaseSessionClient() : getSupabaseClient();
        
        // Handle bank document upload if there's a new file
        if (paymentDocuments.bankDocument) {
          const bankDocResult = await profileService.uploadBankDocument(user.id, paymentDocuments.bankDocument, supabaseClient);
          
          if (bankDocResult.success) {
            // Don't clear the file state yet - let the profile refresh handle it
          } else {
            console.error('❌ Bank document upload failed:', bankDocResult.error);
            alert(`Bank document upload failed: ${bankDocResult.error}`);
            return;
          }
        }
        
        // Prepare payment data updates
        const paymentUpdates = {
          bank_name: bankName,
          account_number: accountNumber,
          iban: iban,
          swift_code: swiftCode,
        };
        
        // Save to database
        const result = await profileService.updateSupplierProfileWithClient(user.id, paymentUpdates, supabaseClient);
        
        if (result.success) {
          // Show success message
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 2500);
          
          // Refresh profile data
          await fetchProfileData();
        } else {
          // Show error message
          alert(`Failed to save payment info: ${result.error}`);
        }
      } catch (error) {
        console.error('Error saving payment info:', error);
        alert('Failed to save payment info. Please try again.');
      }
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateProfileInfo()) {
      try {
        // Get authenticated client
        const storageType = typeof window !== 'undefined' ? localStorage.getItem('auth-storage-type') : null;
        const supabaseClient = storageType === 'sessionStorage' ? getSupabaseSessionClient() : getSupabaseClient();
        
        // Prepare profile data updates
        // First Name field updates first_name, Last Name field updates last_name
        const profileUpdates: any = {
          first_name: name,           // First Name → first_name
          last_name: username,        // Last Name → last_name
          email: email,
          phone: phone,
          avatar_url: avatar,
        };
        
        // Handle profile document uploads (same pattern as business documents)
        if (profileDocuments.idDocument) {
          const govIdResult = await profileService.uploadProfileDocument(user!.id, profileDocuments.idDocument, 'government_id', supabaseClient);
          
          if (govIdResult.success) {
            profileUpdates.government_id_document = govIdResult.url;
          } else {
            console.error('❌ Government ID upload failed:', govIdResult.error);
            alert(`Government ID upload failed: ${govIdResult.error}`);
            return;
          }
        }
        
        if (profileDocuments.proofOfAddress) {
          const addressResult = await profileService.uploadProfileDocument(user!.id, profileDocuments.proofOfAddress, 'proof_of_address', supabaseClient);
          
          if (addressResult.success) {
            profileUpdates.proof_of_address_document = addressResult.url;
          } else {
            console.error('❌ Proof of Address upload failed:', addressResult.error);
            alert(`Proof of Address upload failed: ${addressResult.error}`);
            return;
          }
        }
        
        // Handle avatar upload if there's a new file
        if (avatarFile) {
          const avatarResult = await profileService.uploadAvatar(user!.id, avatarFile, supabaseClient);
          
          if (avatarResult.success) {
            // Update avatar state with the new URL
            setAvatar(avatarResult.url || null);
            setAvatarFile(null);
            profileUpdates.avatar_url = avatarResult.url || null;
          } else {
            console.error('❌ Avatar upload failed:', avatarResult.error);
            alert(`Avatar upload failed: ${avatarResult.error}`);
            return;
          }
        }
        
        // Save to database
        const result = await profileService.updateSupplierProfileWithClient(user!.id, profileUpdates, supabaseClient);
        
        if (result.success) {
          // Show success message
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2500);
          
          // Clear document states after successful upload
          setProfileDocuments({
            idDocument: null,
            proofOfAddress: null,
          });
          
          // Refresh profile data
          await fetchProfileData();
        } else {
          // Show error message
          alert(`Failed to save profile info: ${result.error}`);
        }
      } catch (error) {
        console.error('Error saving profile info:', error);
        alert('Failed to save profile info. Please try again.');
      }
    }
  };

  const handleNotificationSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) {
      console.error('❌ No profile ID available for saving notifications');
      setNotificationError('No profile ID available');
      return;
    }

    setNotificationLoading(true);
    setNotificationError(null);

    try {

      // Test with just one field first to isolate the issue
      const testUpdate = {
        email_notifications: emailNotifications === true ? false : true  // Test changing the value
      };
      
      
      
      // Prepare notification preferences for new column-based approach
      const notificationUpdate = {
        email_notifications: emailNotifications,
        sms_notifications: smsNotifications,
        push_notifications: pushNotifications,
        order_updates: orderUpdates,
        product_recommendations: productRecommendations,
        price_drops: priceDrops,
        new_products: newProducts,
        promotional_emails: promotions,
        newsletter: newsletter,
        security_alerts: securityAlerts,
        review_notifications: reviews
      };


      // Test single field update first
      const testResult = await profileService.updateSupplierProfileWithClient(
        profile.id,
        testUpdate,
        getSupabaseClient()
      );
      
      // Test: Can we change it back to false?
      const testUpdate2 = { email_notifications: false };
      const testResult2 = await profileService.updateSupplierProfileWithClient(
        profile.id,
        testUpdate2,
        getSupabaseClient()
      );
      
      // Test: Can we change a different boolean field to false?
      const testUpdate3 = { sms_notifications: false };
      const testResult3 = await profileService.updateSupplierProfileWithClient(
        profile.id,
        testUpdate3,
        getSupabaseClient()
      );
      
      // Test: Can we set email_notifications to undefined?
      const testUpdate4 = { email_notifications: undefined };
      const testResult4 = await profileService.updateSupplierProfileWithClient(
        profile.id,
        testUpdate4,
        getSupabaseClient()
      );
      
      // Save to database using profile service
      
      const result = await profileService.updateSupplierProfileWithClient(
        profile.id,
        notificationUpdate,
        getSupabaseClient()
      );
      

      if (result.success) {
        setNotificationSuccess(true);
        setTimeout(() => setNotificationSuccess(false), 3000);
        
        // Don't refresh profile data immediately - it might reload old data
        // Instead, just confirm the save was successful
        
        // Optional: Refresh after a delay to ensure database is updated
        setTimeout(async () => {
          await fetchProfileData();
        }, 1000);
      } else {
        console.error('❌ Failed to save notification preferences:', result.error);
        setNotificationError(result.error || 'Failed to save notification preferences');
      }
    } catch (error) {
      console.error('❌ Error saving notification preferences:', error);
      setNotificationError('An unexpected error occurred while saving preferences');
    } finally {
      setNotificationLoading(false);
    }
  };



  // Accordion handler
  const handleSectionToggle = (sectionId: string) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

  // Helper function to get error message for a field
  const getFieldError = (errors: ValidationError[], fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  // Helper function to render form field with error handling
  const renderField = (
    label: string,
    fieldName: string,
    value: string,
    onChange: (value: string) => void,
    type: string = 'text',
    required: boolean = false,
    errors: ValidationError[] = [],
    options?: { value: string; label: string }[]
  ) => {
    const error = getFieldError(errors, fieldName);
    
    // Generate placeholder based on field type and name
    const getPlaceholder = () => {
      if (type === 'tel') {
        if (fieldName.includes('Phone')) {
          return '+234 811 768 1502';
        }
      }
      if (type === 'email') {
        return 'example@email.com';
      }
      if (type === 'url') {
        return 'https://www.example.com';
      }
      if (fieldName === 'taxId') {
        return 'XX-XXXXXXX or country-specific format';
      }
      return '';
    };
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type === 'select' ? (
          <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              error 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={getPlaceholder()}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              error 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            required={required}
          />
        )}
        {error && (
          <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        {/* Help text for phone fields */}
        {type === 'tel' && !value && !error && (
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            💡 Include country code (e.g., +234 for Nigeria, +1 for US)
          </div>
        )}
        {/* Help text for Tax ID fields */}
        {fieldName === 'taxId' && !value && !error && (
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            💡 Must contain a hyphen (-). Format varies by country (e.g., XX-XXXXXXX, XXX-XX-XXXX)
          </div>
        )}
      </div>
    );
  };



  // Fetch profile data function
    const fetchProfileData = async () => {
      if (authLoading) {
        return;
      }

      if (!user?.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
              // Always fetch fresh data from the database to get the latest contact_person_phone
        let profileData: SupplierProfile | null = await profileService.getSupplierProfile(user.id);
        
        if (profileData) {
          
          setProfile(profileData);
          
          // Calculate profile completion
          const completion = profileService.calculateProfileCompletion(profileData);
          setProfileCompletion(completion);
          
          // Populate form fields with real data
          // Force refresh to update shop fields with new data from database
          populateFormFields(profileData, true);
        } else {
          setError('Failed to fetch profile data');
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, [user?.id, authLoading]);



  const populateFormFields = (profileData: SupplierProfile, forceRefresh: boolean = false) => {
    // Populate fields on first initialization OR when force refresh is requested
    if (!formInitialized || forceRefresh) {
      
    // Shop Information
    setShopName(profileService.getShopName(profileData));
    setShopEmail(profileData.email);
    setShopPhone(profileData.phone || '');
    setShopWebsite(profileData.company_website || '');
    setCustomerCareEmail(profileData.contact_person_email || profileData.email);
      
      // Handle customer care phone more carefully
      
      if (forceRefresh) {
        // On force refresh, only update if the database actually has a value
        // This prevents overwriting user input with empty values
        if (profileData.contact_person_phone && profileData.contact_person_phone.trim() !== '') {
          setCustomerCarePhone(profileData.contact_person_phone);
        } else {
          // Don't change the current value - keep what the user entered
        }
      } else {
        // On first initialization, set the value normally
        if (profileData.contact_person_phone) {
          setCustomerCarePhone(profileData.contact_person_phone);
        } else {
          setCustomerCarePhone('');
        }
      }
      
      setShopLogoPreview(profileData.shop_logo || profileData.avatar_url || null);
      if (profileData.shop_logo) setShopLogo(profileData.shop_logo);
      
      // Mark form as initialized
      if (!formInitialized) {
        setFormInitialized(true);
      }
    }
    
    // Always update these fields as they don't conflict with user input
    // Business Information
    const businessInfo = profileService.getBusinessInfo(profileData);
    setBusinessName(businessInfo.name);
    setBusinessType(businessInfo.type);
    setTaxId(businessInfo.taxId);
    setBusinessLicense(businessInfo.license);
    setBusinessAddress(businessInfo.address);
    setLegalRepFullName(profileData.contact_person || '');

    // Business Documents
    
    setUploadedDocuments(prev => ({
      ...prev,
      license: profileData.business_license_document || null,
      taxCertificate: profileData.tax_certificate_document || null,
      bankDocument: profileData.bank_document || null
    }));

    // Shipping Information - load directly from database fields
    setShippingAddress(profileData.shipping_address || profileData.company_address || '');
    setShippingPhone(profileData.shipping_phone || profileData.company_phone || profileData.phone || '');
    setShippingEmail(profileData.shipping_email || profileData.contact_person_email || profileData.email || '');
    
    // Return Information - load directly from database fields
    setReturnAddress(profileData.return_address || profileData.company_address || '');
    setReturnPhone(profileData.return_phone || profileData.company_phone || profileData.phone || '');
    setReturnEmail(profileData.return_email || profileData.contact_person_email || profileData.email || '');
    
    // Shipping method, handling time, and zone
    setShippingMethod(profileData.shipping_method || 'Standard');
    setHandlingTime(profileData.handling_time || '1-2 business days');
    setShippingZone(profileData.shipping_zone || 'Domestic');

    // Payment Information - load directly from database fields
    setBankName(profileData.bank_name || '');
    setAccountNumber(profileData.account_number || '');
    setIban(profileData.iban || '');
    setSwiftCode(profileData.swift_code || '');

    // Profile Information
    // Only set the fields on initial load, not on every refresh
    if (!formInitialized) {
      // First Name field gets first_name from database
      setName(profileData.first_name || '');
      // Last Name field gets last_name from database
      setUsername(profileData.last_name || '');
    }
    
    setEmail(profileData.email);
    setPhone(profileData.phone || '');
    setAvatarPreview(profileData.avatar_url || null);

    // Load profile documents from dedicated columns
    if (profileData.government_id_document) {
      // Set the existing profile documents state to show uploaded documents
      setExistingProfileDocuments(prev => ({
        ...prev,
        idDocument: profileData.government_id_document || null
      }));
    }
    if (profileData.proof_of_address_document) {
      // Set the existing profile documents state to show uploaded documents
      setExistingProfileDocuments(prev => ({
        ...prev,
        proofOfAddress: profileData.proof_of_address_document || null
      }));
    }

    // Notification Preferences - Use new column-based approach
    // Fallback to JSONB if columns don't exist yet (during migration)
    if (profileData.email_notifications !== undefined) {
      // New column-based approach
      
      // Set values with proper fallbacks for missing columns
      setEmailNotifications(profileData.email_notifications ?? true);
      setSmsNotifications(profileData.sms_notifications ?? false);
      setPushNotifications(profileData.push_notifications ?? true);
      setOrderUpdates(profileData.order_updates ?? true);
      setProductRecommendations(profileData.product_recommendations ?? false);
      setPriceDrops(profileData.price_drops ?? true);
      setNewProducts(profileData.new_products ?? false);
      setPromotions(profileData.promotional_emails ?? true);
      setNewsletter(profileData.newsletter ?? false);
      setSecurityAlerts(profileData.security_alerts ?? true);
      setReviews(profileData.review_notifications ?? true);
      
    } else if (profileData.notification_preferences) {
      // Fallback to JSONB approach during migration
      const prefs = profileData.notification_preferences;
      setEmailNotifications(prefs.emailNotifications ?? true);
      setSmsNotifications(prefs.smsNotifications ?? false);
      setPushNotifications(prefs.pushNotifications ?? true);
      setOrderUpdates(prefs.orderUpdates ?? true);
      setProductRecommendations(prefs.productRecommendations ?? false);
      setPriceDrops(prefs.priceDrops ?? true);
      setNewProducts(prefs.newProducts ?? false);
      setPromotions(prefs.promotions ?? true);
      setNewsletter(prefs.newsletter ?? false);
      setSecurityAlerts(prefs.securityAlerts ?? true);
      setReviews(prefs.reviews ?? true);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto text-center text-red-500">{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
            <Users className="w-7 h-7 text-primary-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile & Store Settings</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your personal information, account settings, and store configuration</p>
            <div className="mt-2 flex items-center gap-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                sellerType === 'company' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              }`}>
                {profile ? profileService.getSellerTypeLabel(profile) : 'Loading...'}
              </span>

            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator 
            completed={completedSections} 
            total={totalSections}
            percentage={completionPercentage}
          />
        </div>

        <div className="space-y-6">
          {/* Shop Info Section */}
          <CollapsibleCard
            title="Shop Information"
            icon={<Store className="w-5 h-5 text-primary-600" />}
            status={shopStatus}
            isOpen={openSection === 'shop-info'}
            onToggle={(isOpen) => setOpenSection(isOpen ? 'shop-info' : null)}
          >
            {shopSuccess && (
              <div className="mb-6 flex items-center gap-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-4 py-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                Shop information saved successfully!
              </div>
            )}

            <form onSubmit={handleShopSave} className="space-y-6">
              {/* Help Section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">📱 Phone Number Format</p>
                    <p className="mb-2">Please include your country code when entering phone numbers:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• <strong>Nigeria:</strong> +234 811 768 1502</li>
                      <li>• <strong>United States:</strong> +1 555 123 4567</li>
                      <li>• <strong>United Kingdom:</strong> +44 20 7946 0958</li>
                    </ul>
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                      <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">⚠️ Important:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>Shop phone</strong> and <strong>customer care phone</strong> must be different numbers</li>
                        <li>• <strong>Shop phone:</strong> Your main business line</li>
                        <li>• <strong>Customer care phone:</strong> Specifically for customer support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField('Shop Name', 'shopName', shopName, setShopName, 'text', true, shopErrors)}
                {renderField('Shop Email', 'shopEmail', shopEmail, setShopEmail, 'email', true, shopErrors)}
                {renderField('Shop Phone', 'shopPhone', shopPhone, setShopPhone, 'tel', false, shopErrors)}
                {renderField('Website', 'shopWebsite', shopWebsite, setShopWebsite, 'url', false, shopErrors)}
                {renderField('Customer Care Email', 'customerCareEmail', customerCareEmail, setCustomerCareEmail, 'email', false, shopErrors)}
                {renderField('Customer Care Phone', 'customerCarePhone', customerCarePhone, setCustomerCarePhone, 'tel', false, shopErrors)}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shop Logo</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleShopLogoChange}
                    disabled={uploadingLogo}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {uploadingLogo && (
                    <div className="flex items-center gap-2 text-primary-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      <span className="text-sm">Uploading...</span>
                    </div>
                  )}
                  {shopLogoPreview && (
                    <img src={shopLogoPreview} alt="Logo Preview" className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-600" />
                  )}
                </div>
                {shopLogo && !shopLogo.startsWith('https://') && <div className="text-xs text-gray-500 mt-1">{shopLogo}</div>}
                {uploadingLogo && (
                  <div className="text-xs text-primary-600 mt-1">Logo will be uploaded when you save shop info</div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Save Shop Info
                </button>
              </div>

              {/* Signed Agreement Section */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Signed Agreement
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Your signed contract with Electrify and this clickable links with pages for
                  </p>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <a 
                      href="/electrify-codes" 
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline font-medium"
                    >
                      Electrify codes
                    </a>
                    <a 
                      href="/policies-guidelines" 
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline font-medium"
                    >
                      policies and guidelines
                    </a>
                    <a 
                      href="/privacy-notice" 
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline font-medium"
                    >
                      Privacy Notice
                    </a>
                    <a 
                      href="/cookie-notice" 
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline font-medium"
                    >
                      Cookie Notice
                    </a>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Signed on:</span> {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </form>
          </CollapsibleCard>

          {/* Business Info Section - Only show for company sellers */}
          {sellerType === 'company' && (
            <CollapsibleCard
              title="Business Information"
              icon={<Building2 className="w-5 h-5 text-primary-600" />}
              status={businessStatus}
              isOpen={openSection === 'business-info'}
              onToggle={(isOpen) => setOpenSection(isOpen ? 'business-info' : null)}
            >
              {businessSuccess && (
                <div className="mb-6 flex items-center gap-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-4 py-3 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  Business information saved successfully!
                </div>
              )}

              <form onSubmit={handleBusinessSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderField('Business Name', 'businessName', businessName, setBusinessName, 'text', true, businessErrors)}
                  {renderField('Business Type', 'businessType', businessType, setBusinessType, 'select', false, businessErrors, [
                    { value: 'Corporation', label: 'Corporation' },
                    { value: 'LLC', label: 'LLC' },
                    { value: 'Partnership', label: 'Partnership' },
                    { value: 'Sole Proprietorship', label: 'Sole Proprietorship' }
                  ])}
                  {renderField('Tax ID', 'taxId', taxId, setTaxId, 'text', false, businessErrors)}
                  {renderField('Business License', 'businessLicense', businessLicense, setBusinessLicense, 'text', false, businessErrors)}
                </div>
                
                {renderField('Business Address', 'businessAddress', businessAddress, setBusinessAddress, 'text', true, businessErrors)}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Legal Representative Details</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('Full Name', 'legalRepFullName', legalRepFullName, setLegalRepFullName, 'text', true, businessErrors)}
                    {renderField('ID Type', 'legalRepIdType', legalRepIdType, setLegalRepIdType, 'select', false, businessErrors, [
                      { value: 'Passport', label: 'Passport' },
                      { value: 'Driver\'s License', label: 'Driver\'s License' },
                      { value: 'Government-issued ID', label: 'Government-issued ID' }
                    ])}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Documents</label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label className="w-48 text-gray-700 dark:text-gray-300 text-sm">Business License</label>
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={e => handleDocumentChange(businessDocuments, setBusinessDocuments)('license', e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                      {businessDocuments.license && <FileCheck2 className="w-5 h-5 text-green-600" />}
                      {uploadedDocuments.license && !businessDocuments.license && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileCheck2 className="w-4 h-4 text-green-600" />
                          <span>Document uploaded</span>
                          <a 
                            href={uploadedDocuments.license} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 underline"
                          >
                            View
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="w-48 text-gray-700 dark:text-gray-300 text-sm">Tax Certificate</label>
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={e => handleDocumentChange(businessDocuments, setBusinessDocuments)('taxCertificate', e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                      {businessDocuments.taxCertificate && <FileCheck2 className="w-5 h-5 text-green-600" />}
                      {uploadedDocuments.taxCertificate && !businessDocuments.taxCertificate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileCheck2 className="w-4 h-4 text-green-600" />
                          <span>Document uploaded</span>
                          <a 
                            href={uploadedDocuments.taxCertificate} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 underline"
                          >
                            View
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Save Business Info
                  </button>
                </div>
              </form>
            </CollapsibleCard>
          )}

          {/* Shipping Info Section */}
          <CollapsibleCard
            title="Shipping Information"
            icon={<Truck className="w-5 h-5 text-primary-600" />}
            status={shippingStatus}
            isOpen={openSection === 'shipping-info'}
            onToggle={(isOpen) => setOpenSection(isOpen ? 'shipping-info' : null)}
          >
            {shippingSuccess && (
              <div className="mb-6 flex items-center gap-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-4 py-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                Shipping information saved successfully!
              </div>
            )}

            <form onSubmit={handleShippingSave} className="space-y-6">
              {/* Help Section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">📱 Phone Number Format</p>
                    <p className="mb-2">Please include your country code when entering phone numbers:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• <strong>Nigeria:</strong> +234 811 768 1502</li>
                      <li>• <strong>United States:</strong> +1 555 123 4567</li>
                      <li>• <strong>United Kingdom:</strong> +44 20 7946 0958</li>
                    </ul>
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                      <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">⚠️ Important:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>Shop phone</strong> and <strong>customer care phone</strong> must be different numbers</li>
                        <li>• <strong>Shop phone:</strong> Your main business line</li>
                        <li>• <strong>Customer care phone:</strong> Specifically for customer support</li>
                        <li>• <strong>Shipping phone</strong> and <strong>return phone</strong> must be different numbers</li>
                        <li>• <strong>Shipping phone:</strong> For shipping inquiries</li>
                        <li>• <strong>Return phone:</strong> For return and refund inquiries</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField('Shipping Address', 'shippingAddress', shippingAddress, setShippingAddress, 'text', true, shippingErrors)}
                <div>
                {renderField('Shipping Phone', 'shippingPhone', shippingPhone, setShippingPhone, 'tel', false, shippingErrors)}
                  {!shippingPhone && !getFieldError(shippingErrors, 'shippingPhone') && (
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      💡 Include country code (e.g., +234 for Nigeria, +1 for US)
                    </div>
                  )}
                </div>
                {renderField('Shipping Email', 'shippingEmail', shippingEmail, setShippingEmail, 'email', false, shippingErrors)}
                {renderField('Shipping Method', 'shippingMethod', shippingMethod, setShippingMethod, 'select', false, shippingErrors, [
                  { value: 'Standard', label: 'Standard' },
                  { value: 'Express', label: 'Express' },
                  { value: 'Overnight', label: 'Overnight' }
                ])}
              </div>
              
              {renderField('Handling Time', 'handlingTime', handlingTime, setHandlingTime, 'select', false, shippingErrors, [
                { value: 'Same day', label: 'Same day' },
                { value: '1-2 business days', label: '1-2 business days' },
                { value: '3-5 business days', label: '3-5 business days' },
                { value: '1 week', label: '1 week' }
              ])}

              {renderField('Shipping Zone', 'shippingZone', shippingZone, setShippingZone, 'select', false, shippingErrors, [
                { value: 'Domestic', label: 'Domestic' },
                { value: 'International', label: 'International' },
                { value: 'Local', label: 'Local' }
              ])}

              {/* Return Address Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Please provide the return address
                </label>
                
                {/* Radio button to use business address */}
                <div className="mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="useBusinessAddress"
                      checked={useBusinessAddress}
                      onChange={e => setUseBusinessAddress(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Same as business address</span>
                  </label>
                </div>

                {/* Return Address Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Return Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={returnAddress}
                    onChange={e => setReturnAddress(e.target.value)}
                    disabled={useBusinessAddress}
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      getFieldError(shippingErrors, 'returnAddress')
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    } ${useBusinessAddress ? 'opacity-50 cursor-not-allowed' : ''}`}
                    required
                  />
                  {getFieldError(shippingErrors, 'returnAddress') && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {getFieldError(shippingErrors, 'returnAddress')}
                    </div>
                  )}
                </div>

                {/* Return Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Return Phone
                  </label>
                  <input
                    type="tel"
                    value={returnPhone}
                    onChange={e => setReturnPhone(e.target.value)}
                    placeholder="+234 811 768 1502"
                    disabled={useBusinessAddress}
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      getFieldError(shippingErrors, 'returnPhone')
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    } ${useBusinessAddress ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {getFieldError(shippingErrors, 'returnPhone') && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {getFieldError(shippingErrors, 'returnPhone')}
                    </div>
                  )}
                  {!returnPhone && !getFieldError(shippingErrors, 'returnPhone') && !useBusinessAddress && (
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      💡 Include country code (e.g., +234 for Nigeria, +1 for US)
                    </div>
                  )}
                </div>

                {/* Return Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Return Email
                  </label>
                  <input
                    type="email"
                    value={returnEmail}
                    onChange={e => setReturnEmail(e.target.value)}
                    disabled={useBusinessAddress}
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      getFieldError(shippingErrors, 'returnEmail')
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    } ${useBusinessAddress ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {getFieldError(shippingErrors, 'returnEmail') && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {getFieldError(shippingErrors, 'returnEmail')}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Save Shipping Info
                </button>
              </div>
            </form>
          </CollapsibleCard>

          {/* Payment Info Section */}
          <CollapsibleCard
            title="Payment Information"
            icon={<CreditCard className="w-5 h-5 text-primary-600" />}
            status={paymentStatus}
            isOpen={openSection === 'payment-info'}
            onToggle={(isOpen) => setOpenSection(isOpen ? 'payment-info' : null)}
          >
            {paymentSuccess && (
              <div className="mb-6 flex items-center gap-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-4 py-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                Payment information saved successfully!
              </div>
            )}

            <form onSubmit={handlePaymentSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField('Bank Name', 'bankName', bankName, setBankName, 'text', true, paymentErrors)}
                {renderField('Account Type', 'accountType', accountType, setAccountType, 'select', false, paymentErrors, [
                  { value: 'Business Checking', label: 'Business Checking' },
                  { value: 'Business Savings', label: 'Business Savings' },
                  { value: 'Personal Checking', label: 'Personal Checking' }
                ])}
                {renderField('Account Number', 'accountNumber', accountNumber, setAccountNumber, 'text', true, paymentErrors)}
                {renderField('IBAN', 'iban', iban, setIban, 'text', true, paymentErrors)}
                {renderField('SWIFT Code', 'swiftCode', swiftCode, setSwiftCode, 'text', true, paymentErrors)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Documents</label>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="w-48 text-gray-700 dark:text-gray-300 text-sm">Bank Document</label>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={e => handleDocumentChange(paymentDocuments, setPaymentDocuments)('bankDocument', e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    {paymentDocuments.bankDocument && <FileCheck2 className="w-5 h-5 text-green-600" />}
                    {uploadedDocuments.bankDocument && !paymentDocuments.bankDocument && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileCheck2 className="w-4 h-4 text-green-600" />
                        <span>Document uploaded</span>
                        <a 
                          href={uploadedDocuments.bankDocument} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 underline"
                        >
                          View
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Save Payment Info
                </button>
              </div>
            </form>
          </CollapsibleCard>

          {/* Profile & Account Section */}
          <CollapsibleCard
            title="Profile & Account"
            icon={<User className="w-5 h-5 text-primary-600" />}
            status={profileStatus}
            isOpen={openSection === 'profile-info'}
            onToggle={(isOpen) => setOpenSection(isOpen ? 'profile-info' : null)}
          >
            {profileSuccess && (
              <div className="mb-6 flex items-center gap-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-4 py-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                Profile & account updated successfully!
              </div>
            )}

            {/* Required Documents Upload for Profile */}
            {(isProfileNewUser || !isProfilePendingApproval) && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UploadCloud className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="font-semibold text-yellow-800 dark:text-yellow-200">Required Documents</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">To complete your profile setup, please upload the following documents. They will be saved when you click "Save Profile" below:</p>
                <div className="space-y-4">
                  {profileRequiredDocs.map(doc => (
                    <div key={doc.key} className="flex items-center gap-3">
                      <label className="w-32 text-gray-700 dark:text-gray-300 text-sm">{doc.label}</label>
                      <div className="flex-1">
                        {existingProfileDocuments[doc.key] ? (
                          // Show existing document
                          <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                            <FileCheck2 className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-700 dark:text-green-300">Document uploaded</span>
                            <a 
                              href={existingProfileDocuments[doc.key]!} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              View Document
                            </a>
                          </div>
                        ) : (
                          // Show file input for new upload
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={e => handleProfileDocChange(doc.key, e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                        )}
                      </div>
                      {profileDocuments[doc.key] && <FileCheck2 className="w-5 h-5 text-green-600" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Profile Pending Approval Message */}
            {isProfilePendingApproval && (
              <div className="mb-6 flex items-center gap-2 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-4 py-3 rounded-lg">
                <Clock className="w-5 h-5" />
                Your profile documents have been submitted and are pending approval.
              </div>
            )}
            
            <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField('First Name', 'name', name, setName, 'text', true, profileErrors)}
                {renderField('Last Name', 'username', username, setUsername, 'text', true, profileErrors)}
                {renderField('Email', 'email', email, setEmail, 'email', true, profileErrors)}
                {renderField('Phone', 'phone', phone, setPhone, 'tel', false, profileErrors)}
              </div>
              
              {/* Account Information - Read Only */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Type
                  </label>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white capitalize">
                    {profile?.account_type === 'company' ? 'Company' : 'Individual'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verification Status
                  </label>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                    profile?.verification_status === 'approved' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : profile?.verification_status === 'rejected'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : profile?.verification_status === 'suspended'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {profile?.verification_status === 'approved' && (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Approved
                      </>
                    )}
                    {profile?.verification_status === 'rejected' && (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        Rejected
                      </>
                    )}
                    {profile?.verification_status === 'suspended' && (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        Suspended
                      </>
                    )}
                    {(profile?.verification_status === 'pending' || !profile?.verification_status) && (
                      <>
                        <Clock className="w-3 h-3" />
                        Pending
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avatar</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                      onChange={e => handleAvatarChange(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {avatarPreview && (
                    <img src={avatarPreview} alt="Avatar Preview" className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                  )}
                </div>
                {avatar && <div className="text-xs text-gray-500 mt-1">{avatar}</div>}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </CollapsibleCard>

          {/* Notifications Header */}
          <div className="mt-12 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-1 ml-11">Manage your notification preferences and communication settings</p>
          </div>

          {/* Notifications Section */}
          <CollapsibleCard
            title="Notification Preferences"
            icon={<Bell className="w-5 h-5 text-primary-600" />}
            status={notificationStatus}
            isOpen={openSection === 'notifications'}
            onToggle={(isOpen) => setOpenSection(isOpen ? 'notifications' : null)}
          >
            {notificationSuccess && (
              <div className="mb-6 flex items-center gap-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-4 py-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                Notification preferences saved successfully!
              </div>
            )}

            {notificationError && (
              <div className="mb-6 flex items-center gap-2 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-4 py-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                {notificationError}
              </div>
            )}

            <form onSubmit={handleNotificationSave} className="space-y-6">
              <div className="space-y-6">
                {/* Order Updates */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Order Updates</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications for order updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                                    checked={orderUpdates}
                onChange={e => setOrderUpdates(e.target.checked)}
                      className="sr-only peer"
                  />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
                </div>

                {/* Promotional Emails */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Promotional Emails</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications for promotional emails</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                                    checked={promotions}
                onChange={e => setPromotions(e.target.checked)}
                      className="sr-only peer"
                  />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
                </div>

                {/* Low Inventory Alerts */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Low Inventory Alerts</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications for low inventory alerts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                                    checked={newProducts}
                onChange={e => setNewProducts(e.target.checked)}
                      className="sr-only peer"
                  />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
                </div>

                {/* Security Alerts */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Security Alerts</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications for security alerts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                                    checked={securityAlerts}
                onChange={e => setSecurityAlerts(e.target.checked)}
                      className="sr-only peer"
                  />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
                </div>

                {/* Payout Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Payout Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications for payout updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reviews}
                      onChange={e => setReviews(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={e => setEmailNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* SMS Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">SMS Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smsNotifications}
                      onChange={e => setSmsNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={notificationLoading}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    notificationLoading
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  {notificationLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Notifications'
                  )}
                </button>
              </div>
            </form>
          </CollapsibleCard>
        </div>
      </div>
    </DashboardLayout>
  );
}