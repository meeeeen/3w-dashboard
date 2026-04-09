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
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Cell,
  LabelList,
} from "recharts";
import {
  MONTHLY_REVENUE,
  CURRENT_MONTH_INDEX,
  getMonthlyRevenueTotal,
} from "@/data/finance-seed";
import { TrendingUp } from "lucide-react";

const STORAGE_KEY = "3w-finance-multiyear";
const REVENUE_STORAGE_KEY = "3w-finance-revenue";

interface YearRow {
  year: number;
  target: number; // 억원
  growthRate: string;
  revenueSource: string;
}

const DEFAULT_ROWS: YearRow[] = [
  { year: 2026, target: 20, growthRate: "-", revenueSource: "외주 + K-주전부리" },
  { year: 2027, target: 40, growthRate: "100%", revenueSource: "플랫폼 + 의료 시작" },
  { year: 2028, target: 80, growthRate: "100%", revenueSource: "의료관광 + K-MedSpa" },
  { year: 2029, target: 160, growthRate: "100%", revenueSource: "해외 확장" },
];

function getStoredRows(): YearRow[] {
  if (typeof window === "undefined") return DEFAULT_ROWS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_ROWS;
    }
  }
  return DEFAULT_ROWS;
}

function getStoredRevenue() {
  if (typeof window === "undefined") return MONTHLY_REVENUE;
  const stored = localStorage.getItem(REVENUE_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return MONTHLY_REVENUE;
    }
  }
  return MONTHLY_REVENUE;
}

export function MultiYearProjection() {
  const [rows, setRows] = useState<YearRow[]>(DEFAULT_ROWS);
  const [revenue, setRevenue] = useState(MONTHLY_REVENUE);

  useEffect(() => {
    setRows(getStoredRows());
    setRevenue(getStoredRevenue());

    const handler = () => setRevenue(getStoredRevenue());
    window.addEventListener("finance-revenue-updated", handler);
    return () => window.removeEventListener("finance-revenue-updated", handler);
  }, []);

  const saveRows = useCallback((updated: YearRow[]) => {
    setRows(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("finance-multiyear-updated"));
  }, []);

  const handleSourceChange = (index: number, value: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], revenueSource: value };
    saveRows(updated);
  };

  // Calculate 2026 full-year projection from YTD
  const ytdMonths = revenue.slice(0, CURRENT_MONTH_INDEX + 1);
  const ytdTotal = ytdMonths.reduce(
    (acc: number, m: typeof MONTHLY_REVENUE[number]) => acc + getMonthlyRevenueTotal(m),
    0
  );
  const fullYearProjected = Math.round(
    (ytdTotal / (CURRENT_MONTH_INDEX + 1)) * 12
  );
  const projected2026 = fullYearProjected / 10000; // 억원

  const chartData = rows.map((r) => ({
    year: `${r.year}`,
    target: r.target,
    actual: r.year === 2026 ? Math.round(projected2026 * 10) / 10 : null,
  }));

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">중장기 매출 성장 전략</h3>
          <Badge variant="secondary" className="ml-auto">
            매년 2x 성장
          </Badge>
        </div>

        {/* Chart */}
        <div className="h-72 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 5, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{
                  value: "억원",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12 },
                }}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${value}억원`,
                  name === "target" ? "매출 목표" : "예상 실적",
                ]}
                labelFormatter={(label) => `${label}년`}
              />
              <Bar dataKey="target" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={60} name="매출 목표">
                <LabelList
                  dataKey="target"
                  position="top"
                  formatter={(v) => `${v}억`}
                  style={{ fontSize: 11, fontWeight: 600, fill: "#3B82F6" }}
                />
              </Bar>
              {/* 2026 actual projection overlay */}
              <Bar dataKey="actual" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={30} name="예상 실적">
                <LabelList
                  dataKey="actual"
                  position="top"
                  formatter={(v) => (v ? `${v}억` : "")}
                  style={{ fontSize: 11, fontWeight: 600, fill: "#F59E0B" }}
                />
              </Bar>
              <Line
                type="monotone"
                dataKey="target"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 4, fill: "#10B981" }}
                name="성장 라인"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">연도</TableHead>
              <TableHead className="w-28 text-right">매출 목표</TableHead>
              <TableHead className="w-24 text-right">성장률</TableHead>
              <TableHead>주요 매출원</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={row.year}>
                <TableCell className="font-medium">{row.year}</TableCell>
                <TableCell className="text-right font-semibold">
                  {row.target}억원
                  {row.year === 2026 && (
                    <span className="text-xs text-amber-500 ml-1">
                      (예상 {projected2026.toFixed(1)}억)
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {row.growthRate === "-" ? (
                    <span className="text-muted-foreground">-</span>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      {row.growthRate}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    value={row.revenueSource}
                    onChange={(e) => handleSourceChange(i, e.target.value)}
                    className="h-7 text-xs border-dashed"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
