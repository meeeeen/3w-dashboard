"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  MONTHLY_REVENUE,
  MONTHLY_EXPENSES,
  getMonthlyRevenueTotal,
  getMonthlyExpenseTotal,
  type MonthlyRevenue,
} from "@/data/finance-seed";
import { Flame, AlertTriangle } from "lucide-react";

const REVENUE_STORAGE_KEY = "3w-finance-revenue";
const CASH_STORAGE_KEY = "3w-finance-cash";
const DEFAULT_CASH = 30000; // 3억 = 30,000만원

function getStoredRevenue(): MonthlyRevenue[] {
  if (typeof window === "undefined") return MONTHLY_REVENUE;
  const stored = localStorage.getItem(REVENUE_STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return MONTHLY_REVENUE;
}

function getStoredCash(): number {
  if (typeof window === "undefined") return DEFAULT_CASH;
  const stored = localStorage.getItem(CASH_STORAGE_KEY);
  if (stored) {
    const parsed = Number(stored);
    return isNaN(parsed) ? DEFAULT_CASH : parsed;
  }
  return DEFAULT_CASH;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-md text-sm">
      <p className="font-semibold mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.dataKey}</span>
          <span className="font-medium">{Math.round(p.value).toLocaleString()}만</span>
        </div>
      ))}
    </div>
  );
}

export function BurnRateRunway() {
  const [revenue, setRevenue] = useState<MonthlyRevenue[]>(MONTHLY_REVENUE);
  const [cash, setCash] = useState<number>(DEFAULT_CASH);
  const [cashInput, setCashInput] = useState<string>(DEFAULT_CASH.toString());

  useEffect(() => {
    setRevenue(getStoredRevenue());
    setCash(getStoredCash());
    setCashInput(getStoredCash().toString());

    const handler = () => setRevenue(getStoredRevenue());
    window.addEventListener("finance-revenue-updated", handler);
    return () => window.removeEventListener("finance-revenue-updated", handler);
  }, []);

  const handleCashChange = useCallback((value: string) => {
    setCashInput(value);
    const num = Number(value);
    if (!isNaN(num) && num >= 0) {
      setCash(num);
      localStorage.setItem(CASH_STORAGE_KEY, num.toString());
    }
  }, []);

  // Calculate monthly net cash flows
  const monthlyFlows = revenue.map((rev, i) => {
    const exp = MONTHLY_EXPENSES[i];
    const income = getMonthlyRevenueTotal(rev);
    const expense = getMonthlyExpenseTotal(exp);
    return { label: rev.label, income, expense, net: income - expense };
  });

  // Average monthly burn rate (average net outflow across all months, or average net flow)
  const totalNetFlow = monthlyFlows.reduce((sum, f) => sum + f.net, 0);
  const avgNetFlow = monthlyFlows.length > 0 ? totalNetFlow / monthlyFlows.length : 0;

  // Burn rate: if average net flow is negative, burn = |avgNetFlow|; otherwise 0
  const avgBurnRate = avgNetFlow < 0 ? Math.abs(avgNetFlow) : 0;

  // Months with net burn (expenses > revenue)
  const burnMonths = monthlyFlows.filter((f) => f.net < 0);
  const avgBurnMonthRate =
    burnMonths.length > 0
      ? Math.abs(burnMonths.reduce((sum, f) => sum + f.net, 0) / burnMonths.length)
      : 0;

  // Runway calculation
  const effectiveBurn = avgBurnRate > 0 ? avgBurnRate : avgBurnMonthRate;
  const runway =
    effectiveBurn > 0 ? Math.round(cash / effectiveBurn) : Infinity;
  const runwayDisplay = runway === Infinity ? "N/A (순이익)" : `${runway}개월`;
  const isWarning = runway !== Infinity && runway < 6;

  // Cash projection chart
  const projectionData = monthlyFlows.map((f, i) => {
    const cumulativeNet = monthlyFlows
      .slice(0, i + 1)
      .reduce((sum, m) => sum + m.net, 0);
    return {
      name: f.label,
      현금잔고: cash + cumulativeNet,
    };
  });

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Burn Rate & Runway</h3>
          {isWarning && (
            <Badge variant="destructive" className="ml-auto flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Runway 6개월 미만
            </Badge>
          )}
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <div>
            <p className="text-xs text-muted-foreground mb-1">현재 현금 보유</p>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={cashInput}
                onChange={(e) => handleCashChange(e.target.value)}
                className="h-8 w-28 text-sm font-bold"
              />
              <span className="text-xs text-muted-foreground">만원</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {(cash / 10000).toFixed(1)}억원
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">월평균 순현금흐름</p>
            <p
              className={`text-lg font-bold ${
                avgNetFlow >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {avgNetFlow >= 0 ? "+" : ""}
              {Math.round(avgNetFlow).toLocaleString()}만
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">월평균 Burn Rate</p>
            <p className="text-lg font-bold text-red-600">
              {effectiveBurn > 0
                ? `${Math.round(effectiveBurn).toLocaleString()}만`
                : "-"}
            </p>
            {burnMonths.length > 0 && (
              <p className="text-xs text-muted-foreground">
                적자 {burnMonths.length}개월 기준
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Runway</p>
            <p
              className={`text-lg font-bold ${
                isWarning ? "text-red-600" : "text-green-600"
              }`}
            >
              {runwayDisplay}
            </p>
            <p className="text-xs text-muted-foreground">현금 / Burn Rate</p>
          </div>
        </div>

        {/* Cash projection chart */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            현금 추이 (12개월 예측)
          </p>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={projectionData}
                margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    v >= 10000
                      ? `${(v / 10000).toFixed(1)}억`
                      : `${(v / 1000).toFixed(0)}천`
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="4 4" />
                <defs>
                  <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="현금잔고"
                  stroke="#3B82F6"
                  fill="url(#cashGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
