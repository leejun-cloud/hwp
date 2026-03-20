'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, Loader2 } from 'lucide-react';

function FailPageInner() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || '결제가 취소되었거나 오류가 발생했습니다.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-md w-full text-center shadow-md">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
        <p className="text-gray-500 mb-8">{message}</p>
        <Link
          href="/pricing"
          className="block w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          요금제 페이지로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <FailPageInner />
    </Suspense>
  );
}
