'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, Zap } from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    monthly: '₩0',
    yearly: '₩0',
    desc: '개인 체험용',
    features: [
      '월 5회 문서 생성',
      'HWP · HWPX · DOCX 지원',
      'AI 기본 내용 생성',
      '파일 다운로드',
    ],
    cta: '무료 시작',
    tier: null,
    highlight: false,
  },
  {
    id: 'basic',
    name: 'Basic',
    monthly: '₩6,800',
    yearly: '₩68,000',
    desc: '개인 · 소규모 단체',
    features: [
      '월 50회 문서 생성',
      'HWP · HWPX · DOCX 지원',
      'AI 고급 내용 생성',
      '템플릿 저장 (3개)',
      '생성 이력 30일 보관',
      '이메일 지원',
    ],
    cta: 'Basic 시작',
    tier: 'basic',
    highlight: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    monthly: '₩18,000',
    yearly: '₩180,000',
    desc: '교회 · 학교 · 단체 추천',
    features: [
      '무제한 문서 생성',
      'HWP · HWPX · DOCX 지원',
      'AI 고급 내용 생성',
      '템플릿 저장 (무제한)',
      '생성 이력 1년 보관',
      '팀 멤버 3인',
      '우선 지원',
      'API 접근',
    ],
    cta: 'Premium 시작',
    tier: 'premium',
    highlight: true,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleCTA = (plan: typeof PLANS[0]) => {
    if (!plan.tier) {
      router.push('/dashboard');
    } else {
      router.push(`/checkout?tier=${plan.tier}&cycle=${cycle}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-28 pb-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">요금제</h1>
          <p className="text-gray-500 text-lg">필요에 맞는 플랜을 선택하세요. 언제든 변경·취소 가능합니다.</p>
        </motion.div>

        {/* 월간/연간 토글 */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setCycle('monthly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${cycle === 'monthly' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              월간
            </button>
            <button
              onClick={() => setCycle('yearly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${cycle === 'yearly' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              연간 <span className="text-green-600 font-semibold ml-1">2개월 무료</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 border-2 transition-shadow ${
                plan.highlight
                  ? 'border-indigo-500 shadow-xl shadow-indigo-100'
                  : 'border-gray-200 hover:shadow-md'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 추천
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h2>
                <p className="text-gray-500 text-sm mb-4">{plan.desc}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {cycle === 'monthly' ? plan.monthly : plan.yearly}
                  </span>
                  <span className="text-gray-400 mb-1">{cycle === 'monthly' ? '/월' : '/년'}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCTA(plan)}
                className={`w-full py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                  plan.id === 'free'
                    ? 'border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
                    : plan.highlight
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.id !== 'free' && <Zap className="w-4 h-4" />}
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-16 text-center text-gray-500 text-sm"
        >
          <p>모든 요금제는 토스페이먼츠를 통해 안전하게 결제됩니다.</p>
          <p className="mt-1">구독은 언제든지 취소할 수 있으며, 취소 시 해당 기간 말까지 이용 가능합니다.</p>
        </motion.div>
      </div>
    </main>
  );
}
