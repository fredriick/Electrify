'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Modal } from '@/components/ui/Modal';
import { supabase } from '@/lib/auth';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  LayoutList,
  LayoutGrid,
  Star,
  DollarSign,
  User,
  Calendar,
  Package,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Archive,
  RefreshCw
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  supplier: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    total: number;
    image?: string;
  }>;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded' | 'refund_pending' | 'refund_processed' | 'refund_rejected';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
  isDisputed: boolean;
  disputeReason?: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2025-001',
    customer: {
      id: 'customer-1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, New York, NY 10001'
    },
    supplier: {
      id: 'supplier-1',
      name: 'SolarTech Inc.',
      email: 'orders@solartech.com'
    },
    items: [
      {
        id: 'item-1',
        name: 'Premium Solar Panel 400W',
        sku: 'SOLAR-400W-PREM',
        quantity: 2,
        price: 299.99,
        total: 599.98,
        image: '/images/solar-panel-1.jpg'
      }
    ],
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    subtotal: 599.98,
    tax: 47.99,
    shipping: 25.00,
    total: 672.97,
    currency: 'USD',
    createdAt: '2025-07-15T10:30:00Z',
    updatedAt: '2025-07-20T14:15:00Z',
    estimatedDelivery: '2025-07-25',
    trackingNumber: 'TRK123456789',
    notes: 'Customer requested delivery before 2 PM',
    isDisputed: false
  },
  {
    id: '2',
    orderNumber: 'ORD-2025-002',
    customer: {
      id: 'customer-2',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 987-6543',
      address: '456 Oak Ave, Los Angeles, CA 90210'
    },
    supplier: {
      id: 'supplier-2',
      name: 'PowerMax Systems',
      email: 'orders@powermax.com'
    },
    items: [
      {
        id: 'item-2',
        name: 'Smart Inverter 3000W',
        sku: 'INV-3000W-SMART',
        quantity: 1,
        price: 599.99,
        total: 599.99,
        image: '/images/inverter-1.jpg'
      },
      {
        id: 'item-3',
        name: 'Solar Mounting Kit',
        sku: 'MOUNT-KIT-UNIV',
        quantity: 1,
        price: 89.99,
        total: 89.99,
        image: '/images/mounting-kit-1.jpg'
      }
    ],
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'PayPal',
    subtotal: 689.98,
    tax: 55.20,
    shipping: 35.00,
    total: 780.18,
    currency: 'USD',
    createdAt: '2025-07-16T09:15:00Z',
    updatedAt: '2025-07-18T16:30:00Z',
    estimatedDelivery: '2025-07-28',
    notes: 'Customer prefers weekend delivery',
    isDisputed: false
  },
  {
    id: '3',
    orderNumber: 'ORD-2025-003',
    customer: {
      id: 'customer-3',
      name: 'Mike Davis',
      email: 'mike.davis@email.com',
      phone: '+1 (555) 456-7890',
      address: '789 Pine St, Chicago, IL 60601'
    },
    supplier: {
      id: 'supplier-3',
      name: 'Tesla Energy',
      email: 'orders@teslaenergy.com'
    },
    items: [
      {
        id: 'item-4',
        name: 'Lithium Battery Pack 10kWh',
        sku: 'BAT-10KWH-LITH',
        quantity: 1,
        price: 2499.99,
        total: 2499.99,
        image: '/images/battery-1.jpg'
      }
    ],
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'Bank Transfer',
    subtotal: 2499.99,
    tax: 199.99,
    shipping: 50.00,
    total: 2749.98,
    currency: 'USD',
    createdAt: '2025-07-20T11:45:00Z',
    updatedAt: '2025-07-20T11:45:00Z',
    estimatedDelivery: '2025-08-05',
    notes: 'Large order - requires special handling',
    isDisputed: false
  },
  {
    id: '4',
    orderNumber: 'ORD-2025-004',
    customer: {
      id: 'customer-4',
      name: 'Emily Wilson',
      email: 'emily.w@email.com',
      phone: '+1 (555) 321-6547',
      address: '321 Elm St, Miami, FL 33101'
    },
    supplier: {
      id: 'supplier-4',
      name: 'Energy Store Pro',
      email: 'orders@energystore.com'
    },
    items: [
      {
        id: 'item-5',
        name: 'Solar Cable Set 10m',
        sku: 'CABLE-10M-SOLAR',
        quantity: 3,
        price: 34.99,
        total: 104.97,
        image: '/images/cable-set-1.jpg'
      }
    ],
    status: 'cancelled',
    paymentStatus: 'refunded',
    paymentMethod: 'Credit Card',
    subtotal: 104.97,
    tax: 8.40,
    shipping: 15.00,
    total: 128.37,
    currency: 'USD',
    createdAt: '2025-07-18T14:20:00Z',
    updatedAt: '2025-07-19T10:30:00Z',
    notes: 'Customer cancelled due to change in project scope',
    isDisputed: false
  },
  {
    id: '5',
    orderNumber: 'ORD-2025-005',
    customer: {
      id: 'customer-5',
      name: 'David Brown',
      email: 'david.brown@email.com',
      phone: '+1 (555) 789-0123',
      address: '654 Maple Dr, Seattle, WA 98101'
    },
    supplier: {
      id: 'supplier-5',
      name: 'LG Energy Solutions',
      email: 'orders@lgenergy.com'
    },
    items: [
      {
        id: 'item-6',
        name: 'Smart Home Energy Monitor',
        sku: 'MON-ENERGY-SMART',
        quantity: 1,
        price: 149.99,
        total: 149.99,
        image: '/images/monitor-1.jpg'
      }
    ],
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    subtotal: 149.99,
    tax: 12.00,
    shipping: 20.00,
    total: 181.99,
    currency: 'USD',
    createdAt: '2025-07-19T08:30:00Z',
    updatedAt: '2025-07-21T13:45:00Z',
    estimatedDelivery: '2025-07-26',
    trackingNumber: 'TRK987654321',
    notes: 'Fragile item - handle with care',
    isDisputed: false
  },
  {
    id: '6',
    orderNumber: 'ORD-2025-006',
    customer: {
      id: 'customer-6',
      name: 'Jennifer Lee',
      email: 'jennifer.lee@email.com',
      phone: '+1 (555) 234-5678',
      address: '987 Cedar Ln, Austin, TX 73301'
    },
    supplier: {
      id: 'supplier-6',
      name: 'SunPower Corporation',
      email: 'orders@sunpower.com'
    },
    items: [
      {
        id: 'item-7',
        name: 'High-Efficiency Solar Panel 450W',
        sku: 'SOLAR-450W-HE',
        quantity: 4,
        price: 349.99,
        total: 1399.96,
        image: '/images/solar-panel-2.jpg'
      }
    ],
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    subtotal: 1399.96,
    tax: 111.99,
    shipping: 45.00,
    total: 1556.95,
    currency: 'USD',
    createdAt: '2025-07-22T13:20:00Z',
    updatedAt: '2025-07-23T09:15:00Z',
    estimatedDelivery: '2025-07-30',
    notes: 'Commercial installation - priority shipping',
    isDisputed: false
  },
  {
    id: '7',
    orderNumber: 'ORD-2025-007',
    customer: {
      id: 'customer-7',
      name: 'Robert Garcia',
      email: 'robert.garcia@email.com',
      phone: '+1 (555) 345-6789',
      address: '456 Birch Ave, Denver, CO 80201'
    },
    supplier: {
      id: 'supplier-7',
      name: 'Enphase Energy',
      email: 'orders@enphase.com'
    },
    items: [
      {
        id: 'item-8',
        name: 'Microinverter IQ8H',
        sku: 'MICRO-IQ8H',
        quantity: 6,
        price: 199.99,
        total: 1199.94,
        image: '/images/microinverter-1.jpg'
      }
    ],
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'PayPal',
    subtotal: 1199.94,
    tax: 95.99,
    shipping: 30.00,
    total: 1325.93,
    currency: 'USD',
    createdAt: '2025-07-24T10:45:00Z',
    updatedAt: '2025-07-25T14:30:00Z',
    estimatedDelivery: '2025-08-02',
    notes: 'Residential installation project',
    isDisputed: false
  },
  {
    id: '8',
    orderNumber: 'ORD-2025-008',
    customer: {
      id: 'customer-8',
      name: 'Lisa Chen',
      email: 'lisa.chen@email.com',
      phone: '+1 (555) 456-7890',
      address: '789 Spruce St, Portland, OR 97201'
    },
    supplier: {
      id: 'supplier-8',
      name: 'Canadian Solar',
      email: 'orders@canadiansolar.com'
    },
    items: [
      {
        id: 'item-9',
        name: 'Solar Panel Mounting Brackets',
        sku: 'MOUNT-BRACKET-PRO',
        quantity: 2,
        price: 79.99,
        total: 159.98,
        image: '/images/mounting-brackets-1.jpg'
      },
      {
        id: 'item-10',
        name: 'Solar Panel Cleaning Kit',
        sku: 'CLEAN-KIT-PRO',
        quantity: 1,
        price: 45.99,
        total: 45.99,
        image: '/images/cleaning-kit-1.jpg'
      }
    ],
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    subtotal: 205.97,
    tax: 16.48,
    shipping: 18.00,
    total: 240.45,
    currency: 'USD',
    createdAt: '2025-07-25T16:30:00Z',
    updatedAt: '2025-07-26T11:20:00Z',
    estimatedDelivery: '2025-07-31',
    trackingNumber: 'TRK456789123',
    notes: 'Standard delivery requested',
    isDisputed: false
  },
  {
    id: '9',
    orderNumber: 'ORD-2025-009',
    customer: {
      id: 'customer-9',
      name: 'Michael Thompson',
      email: 'michael.thompson@email.com',
      phone: '+1 (555) 567-8901',
      address: '321 Oak Dr, Nashville, TN 37201'
    },
    supplier: {
      id: 'supplier-9',
      name: 'SMA Solar Technology',
      email: 'orders@sma-solar.com'
    },
    items: [
      {
        id: 'item-11',
        name: 'String Inverter 5000W',
        sku: 'INV-5000W-STRING',
        quantity: 1,
        price: 899.99,
        total: 899.99,
        image: '/images/string-inverter-1.jpg'
      }
    ],
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'Bank Transfer',
    subtotal: 899.99,
    tax: 72.00,
    shipping: 40.00,
    total: 1011.99,
    currency: 'USD',
    createdAt: '2025-07-26T09:15:00Z',
    updatedAt: '2025-07-26T09:15:00Z',
    estimatedDelivery: '2025-08-08',
    notes: 'Large commercial inverter - special handling required',
    isDisputed: false
  },
  {
    id: '10',
    orderNumber: 'ORD-2025-010',
    customer: {
      id: 'customer-10',
      name: 'Amanda Rodriguez',
      email: 'amanda.rodriguez@email.com',
      phone: '+1 (555) 678-9012',
      address: '654 Pine Ave, San Diego, CA 92101'
    },
    supplier: {
      id: 'supplier-10',
      name: 'First Solar',
      email: 'orders@firstsolar.com'
    },
    items: [
      {
        id: 'item-12',
        name: 'Thin-Film Solar Panel 100W',
        sku: 'SOLAR-100W-THIN',
        quantity: 8,
        price: 89.99,
        total: 719.92,
        image: '/images/thin-film-panel-1.jpg'
      }
    ],
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    subtotal: 719.92,
    tax: 57.59,
    shipping: 25.00,
    total: 802.51,
    currency: 'USD',
    createdAt: '2025-07-27T14:45:00Z',
    updatedAt: '2025-07-29T16:20:00Z',
    estimatedDelivery: '2025-08-03',
    trackingNumber: 'TRK789123456',
    notes: 'Successfully delivered - customer satisfied',
    isDisputed: false
  }
];

export default function AllOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Action handlers
  const handleViewOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      // Ensure all data is properly structured before setting
      const safeOrder = {
        ...order,
        customer: {
          id: order.customer?.id || 'unknown',
          name: String(order.customer?.name || 'Unknown Customer'),
          email: String(order.customer?.email || 'No email provided'),
          phone: String(order.customer?.phone || 'No phone provided'),
          address: String(order.customer?.address || 'No address provided')
        },
        supplier: {
          id: order.supplier?.id || 'unknown',
          name: String(order.supplier?.name || 'Unknown Supplier'),
          email: String(order.supplier?.email || 'No email provided')
        }
      };
      setSelectedOrder(safeOrder);
      setShowViewModal(true);
    }
  };

  const handleEditOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      // Ensure all data is properly structured before setting
      const safeOrder = {
        ...order,
        customer: {
          id: order.customer?.id || 'unknown',
          name: String(order.customer?.name || 'Unknown Customer'),
          email: String(order.customer?.email || 'No email provided'),
          phone: String(order.customer?.phone || 'No phone provided'),
          address: String(order.customer?.address || 'No address provided')
        },
        supplier: {
          id: order.supplier?.id || 'unknown',
          name: String(order.supplier?.name || 'Unknown Supplier'),
          email: String(order.supplier?.email || 'No email provided')
        }
      };
      setSelectedOrder(safeOrder);
      setShowEditModal(true);
    }
  };

  const handleSaveOrder = async (updatedOrder: Order) => {
    try {
      // TODO: Implement actual API call to update order
      console.log('Saving order:', updatedOrder);
      
      // For now, update the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      
      setShowEditModal(false);
      setSelectedOrder(null);
      
      // Show success message
      alert('Order updated successfully!');
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Failed to save order. Please try again.');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        console.log('Deleting order:', orderId);
        
        // Delete order items first (foreign key constraint)
        const { error: itemsError } = await supabase
          .from('order_items')
          .delete()
          .eq('order_id', orderId);

        if (itemsError) {
          console.error('Error deleting order items:', itemsError);
          alert('Failed to delete order items');
          return;
        }

        // Delete the order
        const { error: orderError } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);

        if (orderError) {
          console.error('Error deleting order:', orderError);
          alert('Failed to delete order');
          return;
        }

        // Remove from local state
        setOrders(orders.filter(order => order.id !== orderId));
        alert('Order deleted successfully');
        
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order');
      }
    }
  };

  // Fetch real orders data
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('🔍 Fetching orders from database...');
        
        // Fetch orders with related data
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              product:products (
                id,
                name,
                sku,
                image_url
              )
            )
          `)
          .order('created_at', { ascending: false });
        
        if (ordersError) {
          console.error('❌ Error fetching orders:', ordersError);
          setError('Failed to fetch orders');
          return;
        }
        
        console.log('✅ Orders fetched:', ordersData);
        
        // Transform database data to match Order interface
        const transformedOrders: Order[] = await Promise.all(
          ordersData?.map(async (dbOrder: any) => {
            // Fetch customer details
            let customerData = {
              id: dbOrder.user_id,
              name: 'Unknown Customer',
              email: 'unknown@email.com',
              phone: '',
              address: dbOrder.shipping_address || ''
            };

            if (dbOrder.user_id) {
              try {
                const { data: customer, error: customerError } = await supabase
                  .from('customers')
                  .select('id, first_name, last_name, email, phone')
                  .eq('id', dbOrder.user_id)
                  .single();

                if (!customerError && customer) {
                  // Ensure customer is an object and not a string/other type
                  if (typeof customer === 'object' && customer !== null) {
                    customerData = {
                      id: customer.id,
                      name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown Customer',
                      email: customer.email || 'unknown@email.com',
                      phone: customer.phone || '',
                      address: dbOrder.shipping_address || ''
                    };
                  }
                }
              } catch (error) {
                console.warn('Could not fetch customer details for order:', dbOrder.id, error);
              }
            }

            // Fetch supplier details
            let supplierData = {
              id: dbOrder.supplier_id || 'unknown',
              name: 'Unknown Supplier',
              email: 'unknown@email.com'
            };

            if (dbOrder.supplier_id) {
              try {
                const { data: supplier, error: supplierError } = await supabase
                  .from('suppliers')
                  .select('id, company_name, first_name, last_name, email')
                  .eq('id', dbOrder.supplier_id)
                  .single();

                if (!supplierError && supplier) {
                  // Ensure supplier is an object and not a string/other type
                  if (typeof supplier === 'object' && supplier !== null) {
                    const supplierName = supplier.company_name || 
                      `${supplier.first_name || ''} ${supplier.last_name || ''}`.trim() || 
                      'Unknown Supplier';
                    
                    supplierData = {
                      id: supplier.id,
                      name: supplierName,
                      email: supplier.email || 'unknown@email.com'
                    };
                  }
                }
              } catch (error) {
                console.warn('Could not fetch supplier details for order:', dbOrder.id, error);
              }
            } else {
              // If no supplier_id in orders table, try to get it from order_items -> products
              try {
                const { data: orderItems, error: itemsError } = await supabase
                  .from('order_items')
                  .select(`
                    products!inner(
                      supplier_id
                    )
                  `)
                  .eq('order_id', dbOrder.id)
                  .limit(1);

                if (!itemsError && orderItems && orderItems.length > 0) {
                  const supplierId = orderItems[0].products.supplier_id;
                  if (supplierId) {
                    const { data: supplier, error: supplierError } = await supabase
                      .from('suppliers')
                      .select('id, company_name, first_name, last_name, email')
                      .eq('id', supplierId)
                      .single();

                    if (!supplierError && supplier) {
                      const supplierName = supplier.company_name || 
                        `${supplier.first_name || ''} ${supplier.last_name || ''}`.trim() || 
                        'Unknown Supplier';
                      
                      supplierData = {
                        id: supplier.id,
                        name: supplierName,
                        email: supplier.email || 'unknown@email.com'
                      };
                    }
                  }
                }
              } catch (error) {
                console.warn('Could not fetch supplier details from order_items for order:', dbOrder.id, error);
              }
            }

            // Check if this order has a refund
            let displayStatus = dbOrder.status;
            try {
              const { data: refund } = await supabase
                .from('returns')
                .select('status')
                .eq('order_id', dbOrder.id)
                .single();

              if (refund) {
                switch (refund.status) {
                  case 'PENDING':
                    displayStatus = 'refund_pending';
                    break;
                  case 'PROCESSED':
                    displayStatus = 'refund_processed';
                    break;
                  case 'APPROVED':
                    displayStatus = 'refunded';
                    break;
                  case 'REJECTED':
                    displayStatus = 'refund_rejected';
                    break;
                  default:
                    displayStatus = dbOrder.status;
                }
              }
            } catch (error) {
              // No refund found, use original status
              displayStatus = dbOrder.status;
            }

            return {
              id: dbOrder.id,
              orderNumber: dbOrder.order_number,
              customer: customerData,
              supplier: supplierData,
              items: dbOrder.order_items?.map((item: any) => ({
                id: item.id,
                name: item.product_name || item.product?.name || 'Unknown Product',
                sku: item.product?.sku || 'N/A',
                quantity: item.quantity,
                price: item.price,
                total: item.total_price,
                image: item.product_image || item.product?.image_url
              })) || [],
              status: displayStatus,
              paymentStatus: 'paid', // Default to paid since we don't have payment_status field
              paymentMethod: 'Credit Card', // Default value
              subtotal: dbOrder.total_amount || 0,
              tax: 0, // Not stored in your schema
              shipping: 0, // Not stored in your schema
              total: dbOrder.total_amount || 0,
              currency: '₦', // Using your platform currency
              createdAt: dbOrder.created_at,
              updatedAt: dbOrder.updated_at,
              estimatedDelivery: dbOrder.estimated_delivery,
              trackingNumber: dbOrder.tracking_number,
              notes: '',
              isDisputed: false
            };
          }) || []
        );
        
        setOrders(transformedOrders);
        console.log('✅ Transformed orders:', transformedOrders);
        
      } catch (err) {
        console.error('❌ Error in fetchOrders:', err);
        setError('Failed to fetch orders data');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || order.paymentStatus === paymentStatusFilter;
    const matchesSupplier = supplierFilter === 'all' || order.supplier.name === supplierFilter;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesSupplier;
  });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(currentOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'processing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'refunded': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      // Refund statuses
      case 'refund_pending': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'refund_processed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'refund_rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      case 'refunded': return 'Refunded';
      // Refund statuses
      case 'refund_pending': return 'Refund Pending';
      case 'refund_processed': return 'Refund Processed';
      case 'refund_rejected': return 'Refund Rejected';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <RefreshCw className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'refunded': return <XCircle className="w-4 h-4" />;
      // Refund statuses
      case 'refund_pending': return <Clock className="w-4 h-4" />;
      case 'refund_processed': return <RefreshCw className="w-4 h-4" />;
      case 'refund_rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'refunded': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    // In a real app, this would update the backend
    console.log(`Changing order ${orderId} status to ${newStatus}`);
  };

  // Export functionality
  const exportToCSV = () => {
    const headers = [
      'Order ID',
      'Order Number',
      'Customer Name',
      'Customer Email',
      'Supplier',
      'Status',
      'Payment Status',
      'Total Amount',
      'Items Count',
      'Created Date',
      'Estimated Delivery'
    ];

    const csvData = filteredOrders.map(order => [
      order.id,
      order.orderNumber,
      order.customer.name,
      order.customer.email,
      order.supplier.name,
      order.status,
      order.paymentStatus,
      order.total,
      order.items.length,
      new Date(order.createdAt).toLocaleDateString(),
      order.estimatedDelivery || 'N/A'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  
  // Only count orders that are successfully completed (shipped/delivered) and not cancelled or refunded
  const successfulOrders = orders.filter(o => {
    const status = o.status.toLowerCase();
    return status === 'shipped' || 
           status === 'delivered' || 
           status === 'completed';
  });
  
  const totalRevenue = successfulOrders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = successfulOrders.length > 0 ? totalRevenue / successfulOrders.length : 0;

  // Debug logging
  console.log('📊 Admin Orders Statistics:', {
    totalOrders,
    successfulOrdersCount: successfulOrders.length,
    totalRevenue,
    averageOrderValue,
    allOrders: orders.map(o => ({ 
      id: o.id, 
      orderNumber: o.orderNumber,
      total: o.total, 
      status: o.status,
      statusLower: o.status.toLowerCase(),
      isSuccessful: o.status.toLowerCase() === 'shipped' || o.status.toLowerCase() === 'delivered' || o.status.toLowerCase() === 'completed'
    })),
    successfulOrders: successfulOrders.map(o => ({ 
      id: o.id, 
      orderNumber: o.orderNumber,
      total: o.total, 
      status: o.status 
    }))
  });

  const statuses = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'refund_pending', 'refund_processed', 'refund_rejected'];
  const paymentStatuses = ['all', 'pending', 'paid', 'failed', 'refunded'];
  const suppliers = ['all', ...Array.from(new Set(orders.map(o => o.supplier.name)))];

  // Show loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor and manage all marketplace orders
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow text-red-600' : 'text-gray-500 dark:text-gray-300'}`}
                title="List View"
              >
                <LayoutList className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow text-red-600' : 'text-gray-500 dark:text-gray-300'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button 
              onClick={exportToCSV}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Debug:</strong> Orders loaded: {orders.length} | Filtered: {filteredOrders.length} | Current page: {currentPage}
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pendingOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₦{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₦{averageOrderValue.toFixed(0)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders by number, customer, or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Status Filter */}
            <div className="lg:w-48">
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {paymentStatuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Payment Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier Filter */}
            <div className="lg:w-48">
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>
                    {supplier === 'all' ? 'All Suppliers' : supplier}
                  </option>
                ))}
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedOrders.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedOrders.length} selected
                </span>
                <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  Bulk Actions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Orders Table or Grid */}
        {viewMode === 'list' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === currentOrders.length && currentOrders.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium mb-2">No orders found</p>
                          <p className="text-sm">No orders match your current filters or there are no orders yet.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{order.orderNumber}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{order.items.length} items</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{order.customer.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{order.customer.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{order.supplier.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{getStatusLabel(order.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">₦{order.total}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewOrder(order.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                            title="View Order"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditOrder(order.id)}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                            title="Edit Order"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentOrders.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No orders found</p>
                  <p className="text-sm">No orders match your current filters or there are no orders yet.</p>
                </div>
              </div>
            ) : (
              currentOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-3"
                    />
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleViewOrder(order.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                      title="View Order"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditOrder(order.id)}
                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                      title="Edit Order"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteOrder(order.id)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                      title="Delete Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Order Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.items.length} items</p>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4 mr-2" />
                    {order.customer.name}
                  </div>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Package className="w-4 h-4 mr-2" />
                    {order.supplier.name}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{getStatusLabel(order.status)}</span>
                    </span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">₦{order.total}</span>
                  </div>

                  {/* Order Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{order.items.length}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>

                  {order.trackingNumber && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Tracking: {order.trackingNumber}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order View Modal */}
      {selectedOrder && showViewModal && (
        <Modal 
          isOpen={showViewModal} 
          onClose={() => {
            setShowViewModal(false);
            setSelectedOrder(null);
          }} 
          title={`Order #${selectedOrder.orderNumber || 'Unknown'}`}
        >
          <div className="space-y-6">
            {/* Order Overview */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Order Status</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                  selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  selectedOrder.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                  selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {(selectedOrder.status || 'unknown').toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Payment Status</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                  selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {(selectedOrder.paymentStatus || 'unknown').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                <div><strong>Name:</strong> {selectedOrder.customer?.name || 'Unknown Customer'}</div>
                <div><strong>Email:</strong> {selectedOrder.customer?.email || 'No email provided'}</div>
                <div><strong>Phone:</strong> {selectedOrder.customer?.phone || 'No phone provided'}</div>
                <div><strong>Address:</strong> {selectedOrder.customer?.address || 'No address provided'}</div>
              </div>
            </div>

            {/* Supplier Information */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Supplier Information
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                <div><strong>Name:</strong> {selectedOrder.supplier?.name || 'Unknown Supplier'}</div>
                <div><strong>Email:</strong> {selectedOrder.supplier?.email || 'No email provided'}</div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Order Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt={item.name || 'Product'} className="w-12 h-12 object-cover rounded" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{item.name || 'Unknown Product'}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">SKU: {item.sku || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">₦{(item.total || 0).toLocaleString()}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Qty: {item.quantity || 0}</div>
                    </div>
                  </div>
                )) || <div className="text-gray-500 dark:text-gray-400">No items found</div>}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Order Summary
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₦{(selectedOrder.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₦{(selectedOrder.tax || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>₦{(selectedOrder.shipping || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₦{(selectedOrder.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Order Date
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'Unknown'}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Method
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedOrder.paymentMethod || 'Unknown'}
                </div>
              </div>
            </div>

            {selectedOrder.trackingNumber && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Tracking Information
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div><strong>Tracking Number:</strong> {selectedOrder.trackingNumber}</div>
                  {selectedOrder.estimatedDelivery && (
                    <div><strong>Estimated Delivery:</strong> {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            )}

            {selectedOrder.notes && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notes</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  {selectedOrder.notes}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Order Edit Modal */}
      {selectedOrder && showEditModal && (
        <Modal 
          isOpen={showEditModal} 
          onClose={() => {
            setShowEditModal(false);
            setSelectedOrder(null);
          }} 
          title={`Edit Order #${selectedOrder.orderNumber}`}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order Status
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                defaultValue={selectedOrder.status}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Status
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                defaultValue={selectedOrder.paymentStatus}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tracking Number
              </label>
              <input 
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                defaultValue={selectedOrder.trackingNumber || ''}
                placeholder="Enter tracking number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estimated Delivery Date
              </label>
              <input 
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                defaultValue={selectedOrder.estimatedDelivery ? selectedOrder.estimatedDelivery.split('T')[0] : ''}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Admin Notes
              </label>
              <textarea 
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                defaultValue={selectedOrder.notes || ''}
                placeholder="Add admin notes..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedOrder) {
                    handleSaveOrder(selectedOrder);
                  }
                }}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
} 