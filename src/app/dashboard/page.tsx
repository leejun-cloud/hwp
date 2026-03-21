'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import {
  Upload, FileText, Sparkles, Clock,
  ChevronRight, Plus, Crown, X, CheckCircle, BookOpen, Layout
} from "lucide-react";

const RECENT_DOCS = [
  { name: "20260329가정예배지.hwpx", date: "2026.03.29", type: "HWPX" },
  { name: "20260322가정예배지.hwpx", date: "2026.03.22", type: "HWPX" },
  { name: "20260315가정예배지.hwpx", date: "2026.03.15", type: "HWPX" },
];

const TEMPLATES = [
  { name: "가정예배 주보 기본형", type: "HWPX", used: 12 },
  { name: "주간 보고서", type: "DOCX", used: 5 },
  { name: "행사 안내문", type: "HWPX", used: 3 },
];

type ActiveSection = 'upload' | 'generate' | 'templates' | null;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);

  // 파일 업로드 상태
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // 가정예배 주보 상태
  const [verses, setVerses] = useState(['', '', '', '', '']);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState('');

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/login');
      else { setUser(u); setLoading(false); }
    });
  }, [router]);

  const handleFileSelect = (file: File) => {
    const allowed = ['.hwp', '.hwpx', '.docx'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      alert('HWP, HWPX, DOCX 파일만 업로드 가능합니다.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }
    setUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleGenerate = async () => {
    if (verses.some(v => !v.trim())) {
      alert('성경 구절 5개를 모두 입력해주세요.');
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-bulletin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verses }),
      });
      if (!res.ok) throw new Error('생성 실패');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const disposition = res.headers.get('Content-Disposition') || '';
      const nameMatch = disposition.match(/filename="(.+)"/);
      setDownloadUrl(url);
      setDownloadName(nameMatch?.[1] || '가정예배주보.docx');
      setGenerated(true);
    } catch {
      alert('주보 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setGenerating(false);
    }
  };

  const scrollTo = (id: string) => {
    setActiveSection(id as ActiveSection);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

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
              id: 'upload',
              icon: <Upload className="w-6 h-6 text-blue-600" />,
              title: "문서 업로드",
              desc: "HWP · HWPX · DOCX 파일을 올려 AI로 자동 채우기",
              bg: "bg-blue-50",
            },
            {
              id: 'generate',
              icon: <Sparkles className="w-6 h-6 text-purple-600" />,
              title: "가정예배 주보 생성",
              desc: "성경 구절 5개 입력 → AI가 완성된 주보 생성",
              bg: "bg-purple-50",
            },
            {
              id: 'templates',
              icon: <FileText className="w-6 h-6 text-green-600" />,
              title: "템플릿 관리",
              desc: "자주 사용하는 템플릿을 저장하고 재사용",
              bg: "bg-green-50",
            },
          ].map((item, i) => (
            <motion.button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-2xl p-6 border text-left transition-all cursor-pointer group ${
                activeSection === item.id
                  ? 'border-blue-400 shadow-md'
                  : 'border-gray-100 hover:shadow-md'
              }`}
            >
              <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-4`}>
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* 파일 업로드 */}
            <motion.div
              id="upload"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-5">
                <Upload className="w-4 h-4 text-blue-500" /> 문서 업로드
              </h2>

              <input
                ref={fileInputRef}
                type="file"
                accept=".hwp,.hwpx,.docx"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />

              {uploadedFile ? (
                <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-800">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-400">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      AI 분석 시작
                    </button>
                    <button onClick={() => setUploadedFile(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                    dragOver ? 'border-blue-400 bg-blue-50' : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-gray-700 mb-2">파일을 드래그하거나 클릭해서 업로드</h3>
                  <p className="text-gray-400 text-sm">.hwp · .hwpx · .docx 지원 · 최대 10MB</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="mt-5 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    파일 선택
                  </button>
                </div>
              )}
            </motion.div>

            {/* 가정예배 주보 생성 */}
            <motion.div
              id="generate"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-5">
                <Sparkles className="w-4 h-4 text-purple-500" /> 가정예배 주보 생성
              </h2>

              {generated ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="font-semibold text-gray-800 mb-1">주보가 생성됐습니다!</p>
                  <p className="text-gray-400 text-sm mb-5">AI가 완성된 가정예배 주보를 만들었습니다.</p>
                  <div className="flex gap-3 justify-center">
                    {downloadUrl && (
                      <a
                        href={downloadUrl}
                        download={downloadName}
                        className="bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" /> 다운로드 (.docx)
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setGenerated(false);
                        setVerses(['', '', '', '', '']);
                        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
                        setDownloadUrl(null);
                      }}
                      className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      다시 만들기
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4">이번 주 가정예배에 사용할 성경 구절 5개를 입력하세요.</p>
                  <div className="space-y-3 mb-5">
                    {verses.map((v, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <input
                          type="text"
                          placeholder={`예) 요한복음 3:${i + 16}`}
                          value={v}
                          onChange={(e) => {
                            const next = [...verses];
                            next[i] = e.target.value;
                            setVerses(next);
                          }}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> AI 생성 중...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> 주보 생성하기</>
                    )}
                  </button>
                </>
              )}
            </motion.div>

            {/* 템플릿 관리 */}
            <motion.div
              id="templates"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-green-500" /> 템플릿 관리
                </h2>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> 템플릿 추가
                </button>
              </div>
              <div className="space-y-3">
                {TEMPLATES.map((t) => (
                  <div key={t.name} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.type} · {t.used}회 사용</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                        사용
                      </button>
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 최근 문서 */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
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
