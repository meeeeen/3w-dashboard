"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  MONTHLY_REVENUE,
  MONTHLY_EXPENSES,
  CURRENT_MONTH,
  getMonthlyRevenueTotal,
  getMonthlyExpenseTotal,
  type MonthlyRevenue,
} from "@/data/finance-seed";
import { ArrowUpDown } from "lucide-react";

const STORAGE_KEY = "3w-finance-revenue";

function getStoredRevenue(): MonthlyRevenue[] {
  if (typeof window === "undefined") return MONTHLY_REVENUE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return MONTHLY_REVENUE;
}

function buildChartData(revenue: MonthlyRevenue[]) {
  return revenue.map((rev, i) => {
    const exp = MONTHLY_EXPENSES[i];
    const income = getMonthlyRevenueTotal(rev);
    const expense = getMonthlyExpenseTotal(exp);
    return {
      name: rev.label,
      month: rev.month,
      수입: income,
      지출: -expense,
      순이익: income - expense,
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
          <span className="font-medium">
            {Math.abs(p.value).toLocaleString()}만
          </span>
        </div>
      ))}
    </div>
  );
}

export function CashFlowChart() {
  const [chartData, setChartData] = useState(() => buildChartData(MONTHLY_REVENUE));

  useEffect(() => {
    setChartData(buildChartData(getStoredRevenue()));
    const handler = () => setChartData(buildChartData(getStoredRevenue()));
    window.addEventListener("finance-revenue-updated", handler);
    return () => window.removeEventListener("finance-revenue-updated", handler);
  }, []);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">월별 현금 흐름</h3>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                tickFormatter={(v) => `${(Math.abs(v) / 1000).toFixed(0)}천`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <ReferenceLine y={0} stroke="hsl(var(--border))" />
              <Bar dataKey="수입" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="지출" fill="#EF4444" radius={[0, 0, 4, 4]} />
              <Bar dataKey="순이익" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
