import { NextRequest, NextResponse } from 'next/server'
import { adminDb, isAdminInitialized } from '@/lib/firebase-admin'
import { PRODUCTS, ProductId } from '@/lib/constants/payment'
import { generateOrderId, PaymentRecord } from '@/lib/types/payment'

export async function POST(req: NextRequest) {
  if (!isAdminInitialized) {
    return NextResponse.json(
      { error: '서버 설정 오류입니다. 관리자에게 문의하세요.' },
      { status: 503 }
    )
  }

  try {
    const { productId, userId, userEmail, userName } = await req.json()

    if (!productId || !userId || !userEmail) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 })
    }

    const product = PRODUCTS[productId as ProductId]
    if (!product) {
      return NextResponse.json({ error: '유효하지 않은 상품입니다' }, { status: 400 })
    }

    // 할인 쿠폰 확인
    const userRef = adminDb.collection('users').doc(userId)
    const userDoc = await userRef.get()
    let finalAmount = product.price
    let discountApplied = false

    if (userDoc.exists) {
      const userData = userDoc.data()
      const pending = userData?.pendingDiscount
      const isValid = pending?.discount && (!pending.expiresAt || pending.expiresAt > Date.now())

      if (isValid) {
        finalAmount = Math.round(product.price * (1 - pending.discount))
        discountApplied = true
      } else if (pending?.discount && pending.expiresAt && pending.expiresAt <= Date.now()) {
        await userRef.update({ pendingDiscount: null })
      }
    }

    const orderId = generateOrderId()

    const paymentRecord: Omit<PaymentRecord, 'id'> = {
      orderId,
      paymentKey: '',
      userId,
      userEmail,
      productId,
      amount: finalAmount,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    await adminDb.collection('payments').doc(orderId).set(paymentRecord)

    return NextResponse.json({
      success: true,
      orderId,
      orderName: product.name,
      amount: finalAmount,
      originalAmount: product.price,
      discountApplied,
      customerEmail: userEmail,
      customerName: userName || userEmail.split('@')[0],
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '결제 시작 중 오류가 발생했습니다'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
