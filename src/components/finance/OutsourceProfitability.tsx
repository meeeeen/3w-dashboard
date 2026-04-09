"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PieChart } from "lucide-react";

const STORAGE_KEY = "3w-finance-profitability";

interface ProjectProfit {
  name: string;
  contractAmount: number; // 만원
  laborCost: number;      // 만원
  otherCost: number;      // 만원
}

const DEFAULT_PROJECTS: ProjectProfit[] = [
  { name: "Coffee 키오스크", contractAmount: 5000, laborCost: 2800, otherCost: 400 },
  { name: "리파인", contractAmount: 3500, laborCost: 2000, otherCost: 300 },
  { name: "성형 숨고", contractAmount: 6000, laborCost: 3500, otherCost: 500 },
  { name: "여의도 LMS", contractAmount: 4000, laborCost: 2200, otherCost: 350 },
];

function getMargin(p: ProjectProfit): number {
  return p.contractAmount - p.laborCost - p.otherCost;
}

function getMarginRate(p: ProjectProfit): number {
  if (p.contractAmount === 0) return 0;
  return Math.round((getMargin(p) / p.contractAmount) * 100);
}

function getStoredProjects(): ProjectProfit[] {
  if (typeof window === "undefined") return DEFAULT_PROJECTS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_PROJECTS;
    }
  }
  return DEFAULT_PROJECTS;
}

export function OutsourceProfitability() {
  const [projects, setProjects] = useState<ProjectProfit[]>(DEFAULT_PROJECTS);

  useEffect(() => {
    setProjects(getStoredProjects());
  }, []);

  const saveProjects = useCallback((updated: ProjectProfit[]) => {
    setProjects(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("finance-revenue-updated"));
  }, []);

  const handleChange = (
    index: number,
    field: keyof Omit<ProjectProfit, "name">,
    value: string
  ) => {
    const num = parseInt(value.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num) && value !== "") return;
    const updated = projects.map((p, i) =>
      i === index ? { ...p, [field]: isNaN(num) ? 0 : num } : p
    );
    saveProjects(updated);
  };

  const handleNameChange = (index: number, value: string) => {
    const updated = projects.map((p, i) =>
      i === index ? { ...p, name: value } : p
    );
    saveProjects(updated);
  };

  // Summary
  const totalRevenue = projects.reduce((s, p) => s + p.contractAmount, 0);
  const totalLabor = projects.reduce((s, p) => s + p.laborCost, 0);
  const totalOther = projects.reduce((s, p) => s + p.otherCost, 0);
  const totalMargin = projects.reduce((s, p) => s + getMargin(p), 0);
  const avgMarginRate =
    totalRevenue > 0 ? Math.round((totalMargin / totalRevenue) * 100) : 0;

  // Chart data
  const chartData = projects.map((p) => ({
    name: p.name.length > 8 ? p.name.slice(0, 8) + "..." : p.name,
    fullName: p.name,
    인건비: p.laborCost,
    기타비용: p.otherCost,
    마진: getMargin(p),
  }));

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">외주 수익성 분석</h3>
          <Badge variant="secondary" className="ml-auto">
            프로젝트별 마진
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-xs text-muted-foreground">총 외주 매출</div>
            <div className="text-lg font-bold">{totalRevenue.toLocaleString()}만</div>
            <div className="text-xs text-muted-foreground">
              ({(totalRevenue / 10000).toFixed(1)}억원)
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-xs text-muted-foreground">총 마진</div>
            <div className="text-lg font-bold text-green-600">
              {totalMargin.toLocaleString()}만
            </div>
            <div className="text-xs text-muted-foreground">
              ({(totalMargin / 10000).toFixed(1)}억원)
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-xs text-muted-foreground">평균 마진율</div>
            <div className={`text-lg font-bold ${avgMarginRate >= 30 ? "text-green-600" : avgMarginRate >= 20 ? "text-amber-600" : "text-red-600"}`}>
              {avgMarginRate}%
            </div>
          </div>
        </div>

        {/* Stacked Bar Chart */}
        <div className="mb-5">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} layout="vertical" barSize={28}>
              <XAxis
                type="number"
                tick={{ fontSize: 10 }}
                tickFormatter={(v: number) => `${v.toLocaleString()}만`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={90}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${Number(value).toLocaleString()}만원`,
                  name,
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0 && payload[0].payload) {
                    return (payload[0].payload as Record<string, string>).fullName || label;
                  }
                  return label;
                }}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="인건비" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="기타비용" stackId="a" fill="#94A3B8" />
              <Bar dataKey="마진" stackId="a" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Editable Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">프로젝트</TableHead>
              <TableHead className="w-28 text-right">계약금액 (만)</TableHead>
              <TableHead className="w-28 text-right">투입 인건비 (만)</TableHead>
              <TableHead className="w-28 text-right">기타 비용 (만)</TableHead>
              <TableHead className="w-24 text-right">마진 (만)</TableHead>
              <TableHead className="w-20 text-right">마진율</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project, i) => {
              const margin = getMargin(project);
              const marginRate = getMarginRate(project);
              return (
                <TableRow key={i}>
                  <TableCell>
                    <Input
                      value={project.name}
                      onChange={(e) => handleNameChange(i, e.target.value)}
                      className="h-7 text-xs border-dashed"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      value={project.contractAmount.toString()}
                      onChange={(e) =>
                        handleChange(i, "contractAmount", e.target.value)
                      }
                      className="h-7 w-24 text-xs text-right ml-auto border-dashed"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      value={project.laborCost.toString()}
                      onChange={(e) =>
                        handleChange(i, "laborCost", e.target.value)
                      }
                      className="h-7 w-24 text-xs text-right ml-auto border-dashed text-blue-600"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      value={project.otherCost.toString()}
                      onChange={(e) =>
                        handleChange(i, "otherCost", e.target.value)
                      }
                      className="h-7 w-24 text-xs text-right ml-auto border-dashed"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`text-xs font-semibold ${
                        margin >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {margin.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={marginRate >= 30 ? "default" : "secondary"}
                      className={`text-xs ${
                        marginRate >= 30
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : marginRate >= 20
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {marginRate}%
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-semibold text-xs">합계</TableCell>
              <TableCell className="text-right font-semibold text-xs">
                {totalRevenue.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-semibold text-xs text-blue-600">
                {totalLabor.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-semibold text-xs">
                {totalOther.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-semibold text-xs text-green-600">
                {totalMargin.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-semibold text-xs">
                {avgMarginRate}%
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
