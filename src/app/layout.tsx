import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "DocFill AI - AI 문서 자동 작성 서비스",
  description: "HWP, HWPX, Word 문서를 AI가 자동으로 채워드립니다. 교회 주보, 가정통신문, 각종 양식을 몇 초 만에 완성하세요.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
