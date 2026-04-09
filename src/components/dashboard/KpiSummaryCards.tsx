"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  FolderKanban,
  Users,
  Target,
} from "lucide-react";
import type { ProjectWithDetails } from "@/types/database";
import { getYtdRevenue, ANNUAL_TARGET } from "@/data/revenue-seed";
import { PLATFORM_KPIS } from "@/data/kpi-seed";

interface KpiSummaryCardsProps {
  projects: ProjectWithDetails[];
}

export function KpiSummaryCards({ projects }: KpiSummaryCardsProps) {
  const ytdRevenue = getYtdRevenue();
  const ytdBillion = (ytdRevenue / 10000).toFixed(1);
  const targetBillion = (ANNUAL_TARGET / 10000).toFixed(0);
  const achievementRate = ((ytdRevenue / ANNUAL_TARGET) * 100).toFixed(1);

  const activeProjects = projects.filter(
    (p) => p.status === "development" || p.status === "operation" || p.status === "planning"
  ).length;

  const witim = PLATFORM_KPIS.find((p) => p.id === "witim");
  const totalPlatformUsers = PLATFORM_KPIS.reduce(
    (acc, p) => acc + (p.metrics.totalUsers ?? 0),
    0
  );

  const cards = [
    {
      label: "YTD 매출",
      value: `${ytdBillion}억`,
      sub: `목표 ${targetBillion}억 대비 ${achievementRate}%`,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "활성 프로젝트",
      value: `${activeProjects}건`,
      sub: `전체 ${projects.length}건`,
      icon: FolderKanban,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "플랫폼 사용자",
      value: `${totalPlatformUsers}명`,
      sub: `위팀 DAU ${witim?.metrics.dau ?? 0}명`,
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "목표 달성률",
      value: `${achievementRate}%`,
      sub: "연간 20억 목표",
      icon: Target,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`p-2.5 rounded-lg ${card.bg}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tracking-tight">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="text-[11px] text-muted-foreground/70 truncate">
                {card.sub}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
