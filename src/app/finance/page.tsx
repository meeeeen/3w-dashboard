"use client";

import { RevenueTargetTracker } from "@/components/finance/RevenueTargetTracker";
import { GrowthMetrics } from "@/components/finance/GrowthMetrics";
import { RevenueForecast } from "@/components/finance/RevenueForecast";
import { RevenueMixShift } from "@/components/finance/RevenueMixShift";
import { CashFlowChart } from "@/components/finance/CashFlowChart";
import { BurnRateRunway } from "@/components/finance/BurnRateRunway";
import { OutsourcePipeline } from "@/components/finance/OutsourcePipeline";
import { OutsourceProfitability } from "@/components/finance/OutsourceProfitability";
import { MultiYearProjection } from "@/components/finance/MultiYearProjection";
import { ScenarioSimulator } from "@/components/finance/ScenarioSimulator";
import { MonthlyRevenueTable } from "@/components/finance/MonthlyRevenueTable";

export default function FinancePage() {
  return (
    <div className="space-y-6">
      {/* Section 1: 핵심 지표 */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          핵심 지표
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RevenueTargetTracker />
          <GrowthMetrics />
        </div>
      </section>

      {/* Section 2: 매출 분석 */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          매출 분석
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RevenueForecast />
          <RevenueMixShift />
        </div>
      </section>

      {/* Section 3: 현금 & 파이프라인 */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          현금 & 파이프라인
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CashFlowChart />
          <BurnRateRunway />
        </div>
      </section>

      {/* Section 4: 외주 파이프라인 */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          외주 파이프라인
        </h2>
        <OutsourcePipeline />
      </section>

      {/* Section 5: 외주 수익성 분석 */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          외주 수익성 분석
        </h2>
        <OutsourceProfitability />
      </section>

      {/* Section 6: 중장기 성장 전략 */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          중장기 성장 전략
        </h2>
        <MultiYearProjection />
      </section>

      {/* Section 7: 시나리오 시뮬레이터 */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          시나리오 시뮬레이터
        </h2>
        <ScenarioSimulator />
      </section>

      {/* Section 8: 매출 상세 */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          매출 상세
        </h2>
        <MonthlyRevenueTable />
      </section>
    </div>
  );
}
