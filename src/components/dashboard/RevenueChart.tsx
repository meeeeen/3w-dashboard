"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MONTHLY_REVENUE } from "@/data/revenue-seed";

const chartData = MONTHLY_REVENUE.map((m) => ({
  name: m.label,
  외주: m.outsource,
  플랫폼: m.platform,
  정부사업: m.government,
  의료: m.medical,
  합계: m.outsource + m.platform + m.government + m.medical,
}));

const COLORS = {
  외주: "#F59E0B",
  플랫폼: "#3B82F6",
  정부사업: "#10B981",
  의료: "#EF4444",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  const total = payload.reduce((acc: number, p: any) => acc + (p.value ?? 0), 0);
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-md text-sm">
      <p className="font-semibold mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.dataKey}</span>
          <span className="font-medium">{(p.value / 10000 * 10000).toLocaleString()}만</span>
        </div>
      ))}
      <div className="border-t border-border mt-1.5 pt-1.5 flex justify-between gap-4 font-semibold">
        <span>합계</span>
        <span>{total.toLocaleString()}만</span>
      </div>
    </div>
  );
}

export function RevenueChart() {
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold mb-4">월별 매출 추이</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
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
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}천`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Area
                type="monotone"
                dataKey="외주"
                stackId="1"
                stroke={COLORS.외주}
                fill={COLORS.외주}
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="플랫폼"
                stackId="1"
                stroke={COLORS.플랫폼}
                fill={COLORS.플랫폼}
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="정부사업"
                stackId="1"
                stroke={COLORS.정부사업}
                fill={COLORS.정부사업}
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="의료"
                stackId="1"
                stroke={COLORS.의료}
                fill={COLORS.의료}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
