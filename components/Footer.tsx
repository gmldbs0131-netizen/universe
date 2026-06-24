export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950/40 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          
          {/* 서비스 정보 / 로고 */}
          <div className="flex items-center gap-2">
            <span className="font-outfit text-sm font-bold text-slate-400">EduWeb</span>
            <span className="text-xs text-slate-600">|</span>
            <span className="text-xs text-slate-500">교육용 웹애플리케이션 스타터 킷</span>
          </div>

          {/* 카피라이트 공간 */}
          <p className="text-center text-xs text-slate-500">
            &copy; {currentYear} EduWeb. All rights reserved.
          </p>

          {/* 가짜 링크 공간 */}
          <div className="flex gap-4 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">이용약관</a>
            <a href="#" className="hover:text-slate-300 transition-colors">개인정보처리방침</a>
          </div>

        </div>
        
        {/* 
          // [확장성 고려 주석]
          // 여기에 SNS 아이콘 링크 목록이나 패밀리 사이트 드롭다운 컴포넌트를 추가하세요.
        */}
      </div>
    </footer>
  );
}
