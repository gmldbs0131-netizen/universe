import Link from "next/link";

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden min-h-[calc(100vh-8rem)] flex flex-col justify-between">
      
      {/* 상단 장식용 그라데이션 블러 (김밥의 따뜻한 재료 톤인 amber/orange/rose 활용) */}
      <div 
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" 
        aria-hidden="true"
      >
        <div 
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-amber-500 via-orange-600 to-rose-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]" 
        />
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-6 py-20 sm:py-28 text-center flex flex-col items-center">
        
        {/* 상단 뱃지 */}
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-amber-400 ring-1 ring-amber-500/30 bg-amber-500/5 mb-8 animate-pulse">
          <span>🍙 지식을 알차게 말아내는 교육 플랫폼</span>
        </div>

        {/* 메인 환영 문구 (H1) */}
        <h1 className="font-outfit text-4xl font-extrabold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-400">
          나만의 교육용 웹앱 만들기
        </h1>

        {/* 간단한 설명 */}
        <p className="mt-6 max-w-2xl text-md sm:text-lg leading-8 text-slate-400">
          마치 온갖 맛있는 재료들을 한데 모아 꾹꾹 눌러 담은 맛있는 김밥처럼, 
          여러분만의 풍부한 학습 콘텐츠를 하나의 완성도 높은 웹 서비스로 말아내어 배포해 보세요!
        </p>

        {/* 기능 추가를 위한 가짜(Placeholder) 버튼 1개 및 링크 */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            type="button" 
            className="w-full sm:w-auto rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-600/30 hover:bg-amber-500 hover:shadow-amber-500/40 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            김밥에 재료 추가하기 (Placeholder)
          </button>
          
          <Link 
            href="https://nextjs.org/docs" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm font-semibold leading-6 text-slate-300 hover:text-white transition-colors"
          >
            Next.js 가이드 문서 읽기 <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* 
          // [확장성 고려 주석]
          // 여기에 메인 Hero 섹션 하단에 추가할 퀵링크 영역이나 뱃지 컴포넌트를 배치하세요.
        */}
      </section>

      {/* 기능 확장 플레이스홀더 카드 영역 (반응형 2열 구조) */}
      <section className="mx-auto max-w-7xl px-6 pb-20 sm:pb-28 w-full">
        <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-8 md:p-12 backdrop-blur-sm">
          
          <div className="mb-8 text-center sm:text-left">
            <h2 className="font-outfit text-xl sm:text-2xl font-bold text-white">학습 재료 준비하기 (개발 모듈)</h2>
            <p className="mt-2 text-sm text-slate-400">
              다양한 교육용 기능을 컴포넌트로 분리하여 아래 영역에 자유롭게 삽입해보세요.
            </p>
          </div>

          {/* 반응형 12열 그리드 레이아웃 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* 예시 컴포넌트 공간 1 */}
            <div className="rounded-xl border border-slate-900 bg-slate-950/60 p-6 flex flex-col justify-between hover:border-slate-800 transition-colors">
              <div>
                <span className="text-2xl">💛 단무지 (핵심 개념)</span>
                <h3 className="mt-4 font-semibold text-white text-base">개념 학습 모듈</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  교육 웹앱의 가장 기본이 되는 핵심 퀴즈 및 텍스트 자료를 보여주는 컴포넌트를 배치하기에 이상적입니다.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-900/60 text-xs text-amber-400 font-medium">
                {/* 
                  // [확장성 고려 주석]
                  // 여기에 <ConceptModule /> 컴포넌트를 추가하세요.
                */}
                //여기에 Concept 컴포넌트를 임포트하여 배치하세요
              </div>
            </div>

            {/* 예시 컴포넌트 공간 2 */}
            <div className="rounded-xl border border-slate-900 bg-slate-950/60 p-6 flex flex-col justify-between hover:border-slate-800 transition-colors">
              <div>
                <span className="text-2xl">💚 시금치 (실습 환경)</span>
                <h3 className="mt-4 font-semibold text-white text-base">실습형 에디터 모듈</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  학생들이 직접 타이핑하며 코드나 연산 문제를 실습할 수 있는 대화형 컴포넌트를 만들 수 있습니다.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-900/60 text-xs text-amber-400 font-medium">
                {/* 
                  // [확장성 고려 주석]
                  // 여기에 <PracticeEditor /> 컴포넌트를 추가하세요.
                */}
                //여기에 Practice 컴포넌트를 임포트하여 배치하세요
              </div>
            </div>

          </div>

          {/* 추가 확장 컴포넌트 영역 플레이스홀더 */}
          <div className="mt-6 border border-dashed border-slate-900 rounded-xl p-8 text-center text-slate-600 text-xs sm:text-sm">
            {/* 
              // [확장성 고려 주석]
              // 여기에 자유롭게 전체 너비의 새로운 섹션을 추가하세요. (예: 진도현황 대시보드, 학생 관리 목록 등)
            */}
            [ 컴포넌트 추가 및 커스터마이징 영역 ]
          </div>

        </div>
      </section>

      {/* 하단 장식용 그라데이션 블러 (배경 장식) */}
      <div 
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" 
        aria-hidden="true"
      >
        <div 
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 bg-gradient-to-tr from-amber-500 to-rose-500 opacity-10 sm:left-[calc(50%+36rem)] sm:w-[72rem]" 
        />
      </div>

    </div>
  );
}
