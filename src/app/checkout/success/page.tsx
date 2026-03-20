'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function SuccessPageInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setErrorMsg('결제 정보가 올바르지 않습니다.');
      return;
    }

    fetch('/api/payment/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStatus('success');
        else { setStatus('error'); setErrorMsg(data.error || '결제 승인에 실패했습니다.'); }
      })
      .catch(() => { setStatus('error'); setErrorMsg('결제 승인 중 오류가 발생했습니다.'); });
  }, [paymentKey, orderId, amount]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="text-gray-600">결제를 처리하고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-md w-full text-center shadow-md">
        {status === 'success' ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 완료!</h1>
            <p className="text-gray-500 mb-8">구독이 활성화되었습니다. 이제 모든 기능을 사용하실 수 있습니다.</p>
            <Link
              href="/dashboard"
              className="block w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              대시보드로 이동
            </Link>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
            <p className="text-gray-500 mb-8">{errorMsg}</p>
            <Link
              href="/pricing"
              className="block w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              다시 시도하기
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <SuccessPageInner />
    </Suspense>
  );
}
