"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ProjectWithDetails } from "@/types/database";
import { PROJECT_STATUS, PROJECT_CATEGORY } from "@/utils/constants";

interface ProjectStatusChartProps {
  projects: ProjectWithDetails[];
}

const STATUS_COLORS: Record<string, string> = {
  planning: "#A855F7",
  development: "#3B82F6",
  operation: "#10B981",
  hold: "#9CA3AF",
  completed: "#059669",
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const { name, value } = payload[0].payload;
  return (
    <div className="bg-popover border border-border rounded-lg p-2.5 shadow-md text-sm">
      <span className="font-medium">{name}</span>
      <span className="ml-2 font-bold">{value}건</span>
    </div>
  );
}

export function ProjectStatusChart({ projects }: ProjectStatusChartProps) {
  const statusData = Object.entries(PROJECT_STATUS).map(([key, config]) => ({
    key,
    name: config.label,
    value: projects.filter((p) => p.status === key).length,
  }));

  const categoryData = Object.entries(PROJECT_CATEGORY).map(([key, config]) => ({
    key,
    name: config.label,
    value: projects.filter((p) => p.category === key).length,
    color: config.color,
  }));

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold mb-4">프로젝트 현황</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-muted-foreground mb-2">상태별</p>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                    {statusData.map((entry) => (
                      <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">카테고리별</p>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={55}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                    {categoryData.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
