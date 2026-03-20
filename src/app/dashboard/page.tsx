'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import {
  Upload, FileText, Sparkles, Clock,
  ChevronRight, Plus, Crown
} from "lucide-react";

const RECENT_DOCS = [
  { name: "20260329가정예배지.hwpx", date: "2026.03.29", type: "HWPX" },
  { name: "20260322가정예배지.hwpx", date: "2026.03.22", type: "HWPX" },
  { name: "20260315가정예배지.hwpx", date: "2026.03.15", type: "HWPX" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/login');
      else { setUser(u); setLoading(false); }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* 환영 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-2xl font-bold text-gray-900">
            안녕하세요, {user?.displayName || user?.email?.split('@')[0]}님 👋
          </h1>
          <p className="text-gray-500 mt-1">오늘도 문서 작업을 AI와 함께 빠르게 완성하세요.</p>
        </motion.div>

        {/* 주요 액션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[
            {
              icon: <Upload className="w-6 h-6 text-blue-600" />,
              title: "문서 업로드",
              desc: "HWP · HWPX · DOCX 파일을 올려 AI로 자동 채우기",
              bg: "bg-blue-50",
              href: "#upload",
            },
            {
              icon: <Sparkles className="w-6 h-6 text-purple-600" />,
              title: "가정예배 주보 생성",
              desc: "성경 구절 5개 입력 → AI가 완성된 주보 생성",
              bg: "bg-purple-50",
              href: "#generate",
            },
            {
              icon: <FileText className="w-6 h-6 text-green-600" />,
              title: "템플릿 관리",
              desc: "자주 사용하는 템플릿을 저장하고 재사용",
              bg: "bg-green-50",
              href: "#templates",
            },
          ].map((item, i) => (
            <motion.a
              key={item.title}
              href={item.href}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-4`}>
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </motion.a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 문서 업로드 영역 */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              id="upload"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors p-10 text-center cursor-pointer group"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                <Plus className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">파일을 드래그하거나 클릭해서 업로드</h3>
              <p className="text-gray-400 text-sm">.hwp · .hwpx · .docx 지원 · 최대 10MB</p>
              <button className="mt-5 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                파일 선택
              </button>
            </motion.div>

            {/* 최근 문서 */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" /> 최근 생성 문서
                </h2>
                <button className="text-blue-600 text-sm hover:underline">전체 보기</button>
              </div>
              <div className="space-y-3">
                {RECENT_DOCS.map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                        <p className="text-xs text-gray-400">{doc.date} · {doc.type}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-blue-600 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-5">
            {/* 플랜 정보 */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 text-white"
            >
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-yellow-300" />
                <span className="font-semibold">Free 플랜</span>
              </div>
              <p className="text-blue-100 text-sm mb-4">이번 달 사용: <strong className="text-white">2 / 5회</strong></p>
              <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                <div className="bg-white rounded-full h-2" style={{ width: '40%' }} />
              </div>
              <Link
                href="/pricing"
                className="block w-full text-center bg-white text-blue-600 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors"
              >
                업그레이드 →
              </Link>
            </motion.div>

            {/* 빠른 가이드 */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4">빠른 시작 가이드</h3>
              <ol className="space-y-3 text-sm text-gray-600">
                {[
                  "HWP/DOCX 템플릿 업로드",
                  "AI가 빈 필드 자동 감지",
                  "키워드 입력 → AI 초안 생성",
                  "수정 후 파일 다운로드",
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
