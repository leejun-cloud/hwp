'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_WIDGET_ID || '';

const PAYMENT_METHODS = [
  { id: 'CARD', name: '카드 결제', icon: '💳', desc: '신용/체크카드' },
  { id: 'TOSSPAY', name: '토스페이', icon: '🔵', desc: '토스 간편결제' },
  { id: 'KAKAOPAY', name: '카카오페이', icon: '💛', desc: '카카오 간편결제' },
  { id: 'NAVERPAY', name: '네이버페이', icon: '💚', desc: '네이버 간편결제' },
] as const;

const PRICING = {
  basic: {
    monthly: { amount: 6800, productId: 'BASIC_MONTHLY', label: 'DocFill AI Basic 월간' },
    yearly: { amount: 68000, productId: 'BASIC_YEARLY', label: 'DocFill AI Basic 연간' },
  },
  premium: {
    monthly: { amount: 18000, productId: 'PREMIUM_MONTHLY', label: 'DocFill AI Premium 월간' },
    yearly: { amount: 180000, productId: 'PREMIUM_YEARLY', label: 'DocFill AI Premium 연간' },
  },
};

function CheckoutPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [payment, setPayment] = useState<unknown>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('CARD');

  const tierParam = (searchParams.get('tier') || 'basic').toLowerCase() as 'basic' | 'premium';
  const cycleParam = (searchParams.get('cycle') || 'monthly') as 'monthly' | 'yearly';
  const [selectedTier, setSelectedTier] = useState<'basic' | 'premium'>(tierParam);
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'yearly'>(cycleParam);

  const selectedPlan = PRICING[selectedTier][selectedCycle];

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/login?redirect=/checkout');
      else setUser(u);
    });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    if (((window as unknown) as { TossPayments?: unknown }).TossPayments) {
      initToss();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v2/standard';
    script.async = true;
    script.onload = () => initToss();
    script.onerror = () => setLoading(false);
    document.head.appendChild(script);

    function initToss() {
      if (!CLIENT_KEY) { setLoading(false); return; }
      const tossPayments = ((window as unknown) as { TossPayments: (key: string) => unknown }).TossPayments(CLIENT_KEY);
      const instance = (tossPayments as { payment: (opts: unknown) => unknown }).payment({ customerKey: user!.uid });
      setPayment(instance);
      setLoading(false);
    }
  }, [user]);

  const handlePay = async () => {
    if (!payment || !user) return;
    setProcessing(true);

    try {
      // 주문 생성
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedPlan.productId,
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName,
        }),
      });
      const order = await res.json();
      if (!res.ok) { alert(order.error || '주문 생성 실패'); setProcessing(false); return; }

      // Toss 결제창 호출
      await (payment as {
        requestBillingAuth: (opts: unknown) => Promise<void>;
      }).requestBillingAuth({
        method: selectedMethod,
        successUrl: `${window.location.origin}/checkout/success?orderId=${order.orderId}&amount=${order.amount}`,
        failUrl: `${window.location.origin}/checkout/fail`,
        customerEmail: user.email || undefined,
        customerName: user.displayName || user.email || '사용자',
      });
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code !== 'USER_CANCEL') {
        alert('결제 중 오류가 발생했습니다.');
      }
      setProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <Link href="/pricing" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> 요금제로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">결제하기</h1>
        </div>

        {/* 플랜 선택 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4">플랜 선택</h2>
          <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
            {(['basic', 'premium'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  selectedTier === tier ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                }`}
              >
                {tier === 'basic' ? 'Basic' : 'Premium'}
              </button>
            ))}
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['monthly', 'yearly'] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setSelectedCycle(cycle)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  selectedCycle === cycle ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                }`}
              >
                {cycle === 'monthly' ? '월간' : '연간 (2개월 무료)'}
              </button>
            ))}
          </div>
        </div>

        {/* 주문 요약 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4">주문 요약</h2>
          <div className="flex justify-between items-center mb-3">
            <p className="text-gray-600 text-sm">{selectedPlan.label}</p>
            <p className="font-bold text-gray-900">₩{selectedPlan.amount.toLocaleString()}</p>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <p className="font-semibold text-gray-900">결제 금액</p>
            <p className="font-bold text-xl text-blue-600">₩{selectedPlan.amount.toLocaleString()}</p>
          </div>
        </div>

        {/* 결제 수단 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> 결제 수단
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer text-center transition-all ${
                  selectedMethod === m.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <span className="text-2xl">{m.icon}</span>
                <p className="font-medium text-sm mt-1">{m.name}</p>
                <p className="text-xs text-gray-400">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mb-5">
          카드 등록 후 매월 자동 결제됩니다. 언제든지 취소 가능합니다.
        </p>

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <button
            onClick={handlePay}
            disabled={processing || !payment}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> 처리 중...</>
            ) : (
              <><CreditCard className="w-5 h-5" /> ₩{selectedPlan.amount.toLocaleString()} 결제하기</>
            )}
          </button>
        )}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <CheckoutPageInner />
    </Suspense>
  );
}
