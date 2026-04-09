"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MONTHLY_REVENUE, ANNUAL_TARGET, CURRENT_MONTH } from "@/data/finance-seed";
import { TrendingUp, Target } from "lucide-react";

const STORAGE_KEY = "3w-finance-revenue";

function getStoredRevenue() {
  if (typeof window === "undefined") return MONTHLY_REVENUE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return MONTHLY_REVENUE;
}

export function RevenueTargetTracker() {
  const [revenue, setRevenue] = useState(MONTHLY_REVENUE);

  useEffect(() => {
    setRevenue(getStoredRevenue());
    const handler = () => setRevenue(getStoredRevenue());
    window.addEventListener("finance-revenue-updated", handler);
    return () => window.removeEventListener("finance-revenue-updated", handler);
  }, []);

  const ytdData = revenue.filter((m: typeof MONTHLY_REVENUE[number]) => m.month <= CURRENT_MONTH);
  const ytdTotal = ytdData.reduce(
    (acc: number, m: typeof MONTHLY_REVENUE[number]) => acc + m.outsource + m.platform + m.government + m.medical,
    0
  );
  const annualProjected = revenue.reduce(
    (acc: number, m: typeof MONTHLY_REVENUE[number]) => acc + m.outsource + m.platform + m.government + m.medical,
    0
  );

  const ytdPercentage = Math.round((ytdTotal / ANNUAL_TARGET) * 100);
  const projectedPercentage = Math.round((annualProjected / ANNUAL_TARGET) * 100);

  // Category breakdown
  const categories = [
    { label: "외주", key: "outsource" as const, color: "#F59E0B" },
    { label: "플랫폼", key: "platform" as const, color: "#3B82F6" },
    { label: "정부사업", key: "government" as const, color: "#10B981" },
    { label: "의료", key: "medical" as const, color: "#EF4444" },
  ];

  const categoryTotals = categories.map((c) => ({
    ...c,
    ytd: ytdData.reduce((acc: number, m: any) => acc + m[c.key], 0),
    annual: revenue.reduce((acc: number, m: any) => acc + m[c.key], 0),
  }));

  // SVG circular progress
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (ytdPercentage / 100) * circumference;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">연간 매출 목표 달성률</h3>
          <Badge variant="secondary" className="ml-auto">
            목표: {(ANNUAL_TARGET / 10000).toFixed(0)}억원
          </Badge>
        </div>

        <div className="flex items-center gap-8">
          {/* Circular Progress */}
          <div className="relative flex-shrink-0">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="16"
              />
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 100 100)"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{ytdPercentage}%</span>
              <span className="text-xs text-muted-foreground">YTD 달성</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">YTD 실적</p>
                <p className="text-lg font-bold">{(ytdTotal / 10000).toFixed(1)}억원</p>
                <p className="text-xs text-muted-foreground">{ytdTotal.toLocaleString()}만원</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">연간 예상</p>
                <p className="text-lg font-bold">{(annualProjected / 10000).toFixed(1)}억원</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  목표 대비 {projectedPercentage}%
                </p>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="space-y-2">
              {categoryTotals.map((c) => (
                <div key={c.key} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-xs w-14">{c.label}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: c.color,
                        width: `${Math.min(100, (c.ytd / (ANNUAL_TARGET * 0.25)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right">
                    {c.ytd.toLocaleString()}만
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
