'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { 
  FileCheck2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download,
  AlertTriangle,
  Building2,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  FileText,
  Shield,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/auth';

interface BusinessLicenseDocument {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  shop_name?: string;
  account_type: 'individual' | 'company';
  company_name?: string;
  individual_first_name?: string;
  individual_last_name?: string;
  
  // Business license specific fields
  business_license_document?: string;
  tax_certificate_document?: string;
  business_registration_number?: string;
  business_type?: string;
  industry_category?: string;
  
  // Contact and address fields
  phone?: string;
  individual_phone?: string;
  country?: string;
  state?: string;
  company_address?: string;
  avatar_url?: string;
  
  // Section approval status
  section_approval_status?: {
    business: 'pending' | 'under_review' | 'approved' | 'rejected';
  };
  
  // Admin approval notes
  admin_approval_notes?: {
    business?: string;
  };
  
  created_at: string;
  updated_at: string;
}

export default function BusinessLicensesPage() {
  const [suppliers, setSuppliers] = useState<BusinessLicenseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<BusinessLicenseDocument | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSuppliers(data || []);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'under_review':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'under_review':
        return 'Under Review';
      default:
        return 'Pending';
    }
  };

  const getDocumentStatus = (supplier: BusinessLicenseDocument) => {
    const hasBusinessLicense = !!supplier.business_license_document;
    const hasTaxCertificate = !!supplier.tax_certificate_document;
    const hasRegistrationNumber = !!supplier.business_registration_number;
    
    if (hasBusinessLicense && hasTaxCertificate && hasRegistrationNumber) {
      return { status: 'complete', text: 'Complete', color: 'text-green-600' };
    } else if (hasBusinessLicense || hasTaxCertificate) {
      return { status: 'partial', text: 'Partial', color: 'text-yellow-600' };
    } else {
      return { status: 'missing', text: 'Missing', color: 'text-red-600' };
    }
  };

  const handleStatusUpdate = async (supplierId: string, newStatus: string, notes?: string) => {
    try {
      setApprovalLoading(true);
      const supabase = getSupabaseClient();
      
      const updateData: any = {
        section_approval_status: {},
        admin_approval_notes: {}
      };
      
      // Get current status and notes
      const currentSupplier = suppliers.find(s => s.id === supplierId);
      if (!currentSupplier) return;
      
      const currentStatus = currentSupplier.section_approval_status || {};
      const currentNotes = currentSupplier.admin_approval_notes || {};
      
      // Update the business section
      updateData.section_approval_status = {
        ...currentStatus,
        business: newStatus
      };
      
      if (notes) {
        updateData.admin_approval_notes = {
          ...currentNotes,
          business: notes
        };
      }
      
      const { error } = await supabase
        .from('suppliers')
        .update(updateData)
        .eq('id', supplierId);

      if (error) throw error;
      
      // Update local state
      setSuppliers(prev => prev.map(s => 
        s.id === supplierId 
          ? { ...s, ...updateData }
          : s
      ));
      
      setShowModal(false);
      setSelectedSupplier(null);
      setAdminNotes('');
      setSelectedAction('');
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    setSelectedAction(action);
    setAdminNotes('');
  };

  const confirmAction = async () => {
    if (!selectedSupplier || !selectedAction) return;
    
    await handleStatusUpdate(selectedSupplier.id, selectedAction, adminNotes);
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.business_registration_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') {
      // Apply document type filter
      if (documentTypeFilter === 'all') return matchesSearch;
      
      const docStatus = getDocumentStatus(supplier);
      return matchesSearch && docStatus.status === documentTypeFilter;
    }
    
    const hasStatus = supplier.section_approval_status?.business === statusFilter;
    const docStatus = getDocumentStatus(supplier);
    const matchesDocType = documentTypeFilter === 'all' || docStatus.status === documentTypeFilter;
    
    return matchesSearch && hasStatus && matchesDocType;
  });

  // Calculate stats
  const stats = {
    total: suppliers.length,
    pending: suppliers.filter(s => s.section_approval_status?.business === 'pending' || !s.section_approval_status?.business).length,
    approved: suppliers.filter(s => s.section_approval_status?.business === 'approved').length,
    rejected: suppliers.filter(s => s.section_approval_status?.business === 'rejected').length,
    complete: suppliers.filter(s => getDocumentStatus(s).status === 'complete').length,
    partial: suppliers.filter(s => getDocumentStatus(s).status === 'partial').length,
    missing: suppliers.filter(s => getDocumentStatus(s).status === 'missing').length
  };

  if (loading) {
    return (
      <AdminRoute>
        <AdminLayout>
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <Shield className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Licenses</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Review and approve business license documents and compliance</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Suppliers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Complete Documents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.complete}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Missing Documents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.missing}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by email, shop name, company, or registration number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={documentTypeFilter}
              onChange={(e) => setDocumentTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Documents</option>
              <option value="complete">Complete</option>
              <option value="partial">Partial</option>
              <option value="missing">Missing</option>
            </select>
          </div>
        </div>

        {/* Suppliers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Business Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Registration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSuppliers.map((supplier) => {
                  const docStatus = getDocumentStatus(supplier);
                  return (
                    <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {/* Supplier Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {supplier.shop_name || supplier.company_name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {supplier.email}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {supplier.account_type === 'company' ? 'Company' : 'Individual'}
                          </div>
                        </div>
                      </td>

                      {/* Business Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {supplier.business_type || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {supplier.industry_category || 'N/A'}
                        </div>
                      </td>

                      {/* Documents Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3 h-3" />
                            <span className="text-xs">
                              License: {supplier.business_license_document ? '✅' : '❌'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-3 h-3" />
                            <span className="text-xs">
                              Tax Cert: {supplier.tax_certificate_document ? '✅' : '❌'}
                            </span>
                          </div>
                          <div className={`text-xs font-medium ${docStatus.color}`}>
                            {docStatus.text}
                          </div>
                        </div>
                      </td>

                      {/* Registration Number */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {supplier.business_registration_number || 'N/A'}
                        </div>
                      </td>

                      {/* Approval Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(supplier.section_approval_status?.business || 'pending')}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.section_approval_status?.business || 'pending')}`}>
                            {getStatusText(supplier.section_approval_status?.business || 'pending')}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setShowModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* No Results */}
        {filteredSuppliers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No suppliers found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || documentTypeFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No suppliers have been registered yet.'
              }
            </p>
          </div>
        )}

        {/* Review Modal */}
        {showModal && selectedSupplier && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Review Business License: {selectedSupplier.shop_name || selectedSupplier.company_name}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Business Information */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Business Information
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSupplier.section_approval_status?.business || 'pending')}`}>
                        {getStatusText(selectedSupplier.section_approval_status?.business || 'pending')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {selectedSupplier.account_type === 'company' ? (
                        <>
                          Company: {selectedSupplier.company_name || 'N/A'}<br/>
                          Business Type: {selectedSupplier.business_type || 'N/A'}<br/>
                          Industry: {selectedSupplier.industry_category || 'N/A'}<br/>
                          Registration: {selectedSupplier.business_registration_number || 'N/A'}
                        </>
                      ) : (
                        <>
                          Individual: {selectedSupplier.individual_first_name} {selectedSupplier.individual_last_name}<br/>
                          Business Type: {selectedSupplier.business_type || 'N/A'}
                        </>
                      )}
                    </div>
                    
                    {/* Document Links */}
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Documents:</div>
                      <div className="space-y-2">
                        {selectedSupplier.business_license_document && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <a 
                              href={selectedSupplier.business_license_document} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                            >
                              Business License
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {selectedSupplier.tax_certificate_document && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-green-600" />
                            <a 
                              href={selectedSupplier.tax_certificate_document} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 flex items-center gap-1"
                            >
                              Tax Certificate
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleActionClick('approved')}
                        disabled={approvalLoading}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleActionClick('under_review')}
                        disabled={approvalLoading}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Under Review
                      </button>
                      <button
                        onClick={() => handleActionClick('rejected')}
                        disabled={approvalLoading}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Confirmation Modal */}
        {selectedAction && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Confirm {selectedAction === 'approved' ? 'Approval' : selectedAction === 'rejected' ? 'Rejection' : 'Review'} for Business License
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={`Add notes about why this business license is being ${selectedAction === 'approved' ? 'approved' : selectedAction === 'rejected' ? 'rejected' : 'marked for review'}...`}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setSelectedAction('');
                      setAdminNotes('');
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAction}
                    disabled={approvalLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {approvalLoading ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </AdminLayout>
    </AdminRoute>
  );
}


