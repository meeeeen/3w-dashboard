"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MONTHLY_REVENUE,
  CURRENT_MONTH,
  CURRENT_MONTH_INDEX,
  getMonthlyRevenueTotal,
  type MonthlyRevenue,
} from "@/data/finance-seed";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

const STORAGE_KEY = "3w-finance-revenue";

function getStoredRevenue(): MonthlyRevenue[] {
  if (typeof window === "undefined") return MONTHLY_REVENUE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return MONTHLY_REVENUE;
}

function getQuarterIndex(monthIndex: number): number {
  return Math.floor(monthIndex / 3);
}

function getQuarterLabel(qi: number): string {
  return `Q${qi + 1}`;
}

function getQuarterTotal(revenue: MonthlyRevenue[], quarterIndex: number): number {
  const start = quarterIndex * 3;
  return revenue
    .slice(start, start + 3)
    .reduce((sum, m) => sum + getMonthlyRevenueTotal(m), 0);
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

export function GrowthMetrics() {
  const [revenue, setRevenue] = useState<MonthlyRevenue[]>(MONTHLY_REVENUE);

  useEffect(() => {
    setRevenue(getStoredRevenue());
    const handler = () => setRevenue(getStoredRevenue());
    window.addEventListener("finance-revenue-updated", handler);
    return () => window.removeEventListener("finance-revenue-updated", handler);
  }, []);

  // MoM
  const currentTotal = getMonthlyRevenueTotal(revenue[CURRENT_MONTH_INDEX]);
  const prevTotal =
    CURRENT_MONTH_INDEX > 0
      ? getMonthlyRevenueTotal(revenue[CURRENT_MONTH_INDEX - 1])
      : 0;
  const mom = pctChange(currentTotal, prevTotal);

  // QoQ
  const currentQuarter = getQuarterIndex(CURRENT_MONTH_INDEX);
  const currentQTotal = getQuarterTotal(revenue, currentQuarter);
  const prevQTotal =
    currentQuarter > 0 ? getQuarterTotal(revenue, currentQuarter - 1) : 0;
  const qoq = pctChange(currentQTotal, prevQTotal);

  // Quarterly summary
  const quarters = [0, 1, 2, 3].map((qi) => {
    const total = getQuarterTotal(revenue, qi);
    const prevQ = qi > 0 ? getQuarterTotal(revenue, qi - 1) : 0;
    const growth = pctChange(total, prevQ);
    return { label: getQuarterLabel(qi), total, growth };
  });

  // YTD average
  const ytdData = revenue.filter((m) => m.month <= CURRENT_MONTH);
  const ytdTotal = ytdData.reduce((sum, m) => sum + getMonthlyRevenueTotal(m), 0);
  const ytdAvg = ytdData.length > 0 ? Math.round(ytdTotal / ytdData.length) : 0;

  function GrowthBadge({ value }: { value: number | null }) {
    if (value === null) return <Badge variant="secondary">-</Badge>;
    const positive = value >= 0;
    return (
      <Badge
        variant="secondary"
        className={positive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}
      >
        {positive ? (
          <TrendingUp className="h-3 w-3 mr-1 inline" />
        ) : (
          <TrendingDown className="h-3 w-3 mr-1 inline" />
        )}
        {value >= 0 ? "+" : ""}
        {value.toFixed(1)}%
      </Badge>
    );
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">성장 지표</h3>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div>
            <p className="text-xs text-muted-foreground mb-1">MoM 성장률</p>
            <GrowthBadge value={mom} />
            <p className="text-xs text-muted-foreground mt-1">
              {prevTotal.toLocaleString()} → {currentTotal.toLocaleString()}만
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">QoQ 성장률</p>
            <GrowthBadge value={qoq} />
            <p className="text-xs text-muted-foreground mt-1">
              {prevQTotal.toLocaleString()} → {currentQTotal.toLocaleString()}만
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">월평균 매출 (YTD)</p>
            <p className="text-lg font-bold">{ytdAvg.toLocaleString()}만</p>
            <p className="text-xs text-muted-foreground">
              {(ytdAvg / 10000).toFixed(2)}억원
            </p>
          </div>
        </div>

        {/* Quarterly summary table */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            분기별 매출 요약
          </p>
          <div className="grid grid-cols-4 gap-2">
            {quarters.map((q) => {
              const isCurrent = q.label === getQuarterLabel(currentQuarter);
              const isFuture =
                quarters.indexOf(q) > currentQuarter;
              return (
                <div
                  key={q.label}
                  className={`rounded-lg border p-3 text-center ${
                    isCurrent ? "border-primary bg-primary/5" : ""
                  } ${isFuture ? "opacity-50" : ""}`}
                >
                  <p className="text-xs font-semibold mb-1">{q.label}</p>
                  <p className="text-sm font-bold">
                    {(q.total / 10000).toFixed(1)}억
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {q.total.toLocaleString()}만
                  </p>
                  {q.growth !== null && quarters.indexOf(q) > 0 ? (
                    <p
                      className={`text-xs mt-1 font-medium ${
                        q.growth >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {q.growth >= 0 ? "+" : ""}
                      {q.growth.toFixed(1)}%
                    </p>
                  ) : (
                    <p className="text-xs mt-1 text-muted-foreground">-</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
