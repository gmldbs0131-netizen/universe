"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

// MBL 실험 주제별 설정 정보
const SUBJECT_CONFIGS: Record<string, {
  name: string;
  unit: string;
  sensorName: string;
  minY: number;
  maxY: number;
  maxX: number;
  description: string;
  guideText: string;
  generateValue: (time: number) => number;
  icon: string;
  colorClass: string;
  lineColor: string;
}> = {
  "온도 변화": {
    name: "온도 변화 실험 (Heating Curve)",
    unit: "°C",
    sensorName: "온도 센서",
    minY: 0,
    maxY: 120,
    maxX: 30,
    description: "가열 장치 위에 물을 올리고 시간에 따른 온도 변화를 측정합니다.",
    guideText: "초기 온도는 실온(약 20°C)에서 시작하며, 가열 장치 열에 의해 온도가 서서히 올라가다 물의 끓는점인 100°C 부근에 도달하면 상태 변화(기화)로 인해 온도가 일정하게 유지되는 구간을 확인할 수 있습니다.",
    generateValue: (t) => {
      const base = 20 + 80 * (1 - Math.exp(-0.09 * t));
      const noise = (Math.random() - 0.5) * 1.5;
      const finalVal = base + noise;
      return Math.min(100.2, Math.max(18, Number(finalVal.toFixed(1))));
    },
    icon: "🔥",
    colorClass: "from-red-500/20 to-orange-500/10 border-red-500/30 text-red-400 hover:border-red-500/60",
    lineColor: "#f97316"
  },
  "pH 변화": {
    name: "중화 적정 실험 (Acid-Base Titration)",
    unit: "pH",
    sensorName: "pH 센서",
    minY: 0,
    maxY: 14,
    maxX: 30,
    description: "산성 용액에 염기성 용액을 떨어뜨리며 수소이온 농도 지수를 분석합니다.",
    guideText: "강산성 수용액(pH 약 1.5)에 강염기 용액을 뷰렛으로 조금씩 투입합니다. 중화점인 pH 7 부근을 통과할 때, 아주 소량의 염기 추가로도 pH 수치가 급격히 치솟는 전형적인 S자형(시그모이드) 중화 적정 곡선이 나타납니다.",
    generateValue: (t) => {
      const mid = 15; // 15초 부근에서 급변
      const base = 1.5 + 10.5 / (1 + Math.exp(-0.6 * (t - mid)));
      const noise = (Math.random() - 0.5) * 0.15;
      const finalVal = base + noise;
      return Math.min(14, Math.max(0, Number(finalVal.toFixed(2))));
    },
    icon: "🧪",
    colorClass: "from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400 hover:border-indigo-500/60",
    lineColor: "#818cf8"
  },
  "조도 변화": {
    name: "거리별 조도 측정 실험 (Inverse-Square Law)",
    unit: "Lux",
    sensorName: "조도 센서",
    minY: 0,
    maxY: 1000,
    maxX: 30,
    description: "광원으로부터의 거리가 증가할 때 도달하는 빛의 세기를 분석합니다.",
    guideText: "광원 바로 앞의 아주 밝은 상태(약 900 Lux)에서 출발하여 센서를 뒤로 천천히 이동시킵니다. 거리가 늘어남에 따라 조도가 단순 반비례가 아닌, 거리의 제곱에 반비례(1/d²)하여 급격하게 떨어지는 빛의 성질을 발견할 수 있습니다.",
    generateValue: (t) => {
      const dist = (t * 0.45) + 1.8; // 시간 흐름에 따라 거리(d) 증가
      const base = 3200 / (dist * dist);
      const noise = (Math.random() - 0.5) * 12;
      const finalVal = base + noise;
      return Math.min(950, Math.max(0, Number(finalVal.toFixed(0))));
    },
    icon: "💡",
    colorClass: "from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400 hover:border-amber-500/60",
    lineColor: "#fbbf24"
  },
  "운동 분석": {
    name: "수레의 빗면 운동 분석 (Acceleration)",
    unit: "m/s",
    sensorName: "운동(속도) 센서",
    minY: 0,
    maxY: 20,
    maxX: 30,
    description: "경사면을 미끄러지는 수레의 시간에 따른 속도 변화를 관찰합니다.",
    guideText: "마찰이 적은 빗면에 수레를 놓아두면, 중력의 영향으로 인해 일정한 가속도를 받으며 속도가 매 초마다 일정하게 증가합니다. 속도-시간(v-t) 그래프가 선형의 일차함수 형태로 나타나며, 기울기가 수레의 가속도를 나타냅니다.",
    generateValue: (t) => {
      const base = 0.55 * t; // 일정한 가속도 운동 (v = a*t)
      const noise = (Math.random() - 0.5) * 0.25;
      const finalVal = base + noise;
      return Math.min(20, Math.max(0, Number(finalVal.toFixed(2))));
    },
    icon: "🛹",
    colorClass: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60",
    lineColor: "#10b981"
  }
};

interface DataPoint {
  time: number;
  value: number;
}

interface SavedExperiment {
  id: string;
  user_name: string;
  subject: string;
  experiment_data: DataPoint[];
  notes: string;
  created_at: string;
}

export default function MblPage() {
  // 기본 상태 관리
  const [userName, setUserName] = useState<string>("");
  const [isNameConfirmed, setIsNameConfirmed] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("온도 변화");
  
  // 실험 실행 관련 상태
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentVal, setCurrentVal] = useState<number>(0);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [notes, setNotes] = useState<string>("");
  
  // 데이터 저장 및 불러오기 상태
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  const [myRecords, setMyRecords] = useState<SavedExperiment[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState<boolean>(false);
  
  // 시뮬레이션용 인터벌 ref
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 주제 설정 가져오기
  const config = SUBJECT_CONFIGS[selectedSubject];

  // 이름 확정 시 과거 내역 자동 조회
  useEffect(() => {
    if (isNameConfirmed && userName.trim()) {
      fetchMyRecords();
    }
  }, [isNameConfirmed]);

  // 실시간 타이머 및 데이터 측정 로직
  useEffect(() => {
    if (isRunning) {
      // 0.5초마다 데이터 생성
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const nextTime = Number((prev + 0.5).toFixed(1));
          
          // 제한시간 (maxX) 도달 시 자동 종료
          if (nextTime > config.maxX) {
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return prev;
          }

          const newValue = config.generateValue(nextTime);
          setCurrentVal(newValue);
          setDataPoints((prevData) => [...prevData, { time: nextTime, value: newValue }]);
          
          return nextTime;
        });
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, selectedSubject]);

  // 실험 시작
  const startExperiment = () => {
    if (!isNameConfirmed) {
      alert("먼저 상단에 사용자 이름(또는 학번)을 입력하고 확정해주세요.");
      return;
    }
    // 데이터 초기화 후 시작
    setElapsedTime(0);
    const startVal = config.generateValue(0);
    setCurrentVal(startVal);
    setDataPoints([{ time: 0, value: startVal }]);
    setIsRunning(true);
    setSaveStatus({ type: null, message: "" });
  };

  // 실험 정지
  const stopExperiment = () => {
    setIsRunning(false);
  };

  // 실험 초기화
  const resetExperiment = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setCurrentVal(0);
    setDataPoints([]);
    setNotes("");
    setSaveStatus({ type: null, message: "" });
  };

  // Supabase에 실험 결과 저장
  const saveToSupabase = async () => {
    if (!userName.trim()) {
      alert("이름이 설정되지 않았습니다.");
      return;
    }
    if (dataPoints.length === 0) {
      alert("저장할 실험 데이터가 없습니다. 실험을 진행해주세요.");
      return;
    }

    setIsSaving(true);
    setSaveStatus({ type: null, message: "" });

    try {
      const { data, error } = await supabase
        .from("mbl_experiments")
        .insert([
          {
            user_name: userName.trim(),
            subject: selectedSubject,
            experiment_data: dataPoints,
            notes: notes
          }
        ])
        .select();

      if (error) throw error;

      setSaveStatus({
        type: "success",
        message: `데이터베이스에 '${selectedSubject}' 실험 결과가 성공적으로 저장되었습니다!`
      });
      
      // 내 기록 다시 불러오기
      fetchMyRecords();
    } catch (err: any) {
      console.error(err);
      setSaveStatus({
        type: "error",
        message: `저장 실패: ${err.message || "알 수 없는 에러가 발생했습니다. .env 환경변수를 설정했는지 확인하세요."}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 내 실험 기록들 가져오기
  const fetchMyRecords = async () => {
    if (!userName.trim()) return;
    setIsLoadingRecords(true);
    try {
      const { data, error } = await supabase
        .from("mbl_experiments")
        .select("*")
        .eq("user_name", userName.trim())
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMyRecords(data || []);
    } catch (err) {
      console.error("데이터 로드 실패:", err);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // 과거 실험 불러와 화면에 띄우기
  const loadSavedRecord = (record: SavedExperiment) => {
    setSelectedSubject(record.subject);
    setDataPoints(record.experiment_data);
    if (record.experiment_data.length > 0) {
      const lastPoint = record.experiment_data[record.experiment_data.length - 1];
      setElapsedTime(lastPoint.time);
      setCurrentVal(lastPoint.value);
    }
    setNotes(record.notes || "");
    setSaveStatus({
      type: "success",
      message: `과거에 수행한 '${record.subject}' 실험 기록을 불러왔습니다.`
    });
  };

  // SVG 차트 좌표 변환 계산 함수
  const getSvgPath = () => {
    if (dataPoints.length === 0) return "";
    const width = 600;
    const height = 300;
    const padding = 50;

    const chartW = width - 2 * padding;
    const chartH = height - 2 * padding;

    const xMax = config.maxX;
    const yMin = config.minY;
    const yMax = config.maxY;

    return dataPoints
      .map((p, idx) => {
        const x = padding + (p.time / xMax) * chartW;
        const y = height - padding - ((p.value - yMin) / (yMax - yMin)) * chartH;
        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  // SVG 차트 하단 그라데이션 영역 계산 함수
  const getSvgAreaPath = () => {
    if (dataPoints.length === 0) return "";
    const width = 600;
    const height = 300;
    const padding = 50;

    const chartW = width - 2 * padding;
    const chartH = height - 2 * padding;

    const xMax = config.maxX;
    const yMin = config.minY;
    const yMax = config.maxY;

    const linePath = getSvgPath();
    if (!linePath) return "";

    const firstX = padding + (dataPoints[0].time / xMax) * chartW;
    const lastX = padding + (dataPoints[dataPoints.length - 1].time / xMax) * chartW;
    const baseY = height - padding;

    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] text-slate-100 p-4 sm:p-8">
      {/* 장식용 우측 상단 블러 */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-amber-500/5 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 헤더 섹션 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-0.5 text-xs font-semibold text-indigo-400 ring-1 ring-indigo-500/30 bg-indigo-500/5 mb-3">
              MBL (Microcomputer-Based Laboratory)
            </div>
            <h1 className="font-outfit text-3xl font-extrabold text-white tracking-tight">
              실시간 가상 MBL 실험실
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              센서를 활용하여 다양한 데이터를 실시간 수집하고, 결과를 개인의 Supabase 데이터베이스에 저장합니다.
            </p>
          </div>

          {/* 사용자 정보 설정 영역 */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-lg backdrop-blur-sm min-w-[320px]">
            {isNameConfirmed ? (
              <div className="flex items-center justify-between w-full">
                <div>
                  <span className="text-xs text-slate-500 block">실험 참가자</span>
                  <span className="text-sm font-bold text-amber-400">{userName} 학생</span>
                </div>
                <button
                  onClick={() => {
                    setIsNameConfirmed(false);
                    resetExperiment();
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold border border-rose-500/20 hover:border-rose-500/40 px-3 py-1.5 rounded-lg transition-all"
                >
                  참가자 수정
                </button>
              </div>
            ) : (
              <div className="w-full space-y-2">
                <label className="text-xs font-semibold text-slate-400 block">이름 혹은 학번을 입력하세요</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="예: 3학년1반05번 홍길동"
                    className="flex-grow bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    onClick={() => {
                      if (userName.trim()) {
                        setIsNameConfirmed(true);
                      } else {
                        alert("이름을 입력해주세요.");
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-1.5 rounded-lg transition-colors shadow-md shadow-indigo-600/20"
                  >
                    확정
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 메인 2열 그리드 구조 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 좌측 패널 (실험 선택 및 제어 - 4열) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 주제 선택 카드 리스트 */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 space-y-4 backdrop-blur-md">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                1. 실험 주제 선택
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(SUBJECT_CONFIGS).map(([key, item]) => {
                  const isSelected = selectedSubject === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        if (isRunning) {
                          if (confirm("실험이 진행 중입니다. 주제를 변경하고 실험을 초기화할까요?")) {
                            setSelectedSubject(key);
                            resetExperiment();
                          }
                        } else {
                          setSelectedSubject(key);
                          resetExperiment();
                        }
                      }}
                      className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-300 ${
                        isSelected
                          ? `bg-gradient-to-r ${item.colorClass} border-current ring-1 ring-current/20 shadow-md`
                          : "bg-slate-900/40 border-slate-900 text-slate-400 hover:bg-slate-900/80 hover:text-white"
                      }`}
                    >
                      <span className="text-2xl mt-0.5">{item.icon}</span>
                      <div>
                        <div className="font-bold text-sm text-slate-100">{key} 실험</div>
                        <div className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 실험 제어 센터 */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 space-y-5 backdrop-blur-md">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                2. 실시간 센서 제어
              </h2>

              {/* 현재 상태 정보 패널 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/60 border border-slate-900 rounded-xl p-3.5 text-center">
                  <span className="text-xs text-slate-500 block mb-1">측정 시간</span>
                  <span className="text-2xl font-mono font-bold text-white">
                    {elapsedTime.toFixed(1)} <span className="text-xs text-slate-500">초</span>
                  </span>
                </div>
                <div className="bg-slate-900/60 border border-slate-900 rounded-xl p-3.5 text-center">
                  <span className="text-xs text-slate-500 block mb-1">{config.sensorName}</span>
                  <span className="text-2xl font-mono font-bold text-amber-400">
                    {dataPoints.length > 0 ? currentVal : "-"} <span className="text-xs text-slate-500">{config.unit}</span>
                  </span>
                </div>
              </div>

              {/* 버튼 그룹 */}
              <div className="flex flex-col gap-2.5">
                {!isRunning ? (
                  <button
                    onClick={startExperiment}
                    disabled={!isNameConfirmed}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 ${
                      isNameConfirmed
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                        : "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    센서 수집 시작
                  </button>
                ) : (
                  <button
                    onClick={stopExperiment}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/10"
                  >
                    <span className="w-2 h-2 bg-white rounded-none" />
                    수집 일시정지
                  </button>
                )}

                <button
                  onClick={resetExperiment}
                  className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 py-2.5 px-4 rounded-xl font-medium text-xs transition-colors"
                >
                  데이터 초기화
                </button>
              </div>
              
              <div className="text-[11px] text-slate-500 text-center leading-normal">
                시간 제한은 최대 {config.maxX}초이며, 도달 시 센서 작동이 자동 중단됩니다.
              </div>
            </div>

          </div>

          {/* 우측 패널 (실시간 그래프 및 저장 영역 - 8열) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 실시간 그래프 화면 */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-md font-bold text-white">MBL 센서 그래프 뷰어</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{config.name}</p>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Y축 단위: {config.unit}
                </div>
              </div>

              {/* 커스텀 SVG 실시간 라인 차트 */}
              <div className="relative bg-slate-950 border border-slate-900/80 rounded-xl overflow-hidden aspect-[2/1] min-h-[280px]">
                {dataPoints.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                    <span className="text-4xl mb-3">📈</span>
                    <span className="text-sm font-semibold text-slate-400">데이터가 존재하지 않습니다.</span>
                    <span className="text-xs text-slate-600 mt-1 max-w-sm">
                      좌측의 &apos;센서 수집 시작&apos; 버튼을 누르면 실시간으로 모의 센서 데이터가 계측되어 차트에 그려집니다.
                    </span>
                  </div>
                ) : (
                  <svg className="w-full h-full" viewBox="0 0 600 300">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={config.lineColor} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={config.lineColor} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* 그리드 가로선 및 축 라벨 */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const yVal = config.maxY - ratio * (config.maxY - config.minY);
                      const yPos = 50 + ratio * 200; // yMin=50, yMax=250 범위 내
                      return (
                        <g key={i}>
                          <line
                            x1="50"
                            y1={yPos}
                            x2="550"
                            y2={yPos}
                            stroke="#1e293b"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          <text
                            x="40"
                            y={yPos + 4}
                            fill="#64748b"
                            fontSize="10"
                            textAnchor="end"
                            fontFamily="monospace"
                          >
                            {yVal.toFixed(0)}
                          </text>
                        </g>
                      );
                    })}

                    {/* 그리드 세로선 및 X축 라벨 (시간) */}
                    {[0, 5, 10, 15, 20, 25, 30].map((tVal) => {
                      const xPos = 50 + (tVal / config.maxX) * 500;
                      return (
                        <g key={tVal}>
                          <line
                            x1={xPos}
                            y1="50"
                            x2={xPos}
                            y2="250"
                            stroke="#1e293b"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={xPos}
                            y="268"
                            fill="#64748b"
                            fontSize="10"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            {tVal}초
                          </text>
                        </g>
                      );
                    })}

                    {/* X축, Y축 메인 라인 */}
                    <line x1="50" y1="250" x2="550" y2="250" stroke="#475569" strokeWidth="1.5" />
                    <line x1="50" y1="50" x2="50" y2="250" stroke="#475569" strokeWidth="1.5" />

                    {/* 그라데이션 면적 영역 */}
                    <path d={getSvgAreaPath()} fill="url(#chartGradient)" />

                    {/* 데이터 꺾은선 패스 */}
                    <path
                      d={getSvgPath()}
                      fill="none"
                      stroke={config.lineColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* 최근 5개 포인트 점 표시 */}
                    {dataPoints.slice(-5).map((p, i) => {
                      const x = 50 + (p.time / config.maxX) * 500;
                      const y = 250 - ((p.value - config.minY) / (config.maxY - config.minY)) * 200;
                      const isLast = i === Math.min(dataPoints.length, 5) - 1;
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r={isLast ? 4 : 2}
                          fill={isLast ? "#ffffff" : config.lineColor}
                          stroke={config.lineColor}
                          strokeWidth={isLast ? 2.5 : 1}
                        />
                      );
                    })}
                  </svg>
                )}
              </div>
              
              {/* 실험 가이드 텍스트 */}
              <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-900 text-xs sm:text-sm leading-relaxed text-slate-400">
                <strong className="text-slate-200 block mb-1">💡 가상 실험 설명</strong>
                {config.guideText}
              </div>
            </div>

            {/* 보고서 관찰 메모 및 DB 저장 */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md space-y-4">
              <div>
                <h2 className="text-md font-bold text-white">3. 실험 관찰 보고서 작성</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  실험 데이터를 확인하고, 관찰 결과 및 해석한 결론을 메모해 데이터베이스에 저장하세요.
                </p>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="여기에 실험 결과에 대한 관찰 기록이나 물리적/화학적 법칙(예: 물의 끓는점 100도 상태 유지, 또는 중화 반응 급변 지점 특징 등)을 적어주세요."
                rows={4}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs text-slate-400">
                  {isNameConfirmed ? (
                    <span className="flex items-center gap-1.5 text-amber-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      &apos;{userName}&apos; 계정으로 DB에 전송됩니다.
                    </span>
                  ) : (
                    <span className="text-rose-400">⚠️ 이름을 입력하고 확정해야 데이터 전송이 가능합니다.</span>
                  )}
                </div>

                <button
                  onClick={saveToSupabase}
                  disabled={isSaving || !isNameConfirmed || dataPoints.length === 0}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${
                    isSaving || !isNameConfirmed || dataPoints.length === 0
                      ? "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:shadow-orange-500/10"
                  }`}
                >
                  {isSaving ? "데이터베이스 저장 중..." : "실험 결과 DB에 저장하기"}
                </button>
              </div>

              {/* 저장 처리 결과 메시지 */}
              {saveStatus.message && (
                <div
                  className={`mt-2 p-3.5 rounded-xl text-xs font-semibold ${
                    saveStatus.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                  }`}
                >
                  {saveStatus.message}
                </div>
              )}
            </div>

            {/* 과거 실험 목록 로드 (개인별) */}
            {isNameConfirmed && (
              <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-md font-bold text-white">📂 내 과거 MBL 실험 기록</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      데이터베이스에서 &apos;{userName}&apos; 학생이 수집해 저장했던 이전 내역들입니다.
                    </p>
                  </div>
                  <button
                    onClick={fetchMyRecords}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800/80 transition-all"
                  >
                    🔄 새로고침
                  </button>
                </div>

                {isLoadingRecords ? (
                  <div className="text-center py-6 text-xs text-slate-500 font-medium">
                    데이터베이스에서 기록을 검색하고 있습니다...
                  </div>
                ) : myRecords.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-900 rounded-xl text-xs text-slate-500">
                    저장된 과거 실험 내역이 없습니다. 새로운 실험 데이터를 쌓아보세요!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[250px] overflow-y-auto pr-1">
                    {myRecords.map((record) => {
                      const itemConfig = SUBJECT_CONFIGS[record.subject] || SUBJECT_CONFIGS["온도 변화"];
                      const formattedDate = new Date(record.created_at).toLocaleString("ko-KR", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      });

                      return (
                        <div
                          key={record.id}
                          onClick={() => loadSavedRecord(record)}
                          className="bg-slate-900/40 border border-slate-900 hover:border-indigo-500/50 hover:bg-slate-900/80 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between group"
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-xl">{itemConfig.icon}</span>
                            <span className="text-[10px] text-slate-500 font-medium">{formattedDate}</span>
                          </div>
                          <div className="mt-3">
                            <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                              {record.subject} 실험
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                              {record.notes || "(보고서 요약 없음)"}
                            </p>
                          </div>
                          <div className="mt-2.5 pt-2 border-t border-slate-900/60 text-[10px] text-indigo-400 font-bold flex justify-between items-center">
                            <span>측정 데이터 {record.experiment_data.length}개</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">불러오기 →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
