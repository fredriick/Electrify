import { SupplierProfile } from './userService';

export interface SupplierFormData {
  account_type: 'individual' | 'company';
  
  // Individual fields
  individual_first_name?: string;
  individual_last_name?: string;
  individual_phone?: string;
  
  // Company fields
  company_name?: string;
  company_description?: string;
  company_phone?: string;
  company_website?: string;
  company_address?: string;
  contact_person?: string;
  contact_person_phone?: string;
  contact_person_email?: string;
  
  // Common fields
  email: string;
  phone?: string;
  country?: string;
  state?: string;
  business_license?: string;
  tax_id?: string;
  business_registration_number?: string;
  business_type?: string;
  industry_category?: string;
}

export class SupplierHelper {
  /**
   * Get the appropriate display name based on account type
   */
  static getDisplayName(profile: SupplierProfile): string {
    if (profile.account_type === 'company' && profile.company_name) {
      return profile.company_name;
    }
    
    if (profile.account_type === 'individual') {
      if (profile.individual_first_name && profile.individual_last_name) {
        return `${profile.individual_first_name} ${profile.individual_last_name}`;
      }
      if (profile.individual_first_name) {
        return profile.individual_first_name;
      }
      if (profile.individual_last_name) {
        return profile.individual_last_name;
      }
    }
    
    // Fallback to regular fields
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    
    return profile.email || 'Supplier';
  }

  /**
   * Get the appropriate contact name based on account type
   */
  static getContactName(profile: SupplierProfile): string {
    if (profile.account_type === 'company' && profile.contact_person) {
      return profile.contact_person;
    }
    
    if (profile.account_type === 'individual') {
      if (profile.individual_first_name && profile.individual_last_name) {
        return `${profile.individual_first_name} ${profile.individual_last_name}`;
      }
      if (profile.individual_first_name) {
        return profile.individual_first_name;
      }
    }
    
    return profile.first_name || profile.email || 'Contact';
  }

  /**
   * Get the appropriate phone number based on account type
   */
  static getPhoneNumber(profile: SupplierProfile): string {
    if (profile.account_type === 'company' && profile.company_phone) {
      return profile.company_phone;
    }
    
    if (profile.account_type === 'individual' && profile.individual_phone) {
      return profile.individual_phone;
    }
    
    return profile.phone || '';
  }

  /**
   * Check if supplier is verified
   */
  static isVerified(profile: SupplierProfile): boolean {
    return profile.is_verified && profile.verification_status === 'approved';
  }

  /**
   * Get verification status display text
   */
  static getVerificationStatusText(profile: SupplierProfile): string {
    if (!profile.is_verified) {
      return 'Email verification required';
    }
    
    switch (profile.verification_status) {
      case 'pending':
        return 'Business verification pending';
      case 'approved':
        return 'Business verified';
      case 'rejected':
        return 'Business verification rejected';
      case 'suspended':
        return 'Account suspended';
      default:
        return 'Verification status unknown';
    }
  }

  /**
   * Get verification status color
   */
  static getVerificationStatusColor(profile: SupplierProfile): string {
    if (!profile.is_verified) {
      return 'yellow';
    }
    
    switch (profile.verification_status) {
      case 'pending':
        return 'yellow';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      case 'suspended':
        return 'red';
      default:
        return 'gray';
    }
  }

  /**
   * Transform form data to database format
   */
  static transformFormData(formData: SupplierFormData): Partial<SupplierProfile> {
    const baseData: Partial<SupplierProfile> = {
      account_type: formData.account_type,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      state: formData.state,
      business_license: formData.business_license,
      tax_id: formData.tax_id,
      business_registration_number: formData.business_registration_number,
      business_type: formData.business_type,
      industry_category: formData.industry_category,
    };

    if (formData.account_type === 'individual') {
      return {
        ...baseData,
        individual_first_name: formData.individual_first_name,
        individual_last_name: formData.individual_last_name,
        individual_phone: formData.individual_phone,
      };
    } else {
      return {
        ...baseData,
        company_name: formData.company_name,
        company_description: formData.company_description,
        company_phone: formData.company_phone,
        company_website: formData.company_website,
        company_address: formData.company_address,
        contact_person: formData.contact_person,
        contact_person_phone: formData.contact_person_phone,
        contact_person_email: formData.contact_person_email,
      };
    }
  }

  /**
   * Transform database data to form format
   */
  static transformToFormData(profile: SupplierProfile): SupplierFormData {
    return {
      account_type: profile.account_type || 'individual',
      email: profile.email,
      phone: profile.phone,
      country: profile.country,
      state: profile.state,
      
      // Individual fields
      individual_first_name: profile.individual_first_name,
      individual_last_name: profile.individual_last_name,
      individual_phone: profile.individual_phone,
      
      // Company fields
      company_name: profile.company_name,
      company_description: profile.company_description,
      company_phone: profile.company_phone,
      company_website: profile.company_website,
      company_address: profile.company_address,
      contact_person: profile.contact_person,
      contact_person_phone: profile.contact_person_phone,
      contact_person_email: profile.contact_person_email,
      
      // Business fields
      business_license: profile.business_license,
      tax_id: profile.tax_id,
      business_registration_number: profile.business_registration_number,
      business_type: profile.business_type,
      industry_category: profile.industry_category,
    };
  }
} 