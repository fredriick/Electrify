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
  Users,
  Building2,
  Truck,
  CreditCard,
  User,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/auth';

interface SupplierDocument {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  shop_name?: string;
  account_type: 'individual' | 'company';
  company_name?: string;
  individual_first_name?: string;
  individual_last_name?: string;
  
  // Contact and address fields
  phone?: string;
  individual_phone?: string;
  country?: string;
  state?: string;
  company_address?: string;
  avatar_url?: string;
  
  // Document URLs
  business_license_document?: string;
  tax_certificate_document?: string;
  bank_document?: string;
  government_id_document?: string;
  proof_of_address_document?: string;
  
  // Section approval status
  section_approval_status?: {
    shop: 'pending' | 'under_review' | 'approved' | 'rejected';
    business: 'pending' | 'under_review' | 'approved' | 'rejected';
    shipping: 'pending' | 'under_review' | 'approved' | 'rejected';
    payment: 'pending' | 'under_review' | 'approved' | 'rejected';
    profile: 'pending' | 'under_review' | 'approved' | 'rejected';
  };
  
  // Admin approval notes
  admin_approval_notes?: {
    shop?: string;
    business?: string;
    shipping?: string;
    payment?: string;
    profile?: string;
  };
  
  created_at: string;
  updated_at: string;
}

export default function SellerDocumentApprovalPage() {
  const [suppliers, setSuppliers] = useState<SupplierDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierDocument | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
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

  const handleStatusUpdate = async (supplierId: string, section: string, newStatus: string, notes?: string) => {
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
      
      // Update the specific section
      updateData.section_approval_status = {
        ...currentStatus,
        [section]: newStatus
      };
      
      if (notes) {
        updateData.admin_approval_notes = {
          ...currentNotes,
          [section]: notes
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
      setSelectedSection('');
      setSelectedAction('');
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleActionClick = (section: string, action: string) => {
    setSelectedSection(section);
    setSelectedAction(action);
    setAdminNotes('');
  };

  const confirmAction = async () => {
    if (!selectedSupplier || !selectedSection || !selectedAction) return;
    
    await handleStatusUpdate(selectedSupplier.id, selectedSection, selectedAction, adminNotes);
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const hasStatus = Object.values(supplier.section_approval_status || {}).some(status => status === statusFilter);
    return matchesSearch && hasStatus;
  });

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
              <FileCheck2 className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Seller Document Approval</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Review and approve seller profile sections and documents</p>
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
                placeholder="Search suppliers by email, shop name, or company..."
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
                    Shop Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                    Shipping
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSuppliers.map((supplier) => (
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

                    {/* Shop Info Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(supplier.section_approval_status?.shop || 'pending')}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.section_approval_status?.shop || 'pending')}`}>
                          {getStatusText(supplier.section_approval_status?.shop || 'pending')}
                        </span>
                      </div>
                    </td>

                    {/* Business Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(supplier.section_approval_status?.business || 'pending')}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.section_approval_status?.business || 'pending')}`}>
                          {getStatusText(supplier.section_approval_status?.business || 'pending')}
                        </span>
                      </div>
                    </td>

                    {/* Shipping Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(supplier.section_approval_status?.shipping || 'pending')}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.section_approval_status?.shipping || 'pending')}`}>
                          {getStatusText(supplier.section_approval_status?.shipping || 'pending')}
                        </span>
                      </div>
                    </td>

                    {/* Payment Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(supplier.section_approval_status?.payment || 'pending')}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.section_approval_status?.payment || 'pending')}`}>
                          {getStatusText(supplier.section_approval_status?.payment || 'pending')}
                        </span>
                      </div>
                    </td>

                    {/* Profile Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(supplier.section_approval_status?.profile || 'pending')}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.section_approval_status?.profile || 'pending')}`}>
                          {getStatusText(supplier.section_approval_status?.profile || 'pending')}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* No Results */}
        {filteredSuppliers.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileCheck2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No suppliers found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No suppliers have been registered yet.'
              }
            </p>
          </div>
        )}

        {/* Approval Modal */}
        {showModal && selectedSupplier && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Review Supplier: {selectedSupplier.shop_name || selectedSupplier.company_name}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Shop Info Section */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Shop Information
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSupplier.section_approval_status?.shop || 'pending')}`}>
                        {getStatusText(selectedSupplier.section_approval_status?.shop || 'pending')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Shop Name: {selectedSupplier.shop_name || 'N/A'}<br/>
                      Email: {selectedSupplier.email}<br/>
                      Phone: {selectedSupplier.phone || 'N/A'}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleActionClick('shop', 'approved')}
                        disabled={approvalLoading}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleActionClick('shop', 'under_review')}
                        disabled={approvalLoading}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Under Review
                      </button>
                      <button
                        onClick={() => handleActionClick('shop', 'rejected')}
                        disabled={approvalLoading}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* Business Section */}
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
                          Business License: {selectedSupplier.business_license_document ? '✅ Uploaded' : '❌ Missing'}<br/>
                          Tax ID: {selectedSupplier.tax_certificate_document ? '✅ Uploaded' : '❌ Missing'}
                        </>
                      ) : (
                        <>
                          Individual: {selectedSupplier.individual_first_name} {selectedSupplier.individual_last_name}<br/>
                          Phone: {selectedSupplier.individual_phone || 'N/A'}
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleActionClick('business', 'approved')}
                        disabled={approvalLoading}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleActionClick('business', 'under_review')}
                        disabled={approvalLoading}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Under Review
                      </button>
                      <button
                        onClick={() => handleActionClick('business', 'rejected')}
                        disabled={approvalLoading}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* Shipping Section */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Shipping Information
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSupplier.section_approval_status?.shipping || 'pending')}`}>
                        {getStatusText(selectedSupplier.section_approval_status?.shipping || 'pending')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Address: {selectedSupplier.company_address || `${selectedSupplier.country || 'N/A'}, ${selectedSupplier.state || 'N/A'}`}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleActionClick('shipping', 'approved')}
                        disabled={approvalLoading}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleActionClick('shipping', 'under_review')}
                        disabled={approvalLoading}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Under Review
                      </button>
                      <button
                        onClick={() => handleActionClick('shipping', 'rejected')}
                        disabled={approvalLoading}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* Payment Section */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Information
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSupplier.section_approval_status?.payment || 'pending')}`}>
                        {getStatusText(selectedSupplier.section_approval_status?.payment || 'pending')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Bank Document: {selectedSupplier.bank_document ? '✅ Uploaded' : '❌ Missing'}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleActionClick('payment', 'approved')}
                        disabled={approvalLoading}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleActionClick('payment', 'under_review')}
                        disabled={approvalLoading}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Under Review
                      </button>
                      <button
                        onClick={() => handleActionClick('payment', 'rejected')}
                        disabled={approvalLoading}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* Profile Section */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Profile Information
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSupplier.section_approval_status?.profile || 'pending')}`}>
                        {getStatusText(selectedSupplier.section_approval_status?.profile || 'pending')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Name: {selectedSupplier.first_name} {selectedSupplier.last_name}<br/>
                      Phone: {selectedSupplier.phone || 'N/A'}<br/>
                      Avatar: {selectedSupplier.avatar_url ? '✅ Uploaded' : '❌ Missing'}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleActionClick('profile', 'approved')}
                        disabled={approvalLoading}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleActionClick('profile', 'under_review')}
                        disabled={approvalLoading}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Under Review
                      </button>
                      <button
                        onClick={() => handleActionClick('profile', 'rejected')}
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
        {selectedSection && selectedAction && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Confirm {selectedAction === 'approved' ? 'Approval' : selectedAction === 'rejected' ? 'Rejection' : 'Review'} for {selectedSection}
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={`Add notes about why this section is being ${selectedAction === 'approved' ? 'approved' : selectedAction === 'rejected' ? 'rejected' : 'marked for review'}...`}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setSelectedSection('');
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
