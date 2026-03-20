export interface PaymentRecord {
  id?: string
  orderId: string
  paymentKey: string
  userId: string
  userEmail: string
  productId: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  paymentMethod?: string
  approvedAt?: number
  createdAt: number
  updatedAt: number
  tossResponse?: unknown
}

export interface SubscriptionRecord {
  id?: string
  userId: string
  productId: string
  status: 'active' | 'cancelled' | 'expired'
  startDate: number
  endDate: number
  paymentId: string
  autoRenew: boolean
  createdAt: number
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `ORDER_${timestamp}_${random}`.toUpperCase()
}
