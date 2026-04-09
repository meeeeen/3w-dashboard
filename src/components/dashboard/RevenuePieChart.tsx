"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getRevenueByCategoryYtd } from "@/data/revenue-seed";

const CATEGORY_CONFIG = [
  { key: "outsource", label: "외주", color: "#F59E0B" },
  { key: "platform", label: "자체 플랫폼", color: "#3B82F6" },
  { key: "government", label: "정부사업", color: "#10B981" },
  { key: "medical", label: "의료", color: "#EF4444" },
] as const;

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-popover border border-border rounded-lg p-2.5 shadow-md text-sm">
      <span className="font-medium">{name}</span>
      <span className="ml-2">{value.toLocaleString()}만원</span>
    </div>
  );
}

export function RevenuePieChart() {
  const ytdByCategory = getRevenueByCategoryYtd();
  const total = Object.values(ytdByCategory).reduce((a, b) => a + b, 0);

  const data = CATEGORY_CONFIG.map((c) => ({
    name: c.label,
    value: ytdByCategory[c.key],
    color: c.color,
  })).filter((d) => d.value > 0);

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold mb-4">카테고리별 매출 (YTD)</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 mt-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-muted-foreground">{d.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {d.value.toLocaleString()}만
                </span>
                <span className="text-xs text-muted-foreground">
                  ({((d.value / total) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
