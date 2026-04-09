"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { SlidersHorizontal } from "lucide-react";
import { ANNUAL_TARGET, MONTHLY_REVENUE } from "@/data/finance-seed";

const STORAGE_KEY = "3w-finance-scenarios";

// 모든 금액 단위: 만원
interface ScenarioInputs {
  // 위팀 (플랫폼)
  witimMau: number;           // MAU 목표 (명)
  witimArpu: number;          // ARPU (만원/월/유저)
  witimServiceMonths: number; // 유료 서비스 운영 개월 수 (올해 남은 기간)

  // 외주
  existingOutsourceRevenue: number; // 기존 계약 매출 합계 (만원)
  newDealsPerMonth: number;         // 신규 수주 건수/월
  newDealAvgRevenue: number;        // 신규 건당 평균 매출 (만원)
  newDealMonths: number;            // 신규 수주 가능 개월 수

  // 의료 마케팅 AI
  medicalAiClients: number;        // 고객 수 (개사)
  medicalAiMonthlyFee: number;     // 월 구독료 (만원)
  medicalAiServiceMonths: number;  // 서비스 운영 개월 수

  // 정부사업
  governmentGrant: number; // K-주전부리 등 정부지원금 (만원)
}

const DEFAULT_INPUTS: ScenarioInputs = {
  // 위팀: 5월 오픈 → 올해 8개월, 초기 무료 PLG
  witimMau: 100,
  witimArpu: 0,
  witimServiceMonths: 8,

  // 외주: 기존 4건 (Coffee 5000 + 리파인 3500 + 성형숨고 6000 + LMS 4000 = 18500만)
  existingOutsourceRevenue: 18500,
  newDealsPerMonth: 1,
  newDealAvgRevenue: 3000,
  newDealMonths: 8, // 5월~12월

  // 의료 AI: 하반기 런칭 예정
  medicalAiClients: 0,
  medicalAiMonthlyFee: 199,
  medicalAiServiceMonths: 4, // 9월 런칭 시 4개월

  // 정부사업
  governmentGrant: 11400,
};

function getStoredInputs(): ScenarioInputs {
  if (typeof window === "undefined") return DEFAULT_INPUTS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return { ...DEFAULT_INPUTS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_INPUTS;
    }
  }
  return DEFAULT_INPUTS;
}

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (v: number) => void;
}

function SliderInput({ label, value, min, max, step = 1, unit, onChange }: SliderInputProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{label}</Label>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 accent-primary cursor-pointer"
        />
        <Input
          value={value.toLocaleString()}
          onChange={(e) => {
            const num = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
            if (!isNaN(num)) onChange(Math.min(max, Math.max(min, num)));
          }}
          className="h-7 w-24 text-xs text-right border-dashed"
        />
      </div>
    </div>
  );
}

// 만원 → 읽기 쉬운 형태
function formatRevenue(v: number): string {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}억원`;
  return `${v.toLocaleString()}만원`;
}

export function ScenarioSimulator() {
  const [inputs, setInputs] = useState<ScenarioInputs>(DEFAULT_INPUTS);

  useEffect(() => {
    setInputs(getStoredInputs());
  }, []);

  const updateInput = useCallback(
    (key: keyof ScenarioInputs, value: number) => {
      setInputs((prev) => {
        const updated = { ...prev, [key]: value };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setTimeout(() => window.dispatchEvent(new CustomEvent("finance-revenue-updated")), 0);
        return updated;
      });
    },
    []
  );

  // ── 시나리오 매출 계산 (만원) ──
  // 플랫폼: MAU × ARPU(만원) × 서비스 개월
  const platformRevenue = inputs.witimMau * inputs.witimArpu * inputs.witimServiceMonths;

  // 외주: 기존 계약 + 신규 수주
  // 신규 = 월 수주 건수 × 건당 매출 × 수주 가능 개월
  const newOutsourceRevenue = inputs.newDealsPerMonth * inputs.newDealAvgRevenue * inputs.newDealMonths;
  const outsourceRevenue = inputs.existingOutsourceRevenue + newOutsourceRevenue;

  // 의료 AI: 고객 수 × 월 구독료(만원) × 서비스 개월
  const medicalRevenue = inputs.medicalAiClients * inputs.medicalAiMonthlyFee * inputs.medicalAiServiceMonths;

  // 정부사업
  const governmentRevenue = inputs.governmentGrant;

  // 합계
  const scenarioTotal = platformRevenue + outsourceRevenue + medicalRevenue + governmentRevenue;

  // 현재 계획 (seed 데이터 기반)
  const planPlatform = MONTHLY_REVENUE.reduce((s, m) => s + m.platform, 0);
  const planOutsource = MONTHLY_REVENUE.reduce((s, m) => s + m.outsource, 0);
  const planMedical = MONTHLY_REVENUE.reduce((s, m) => s + m.medical, 0);
  const planGovernment = MONTHLY_REVENUE.reduce((s, m) => s + m.government, 0);
  const planTotal = planPlatform + planOutsource + planMedical + planGovernment;

  const achievementRate = Math.round((scenarioTotal / ANNUAL_TARGET) * 100);

  const comparisonData = [
    { name: "플랫폼", 현재계획: planPlatform, 시나리오: platformRevenue },
    { name: "외주", 현재계획: planOutsource, 시나리오: outsourceRevenue },
    { name: "의료AI", 현재계획: planMedical, 시나리오: medicalRevenue },
    { name: "정부", 현재계획: planGovernment, 시나리오: governmentRevenue },
  ];

  const breakdownItems = [
    { label: "플랫폼 (WiTiM)", value: platformRevenue, formula: `${inputs.witimMau}명 × ${inputs.witimArpu}만원 × ${inputs.witimServiceMonths}개월`, color: "#3B82F6" },
    { label: "외주 (기존)", value: inputs.existingOutsourceRevenue, formula: `계약 4건 합계`, color: "#F59E0B" },
    { label: "외주 (신규)", value: newOutsourceRevenue, formula: `${inputs.newDealsPerMonth}건/월 × ${inputs.newDealAvgRevenue.toLocaleString()}만 × ${inputs.newDealMonths}개월`, color: "#D97706" },
    { label: "의료 AI", value: medicalRevenue, formula: `${inputs.medicalAiClients}사 × ${inputs.medicalAiMonthlyFee}만원 × ${inputs.medicalAiServiceMonths}개월`, color: "#EF4444" },
    { label: "정부사업", value: governmentRevenue, formula: `K-주전부리 등`, color: "#10B981" },
  ];

  const gaugeWidth = Math.min(achievementRate, 150);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">매출 시나리오 시뮬레이터</h3>
          <Badge variant="secondary" className="ml-auto">What-if 분석</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input Controls */}
          <div className="space-y-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2">가정 변수 조정</div>

            {/* 위팀 */}
            <div className="p-3 rounded-lg border border-dashed space-y-3">
              <p className="text-xs font-semibold text-blue-600">WiTiM (플랫폼)</p>
              <SliderInput label="MAU (월간 활성 유저)" value={inputs.witimMau} min={0} max={10000} step={50} unit="명" onChange={(v) => updateInput("witimMau", v)} />
              <SliderInput label="ARPU (월 매출/유저)" value={inputs.witimArpu} min={0} max={10} step={0.1} unit="만원" onChange={(v) => updateInput("witimArpu", v)} />
              <SliderInput label="유료 서비스 개월 수" value={inputs.witimServiceMonths} min={0} max={12} unit="개월" onChange={(v) => updateInput("witimServiceMonths", v)} />
            </div>

            {/* 외주 */}
            <div className="p-3 rounded-lg border border-dashed space-y-3">
              <p className="text-xs font-semibold text-amber-600">외주</p>
              <SliderInput label="기존 계약 매출 합계" value={inputs.existingOutsourceRevenue} min={0} max={50000} step={500} unit="만원" onChange={(v) => updateInput("existingOutsourceRevenue", v)} />
              <SliderInput label="신규 수주 건수/월" value={inputs.newDealsPerMonth} min={0} max={5} unit="건" onChange={(v) => updateInput("newDealsPerMonth", v)} />
              <SliderInput label="신규 건당 평균 매출" value={inputs.newDealAvgRevenue} min={500} max={10000} step={100} unit="만원" onChange={(v) => updateInput("newDealAvgRevenue", v)} />
              <SliderInput label="수주 가능 개월 수" value={inputs.newDealMonths} min={0} max={12} unit="개월" onChange={(v) => updateInput("newDealMonths", v)} />
            </div>

            {/* 의료 AI */}
            <div className="p-3 rounded-lg border border-dashed space-y-3">
              <p className="text-xs font-semibold text-red-600">의료 마케팅 AI</p>
              <SliderInput label="고객 수" value={inputs.medicalAiClients} min={0} max={50} unit="개사" onChange={(v) => updateInput("medicalAiClients", v)} />
              <SliderInput label="월 구독료" value={inputs.medicalAiMonthlyFee} min={0} max={500} step={10} unit="만원" onChange={(v) => updateInput("medicalAiMonthlyFee", v)} />
              <SliderInput label="서비스 운영 개월 수" value={inputs.medicalAiServiceMonths} min={0} max={12} unit="개월" onChange={(v) => updateInput("medicalAiServiceMonths", v)} />
            </div>

            {/* 정부 */}
            <div className="p-3 rounded-lg border border-dashed space-y-3">
              <p className="text-xs font-semibold text-green-600">정부사업</p>
              <SliderInput label="K-주전부리 등 지원금" value={inputs.governmentGrant} min={0} max={20000} step={100} unit="만원" onChange={(v) => updateInput("governmentGrant", v)} />
            </div>
          </div>

          {/* Right: Results */}
          <div className="space-y-4">
            {/* Total & Achievement */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">연간 예상 매출 (시나리오)</div>
              <div className="text-2xl font-bold">
                {formatRevenue(scenarioTotal)}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({scenarioTotal.toLocaleString()}만원)
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">목표 달성률</span>
                  <span className={`font-bold ${achievementRate >= 100 ? "text-green-600" : achievementRate >= 70 ? "text-amber-600" : "text-red-600"}`}>
                    {achievementRate}%
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(gaugeWidth, 100)}%`,
                      background: achievementRate >= 100
                        ? "linear-gradient(90deg, #10B981, #059669)"
                        : achievementRate >= 70
                          ? "linear-gradient(90deg, #F59E0B, #D97706)"
                          : "linear-gradient(90deg, #EF4444, #DC2626)",
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0</span>
                  <span>목표 {(ANNUAL_TARGET / 10000).toFixed(0)}억</span>
                </div>
              </div>
            </div>

            {/* Category Breakdown with formulas */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">카테고리별 산출 내역</div>
              {breakdownItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{item.label}</span>
                      <span className="text-xs font-bold">{formatRevenue(item.value)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{item.formula}</p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="text-xs font-bold">합계</span>
                <span className="text-xs font-bold">{formatRevenue(scenarioTotal)}</span>
              </div>
            </div>

            {/* Comparison Chart */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2">현재 계획 vs 시나리오</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={comparisonData} barGap={2}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => v >= 10000 ? `${(v / 10000).toFixed(1)}억` : `${v.toLocaleString()}만`}
                  />
                  <Tooltip
                    formatter={(value) => formatRevenue(Number(value))}
                    labelStyle={{ fontSize: 12 }}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="현재계획" fill="#94A3B8" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="시나리오" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Plan vs Scenario summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border">
                <div className="text-xs text-muted-foreground">현재 계획</div>
                <div className="text-lg font-bold">{formatRevenue(planTotal)}</div>
                <div className="text-xs text-muted-foreground">
                  목표 대비 {Math.round((planTotal / ANNUAL_TARGET) * 100)}%
                </div>
              </div>
              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
                <div className="text-xs text-muted-foreground">시나리오 결과</div>
                <div className="text-lg font-bold">{formatRevenue(scenarioTotal)}</div>
                <div className="text-xs">
                  {scenarioTotal > planTotal ? (
                    <span className="text-green-600">+{formatRevenue(scenarioTotal - planTotal)} (계획 대비)</span>
                  ) : scenarioTotal < planTotal ? (
                    <span className="text-red-600">-{formatRevenue(planTotal - scenarioTotal)} (계획 대비)</span>
                  ) : (
                    <span className="text-muted-foreground">계획과 동일</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
