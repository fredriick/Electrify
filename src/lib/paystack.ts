import { supabase } from './auth'

export interface PaystackPaymentData {
  email: string
  amount: number
  currency: string
  reference: string
  callback_url: string
  metadata: {
    customer_id: string
    order_id: string
    customer_name: string
    items: Array<{
      name: string
      quantity: number
      price: number
    }>
  }
}

export interface PaystackResponse {
  status: boolean
  message: string
  data?: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export class PaystackService {
  private static readonly PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_...'

  /**
   * Initialize Paystack payment using secure API route
   */
  static async initializePayment(paymentData: PaystackPaymentData): Promise<PaystackResponse> {
    try {
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to initialize payment')
      }

      return result
    } catch (error) {
      console.error('❌ Paystack: Payment initialization error:', error)
      throw error
    }
  }

  /**
   * Verify payment transaction using secure API route
   */
  static async verifyPayment(reference: string): Promise<any> {
    try {
      const response = await fetch(`/api/paystack/verify/${reference}`, {
        method: 'GET',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to verify payment')
      }

      return result
    } catch (error) {
      console.error('❌ Paystack: Payment verification error:', error)
      throw error
    }
  }

  /**
   * Create order in database
   */
  static async createOrder(orderData: {
    customer_id: string
    supplier_id: string
    items: Array<{
      product_id: string
      quantity: number
      unit_price: number
      total_price: number
    }>
    subtotal: number
    shipping_amount: number
    tax_amount: number
    total_amount: number
    payment_reference: string
    shipping_address: any
    billing_address: any
  }) {
    try {
      console.log('📦 Creating order in database:', orderData.payment_reference)
      
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: orderData.customer_id,
          supplier_id: orderData.supplier_id,
          subtotal: orderData.subtotal,
          shipping_amount: orderData.shipping_amount,
          tax_amount: orderData.tax_amount,
          total_amount: orderData.total_amount,
          payment_reference: orderData.payment_reference,
          shipping_address: orderData.shipping_address,
          billing_address: orderData.billing_address,
          status: 'PENDING',
          payment_status: 'PENDING',
          payment_gateway: 'PAYSTACK',
        })
        .select()
        .single()

      if (orderError) {
        throw new Error(`Order creation failed: ${orderError.message}`)
      }

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        throw new Error(`Order items creation failed: ${itemsError.message}`)
      }

      console.log('✅ Order created successfully:', order.id)
      return order
    } catch (error) {
      console.error('❌ Order creation error:', error)
      throw error
    }
  }

  /**
   * Update order payment status
   */
  static async updateOrderPaymentStatus(orderId: string, paymentStatus: string, transactionId?: string) {
    try {
      console.log('💳 Updating order payment status:', orderId, paymentStatus)
      
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: paymentStatus,
          payment_reference: transactionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (error) {
        throw new Error(`Payment status update failed: ${error.message}`)
      }

      console.log('✅ Payment status updated successfully')
    } catch (error) {
      console.error('❌ Payment status update error:', error)
      throw error
    }
  }
}
