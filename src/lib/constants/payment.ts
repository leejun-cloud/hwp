export const TOSS_PAYMENTS_CONFIG = {
  clientKey: process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY || '',
  secretKey: process.env.TOSS_PAYMENTS_SECRET_KEY || '',
  apiBaseUrl: 'https://api.tosspayments.com/v1',
  successUrl: '/checkout/success',
  failUrl: '/checkout/fail',
}

export interface Product {
  id: string
  name: string
  price: number
  period: 'monthly' | 'yearly'
  periodDays: number
  tier: 'BASIC' | 'PREMIUM'
  monthlyLimit: number | null // null = unlimited
}

export const PRODUCTS: Record<string, Product> = {
  BASIC_MONTHLY: {
    id: 'basic_monthly',
    name: 'DocFill AI Basic 월간',
    price: 6800,
    period: 'monthly',
    periodDays: 30,
    tier: 'BASIC',
    monthlyLimit: 50,
  },
  BASIC_YEARLY: {
    id: 'basic_yearly',
    name: 'DocFill AI Basic 연간',
    price: 68000,
    period: 'yearly',
    periodDays: 365,
    tier: 'BASIC',
    monthlyLimit: 50,
  },
  PREMIUM_MONTHLY: {
    id: 'premium_monthly',
    name: 'DocFill AI Premium 월간',
    price: 18000,
    period: 'monthly',
    periodDays: 30,
    tier: 'PREMIUM',
    monthlyLimit: null,
  },
  PREMIUM_YEARLY: {
    id: 'premium_yearly',
    name: 'DocFill AI Premium 연간',
    price: 180000,
    period: 'yearly',
    periodDays: 365,
    tier: 'PREMIUM',
    monthlyLimit: null,
  },
}

export type ProductId = keyof typeof PRODUCTS
