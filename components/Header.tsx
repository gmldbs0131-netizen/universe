import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* 서비스 로고 영역 (김밥 SVG 로고 + 텍스트) */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            {/* 귀여운 김밥 단면 SVG 로고 */}
            <svg 
              className="w-8 h-8 transition-transform duration-300 group-hover:rotate-12" 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* 김 (바깥 테두리) */}
              <circle cx="50" cy="50" r="45" fill="#020617" stroke="#334155" strokeWidth="6"/>
              {/* 밥 */}
              <circle cx="50" cy="50" r="38" fill="#f8fafc"/>
              {/* 속재료 - 단무지 (노란색) */}
              <path d="M42 35C48 35 52 39 52 45C52 46.5 51.5 48 50.5 49.5L42 45V35Z" fill="#eab308"/>
              {/* 속재료 - 시금치 (초록색) */}
              <circle cx="62" cy="42" r="7" fill="#10b981"/>
              {/* 속재료 - 당근 (주황색) */}
              <circle cx="58" cy="59" r="6" fill="#f97316"/>
              {/* 속재료 - 햄 (핑크색) */}
              <circle cx="40" cy="57" r="8" fill="#f43f5e"/>
              {/* 깨 고명 */}
              <circle cx="48" cy="48" r="1.5" fill="#0f172a"/>
              <circle cx="53" cy="51" r="1.5" fill="#0f172a"/>
            </svg>
            <span className="font-outfit text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500">
              김밥에듀
            </span>
          </Link>
          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20">
            Kimbap
          </span>
        </div>

        {/* 네비게이션 바 공간 (태블릿/PC에서만 노출되는 반응형 구조) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            소개
          </Link>
          <Link href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            가이드
          </Link>
          <Link href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            커뮤니티
          </Link>
          {/* 
            // [확장성 고려 주석]
            // 여기에 새로운 네비게이션 링크나 카테고리 컴포넌트를 추가하세요.
            // 예: <Link href="/courses">강의실</Link>
          */}
        </nav>

        {/* 우측 액션 영역 (로그인, 시작하기 버튼 등) */}
        <div className="flex items-center gap-3">
          <button className="rounded-full bg-slate-900 px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200">
            로그인
          </button>
          <button className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-xs sm:text-sm font-semibold text-white hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-200">
            시작하기
          </button>
          {/* 
            // [확장성 고려 주석]
            // 여기에 다크모드 토글 버튼 또는 다국어 선택 컴포넌트를 추가하세요.
          */}
        </div>

      </div>
    </header>
  );
}
