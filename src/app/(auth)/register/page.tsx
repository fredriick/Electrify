'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, AlertCircle, CheckCircle, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  state: string;
  agreeToTerms: boolean;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ 
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    country?: string;
    state?: string;
    agreeToTerms?: string;
  }>({});
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  
  const { signUp, user, profile, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    state: '',
    agreeToTerms: false
  });

  // Redirect if already logged in and profile exists
  useEffect(() => {
    // Only redirect if we have both user AND profile, and we're not showing email confirmation
    // This prevents redirect when user exists but profile hasn't been created yet (email confirmation pending)
    if (!loading && user && profile && !showEmailConfirmation) {
      const redirectPath = getRedirectPath(profile);
      router.push(redirectPath);
    } else if (!loading && user && !profile && !showEmailConfirmation) {
    }
  }, [user, profile, loading, router, showEmailConfirmation]);

  const getRedirectPath = (userProfile: any) => {
    // Customer registration always redirects to home page
        return '/';
  };

  const validateForm = (): boolean => {
    const errors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      country?: string;
      state?: string;
      agreeToTerms?: string;
    } = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }

    // Phone validation
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\+]?[0-9][\d\s\-\(\)]{7,15}$/.test(formData.phone.trim())) {
      errors.phone = 'Please enter a valid phone number';
    }



    // Terms agreement
    if (!formData.agreeToTerms) {
      (errors as any).agreeToTerms = 'You must agree to the terms and conditions';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const profileData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        role: 'CUSTOMER' as const,
        country: formData.country,
        state: formData.state,
      };

      console.log('Registration form: Calling signUp with profileData:', profileData);

      const { data, error } = await signUp(formData.email, formData.password, profileData);
      
      if (error) {
        console.error('Registration error:', error);
        // Error is handled by the auth context
      } else {
        
        if (data?.requiresEmailConfirmation) {
          // Email confirmation required - show confirmation message
        setShowEmailConfirmation(true);
        } else if (data?.profile) {
          // Profile created immediately (auto-confirm enabled)
        // Redirect will be handled by useEffect
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create your account
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Join Electrify and start your journey
          </p>
        </div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Account Type */}
            <div>
              <div className="p-4 border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <div className="flex items-center mb-2">
                    <User className="w-5 h-5 mr-2 text-primary-600" />
                  <span className="font-semibold text-primary-700 dark:text-primary-300">Customer Account</span>
                  </div>
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  Browse and purchase solar products from our marketplace
                </p>
              </div>
            </div>



            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${
                      formErrors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your first name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                {formErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${
                      formErrors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your last name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                {formErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your phone number"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => {
                        handleInputChange('country', e.target.value);
                        // Reset state when country changes
                        if (formData.state) {
                          handleInputChange('state', '');
                        }
                      }}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${
                        formErrors.country ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Select Country</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Italy">Italy</option>
                      <option value="Spain">Spain</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="Belgium">Belgium</option>
                      <option value="Switzerland">Switzerland</option>
                      <option value="Austria">Austria</option>
                      <option value="Sweden">Sweden</option>
                      <option value="Norway">Norway</option>
                      <option value="Denmark">Denmark</option>
                      <option value="Finland">Finland</option>
                      <option value="Poland">Poland</option>
                      <option value="Czech Republic">Czech Republic</option>
                      <option value="Hungary">Hungary</option>
                      <option value="Romania">Romania</option>
                      <option value="Bulgaria">Bulgaria</option>
                      <option value="Greece">Greece</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Ireland">Ireland</option>
                      <option value="Iceland">Iceland</option>
                      <option value="Luxembourg">Luxembourg</option>
                      <option value="Malta">Malta</option>
                      <option value="Cyprus">Cyprus</option>
                      <option value="Estonia">Estonia</option>
                      <option value="Latvia">Latvia</option>
                      <option value="Lithuania">Lithuania</option>
                      <option value="Slovakia">Slovakia</option>
                      <option value="Slovenia">Slovenia</option>
                      <option value="Croatia">Croatia</option>
                      <option value="Serbia">Serbia</option>
                      <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                      <option value="Montenegro">Montenegro</option>
                      <option value="North Macedonia">North Macedonia</option>
                      <option value="Albania">Albania</option>
                      <option value="Kosovo">Kosovo</option>
                      <option value="Moldova">Moldova</option>
                      <option value="Ukraine">Ukraine</option>
                      <option value="Belarus">Belarus</option>
                      <option value="Russia">Russia</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Armenia">Armenia</option>
                      <option value="Azerbaijan">Azerbaijan</option>
                      <option value="Turkey">Turkey</option>
                      <option value="Israel">Israel</option>
                      <option value="Lebanon">Lebanon</option>
                      <option value="Syria">Syria</option>
                      <option value="Jordan">Jordan</option>
                      <option value="Iraq">Iraq</option>
                      <option value="Iran">Iran</option>
                      <option value="Kuwait">Kuwait</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="Qatar">Qatar</option>
                      <option value="Bahrain">Bahrain</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="Oman">Oman</option>
                      <option value="Yemen">Yemen</option>
                      <option value="Egypt">Egypt</option>
                      <option value="Libya">Libya</option>
                      <option value="Tunisia">Tunisia</option>
                      <option value="Algeria">Algeria</option>
                      <option value="Morocco">Morocco</option>
                      <option value="Mauritania">Mauritania</option>
                      <option value="Senegal">Senegal</option>
                      <option value="Gambia">Gambia</option>
                      <option value="Guinea-Bissau">Guinea-Bissau</option>
                      <option value="Guinea">Guinea</option>
                      <option value="Sierra Leone">Sierra Leone</option>
                      <option value="Liberia">Liberia</option>
                      <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Togo">Togo</option>
                      <option value="Benin">Benin</option>
                      <option value="Burkina Faso">Burkina Faso</option>
                      <option value="Mali">Mali</option>
                      <option value="Niger">Niger</option>
                      <option value="Chad">Chad</option>
                      <option value="Sudan">Sudan</option>
                      <option value="South Sudan">South Sudan</option>
                      <option value="Central African Republic">Central African Republic</option>
                      <option value="Cameroon">Cameroon</option>
                      <option value="Equatorial Guinea">Equatorial Guinea</option>
                      <option value="Gabon">Gabon</option>
                      <option value="Republic of the Congo">Republic of the Congo</option>
                      <option value="Democratic Republic of the Congo">Democratic Republic of the Congo</option>
                      <option value="Angola">Angola</option>
                      <option value="Zambia">Zambia</option>
                      <option value="Zimbabwe">Zimbabwe</option>
                      <option value="Botswana">Botswana</option>
                      <option value="Namibia">Namibia</option>
                      <option value="Lesotho">Lesotho</option>
                      <option value="Eswatini">Eswatini</option>
                      <option value="Mozambique">Mozambique</option>
                      <option value="Madagascar">Madagascar</option>
                      <option value="Comoros">Comoros</option>
                      <option value="Seychelles">Seychelles</option>
                      <option value="Mauritius">Mauritius</option>
                      <option value="Réunion">Réunion</option>
                      <option value="Mayotte">Mayotte</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="Burundi">Burundi</option>
                      <option value="Ethiopia">Ethiopia</option>
                      <option value="Eritrea">Eritrea</option>
                      <option value="Djibouti">Djibouti</option>
                      <option value="Somalia">Somalia</option>
                      <option value="South Africa">South Africa</option>
                      <option value="China">China</option>
                      <option value="Japan">Japan</option>
                      <option value="South Korea">South Korea</option>
                      <option value="North Korea">North Korea</option>
                      <option value="Mongolia">Mongolia</option>
                      <option value="Taiwan">Taiwan</option>
                      <option value="Hong Kong">Hong Kong</option>
                      <option value="Macau">Macau</option>
                      <option value="Vietnam">Vietnam</option>
                      <option value="Laos">Laos</option>
                      <option value="Cambodia">Cambodia</option>
                      <option value="Thailand">Thailand</option>
                      <option value="Myanmar">Myanmar</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Indonesia">Indonesia</option>
                      <option value="Philippines">Philippines</option>
                      <option value="Brunei">Brunei</option>
                      <option value="East Timor">East Timor</option>
                      <option value="India">India</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Afghanistan">Afghanistan</option>
                      <option value="Nepal">Nepal</option>
                      <option value="Bhutan">Bhutan</option>
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="Sri Lanka">Sri Lanka</option>
                      <option value="Maldives">Maldives</option>
                      <option value="Australia">Australia</option>
                      <option value="New Zealand">New Zealand</option>
                      <option value="Fiji">Fiji</option>
                      <option value="Papua New Guinea">Papua New Guinea</option>
                      <option value="Solomon Islands">Solomon Islands</option>
                      <option value="Vanuatu">Vanuatu</option>
                      <option value="New Caledonia">New Caledonia</option>
                      <option value="Samoa">Samoa</option>
                      <option value="Tonga">Tonga</option>
                      <option value="Kiribati">Kiribati</option>
                      <option value="Tuvalu">Tuvalu</option>
                      <option value="Nauru">Nauru</option>
                      <option value="Palau">Palau</option>
                      <option value="Marshall Islands">Marshall Islands</option>
                      <option value="Micronesia">Micronesia</option>
                      <option value="Brazil">Brazil</option>
                      <option value="Argentina">Argentina</option>
                      <option value="Chile">Chile</option>
                      <option value="Peru">Peru</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Venezuela">Venezuela</option>
                      <option value="Ecuador">Ecuador</option>
                      <option value="Bolivia">Bolivia</option>
                      <option value="Paraguay">Paraguay</option>
                      <option value="Uruguay">Uruguay</option>
                      <option value="Guyana">Guyana</option>
                      <option value="Suriname">Suriname</option>
                      <option value="French Guiana">French Guiana</option>
                      <option value="Mexico">Mexico</option>
                      <option value="Guatemala">Guatemala</option>
                      <option value="Belize">Belize</option>
                      <option value="El Salvador">El Salvador</option>
                      <option value="Honduras">Honduras</option>
                      <option value="Nicaragua">Nicaragua</option>
                      <option value="Costa Rica">Costa Rica</option>
                      <option value="Panama">Panama</option>
                      <option value="Cuba">Cuba</option>
                      <option value="Jamaica">Jamaica</option>
                      <option value="Haiti">Haiti</option>
                      <option value="Dominican Republic">Dominican Republic</option>
                      <option value="Puerto Rico">Puerto Rico</option>
                      <option value="Bahamas">Bahamas</option>
                      <option value="Barbados">Barbados</option>
                      <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                      <option value="Grenada">Grenada</option>
                      <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                      <option value="Saint Lucia">Saint Lucia</option>
                      <option value="Dominica">Dominica</option>
                      <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                      <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                    </select>
                  </div>
                  {formErrors.country && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.country}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State/Province *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${
                        formErrors.state ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } ${!formData.country ? 'opacity-50 cursor-not-allowed' : ''}`}
                      required
                      disabled={isSubmitting || !formData.country}
                    >
                      <option value="">
                        {!formData.country ? 'Select Country First' : 'Select State/Province'}
                      </option>
                      
                      {/* Nigeria States */}
                      {formData.country === "Nigeria" && (
                        <>
                          <option value="Abia">Abia</option>
                          <option value="Adamawa">Adamawa</option>
                          <option value="Akwa Ibom">Akwa Ibom</option>
                          <option value="Anambra">Anambra</option>
                          <option value="Bauchi">Bauchi</option>
                          <option value="Bayelsa">Bayelsa</option>
                          <option value="Benue">Benue</option>
                          <option value="Borno">Borno</option>
                          <option value="Cross River">Cross River</option>
                          <option value="Delta">Delta</option>
                          <option value="Ebonyi">Ebonyi</option>
                          <option value="Edo">Edo</option>
                          <option value="Ekiti">Ekiti</option>
                          <option value="Enugu">Enugu</option>
                          <option value="Federal Capital Territory">Federal Capital Territory</option>
                          <option value="Gombe">Gombe</option>
                          <option value="Imo">Imo</option>
                          <option value="Jigawa">Jigawa</option>
                          <option value="Kaduna">Kaduna</option>
                          <option value="Kano">Kano</option>
                          <option value="Katsina">Katsina</option>
                          <option value="Kebbi">Kebbi</option>
                          <option value="Kogi">Kogi</option>
                          <option value="Kwara">Kwara</option>
                          <option value="Lagos">Lagos</option>
                          <option value="Nasarawa">Nasarawa</option>
                          <option value="Niger">Niger</option>
                          <option value="Ogun">Ogun</option>
                          <option value="Ondo">Ondo</option>
                          <option value="Osun">Osun</option>
                          <option value="Oyo">Oyo</option>
                          <option value="Plateau">Plateau</option>
                          <option value="Rivers">Rivers</option>
                          <option value="Sokoto">Sokoto</option>
                          <option value="Taraba">Taraba</option>
                          <option value="Yobe">Yobe</option>
                          <option value="Zamfara">Zamfara</option>
                        </>
                      )}
                      
                      {/* United States States */}
                      {formData.country === "United States" && (
                        <>
                          <option value="Alabama">Alabama</option>
                          <option value="Alaska">Alaska</option>
                          <option value="Arizona">Arizona</option>
                          <option value="Arkansas">Arkansas</option>
                          <option value="California">California</option>
                          <option value="Colorado">Colorado</option>
                          <option value="Connecticut">Connecticut</option>
                          <option value="Delaware">Delaware</option>
                          <option value="Florida">Florida</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Hawaii">Hawaii</option>
                          <option value="Idaho">Idaho</option>
                          <option value="Illinois">Illinois</option>
                          <option value="Indiana">Indiana</option>
                          <option value="Iowa">Iowa</option>
                          <option value="Kansas">Kansas</option>
                          <option value="Kentucky">Kentucky</option>
                          <option value="Louisiana">Louisiana</option>
                          <option value="Maine">Maine</option>
                          <option value="Maryland">Maryland</option>
                          <option value="Massachusetts">Massachusetts</option>
                          <option value="Michigan">Michigan</option>
                          <option value="Minnesota">Minnesota</option>
                          <option value="Mississippi">Mississippi</option>
                          <option value="Missouri">Missouri</option>
                          <option value="Montana">Montana</option>
                          <option value="Nebraska">Nebraska</option>
                          <option value="Nevada">Nevada</option>
                          <option value="New Hampshire">New Hampshire</option>
                          <option value="New Jersey">New Jersey</option>
                          <option value="New Mexico">New Mexico</option>
                          <option value="New York">New York</option>
                          <option value="North Carolina">North Carolina</option>
                          <option value="North Dakota">North Dakota</option>
                          <option value="Ohio">Ohio</option>
                          <option value="Oklahoma">Oklahoma</option>
                          <option value="Oregon">Oregon</option>
                          <option value="Pennsylvania">Pennsylvania</option>
                          <option value="Rhode Island">Rhode Island</option>
                          <option value="South Carolina">South Carolina</option>
                          <option value="South Dakota">South Dakota</option>
                          <option value="Tennessee">Tennessee</option>
                          <option value="Texas">Texas</option>
                          <option value="Utah">Utah</option>
                          <option value="Vermont">Vermont</option>
                          <option value="Virginia">Virginia</option>
                          <option value="Washington">Washington</option>
                          <option value="West Virginia">West Virginia</option>
                          <option value="Wisconsin">Wisconsin</option>
                          <option value="Wyoming">Wyoming</option>
                        </>
                      )}
                      
                      {/* Canada Provinces */}
                      {formData.country === "Canada" && (
                        <>
                          <option value="Alberta">Alberta</option>
                          <option value="British Columbia">British Columbia</option>
                          <option value="Manitoba">Manitoba</option>
                          <option value="New Brunswick">New Brunswick</option>
                          <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                          <option value="Northwest Territories">Northwest Territories</option>
                          <option value="Nova Scotia">Nova Scotia</option>
                          <option value="Nunavut">Nunavut</option>
                          <option value="Ontario">Ontario</option>
                          <option value="Prince Edward Island">Prince Edward Island</option>
                          <option value="Quebec">Quebec</option>
                          <option value="Saskatchewan">Saskatchewan</option>
                          <option value="Yukon">Yukon</option>
                        </>
                      )}
                      
                      {/* United Kingdom Countries */}
                      {formData.country === "United Kingdom" && (
                        <>
                          <option value="England">England</option>
                          <option value="Scotland">Scotland</option>
                          <option value="Wales">Wales</option>
                          <option value="Northern Ireland">Northern Ireland</option>
                        </>
                      )}
                      
                      {/* Germany States */}
                      {formData.country === "Germany" && (
                        <>
                          <option value="Baden-Württemberg">Baden-Württemberg</option>
                          <option value="Bavaria">Bavaria</option>
                          <option value="Berlin">Berlin</option>
                          <option value="Brandenburg">Brandenburg</option>
                          <option value="Bremen">Bremen</option>
                          <option value="Hamburg">Hamburg</option>
                          <option value="Hesse">Hesse</option>
                          <option value="Lower Saxony">Lower Saxony</option>
                          <option value="Mecklenburg-Vorpommern">Mecklenburg-Vorpommern</option>
                          <option value="North Rhine-Westphalia">North Rhine-Westphalia</option>
                          <option value="Rhineland-Palatinate">Rhineland-Palatinate</option>
                          <option value="Saarland">Saarland</option>
                          <option value="Saxony">Saxony</option>
                          <option value="Saxony-Anhalt">Saxony-Anhalt</option>
                          <option value="Schleswig-Holstein">Schleswig-Holstein</option>
                          <option value="Thuringia">Thuringia</option>
                        </>
                      )}
                      
                      {/* France Regions */}
                      {formData.country === "France" && (
                        <>
                          <option value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes</option>
                          <option value="Bourgogne-Franche-Comté">Bourgogne-Franche-Comté</option>
                          <option value="Bretagne">Bretagne</option>
                          <option value="Centre-Val de Loire">Centre-Val de Loire</option>
                          <option value="Corse">Corse</option>
                          <option value="Grand Est">Grand Est</option>
                          <option value="Hauts-de-France">Hauts-de-France</option>
                          <option value="Île-de-France">Île-de-France</option>
                          <option value="Normandie">Normandie</option>
                          <option value="Nouvelle-Aquitaine">Nouvelle-Aquitaine</option>
                          <option value="Occitanie">Occitanie</option>
                          <option value="Pays de la Loire">Pays de la Loire</option>
                          <option value="Provence-Alpes-Côte d'Azur">Provence-Alpes-Côte d'Azur</option>
                        </>
                      )}
                      
                      {/* Kenya Counties */}
                      {formData.country === "Kenya" && (
                        <>
                          <option value="Mombasa">Mombasa</option>
                          <option value="Kwale">Kwale</option>
                          <option value="Kilifi">Kilifi</option>
                          <option value="Tana River">Tana River</option>
                          <option value="Lamu">Lamu</option>
                          <option value="Taita Taveta">Taita Taveta</option>
                          <option value="Garissa">Garissa</option>
                          <option value="Wajir">Wajir</option>
                          <option value="Mandera">Mandera</option>
                          <option value="Marsabit">Marsabit</option>
                          <option value="Isiolo">Isiolo</option>
                          <option value="Meru">Meru</option>
                          <option value="Tharaka Nithi">Tharaka Nithi</option>
                          <option value="Embu">Embu</option>
                          <option value="Kitui">Kitui</option>
                          <option value="Machakos">Machakos</option>
                          <option value="Makueni">Makueni</option>
                          <option value="Nyandarua">Nyandarua</option>
                          <option value="Nyeri">Nyeri</option>
                          <option value="Kirinyaga">Kirinyaga</option>
                          <option value="Murang'a">Murang'a</option>
                          <option value="Kiambu">Kiambu</option>
                          <option value="Turkana">Turkana</option>
                          <option value="West Pokot">West Pokot</option>
                          <option value="Samburu">Samburu</option>
                          <option value="Trans Nzoia">Trans Nzoia</option>
                          <option value="Uasin Gishu">Uasin Gishu</option>
                          <option value="Elgeyo Marakwet">Elgeyo Marakwet</option>
                          <option value="Nandi">Nandi</option>
                          <option value="Baringo">Baringo</option>
                          <option value="Laikipia">Laikipia</option>
                          <option value="Nakuru">Nakuru</option>
                          <option value="Narok">Narok</option>
                          <option value="Kajiado">Kajiado</option>
                          <option value="Kericho">Kericho</option>
                          <option value="Bomet">Bomet</option>
                          <option value="Kakamega">Kakamega</option>
                          <option value="Vihiga">Vihiga</option>
                          <option value="Bungoma">Bungoma</option>
                          <option value="Busia">Busia</option>
                          <option value="Siaya">Siaya</option>
                          <option value="Kisumu">Kisumu</option>
                          <option value="Homa Bay">Homa Bay</option>
                          <option value="Migori">Migori</option>
                          <option value="Kisii">Kisii</option>
                          <option value="Nyamira">Nyamira</option>
                          <option value="Nairobi">Nairobi</option>
                        </>
                      )}
                      
                      {/* South Africa Provinces */}
                      {formData.country === "South Africa" && (
                        <>
                          <option value="Eastern Cape">Eastern Cape</option>
                          <option value="Free State">Free State</option>
                          <option value="Gauteng">Gauteng</option>
                          <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                          <option value="Limpopo">Limpopo</option>
                          <option value="Mpumalanga">Mpumalanga</option>
                          <option value="Northern Cape">Northern Cape</option>
                          <option value="North West">North West</option>
                          <option value="Western Cape">Western Cape</option>
                        </>
                      )}
                      
                      {/* India States */}
                      {formData.country === "India" && (
                        <>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                          <option value="Assam">Assam</option>
                          <option value="Bihar">Bihar</option>
                          <option value="Chhattisgarh">Chhattisgarh</option>
                          <option value="Goa">Goa</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Haryana">Haryana</option>
                          <option value="Himachal Pradesh">Himachal Pradesh</option>
                          <option value="Jharkhand">Jharkhand</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Kerala">Kerala</option>
                          <option value="Madhya Pradesh">Madhya Pradesh</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Manipur">Manipur</option>
                          <option value="Meghalaya">Meghalaya</option>
                          <option value="Mizoram">Mizoram</option>
                          <option value="Nagaland">Nagaland</option>
                          <option value="Odisha">Odisha</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Sikkim">Sikkim</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Tripura">Tripura</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Uttarakhand">Uttarakhand</option>
                          <option value="West Bengal">West Bengal</option>
                        </>
                      )}
                      
                      {/* Australia States */}
                      {formData.country === "Australia" && (
                        <>
                          <option value="New South Wales">New South Wales</option>
                          <option value="Victoria">Victoria</option>
                          <option value="Queensland">Queensland</option>
                          <option value="Western Australia">Western Australia</option>
                          <option value="South Australia">South Australia</option>
                          <option value="Tasmania">Tasmania</option>
                          <option value="Australian Capital Territory">Australian Capital Territory</option>
                          <option value="Northern Territory">Northern Territory</option>
                        </>
                      )}
                      
                      {/* Brazil States */}
                      {formData.country === "Brazil" && (
                        <>
                          <option value="Acre">Acre</option>
                          <option value="Alagoas">Alagoas</option>
                          <option value="Amapá">Amapá</option>
                          <option value="Amazonas">Amazonas</option>
                          <option value="Bahia">Bahia</option>
                          <option value="Ceará">Ceará</option>
                          <option value="Distrito Federal">Distrito Federal</option>
                          <option value="Espírito Santo">Espírito Santo</option>
                          <option value="Goiás">Goiás</option>
                          <option value="Maranhão">Maranhão</option>
                          <option value="Mato Grosso">Mato Grosso</option>
                          <option value="Mato Grosso do Sul">Mato Grosso do Sul</option>
                          <option value="Minas Gerais">Minas Gerais</option>
                          <option value="Pará">Pará</option>
                          <option value="Paraíba">Paraíba</option>
                          <option value="Paraná">Paraná</option>
                          <option value="Pernambuco">Pernambuco</option>
                          <option value="Piauí">Piauí</option>
                          <option value="Rio de Janeiro">Rio de Janeiro</option>
                          <option value="Rio Grande do Norte">Rio Grande do Norte</option>
                          <option value="Rio Grande do Sul">Rio Grande do Sul</option>
                          <option value="Rondônia">Rondônia</option>
                          <option value="Roraima">Roraima</option>
                          <option value="Santa Catarina">Santa Catarina</option>
                          <option value="São Paulo">São Paulo</option>
                          <option value="Sergipe">Sergipe</option>
                          <option value="Tocantins">Tocantins</option>
                        </>
                      )}
                    </select>
                  </div>
                  {formErrors.state && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.state}
                    </p>
                  )}
                </div>
              </div>
            </div>



            {/* Email and Password */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Credentials</h3>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your email"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${
                        formErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Create a password"
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${
                        formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Confirm your password"
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="border-t pt-6">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={isSubmitting}
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {formErrors.agreeToTerms && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {formErrors.agreeToTerms}
                </p>
              )}
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Email Confirmation Popup */}
      {showEmailConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Email Confirmation Required
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                We've sent a confirmation email to <span className="font-medium text-gray-900 dark:text-white">{formData.email}</span>. Please check your inbox and click the confirmation link to activate your account.
              </p>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                <p>⚠️ Important: You must confirm your email before you can sign in.</p>
                <p>Didn't receive the email? Check your spam folder or contact support.</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowEmailConfirmation(false);
                    router.push('/login');
                  }}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => {
                    setShowEmailConfirmation(false);
                    router.push('/');
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
 
 
 
 
 