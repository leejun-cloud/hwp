import { NextRequest, NextResponse } from 'next/server'
import { adminDb, isAdminInitialized } from '@/lib/firebase-admin'
import { TOSS_PAYMENTS_CONFIG, PRODUCTS, ProductId } from '@/lib/constants/payment'

export async function POST(req: NextRequest) {
  if (!isAdminInitialized) {
    return NextResponse.json(
      { error: '서버 설정 오류입니다. 관리자에게 문의하세요.' },
      { status: 503 }
    )
  }

  try {
    const { paymentKey, orderId, amount } = await req.json()

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 })
    }

    const paymentRef = adminDb.collection('payments').doc(orderId)
    const paymentDoc = await paymentRef.get()

    if (!paymentDoc.exists) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
    }

    const paymentData = paymentDoc.data()

    // Idempotency
    if (paymentData?.status === 'completed') {
      const product = PRODUCTS[paymentData.productId as ProductId]
      const expiresAt = paymentData.updatedAt + (product?.periodDays || 30) * 86400000
      return NextResponse.json({ success: true, message: '이미 처리된 결제입니다.', expiresAt, paymentMethod: paymentData.paymentMethod })
    }

    if (paymentData?.amount !== amount) {
      return NextResponse.json({ error: '결제 금액이 일치하지 않습니다' }, { status: 400 })
    }

    // Toss Payments 승인
    const encryptedSecretKey = Buffer.from(`${TOSS_PAYMENTS_CONFIG.secretKey}:`).toString('base64')
    const tossResponse = await fetch(`${TOSS_PAYMENTS_CONFIG.apiBaseUrl}/payments/confirm`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })

    const tossData = await tossResponse.json()

    if (!tossResponse.ok) {
      await paymentRef.update({ status: 'failed', tossResponse: tossData, updatedAt: Date.now() })
      return NextResponse.json({ error: tossData.message || '결제 승인에 실패했습니다' }, { status: 400 })
    }

    const product = PRODUCTS[paymentData!.productId as ProductId]
    if (!product) throw new Error('Product not found')

    const proExpiresAt = Date.now() + product.periodDays * 86400000

    const batch = adminDb.batch()

    batch.update(paymentRef, {
      paymentKey,
      status: 'completed',
      paymentMethod: tossData.method,
      approvedAt: Date.now(),
      tossResponse: tossData,
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

    return NextResponse.json({
      success: true,
      message: `${product.tier === 'PREMIUM' ? 'Premium' : 'Basic'} 구독이 활성화되었습니다!`,
      expiresAt: proExpiresAt,
      paymentMethod: tossData.method,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '결제 승인 중 오류가 발생했습니다'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
