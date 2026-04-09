"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PROJECT_STATUS, PROJECT_CATEGORY } from "@/utils/constants";
import type { PortfolioBusiness } from "@/data/portfolio-seed";
import {
  Briefcase,
  TrendingUp,
  Clock,
  PauseCircle,
} from "lucide-react";

interface PortfolioSummaryProps {
  businesses: PortfolioBusiness[];
}

const summaryCards = [
  {
    key: "total",
    label: "총 사업 수",
    icon: Briefcase,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    key: "active",
    label: "활성 사업",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    key: "planning",
    label: "기획/탐색",
    icon: Clock,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    key: "holdOrRevenue",
    label: "예상 총 매출 기여",
    icon: PauseCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
] as const;

export function PortfolioSummary({ businesses }: PortfolioSummaryProps) {
  const total = businesses.length;
  const active = businesses.filter(
    (b) =>
      b.status === "development" ||
      b.status === "operation" ||
      b.status === "progress"
  ).length;
  const planningOrExploration = businesses.filter(
    (b) => b.status === "planning" || b.status === "exploration"
  ).length;

  // Count by status
  const statusCounts: Record<string, number> = {};
  businesses.forEach((b) => {
    const label = PROJECT_STATUS[b.status]?.label ?? b.status;
    statusCounts[label] = (statusCounts[label] || 0) + 1;
  });

  // Count by category
  const categoryCounts: Record<string, { count: number; color: string }> = {};
  businesses.forEach((b) => {
    const cat = PROJECT_CATEGORY[b.category];
    const label = cat?.label ?? b.category;
    if (!categoryCounts[label]) {
      categoryCounts[label] = { count: 0, color: cat?.color ?? "#6B7280" };
    }
    categoryCounts[label].count++;
  });

  const values: Record<string, string> = {
    total: `${total}개`,
    active: `${active}개`,
    planning: `${planningOrExploration}개`,
    holdOrRevenue: "~20억 (목표)",
  };

  return (
    <div className="space-y-4">
      {/* Summary cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((sc) => (
          <Card key={sc.key}>
            <CardContent className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${sc.bgColor}`}>
                <sc.icon className={`size-5 ${sc.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{sc.label}</p>
                <p className="text-lg font-semibold">{values[sc.key]}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status + Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <p className="text-sm font-medium mb-3">상태별 분류</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusCounts).map(([label, count]) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted"
                >
                  {label}
                  <span className="bg-foreground/10 px-1.5 py-0.5 rounded-full text-[10px]">
                    {count}
                  </span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm font-medium mb-3">카테고리별 분류</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryCounts).map(([label, { count, color }]) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  {label}
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[10px]"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    {count}
                  </span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
