import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { reference: string } }
) {
  try {
    // Get the secret key from server environment variables
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
    
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Paystack secret key not configured' },
        { status: 500 }
      )
    }

    const { reference } = params

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    // Make the request to Paystack API
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: result.message || 'Failed to verify payment' },
        { status: response.status }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Paystack verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}





