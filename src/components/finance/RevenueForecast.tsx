"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  MONTHLY_REVENUE,
  CURRENT_MONTH_INDEX,
  ANNUAL_TARGET,
  type MonthlyRevenue,
} from "@/data/finance-seed";
import { TrendingUp } from "lucide-react";

const STORAGE_KEY = "3w-finance-revenue";

function getStoredRevenue(): MonthlyRevenue[] {
  if (typeof window === "undefined") return MONTHLY_REVENUE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return MONTHLY_REVENUE;
}

function getTotal(m: MonthlyRevenue) {
  return m.outsource + m.platform + m.government + m.medical;
}

function buildForecastData(revenue: MonthlyRevenue[]) {
  let cumulativeActual = 0;
  let cumulativeForecast = 0;

  return revenue.map((m, i) => {
    const total = getTotal(m);
    const isActual = i <= CURRENT_MONTH_INDEX;

    if (isActual) {
      cumulativeActual += total;
      cumulativeForecast += total;
    } else {
      cumulativeForecast += total;
    }

    return {
      name: m.label,
      실적: isActual ? cumulativeActual : undefined,
      예상: cumulativeForecast,
      목표: Math.round((ANNUAL_TARGET / 12) * (i + 1)),
    };
  });
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-md text-sm">
      <p className="font-semibold mb-1.5">{label}</p>
      {payload
        .filter((p: any) => p.value != null)
        .map((p: any) => (
          <div key={p.dataKey} className="flex justify-between gap-4">
            <span style={{ color: p.color }}>{p.dataKey}</span>
            <span className="font-medium">{Math.round(p.value).toLocaleString()}만</span>
          </div>
        ))}
    </div>
  );
}

export function RevenueForecast() {
  const [forecastData, setForecastData] = useState(() => buildForecastData(MONTHLY_REVENUE));

  useEffect(() => {
    setForecastData(buildForecastData(getStoredRevenue()));
    const handler = () => setForecastData(buildForecastData(getStoredRevenue()));
    window.addEventListener("finance-revenue-updated", handler);
    return () => window.removeEventListener("finance-revenue-updated", handler);
  }, []);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">연간 매출 예측 (누적)</h3>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
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
                tickFormatter={(v) => `${(v / 10000).toFixed(1)}억`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              {/* Forecast line (dotted, full year) */}
              <Line
                type="monotone"
                dataKey="예상"
                stroke="#3B82F6"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                connectNulls
              />
              {/* Actual line (solid, up to current month) */}
              <Line
                type="monotone"
                dataKey="실적"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 4, fill: "#10B981" }}
                connectNulls
              />
              {/* Target line */}
              <Line
                type="monotone"
                dataKey="목표"
                stroke="#F59E0B"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
