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
  Cell,
  LabelList,
} from "recharts";
import { Briefcase } from "lucide-react";

const STORAGE_KEY = "3w-finance-pipeline";

interface Deal {
  name: string;
  amount: number; // 만원
}

interface PipelineStage {
  stage: string;
  deals: Deal[];
  conversionRate: number; // 0-100
  color: string;
}

const DEFAULT_PIPELINE: PipelineStage[] = [
  {
    stage: "상담중",
    deals: [
      { name: "A사 웹개발", amount: 4500 },
      { name: "B사 앱개발", amount: 3500 },
    ],
    conversionRate: 30,
    color: "#94A3B8",
  },
  {
    stage: "계약협상",
    deals: [{ name: "C사 시스템 구축", amount: 5000 }],
    conversionRate: 60,
    color: "#F59E0B",
  },
  {
    stage: "진행중",
    deals: [
      { name: "Coffee 키오스크", amount: 4500 },
      { name: "리파인", amount: 3500 },
      { name: "성형 숨고", amount: 4000 },
      { name: "여의도 LMS", amount: 3000 },
    ],
    conversionRate: 90,
    color: "#3B82F6",
  },
  {
    stage: "완료(올해)",
    deals: [],
    conversionRate: 100,
    color: "#10B981",
  },
];

function getStoredPipeline(): PipelineStage[] {
  if (typeof window === "undefined") return DEFAULT_PIPELINE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_PIPELINE;
    }
  }
  return DEFAULT_PIPELINE;
}

export function OutsourcePipeline() {
  const [pipeline, setPipeline] = useState<PipelineStage[]>(DEFAULT_PIPELINE);

  useEffect(() => {
    setPipeline(getStoredPipeline());
  }, []);

  const savePipeline = useCallback((updated: PipelineStage[]) => {
    setPipeline(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("finance-pipeline-updated"));
  }, []);

  const handleDealAmountChange = (
    stageIndex: number,
    dealIndex: number,
    value: string
  ) => {
    const num = parseInt(value.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num) && value !== "") return;
    const updated = pipeline.map((s, si) =>
      si === stageIndex
        ? {
            ...s,
            deals: s.deals.map((d, di) =>
              di === dealIndex ? { ...d, amount: isNaN(num) ? 0 : num } : d
            ),
          }
        : s
    );
    savePipeline(updated);
  };

  const handleDealNameChange = (
    stageIndex: number,
    dealIndex: number,
    value: string
  ) => {
    const updated = pipeline.map((s, si) =>
      si === stageIndex
        ? {
            ...s,
            deals: s.deals.map((d, di) =>
              di === dealIndex ? { ...d, name: value } : d
            ),
          }
        : s
    );
    savePipeline(updated);
  };

  const handleConversionRateChange = (stageIndex: number, value: string) => {
    const num = parseInt(value.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num) && value !== "") return;
    const updated = pipeline.map((s, si) =>
      si === stageIndex
        ? { ...s, conversionRate: isNaN(num) ? 0 : Math.min(100, num) }
        : s
    );
    savePipeline(updated);
  };

  const stageTotal = (stage: PipelineStage) =>
    stage.deals.reduce((acc, d) => acc + d.amount, 0);

  const totalPipeline = pipeline.reduce((acc, s) => acc + stageTotal(s), 0);

  const weightedPipeline = pipeline.reduce(
    (acc, s) => acc + stageTotal(s) * (s.conversionRate / 100),
    0
  );

  // Funnel chart data
  const maxValue = Math.max(...pipeline.map((s) => stageTotal(s)), 1);
  const funnelData = pipeline.map((s) => ({
    stage: s.stage,
    value: stageTotal(s),
    deals: s.deals.length,
    color: s.color,
  }));

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">외주 파이프라인</h3>
          <div className="ml-auto flex gap-2">
            <Badge variant="secondary">
              수주 잔고: {(totalPipeline / 10000).toFixed(1)}억원
            </Badge>
            <Badge variant="outline">
              가중 예상: {(weightedPipeline / 10000).toFixed(1)}억원
            </Badge>
          </div>
        </div>

        {/* Funnel Visualization - horizontal bars */}
        <div className="space-y-2 mb-6">
          {funnelData.map((item, i) => {
            const widthPct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            return (
              <div key={item.stage} className="flex items-center gap-3">
                <span className="text-xs w-20 text-right font-medium shrink-0">
                  {item.stage}
                </span>
                <div className="flex-1 relative">
                  <div
                    className="h-8 rounded-md flex items-center transition-all duration-500"
                    style={{
                      width: `${Math.max(widthPct, 2)}%`,
                      backgroundColor: item.color,
                      minWidth: "2rem",
                    }}
                  >
                    <span className="text-xs font-semibold text-white px-2 whitespace-nowrap">
                      {item.deals}건 / {item.value.toLocaleString()}만원
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pipeline Value Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">단계</TableHead>
              <TableHead className="w-12 text-right">건수</TableHead>
              <TableHead className="w-28 text-right">금액 (만원)</TableHead>
              <TableHead className="w-24 text-right">전환율</TableHead>
              <TableHead>딜 목록</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pipeline.map((stage, si) => (
              <TableRow key={stage.stage}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="font-medium text-xs">{stage.stage}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {stage.deals.length}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {stageTotal(stage).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    value={stage.conversionRate.toString()}
                    onChange={(e) =>
                      handleConversionRateChange(si, e.target.value)
                    }
                    className="h-7 w-16 text-xs text-right ml-auto border-dashed"
                    disabled={stage.stage === "완료(올해)"}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {stage.deals.length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        -
                      </span>
                    ) : (
                      stage.deals.map((deal, di) => (
                        <div key={di} className="flex items-center gap-1">
                          <Input
                            value={deal.name}
                            onChange={(e) =>
                              handleDealNameChange(si, di, e.target.value)
                            }
                            className="h-6 text-xs flex-1 border-dashed"
                          />
                          <Input
                            value={deal.amount.toString()}
                            onChange={(e) =>
                              handleDealAmountChange(si, di, e.target.value)
                            }
                            className="h-6 w-20 text-xs text-right border-dashed"
                          />
                          <span className="text-xs text-muted-foreground shrink-0">
                            만
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-semibold">합계</TableCell>
              <TableCell className="text-right font-semibold">
                {pipeline.reduce((acc, s) => acc + s.deals.length, 0)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {totalPipeline.toLocaleString()}
              </TableCell>
              <TableCell />
              <TableCell className="text-xs text-muted-foreground">
                가중 매출 예상: {weightedPipeline.toLocaleString()}만원 (
                {(weightedPipeline / 10000).toFixed(1)}억원)
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
