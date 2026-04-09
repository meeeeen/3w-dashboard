"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  MONTHLY_REVENUE,
  CURRENT_MONTH,
  getMonthlyRevenueTotal,
  type MonthlyRevenue,
} from "@/data/finance-seed";
import { ArrowRight, PieChart } from "lucide-react";

const STORAGE_KEY = "3w-finance-revenue";

const CATEGORIES = [
  { key: "outsource" as const, label: "외주", color: "#F59E0B" },
  { key: "platform" as const, label: "플랫폼", color: "#3B82F6" },
  { key: "government" as const, label: "정부사업", color: "#10B981" },
  { key: "medical" as const, label: "의료", color: "#EF4444" },
];

function getStoredRevenue(): MonthlyRevenue[] {
  if (typeof window === "undefined") return MONTHLY_REVENUE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return MONTHLY_REVENUE;
}

function buildMixData(revenue: MonthlyRevenue[]) {
  return revenue.map((m) => {
    const total = getMonthlyRevenueTotal(m);
    if (total === 0) {
      return {
        name: m.label,
        month: m.month,
        외주: 0,
        플랫폼: 0,
        정부사업: 0,
        의료: 0,
      };
    }
    return {
      name: m.label,
      month: m.month,
      외주: Math.round((m.outsource / total) * 100),
      플랫폼: Math.round((m.platform / total) * 100),
      정부사업: Math.round((m.government / total) * 100),
      의료: Math.round((m.medical / total) * 100),
    };
  });
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-md text-sm">
      <p className="font-semibold mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.dataKey}</span>
          <span className="font-medium">{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

export function RevenueMixShift() {
  const [revenue, setRevenue] = useState<MonthlyRevenue[]>(MONTHLY_REVENUE);

  useEffect(() => {
    setRevenue(getStoredRevenue());
    const handler = () => setRevenue(getStoredRevenue());
    window.addEventListener("finance-revenue-updated", handler);
    return () => window.removeEventListener("finance-revenue-updated", handler);
  }, []);

  const mixData = buildMixData(revenue);

  // Compute narrative: first and last month outsource percentages
  const firstMonth = revenue[0];
  const lastMonth = revenue[revenue.length - 1];
  const firstTotal = getMonthlyRevenueTotal(firstMonth);
  const lastTotal = getMonthlyRevenueTotal(lastMonth);
  const firstOutsourcePct =
    firstTotal > 0 ? Math.round((firstMonth.outsource / firstTotal) * 100) : 0;
  const lastOutsourcePct =
    lastTotal > 0 ? Math.round((lastMonth.outsource / lastTotal) * 100) : 0;

  // Platform pct for narrative
  const firstPlatformPct =
    firstTotal > 0 ? Math.round((firstMonth.platform / firstTotal) * 100) : 0;
  const lastPlatformPct =
    lastTotal > 0 ? Math.round((lastMonth.platform / lastTotal) * 100) : 0;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">매출 믹스 변화</h3>
          <span className="text-xs text-muted-foreground ml-auto">
            에이전시 → AI 플랫폼 전환
          </span>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mixData}
              margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
              stackOffset="expand"
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${Math.round(v * 100)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              {CATEGORIES.map((c) => (
                <Bar
                  key={c.key}
                  dataKey={c.label}
                  stackId="mix"
                  fill={c.color}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Narrative summary */}
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 p-2 rounded-md bg-amber-50 border border-amber-200">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#F59E0B" }}
            />
            <span className="text-amber-800">
              외주 비중: {firstMonth.label} {firstOutsourcePct}%
            </span>
            <ArrowRight className="h-3 w-3 text-amber-600" />
            <span className="text-amber-800">
              {lastMonth.label} {lastOutsourcePct}%
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-blue-50 border border-blue-200">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#3B82F6" }}
            />
            <span className="text-blue-800">
              플랫폼 비중: {firstMonth.label} {firstPlatformPct}%
            </span>
            <ArrowRight className="h-3 w-3 text-blue-600" />
            <span className="text-blue-800">
              {lastMonth.label} {lastPlatformPct}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
