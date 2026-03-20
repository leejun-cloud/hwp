'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { FileText, LogOut, User as UserIcon } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <FileText className="w-6 h-6" />
          DocFill AI
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">기능</Link>
          <Link href="/#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">사용법</Link>
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">요금제</Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                {user.displayName?.split(' ')[0] || '대시보드'}
              </Link>
              <button
                onClick={() => signOut(auth)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                로그인
              </Link>
              <Link
                href="/pricing"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                무료 시작
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
