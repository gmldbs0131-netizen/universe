import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "김밥에듀 (KimbapEdu) - 나만의 교육용 웹앱",
  description: "김밥처럼 지식을 알차게 말아내는 Next.js & Tailwind CSS 기반의 교육용 웹앱 보일러플레이트입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <head>
        {/* 프리미엄 폰트 불러오기 (Inter, Outfit) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30">
        
        {/* 공통 상단 헤더 컴포넌트 */}
        <Header />
        
        {/* 메인 콘텐츠 영역 */}
        <main className="flex-grow">
          {children}
        </main>
        
        {/* 공통 하단 푸터 컴포넌트 */}
        <Footer />
        
      </body>
    </html>
  );
}
