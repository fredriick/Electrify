import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(request: NextRequest) {
  try {
    // Get the secret key from server environment variables
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
    
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Paystack secret key not configured' },
        { status: 500 }
      )
    }

    // Parse the request body
    const paymentData: PaystackPaymentData = await request.json()

    // Validate required fields
    if (!paymentData.email || !paymentData.amount || !paymentData.reference) {
      return NextResponse.json(
        { error: 'Missing required payment data' },
        { status: 400 }
      )
    }

    // Make the request to Paystack API
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    })

    const result: PaystackResponse = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: result.message || 'Failed to initialize payment' },
        { status: response.status }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Paystack initialization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

