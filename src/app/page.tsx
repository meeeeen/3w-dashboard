"use client";

import { useProjects } from "@/hooks/useProjects";
import { KpiSummaryCards } from "@/components/dashboard/KpiSummaryCards";
import { OkrTracker } from "@/components/dashboard/OkrTracker";
import { EventFeed } from "@/components/dashboard/EventFeed";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RevenuePieChart } from "@/components/dashboard/RevenuePieChart";
import { PlatformKpiCards } from "@/components/dashboard/PlatformKpiCards";
import { ProjectStatusChart } from "@/components/dashboard/ProjectStatusChart";
import { UpcomingMilestones } from "@/components/dashboard/UpcomingMilestones";
import { CohortAnalysis } from "@/components/dashboard/CohortAnalysis";

export default function DashboardPage() {
  const { data: projects, isLoading } = useProjects();

  if (isLoading || !projects) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 상단 요약 카드 */}
      <KpiSummaryCards projects={projects} />

      {/* 매출 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <RevenuePieChart />
      </div>

      {/* 플랫폼 KPI */}
      <PlatformKpiCards />

      {/* 코호트 리텐션 분석 */}
      <CohortAnalysis />

      {/* 프로젝트 현황 + 마일스톤 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProjectStatusChart projects={projects} />
        <UpcomingMilestones projects={projects} />
      </div>

      {/* OKR 트래커 + 이벤트 피드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OkrTracker />
        <EventFeed />
      </div>
    </div>
  );
}
