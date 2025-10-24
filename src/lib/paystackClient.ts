export interface PaystackConfig {
  key: string
  email: string
  amount: number
  currency: string
  reference: string
  callback: (response: any) => void | Promise<void>
  onClose: () => void
}

export class PaystackClient {
  private static readonly PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_...'

  /**
   * Initialize Paystack payment using inline JS
   */
    static initializePayment(config: PaystackConfig) {
    try {
      
      // Check if Paystack script is loaded
      if (typeof window !== 'undefined' && (window as any).PaystackPop) {
        const handler = (window as any).PaystackPop.setup({
          key: config.key || this.PAYSTACK_PUBLIC_KEY,
          email: config.email,
          amount: Math.round(config.amount * 100), // Convert to kobo and ensure it's an integer
          currency: config.currency,
          reference: config.reference,
          callback: config.callback,
          onClose: config.onClose,
        })
        
        handler.openIframe()
        return handler
      } else {
        // Load Paystack script if not already loaded
        this.loadPaystackScript().then(() => {
          this.initializePayment(config)
        })
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Load Paystack script dynamically
   */
  private static loadPaystackScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve()
        return
      }

      // Check if script is already loaded
      if ((window as any).PaystackPop) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://js.paystack.co/v1/inline.js'
      script.async = true
      
      script.onload = () => {
        resolve()
      }
      
      script.onerror = () => {
        reject(new Error('Failed to load Paystack script'))
      }

      document.head.appendChild(script)
    })
  }

  /**
   * Generate unique reference for payment
   */
  static generateReference(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `PAY_${timestamp}_${random}`.toUpperCase()
  }

  /**
   * Format amount for Paystack (convert to kobo)
   */
  static formatAmount(amount: number): number {
    return Math.round(amount * 100) // Ensure integer result
  }

  /**
   * Validate payment configuration
   */
  static validateConfig(config: PaystackConfig): boolean {
    if (!config.key && !this.PAYSTACK_PUBLIC_KEY) {
      throw new Error('Paystack public key is required')
    }
    if (!config.email) {
      throw new Error('Customer email is required')
    }
    if (!config.amount || config.amount <= 0) {
      throw new Error('Valid amount is required')
    }
    if (!config.reference) {
      throw new Error('Payment reference is required')
    }
    if (!config.callback) {
      throw new Error('Payment callback is required')
    }
    return true
  }
}
