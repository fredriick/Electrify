'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Building, Phone, MapPin, Store, Check, Globe, Search, ChevronDown } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';

interface SellerRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSellerRegister?: (sellerData: SellerData) => void;
  onEmailVerificationRequired?: (email: string) => void;
}

interface SellerData {
  accountType: 'individual' | 'company';
  // Individual fields
  firstName?: string;
  lastName?: string;
  // Company fields
  companyName?: string;
  incorporationNumber?: string;
  contactPerson?: string;
  // Shared fields
  email: string;
  phone: string;
  businessType: string;
  shopName: string;
  address: string;
  country: string;
  city: string;
  password: string;
}

// Comprehensive list of countries
const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar',
  'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe'
];

// Major cities by country (sample for popular countries)
const citiesByCountry: { [key: string]: string[] } = {
  'United States': [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
    'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington',
    'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore'
  ],
  'Canada': [
    'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener',
    'London', 'Victoria', 'Halifax', 'Oshawa', 'Windsor', 'Saskatoon', 'Regina', 'St. John\'s', 'Kelowna', 'Barrie'
  ],
  'United Kingdom': [
    'London', 'Birmingham', 'Leeds', 'Glasgow', 'Sheffield', 'Bradford', 'Edinburgh', 'Liverpool', 'Manchester', 'Bristol',
    'Wakefield', 'Cardiff', 'Coventry', 'Nottingham', 'Leicester', 'Sunderland', 'Belfast', 'Newcastle', 'Brighton', 'Hull'
  ],
  'Australia': [
    'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong',
    'Hobart', 'Geelong', 'Townsville', 'Cairns', 'Darwin', 'Toowoomba', 'Ballarat', 'Bendigo', 'Albury', 'Launceston'
  ],
  'Germany': [
    'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig',
    'Bremen', 'Dresden', 'Hannover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster'
  ],
  'France': [
    'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille',
    'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Angers', 'Grenoble', 'Dijon', 'Nîmes', 'Saint-Denis'
  ],
  'India': [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Surat', 'Jaipur',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara'
  ],
  'China': [
    'Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Tianjin', 'Chongqing', 'Nanjing', 'Wuhan', 'Xi\'an',
    'Hangzhou', 'Dongguan', 'Foshan', 'Shenyang', 'Harbin', 'Jinan', 'Zhengzhou', 'Changsha', 'Kunming', 'Nanchang'
  ],
  'Japan': [
    'Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama',
    'Hiroshima', 'Sendai', 'Chiba', 'Kitakyushu', 'Sakai', 'Niigata', 'Hamamatsu', 'Kumamoto', 'Sagamihara', 'Shizuoka'
  ],
  'Brazil': [
    'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre',
    'Belém', 'Goiânia', 'Guarulhos', 'Campinas', 'Nova Iguaçu', 'São Luís', 'Maceió', 'Duque de Caxias', 'Natal', 'Teresina'
  ],
  // African Countries
  'Nigeria': [
    // All 36 States plus Federal Capital Territory (Abuja) - Alphabetically sorted
    'Abia', 'Abuja', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River',
    'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
    'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
    'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ],
  'South Africa': [
    'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Kimberley', 'Nelspruit', 'Polokwane',
    'Rustenburg', 'Welkom', 'Pietermaritzburg', 'Boksburg', 'Vereeniging', 'Soweto', 'Tembisa', 'Umlazi', 'Khayelitsha', 'Mitchell\'s Plain'
  ],
  'Egypt': [
    'Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said', 'Suez', 'Luxor', 'Mansoura', 'El-Mahalla El-Kubra', 'Aswan',
    'Asyut', 'Ismailia', 'Fayoum', 'Zagazig', 'Damietta', 'Assiut', 'Tanta', 'Qena', 'Sohag', 'Hurghada'
  ],
  'Kenya': [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale', 'Kakamega', 'Nyeri',
    'Machakos', 'Embu', 'Kericho', 'Narok', 'Bungoma', 'Kisii', 'Garissa', 'Wajir', 'Lamu', 'Voi'
  ],
  'Ghana': [
    'Accra', 'Kumasi', 'Tamale', 'Sekondi-Takoradi', 'Ashaiman', 'Sunyani', 'Cape Coast', 'Koforidua', 'Obuasi', 'Tema',
    'Teshie', 'Madina', 'Korle Bu', 'Wa', 'Ho', 'Kintampo', 'Bolgatanga', 'Yendi', 'Savelugu', 'Aflao'
  ],
  'Ethiopia': [
    'Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Adama', 'Jimma', 'Dessie', 'Bahir Dar', 'Jijiga', 'Shashamane',
    'Bishoftu', 'Arba Minch', 'Hosaena', 'Harar', 'Dilla', 'Nekemte', 'Debre Birhan', 'Asella', 'Hagere Hiywet', 'Goba'
  ],
  'Morocco': [
    'Casablanca', 'Rabat', 'Fez', 'Marrakech', 'Agadir', 'Tangier', 'Meknes', 'Oujda', 'Kénitra', 'Tetouan',
    'Safi', 'El Jadida', 'Beni Mellal', 'Taza', 'Larache', 'Khouribga', 'Settat', 'Berkane', 'Khemisset', 'Ifrane'
  ],
  'Tanzania': [
    'Dar es Salaam', 'Mwanza', 'Arusha', 'Dodoma', 'Mbeya', 'Morogoro', 'Tanga', 'Kahama', 'Tabora', 'Zanzibar City',
    'Kigoma', 'Musoma', 'Iringa', 'Songea', 'Katavi', 'Singida', 'Njombe', 'Simiyu', 'Geita', 'Manyara'
  ],
  'Uganda': [
    'Kampala', 'Gulu', 'Lira', 'Mbarara', 'Jinja', 'Bwizibwera', 'Mbale', 'Mukono', 'Kasese', 'Arua',
    'Masaka', 'Entebbe', 'Tororo', 'Kabale', 'Soroti', 'Fort Portal', 'Mityana', 'Hoima', 'Lugazi', 'Busia'
  ],
  'Algeria': [
    'Algiers', 'Oran', 'Constantine', 'Annaba', 'Batna', 'Blida', 'Setif', 'Chlef', 'Djelfa', 'Sidi Bel Abbes',
    'Biskra', 'Tebessa', 'Tiaret', 'El Oued', 'Skikda', 'Béjaïa', 'Tlemcen', 'Ouargla', 'Bechar', 'Mostaganem'
  ],
  'Sudan': [
    'Khartoum', 'Omdurman', 'Port Sudan', 'Kassala', 'El Obeid', 'Nyala', 'Wad Madani', 'El Fasher', 'Kosti', 'Gedaref',
    'Medani', 'El Geneina', 'Sennar', 'Singa', 'Ad-Damazin', 'Atbara', 'Kadugli', 'El Daein', 'Umm Ruwaba', 'Shendi'
  ],
  'Angola': [
    'Luanda', 'Huambo', 'Lobito', 'Benguela', 'Kuito', 'Lubango', 'Malanje', 'Namibe', 'Soyo', 'Cabinda',
    'Uige', 'Tombua', 'Lwena', 'Moxico', 'Menongue', 'Luena', 'Kuito', 'Lubango', 'Malanje', 'Namibe'
  ],
  'Cameroon': [
    'Douala', 'Yaoundé', 'Bamenda', 'Bafoussam', 'Garoua', 'Maroua', 'Kribi', 'Buea', 'Ngaoundéré', 'Bertoua',
    'Kumba', 'Ebolowa', 'Kousséri', 'Limbe', 'Edea', 'Kribi', 'Bafang', 'Kumbo', 'Foumban', 'Bangangte'
  ],
  'Côte d\'Ivoire': [
    'Abidjan', 'Bouaké', 'Daloa', 'San-Pédro', 'Yamoussoukro', 'Korhogo', 'Man', 'Gagnoa', 'Abengourou', 'Anyama',
    'Agboville', 'Divo', 'Grand-Bassam', 'Bingerville', 'Tiassalé', 'Bondoukou', 'Odienné', 'Ferkessédougou', 'Séguéla', 'Katiola'
  ],
  'Senegal': [
    'Dakar', 'Touba', 'Thiès', 'Rufisque', 'Kaolack', 'Mbour', 'Ziguinchor', 'Saint-Louis', 'Diourbel', 'Louga',
    'Tambacounda', 'Kolda', 'Fatick', 'Kaffrine', 'Matam', 'Kédougou', 'Sédhiou', 'Kédougou', 'Podor', 'Bakel'
  ],
  'Zimbabwe': [
    'Harare', 'Bulawayo', 'Chitungwiza', 'Mutare', 'Epworth', 'Gweru', 'Kwekwe', 'Kadoma', 'Masvingo', 'Chinhoyi',
    'Marondera', 'Ruwa', 'Chegutu', 'Zvishavane', 'Bindura', 'Beitbridge', 'Redcliff', 'Victoria Falls', 'Hwange', 'Chiredzi'
  ],
  'Zambia': [
    'Lusaka', 'Kitwe', 'Ndola', 'Kabwe', 'Chingola', 'Mufulira', 'Luanshya', 'Livingstone', 'Kalulushi', 'Chililabombwe',
    'Mazabuka', 'Kafue', 'Mongu', 'Chipata', 'Solwezi', 'Choma', 'Mpika', 'Kasama', 'Mansa', 'Kapiri Mposhi'
  ],
  'Mali': [
    'Bamako', 'Sikasso', 'Mopti', 'Koutiala', 'Ségou', 'Gao', 'Kayes', 'San', 'Tombouctou', 'Bourem',
    'Kati', 'Koulikoro', 'Kangaba', 'Kita', 'Yanfolila', 'Bla', 'Markala', 'Niono', 'Djenné', 'Ténenkou'
  ],
  'Burkina Faso': [
    'Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Banfora', 'Dédougou', 'Kaya', 'Tenkodogo', 'Fada N\'gourma', 'Dori',
    'Diapaga', 'Zorgho', 'Koupéla', 'Kombissiri', 'Garango', 'Yako', 'Pô', 'Nouna', 'Sapouy', 'Boulsa'
  ],
  'Niger': [
    'Niamey', 'Zinder', 'Maradi', 'Agadez', 'Alaghsas', 'Tahoua', 'Dosso', 'Arlit', 'Birni-N\'Konni', 'Tessaoua',
    'Gaya', 'Dogondoutchi', 'Diffa', 'Ayorou', 'Madaoua', 'Mayahi', 'Téra', 'Mirriah', 'Tibiri', 'Magaria'
  ],
  'Chad': [
    'N\'Djamena', 'Moundou', 'Sarh', 'Abéché', 'Kelo', 'Koumra', 'Pala', 'Am Timan', 'Bongor', 'Mongo',
    'Doba', 'Ati', 'Lai', 'Oum Hadjer', 'Bitkine', 'Mao', 'Massaguet', 'Dourbali', 'Zouar', 'Faya-Largeau'
  ]
};

export function SellerRegisterModal({ isOpen, onClose, onSellerRegister, onEmailVerificationRequired }: SellerRegisterModalProps) {
  const router = useRouter();
  const { signUp } = useAuth();
  const [accountType, setAccountType] = useState<'individual' | 'company'>('individual');
  
  // Individual fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [incorporationNumber, setIncorporationNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  
  // Shared fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);

  // Search states
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  // Refs for dropdown handling
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const countryInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  // Handle clicks outside dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const businessTypes = [
    'Solar Panel Manufacturer',
    'Solar Panel Distributor',
    'Solar Installation Company',
    'Solar Equipment Retailer',
    'Solar Service Provider',
    'Other'
  ];

  // Filter countries based on search
  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Filter cities based on selected country and search
  const filteredCities = country && citiesByCountry[country] 
    ? citiesByCountry[country].filter(city =>
        city.toLowerCase().includes(citySearch.toLowerCase())
      )
    : [];

  const validateRegisterForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (accountType === 'individual') {
      if (!firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
    } else {
      if (!companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (!incorporationNumber.trim()) {
        newErrors.incorporationNumber = 'Incorporation number is required';
      }
      if (!contactPerson.trim()) {
        newErrors.contactPerson = 'Contact person is required';
      }
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!businessType) {
      newErrors.businessType = 'Business type is required';
    }

    if (!shopName.trim()) {
      newErrors.shopName = 'Shop name is required';
    }

    if (!address.trim()) {
      newErrors.address = 'Business address is required';
    }

    if (!country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the Terms and Conditions and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) return;

    setIsLoading(true);
    try {
      // Prepare profile data for registration using enhanced supplier structure
      const profileData = {
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role: 'SUPPLIER' as const,
        account_type: accountType,
        country: country,
        state: city, // Using city as state for now
        
        // Individual seller fields
        ...(accountType === 'individual' && {
          individual_first_name: firstName,
          individual_last_name: lastName,
          individual_phone: phone.trim(),
        }),
        
        // Company seller fields
        ...(accountType === 'company' && {
          company_name: companyName,
          company_description: '', // Can be added later
          company_phone: phone.trim(),
          company_website: '', // Can be added later
          company_address: address,
          contact_person: contactPerson,
          contact_person_phone: phone.trim(),
          contact_person_email: email.trim().toLowerCase(),
        }),
        
        // Business verification fields
        business_license: accountType === 'company' ? incorporationNumber : '',
        tax_id: accountType === 'company' ? incorporationNumber : '',
        business_registration_number: accountType === 'company' ? incorporationNumber : '',
        business_type: businessType,
        industry_category: businessType,
        
        // Shop/Store information (common for both)
        shop_name: shopName,
        business_address: address,
      };

      const result = await signUp(email, password, profileData);
      
      if (result.data && !result.error) {
        // Check if email confirmation is required
        if (result.data.requiresEmailConfirmation) {
          console.log('📧 Email confirmation required, calling parent callback');
          if (onEmailVerificationRequired) {
            onEmailVerificationRequired(email);
          }
        } else {
          console.log('✅ Registration successful, showing success popup');
          setShowSuccessPopup(true);
          // Wait a bit longer to ensure auth state is properly established
          setTimeout(() => {
            setShowSuccessPopup(false);
            handleClose();
            // Use router for proper navigation instead of window.location
            // The auth state will be handled by the AuthContext
            console.log('Registration successful, redirecting to dashboard...');
            router.push('/dashboard');
          }, 2000); // Reduced from 3000ms to 2000ms for better UX
        }
      } else {
        const errorMessage = result.error?.message || 'Registration failed. Please try again.';
        console.log('🔍 Registration error message:', errorMessage);
        
        // Check if it's a rate limit error and show special popup
        if (errorMessage === 'EMAIL_RATE_LIMIT_EXCEEDED' || 
            errorMessage.includes('rate limit') ||
            errorMessage.includes('Too many registration attempts')) {
          console.log('🚨 Rate limit error detected, showing popup');
          setShowRateLimitPopup(true);
        } else {
          console.log('❌ Not a rate limit error, showing inline error');
          setErrors({ general: errorMessage });
        }
      }
    } catch (error) {
      console.error('Seller registration failed:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAccountType('individual');
    setFirstName('');
    setLastName('');
    setCompanyName('');
    setIncorporationNumber('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setBusinessType('');
    setShopName('');
    setAddress('');
    setCountry('');
    setCity('');
    setPassword('');
    setShowPassword(false);
    setAgreedToTerms(false);
    setErrors({});
    setIsLoading(false);
    setShowCountryDropdown(false);
    setShowCityDropdown(false);
    setCountrySearch('');
    setCitySearch('');
    setShowSuccessPopup(false);
    setShowRateLimitPopup(false);
    onClose();
  };

  const handleCountrySelect = (selectedCountry: string) => {
    setCountry(selectedCountry);
    setCity(''); // Reset city when country changes
    setShowCountryDropdown(false);
    setCountrySearch('');
  };

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setShowCityDropdown(false);
    setCitySearch('');
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={handleClose} 
        title="Become a Seller"
      >
        <div className="space-y-6">
          {/* Account Type Toggle */}
          <div className="flex justify-center mb-6 gap-4">
            <button
              type="button"
              className={`px-4 py-2 rounded-lg font-medium border ${accountType === 'individual' ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
              onClick={() => setAccountType('individual')}
            >
              Individual
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-lg font-medium border ${accountType === 'company' ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
              onClick={() => setAccountType('company')}
            >
              Company
            </button>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
              </div>
            )}
            {accountType === 'individual' ? (
              <>
                {/* First Name */}
                <div>
                  <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your first name"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your last name"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Company Name */}
                <div>
                  <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="company-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                        errors.companyName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter company name"
                    />
                  </div>
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.companyName}</p>
                  )}
                </div>

                {/* Incorporation Number */}
                <div>
                  <label htmlFor="incorporation-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Incorporation Number
                  </label>
                  <div className="relative">
                    <Check className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="incorporation-number"
                      value={incorporationNumber}
                      onChange={(e) => setIncorporationNumber(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                        errors.incorporationNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter incorporation number"
                    />
                  </div>
                  {errors.incorporationNumber && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.incorporationNumber}</p>
                  )}
                </div>

                {/* Contact Person */}
                <div>
                  <label htmlFor="contact-person" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Person
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="contact-person"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                        errors.contactPerson ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter contact person name"
                    />
                  </div>
                  {errors.contactPerson && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contactPerson}</p>
                  )}
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label htmlFor="seller-email-reg" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {accountType === 'individual' ? 'Email Address' : 'Business Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="seller-email-reg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={accountType === 'individual' ? 'Enter your email' : 'Enter business email'}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter phone number"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
              )}
            </div>

            {/* Business Type */}
            <div>
              <label htmlFor="business-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Type
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  id="business-type"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.businessType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select business type</option>
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              {errors.businessType && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.businessType}</p>
              )}
            </div>

            {/* Shop Name */}
            <div>
              <label htmlFor="shop-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shop Name
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="shop-name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.shopName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your shop name"
                />
              </div>
              {errors.shopName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.shopName}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {accountType === 'individual' ? 'Address' : 'Business Address'}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={accountType === 'individual' ? 'Enter your address' : 'Enter business address'}
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>
              )}
            </div>

            {/* Country */}
            <div className="relative" ref={countryDropdownRef}>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={countryInputRef}
                  type="text"
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.country ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter country"
                  onClick={() => setShowCountryDropdown(true)}
                  onFocus={() => setShowCountryDropdown(true)}
                  readOnly
                />
                {showCountryDropdown && (
                  <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search countries..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="w-full pl-8 pr-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((countryName) => (
                          <div
                            key={countryName}
                            onClick={() => handleCountrySelect(countryName)}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
                          >
                            {countryName}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                          No countries found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.country && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.country}</p>
              )}
            </div>

            {/* City */}
            <div className="relative" ref={cityDropdownRef}>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={cityInputRef}
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={country ? "Enter city" : "Select country first"}
                  disabled={!country}
                  onClick={() => country && setShowCityDropdown(true)}
                  onFocus={() => country && setShowCityDropdown(true)}
                  readOnly
                />
                {showCityDropdown && country && (
                  <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search cities..."
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                          className="w-full pl-8 pr-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {filteredCities.length > 0 ? (
                        filteredCities.map((cityName) => (
                          <div
                            key={cityName}
                            onClick={() => handleCitySelect(cityName)}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
                          >
                            {cityName}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                          {citySearch ? 'No cities found' : 'No cities available for this country'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.city && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="seller-password-reg" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="seller-password-reg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="seller-terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="seller-terms" className="text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <button
                    type="button"
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Terms and Conditions
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.terms}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || !agreedToTerms}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                `Create ${accountType === 'individual' ? 'Individual' : 'Company'} Seller Account`
              )}
            </button>
          </form>

          {/* Benefits for Sellers */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Why Sell on ElectrifyShop?</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Reach thousands of solar customers</li>
              <li>• Easy product management dashboard</li>
              <li>• Secure payment processing</li>
              <li>• Marketing and promotion tools</li>
              <li>• 24/7 customer support</li>
            </ul>
          </div>
        </div>
      </Modal>

      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center">
            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">Registration Successful!</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Your seller account has been created successfully. You will be redirected to the seller dashboard shortly.
            </p>
            <button
              onClick={() => {
                setShowSuccessPopup(false);
                handleClose();
                window.location.href = '/dashboard';
              }}
              className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

      {showRateLimitPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center max-w-md">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 mb-4">
                <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Daily Email Limit Reached</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                We've reached our daily limit of 100 verification emails. Please try registering again tomorrow.
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                If you already received a verification email from a previous attempt, please check your inbox and click the verification link to complete your registration.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowRateLimitPopup(false);
                  handleClose();
                }}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowRateLimitPopup(false);
                  // Keep the form open so user can try again later
                }}
                className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Try Again Later
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
} 