'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Upload, Cpu, Eye, Download,
  FileText, FileType, Sparkles, CheckCircle,
  ChevronRight, Zap, Shield, Globe
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const FEATURES = [
  {
    icon: <FileText className="w-6 h-6 text-blue-500" />,
    title: "HWP · HWPX 완벽 지원",
    desc: "한글 구버전(.hwp)부터 최신 버전(.hwpx)까지 원본 서식을 그대로 유지하며 편집합니다.",
  },
  {
    icon: <FileType className="w-6 h-6 text-indigo-500" />,
    title: "MS Word 지원",
    desc: "Word(.docx) 문서도 동일하게 분석하고, 수정된 Word 파일로 다시 내보냅니다.",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-purple-500" />,
    title: "AI 자동 내용 생성",
    desc: "구절·키워드만 입력하면 Claude AI가 제목, Q&A, 찬송가까지 완성된 내용을 작성합니다.",
  },
  {
    icon: <Eye className="w-6 h-6 text-green-500" />,
    title: "실시간 미리보기 · 수정",
    desc: "AI가 작성한 초안을 바로 확인하고, 원하는 부분만 수정한 뒤 최종 확정합니다.",
  },
  {
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    title: "10초 안에 완성",
    desc: "수십 분 걸리던 주보·양식 작성을 AI가 단 몇 초 만에 처리합니다.",
  },
  {
    icon: <Shield className="w-6 h-6 text-red-500" />,
    title: "안전한 파일 처리",
    desc: "업로드된 파일은 작업 후 즉시 삭제됩니다. 개인정보는 저장하지 않습니다.",
  },
];

const STEPS = [
  { step: "01", icon: <Upload className="w-8 h-8" />, title: "문서 업로드", desc: "HWP, HWPX, DOCX 파일을 드래그하거나 선택해 업로드합니다." },
  { step: "02", icon: <Cpu className="w-8 h-8" />, title: "AI 분석", desc: "AI가 문서 구조를 파악하고 채워야 할 필드를 자동으로 감지합니다." },
  { step: "03", icon: <Sparkles className="w-8 h-8" />, title: "내용 입력 & 생성", desc: "키워드나 구절을 입력하면 AI가 완성된 내용을 초안으로 작성합니다." },
  { step: "04", icon: <Eye className="w-8 h-8" />, title: "미리보기 & 수정", desc: "생성된 내용을 확인하고 원하는 부분을 수정한 뒤 확정합니다." },
  { step: "05", icon: <Download className="w-8 h-8" />, title: "다운로드", desc: "원본 형식 그대로(HWP/DOCX) 파일을 내려받습니다." },
];

const USE_CASES = [
  { emoji: "⛪", title: "교회 주보 · 가정예배지", desc: "성경 구절 5개만 입력하면 월~금 큐티 내용을 완성합니다." },
  { emoji: "🏫", title: "학교 가정통신문", desc: "반복되는 양식에 날짜·내용만 바꿔 매주 빠르게 발송합니다." },
  { emoji: "🏢", title: "기관·단체 정기 문서", desc: "보고서, 회의록, 공문 등 정형화된 양식을 자동화합니다." },
  { emoji: "📋", title: "각종 신청서·양식", desc: "빈칸 채우기 형식의 문서를 AI가 맥락에 맞게 완성합니다." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Claude AI 기반 문서 자동화
            </span>
          </motion.div>

          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl font-bold text-gray-900 leading-tight mb-6"
          >
            HWP · Word 문서를<br />
            <span className="text-blue-600">AI가 10초 만에</span> 완성합니다
          </motion.h1>

          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto"
          >
            파일 업로드 → AI 분석 → 내용 생성 → 수정 → 다운로드.<br />
            반복 문서 작업에서 해방되세요.
          </motion.p>

          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Link
              href="/login"
              className="flex items-center gap-2 bg-blue-600 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg shadow-lg shadow-blue-200"
            >
              무료로 시작하기 <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/#how-it-works"
              className="flex items-center gap-2 text-gray-600 px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-lg border border-gray-200"
            >
              사용법 보기
            </Link>
          </motion.div>

          {/* 지원 형식 뱃지 */}
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={4}
            className="flex items-center justify-center gap-3 mt-10 flex-wrap"
          >
            {[".hwp", ".hwpx", ".docx"].map((ext) => (
              <span key={ext} className="bg-white border border-gray-200 text-gray-600 text-sm font-mono px-3 py-1 rounded-lg shadow-sm">
                {ext}
              </span>
            ))}
            <span className="text-gray-400 text-sm">지원</span>
          </motion.div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            이런 분들께 꼭 필요합니다
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {USE_CASES.map((uc, i) => (
              <motion.div
                key={uc.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="text-4xl mb-3">{uc.emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{uc.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{uc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">강력한 기능</h2>
            <p className="text-gray-500 text-lg">문서 자동화에 필요한 모든 것</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">이렇게 사용하세요</h2>
            <p className="text-gray-500 text-lg">5단계로 문서 완성</p>
          </motion.div>

          <div className="relative">
            {/* 연결선 */}
            <div className="absolute left-8 top-8 bottom-8 w-px bg-blue-100 hidden md:block" />

            <div className="space-y-8">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                  className="flex gap-6 items-start"
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-blue-600 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-blue-200">
                    {s.icon}
                  </div>
                  <div className="pt-2">
                    <div className="text-xs text-blue-500 font-bold mb-1">STEP {s.step}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{s.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 text-center text-white shadow-2xl"
          >
            <Globe className="w-12 h-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
            <p className="text-blue-100 text-lg mb-8">
              무료 플랜으로 먼저 체험하고, 필요에 따라 업그레이드하세요.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/login"
                className="bg-white text-blue-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-lg"
              >
                무료로 시작하기
              </Link>
              <Link
                href="/pricing"
                className="border border-white/40 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors text-lg"
              >
                요금제 보기
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-blue-100 text-sm flex-wrap">
              {["신용카드 불필요", "월 5회 무료", "언제든 취소 가능"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2 font-semibold text-gray-600">
            <FileText className="w-4 h-4 text-blue-600" /> DocFill AI
          </div>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-gray-600 transition-colors">요금제</Link>
            <Link href="/login" className="hover:text-gray-600 transition-colors">로그인</Link>
          </div>
          <p>© 2026 DocFill AI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
