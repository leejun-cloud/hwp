import { NextRequest, NextResponse } from 'next/server'
import { adminDb, isAdminInitialized } from '@/lib/firebase-admin'
import { TOSS_PAYMENTS_CONFIG, PRODUCTS, ProductId } from '@/lib/constants/payment'

export async function POST(req: NextRequest) {
  if (!isAdminInitialized) {
    return NextResponse.json({ error: '서버 설정 오류' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const { paymentKey, orderId, status } = body

    if (status === 'DONE' && paymentKey) {
      // Toss API 재검증 (위조 방지)
      const encryptedSecretKey = Buffer.from(`${TOSS_PAYMENTS_CONFIG.secretKey}:`).toString('base64')
      const verifyResponse = await fetch(`${TOSS_PAYMENTS_CONFIG.apiBaseUrl}/payments/${paymentKey}`, {
        headers: { Authorization: `Basic ${encryptedSecretKey}` },
      })
      const tossPayment = await verifyResponse.json()
      if (tossPayment.status !== 'DONE') {
        return NextResponse.json({ error: '결제 검증 실패' }, { status: 400 })
      }
    }

    if (!orderId) return NextResponse.json({ ok: true })

    const paymentRef = adminDb.collection('payments').doc(orderId)
    const paymentDoc = await paymentRef.get()

    if (!paymentDoc.exists) return NextResponse.json({ ok: true })

    const paymentData = paymentDoc.data()

    // Idempotency
    if (paymentData?.status === 'completed') return NextResponse.json({ ok: true })

    if (status === 'DONE') {
      const product = PRODUCTS[paymentData!.productId as ProductId]
      if (!product) return NextResponse.json({ ok: true })

      const proExpiresAt = Date.now() + product.periodDays * 86400000
      const batch = adminDb.batch()

      batch.update(paymentRef, {
        paymentKey,
        status: 'completed',
        approvedAt: Date.now(),
        updatedAt: Date.now(),
      })

      const userRef = adminDb.collection('users').doc(paymentData!.userId)
      batch.update(userRef, {
        tier: product.tier,
        subscriptionStatus: 'active',
        proExpiresAt,
        lastPaymentId: orderId,
        pendingDiscount: null,
        updatedAt: Date.now(),
      })

      const subRef = adminDb.collection('subscriptions').doc()
      batch.set(subRef, {
        userId: paymentData!.userId,
        productId: paymentData!.productId,
        status: 'active',
        startDate: Date.now(),
        endDate: proExpiresAt,
        paymentId: orderId,
        autoRenew: false,
        createdAt: Date.now(),
      })

      await batch.commit()
    } else if (status === 'CANCELED' || status === 'ABORTED') {
      await paymentRef.update({ status: 'cancelled', updatedAt: Date.now() })
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Webhook 처리 오류'
    console.error('[Webhook Error]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
