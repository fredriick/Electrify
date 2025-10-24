'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/auth';
import { revenueService, CommissionRate, PlatformFee, PaymentProcessingFee } from '@/services/revenueService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Loader2, DollarSign, Percent, CreditCard, Settings, Plus, Edit, Trash2 } from 'lucide-react';

export default function RevenueManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('commission');

  // Commission rates state
  const [commissionRates, setCommissionRates] = useState<CommissionRate[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [editingCommission, setEditingCommission] = useState<CommissionRate | null>(null);

  // Platform fees state
  const [platformFees, setPlatformFees] = useState<PlatformFee[]>([]);
  const [editingPlatformFee, setEditingPlatformFee] = useState<PlatformFee | null>(null);

  // Payment processing fees state
  const [paymentFees, setPaymentFees] = useState<PaymentProcessingFee[]>([]);
  const [editingPaymentFee, setEditingPaymentFee] = useState<PaymentProcessingFee | null>(null);

  // Form states
  const [commissionForm, setCommissionForm] = useState({
    supplier_id: '',
    commission_rate: 5.0,
    min_order_amount: 0,
    max_order_amount: ''
  });

  const [platformFeeForm, setPlatformFeeForm] = useState({
    fee_type: 'per_order' as 'per_order' | 'per_item' | 'percentage',
    fee_amount: 200.0,
    min_order_amount: 0,
    max_order_amount: '',
    description: ''
  });

  const [paymentFeeForm, setPaymentFeeForm] = useState({
    payment_provider: 'paystack' as 'paystack' | 'flutterwave' | 'stripe',
    fee_type: 'percentage' as 'percentage' | 'fixed' | 'hybrid',
    percentage_rate: 0.015,
    fixed_amount: 0,
    min_fee: 10,
    max_fee: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCommissionRates(),
        loadSuppliers(),
        loadPlatformFees(),
        loadPaymentFees()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCommissionRates = async () => {
    try {
      console.log('🔍 Loading commission rates...');
      const { data, error } = await supabase
        .from('commission_rates')
        .select(`
          *,
          suppliers (
            id,
            shop_name,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading commission rates:', error);
        throw error;
      }
      
      console.log('✅ Commission rates loaded:', {
        count: data?.length || 0,
        rates: data?.map((rate: any) => ({
          id: rate.id,
          supplier_id: rate.supplier_id,
          commission_rate: rate.commission_rate,
          supplier_name: rate.suppliers?.shop_name || 
                        `${rate.suppliers?.first_name || ''} ${rate.suppliers?.last_name || ''}`.trim() || 
                        rate.suppliers?.email
        })) || []
      });
      setCommissionRates(data || []);
    } catch (error) {
      console.error('❌ Error loading commission rates:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      console.log('🔍 Loading suppliers...');
      const { data, error } = await supabase
        .from('suppliers')
        .select(`
          id,
          shop_name,
          first_name,
          last_name,
          email
        `)
        .eq('is_active', true);

      if (error) {
        console.error('❌ Error loading suppliers:', error);
        throw error;
      }
      
      // Map suppliers to include business_name (using shop_name or first_name + last_name)
      const mappedSuppliers = data?.map((s: any) => ({
        id: s.id,
        business_name: s.shop_name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email
      })) || [];
      
      console.log('✅ Suppliers loaded:', {
        count: mappedSuppliers.length,
        suppliers: mappedSuppliers.map((s: any) => ({ id: s.id, name: s.business_name }))
      });
      setSuppliers(mappedSuppliers);
    } catch (error) {
      console.error('❌ Error loading suppliers:', error);
    }
  };

  const loadPlatformFees = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_fees')
        .select('*')
        .order('min_order_amount', { ascending: true });

      if (error) throw error;
      setPlatformFees(data || []);
    } catch (error) {
      console.error('Error loading platform fees:', error);
    }
  };

  const loadPaymentFees = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_processing_fees')
        .select('*')
        .order('payment_provider', { ascending: true });

      if (error) throw error;
      setPaymentFees(data || []);
    } catch (error) {
      console.error('Error loading payment fees:', error);
    }
  };

  const handleCommissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('🔍 Commission form submission:', {
        formData: commissionForm,
        editingCommission: editingCommission,
        suppliersCount: suppliers.length,
        suppliers: suppliers.map(s => ({ id: s.id, name: s.business_name }))
      });

      if (!commissionForm.supplier_id) {
        alert('Please select a supplier');
        return;
      }

      if (editingCommission) {
        // Update existing commission rate
        console.log('🔄 Updating existing commission rate:', editingCommission.id);
        await revenueService.updateCommissionRate(
          commissionForm.supplier_id,
          commissionForm.commission_rate,
          commissionForm.min_order_amount,
          commissionForm.max_order_amount ? parseFloat(commissionForm.max_order_amount) : undefined,
          editingCommission.id
        );
      } else {
        // Create new commission rate
        console.log('➕ Creating new commission rate');
        await revenueService.updateCommissionRate(
          commissionForm.supplier_id,
          commissionForm.commission_rate,
          commissionForm.min_order_amount,
          commissionForm.max_order_amount ? parseFloat(commissionForm.max_order_amount) : undefined
        );
      }
      
      console.log('✅ Commission rate saved successfully');
      await loadCommissionRates();
      handleCancelEdit();
    } catch (error) {
      console.error('❌ Error updating commission rate:', error);
      alert(`Error saving commission rate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePlatformFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlatformFee) {
        // Update existing platform fee
        await revenueService.updatePlatformFee(
          platformFeeForm.fee_type,
          platformFeeForm.fee_amount,
          platformFeeForm.min_order_amount,
          platformFeeForm.max_order_amount ? parseFloat(platformFeeForm.max_order_amount) : undefined,
          platformFeeForm.description,
          editingPlatformFee.id
        );
      } else {
        // Create new platform fee
        await revenueService.updatePlatformFee(
          platformFeeForm.fee_type,
          platformFeeForm.fee_amount,
          platformFeeForm.min_order_amount,
          platformFeeForm.max_order_amount ? parseFloat(platformFeeForm.max_order_amount) : undefined,
          platformFeeForm.description
        );
      }
      
      await loadPlatformFees();
      handleCancelEdit();
    } catch (error) {
      console.error('Error updating platform fee:', error);
    }
  };

  const handlePaymentFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPaymentFee) {
        // Update existing payment fee
        await revenueService.updatePaymentProcessingFee(
          paymentFeeForm.payment_provider,
          paymentFeeForm.fee_type,
          paymentFeeForm.percentage_rate,
          paymentFeeForm.fixed_amount,
          paymentFeeForm.min_fee,
          paymentFeeForm.max_fee ? parseFloat(paymentFeeForm.max_fee) : undefined,
          editingPaymentFee.id
        );
      } else {
        // Create new payment fee
        await revenueService.updatePaymentProcessingFee(
          paymentFeeForm.payment_provider,
          paymentFeeForm.fee_type,
          paymentFeeForm.percentage_rate,
          paymentFeeForm.fixed_amount,
          paymentFeeForm.min_fee,
          paymentFeeForm.max_fee ? parseFloat(paymentFeeForm.max_fee) : undefined
        );
      }
      
      await loadPaymentFees();
      handleCancelEdit();
    } catch (error) {
      console.error('Error updating payment fee:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${rate}%`;
  };

  // Edit handlers
  const handleEditCommission = (rate: CommissionRate) => {
    setEditingCommission(rate);
    setCommissionForm({
      supplier_id: rate.supplier_id,
      commission_rate: rate.commission_rate,
      min_order_amount: rate.min_order_amount,
      max_order_amount: rate.max_order_amount?.toString() || ''
    });
  };

  const handleEditPlatformFee = (fee: PlatformFee) => {
    setEditingPlatformFee(fee);
    setPlatformFeeForm({
      fee_type: fee.fee_type,
      fee_amount: fee.fee_amount,
      min_order_amount: fee.min_order_amount,
      max_order_amount: fee.max_order_amount?.toString() || '',
      description: fee.description || ''
    });
  };

  const handleEditPaymentFee = (fee: PaymentProcessingFee) => {
    setEditingPaymentFee(fee);
    setPaymentFeeForm({
      payment_provider: fee.payment_provider,
      fee_type: fee.fee_type,
      percentage_rate: fee.percentage_rate,
      fixed_amount: fee.fixed_amount,
      min_fee: fee.min_fee,
      max_fee: fee.max_fee?.toString() || ''
    });
  };

  // Delete handlers
  const handleDeleteCommission = async (rateId: string) => {
    if (confirm('Are you sure you want to delete this commission rate?')) {
      try {
        await revenueService.deleteCommissionRate(rateId);
        await loadCommissionRates();
      } catch (error) {
        console.error('Error deleting commission rate:', error);
      }
    }
  };

  const handleDeletePlatformFee = async (feeId: string) => {
    if (confirm('Are you sure you want to delete this platform fee?')) {
      try {
        await revenueService.deletePlatformFee(feeId);
        await loadPlatformFees();
      } catch (error) {
        console.error('Error deleting platform fee:', error);
      }
    }
  };

  const handleDeletePaymentFee = async (feeId: string) => {
    if (confirm('Are you sure you want to delete this payment fee?')) {
      try {
        await revenueService.deletePaymentProcessingFee(feeId);
        await loadPaymentFees();
      } catch (error) {
        console.error('Error deleting payment fee:', error);
      }
    }
  };

  // Cancel edit handlers
  const handleCancelEdit = () => {
    setEditingCommission(null);
    setEditingPlatformFee(null);
    setEditingPaymentFee(null);
    setCommissionForm({
      supplier_id: '',
      commission_rate: 5.0,
      min_order_amount: 0,
      max_order_amount: ''
    });
    setPlatformFeeForm({
      fee_type: 'per_order',
      fee_amount: 200.0,
      min_order_amount: 0,
      max_order_amount: '',
      description: ''
    });
    setPaymentFeeForm({
      payment_provider: 'paystack',
      fee_type: 'percentage',
      percentage_rate: 0.015,
      fixed_amount: 0,
      min_fee: 10,
      max_fee: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Revenue Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage platform revenue streams including commissions, fees, and payment processing
              </p>
            </div>
          </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="commission" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Commission Rates
          </TabsTrigger>
          <TabsTrigger value="platform" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Platform Fees
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Fees
          </TabsTrigger>
        </TabsList>

        {/* Commission Rates Tab */}
        <TabsContent value="commission" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Commission Rates
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Set commission rates for suppliers based on order amounts
              </p>
            </div>
            <div className="space-y-4">
              <form onSubmit={handleCommissionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select
                      value={commissionForm.supplier_id}
                      onValueChange={(value) => setCommissionForm(prev => ({ ...prev, supplier_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.business_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                    <Input
                      id="commission_rate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={commissionForm.commission_rate}
                      onChange={(e) => setCommissionForm(prev => ({ ...prev, commission_rate: parseFloat(e.target.value) }))}
                      placeholder="5.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="min_order_amount">Minimum Order Amount</Label>
                    <Input
                      id="min_order_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={commissionForm.min_order_amount}
                      onChange={(e) => setCommissionForm(prev => ({ ...prev, min_order_amount: parseFloat(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_order_amount">Maximum Order Amount (Optional)</Label>
                    <Input
                      id="max_order_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={commissionForm.max_order_amount}
                      onChange={(e) => setCommissionForm(prev => ({ ...prev, max_order_amount: e.target.value }))}
                      placeholder="Leave empty for no limit"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingCommission ? (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Update Commission Rate
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Commission Rate
                      </>
                    )}
                  </Button>
                  {editingCommission && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Current Commission Rates
              </h2>
            </div>
            <div className="space-y-4">
              {commissionRates.map((rate) => (
                <div key={rate.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {(rate as any).suppliers?.shop_name ||
                        `${(rate as any).suppliers?.first_name || ''} ${(rate as any).suppliers?.last_name || ''}`.trim() ||
                        (rate as any).suppliers?.email ||
                        'Unknown Supplier'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Order range: {formatCurrency(rate.min_order_amount)} - {rate.max_order_amount ? formatCurrency(rate.max_order_amount) : 'No limit'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge variant="outline" className="text-lg">
                        {formatPercentage(rate.commission_rate)}
                      </Badge>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {rate.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCommission(rate)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCommission(rate.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Platform Fees Tab */}
        <TabsContent value="platform" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Platform Fees
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Set fixed platform fees charged per order
              </p>
            </div>
            <div className="space-y-4">
              <form onSubmit={handlePlatformFeeSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fee_type">Fee Type</Label>
                    <Select
                      value={platformFeeForm.fee_type}
                      onValueChange={(value: string) =>
                        setPlatformFeeForm(prev => ({ ...prev, fee_type: value as 'per_order' | 'per_item' | 'percentage' }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_order">Per Order</SelectItem>
                        <SelectItem value="per_item">Per Item</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fee_amount">Fee Amount</Label>
                    <Input
                      id="fee_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={platformFeeForm.fee_amount}
                      onChange={(e) => setPlatformFeeForm(prev => ({ ...prev, fee_amount: parseFloat(e.target.value) }))}
                      placeholder="200.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="min_order_amount">Minimum Order Amount</Label>
                    <Input
                      id="min_order_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={platformFeeForm.min_order_amount}
                      onChange={(e) => setPlatformFeeForm(prev => ({ ...prev, min_order_amount: parseFloat(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_order_amount">Maximum Order Amount (Optional)</Label>
                    <Input
                      id="max_order_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={platformFeeForm.max_order_amount}
                      onChange={(e) => setPlatformFeeForm(prev => ({ ...prev, max_order_amount: e.target.value }))}
                      placeholder="Leave empty for no limit"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={platformFeeForm.description}
                      onChange={(e) => setPlatformFeeForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="e.g., Standard platform fee per order"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingPlatformFee ? (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Update Platform Fee
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Platform Fee
                      </>
                    )}
                  </Button>
                  {editingPlatformFee && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Current Platform Fees
              </h2>
            </div>
            <div className="space-y-4">
              {platformFees.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white capitalize">{fee.fee_type.replace('_', ' ')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{fee.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Order range: {formatCurrency(fee.min_order_amount)} - {fee.max_order_amount ? formatCurrency(fee.max_order_amount) : 'No limit'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge variant="outline" className="text-lg">
                        {formatCurrency(fee.fee_amount)}
                      </Badge>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {fee.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPlatformFee(fee)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePlatformFee(fee.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Payment Processing Fees Tab */}
        <TabsContent value="payment" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payment Processing Fees
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Set fees for payment providers (Paystack, Flutterwave, Stripe)
              </p>
            </div>
            <div className="space-y-4">
              <form onSubmit={handlePaymentFeeSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment_provider">Payment Provider</Label>
                    <Select
                      value={paymentFeeForm.payment_provider}
                      onValueChange={(value: string) =>
                        setPaymentFeeForm(prev => ({ ...prev, payment_provider: value as 'paystack' | 'flutterwave' | 'stripe' }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paystack">Paystack</SelectItem>
                        <SelectItem value="flutterwave">Flutterwave</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fee_type">Fee Type</Label>
                    <Select
                      value={paymentFeeForm.fee_type}
                      onValueChange={(value: string) =>
                        setPaymentFeeForm(prev => ({ ...prev, fee_type: value as 'percentage' | 'fixed' | 'hybrid' }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="hybrid">Hybrid (Max of % or Fixed)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="percentage_rate">Percentage Rate</Label>
                    <Input
                      id="percentage_rate"
                      type="number"
                      step="0.0001"
                      min="0"
                      max="1"
                      value={paymentFeeForm.percentage_rate}
                      onChange={(e) => setPaymentFeeForm(prev => ({ ...prev, percentage_rate: parseFloat(e.target.value) }))}
                      placeholder="0.015"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fixed_amount">Fixed Amount</Label>
                    <Input
                      id="fixed_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={paymentFeeForm.fixed_amount}
                      onChange={(e) => setPaymentFeeForm(prev => ({ ...prev, fixed_amount: parseFloat(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="min_fee">Minimum Fee</Label>
                    <Input
                      id="min_fee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={paymentFeeForm.min_fee}
                      onChange={(e) => setPaymentFeeForm(prev => ({ ...prev, min_fee: parseFloat(e.target.value) }))}
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_fee">Maximum Fee (Optional)</Label>
                    <Input
                      id="max_fee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={paymentFeeForm.max_fee}
                      onChange={(e) => setPaymentFeeForm(prev => ({ ...prev, max_fee: e.target.value }))}
                      placeholder="Leave empty for no limit"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingPaymentFee ? (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Update Payment Fee
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Fee
                      </>
                    )}
                  </Button>
                  {editingPaymentFee && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Current Payment Processing Fees
              </h2>
            </div>
            <div className="space-y-4">
              {paymentFees.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white capitalize">{fee.payment_provider}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{fee.fee_type}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Min: {formatCurrency(fee.min_fee)} - Max: {fee.max_fee ? formatCurrency(fee.max_fee) : 'No limit'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="space-y-1">
                        <Badge variant="outline">
                          {formatPercentage(fee.percentage_rate * 100)}
                        </Badge>
                        {fee.fixed_amount > 0 && (
                          <Badge variant="outline">
                            {formatCurrency(fee.fixed_amount)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {fee.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPaymentFee(fee)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePaymentFee(fee.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}
