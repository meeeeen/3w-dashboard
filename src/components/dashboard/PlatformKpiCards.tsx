"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PLATFORM_KPIS, type PlatformKpi } from "@/data/kpi-seed";
import {
  Activity,
  Users,
  ArrowRightLeft,
  Stethoscope,
  TrendingUp,
} from "lucide-react";

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  live: { label: "운영중", variant: "default" },
  development: { label: "개발중", variant: "secondary" },
  hold: { label: "보류", variant: "outline" },
};

const PLATFORM_ICONS: Record<string, typeof Activity> = {
  witim: Activity,
  wdot: ArrowRightLeft,
  medical: Stethoscope,
};

const PLATFORM_COLORS: Record<string, string> = {
  witim: "#3B82F6",
  wdot: "#F59E0B",
  medical: "#EF4444",
};

function MiniSparkline({ data, color }: { data: { date: string; value: number }[]; color: string }) {
  if (data.length === 0) return <div className="h-[60px] flex items-center justify-center text-xs text-muted-foreground">데이터 준비 중</div>;
  return (
    <div className="h-[60px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Tooltip
            contentStyle={{ fontSize: 11, padding: "4px 8px" }}
            labelStyle={{ fontSize: 10 }}
            formatter={(value) => [`${value}명`, ""]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function WitimMetrics({ kpi }: { kpi: PlatformKpi }) {
  const { metrics } = kpi;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">DAU</p>
          <p className="text-xl font-bold">{metrics.dau}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">WAU</p>
          <p className="text-xl font-bold">{metrics.wau}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">MAU</p>
          <p className="text-xl font-bold">{metrics.mau}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">총 가입자</p>
          <p className="text-xl font-bold">{metrics.totalUsers}</p>
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">가입자 추이</p>
        <MiniSparkline data={kpi.userGrowth} color={PLATFORM_COLORS.witim} />
      </div>
    </div>
  );
}

function WdotMetrics({ kpi }: { kpi: PlatformKpi }) {
  const { metrics } = kpi;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">거래 건수</p>
          <p className="text-xl font-bold">{metrics.transactions ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">거래 금액</p>
          <p className="text-xl font-bold">{(metrics.transactionAmount ?? 0).toLocaleString()}원</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">수수료 매출</p>
          <p className="text-xl font-bold">{(metrics.commissionRevenue ?? 0).toLocaleString()}원</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">총 사용자</p>
          <p className="text-xl font-bold">{metrics.totalUsers ?? 0}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground italic">플랫폼 기획 확정 후 본격 진행 예정</p>
    </div>
  );
}

function MedicalMetrics({ kpi }: { kpi: PlatformKpi }) {
  const { metrics } = kpi;
  const progress = metrics.devProgress ?? 0;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">개발 진척률</p>
          <p className="text-xl font-bold">{progress}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">파트너 병원</p>
          <p className="text-xl font-bold">{metrics.partnerCount ?? 0}곳</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>개발 진행</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

const METRIC_RENDERERS: Record<string, (kpi: PlatformKpi) => React.ReactNode> = {
  witim: (kpi) => <WitimMetrics kpi={kpi} />,
  wdot: (kpi) => <WdotMetrics kpi={kpi} />,
  medical: (kpi) => <MedicalMetrics kpi={kpi} />,
};

export function PlatformKpiCards() {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        플랫폼 KPI
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLATFORM_KPIS.map((kpi) => {
          const Icon = PLATFORM_ICONS[kpi.id] ?? Users;
          const badge = STATUS_BADGE[kpi.status];
          return (
            <Card key={kpi.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-1.5 rounded-md"
                      style={{ backgroundColor: `${PLATFORM_COLORS[kpi.id]}15` }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: PLATFORM_COLORS[kpi.id] }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{kpi.name}</p>
                      <p className="text-[11px] text-muted-foreground">{kpi.description}</p>
                    </div>
                  </div>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
                {METRIC_RENDERERS[kpi.id]?.(kpi)}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
