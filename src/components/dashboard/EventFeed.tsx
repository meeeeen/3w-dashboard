"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Info,
  Bell,
} from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";
import { ko } from "date-fns/locale";
import { SEED_PROJECTS } from "@/data/seed";
import { PORTFOLIO_BUSINESSES } from "@/data/portfolio-seed";
import { MONTHLY_REVENUE, ANNUAL_TARGET } from "@/data/revenue-seed";

type Severity = "urgent" | "warning" | "info" | "success";

interface FeedEvent {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  date: Date;
}

const TODAY = new Date("2026-04-07");

const SEVERITY_CONFIG: Record<
  Severity,
  {
    icon: typeof AlertTriangle;
    color: string;
    bg: string;
    badge: string;
    badgeClass: string;
  }
> = {
  urgent: {
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
    badge: "긴급",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
  },
  warning: {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    badge: "주의",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
  },
  info: {
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-50",
    badge: "정보",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
  },
  success: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    badge: "달성",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
};

function generateProjectMilestoneEvents(): FeedEvent[] {
  const events: FeedEvent[] = [];

  for (const project of SEED_PROJECTS) {
    for (const phase of project.phases ?? []) {
      if (phase.type !== "milestone") continue;
      const milestoneDate = parseISO(phase.start_date);
      const dDays = differenceInDays(milestoneDate, TODAY);

      // Within -3 to +7 days
      if (dDays >= -3 && dDays <= 7) {
        const isOverdue = dDays < 0;
        const isUrgent = dDays <= 2;
        const severity: Severity = isOverdue
          ? "urgent"
          : isUrgent
            ? "warning"
            : "info";
        const dDayLabel =
          dDays === 0
            ? "D-Day"
            : dDays > 0
              ? `D-${dDays}`
              : `D+${Math.abs(dDays)} (초과)`;

        events.push({
          id: `proj-${project.id}-${phase.id}`,
          severity,
          title: isOverdue
            ? `마일스톤 초과: ${project.name}`
            : `마일스톤 임박: ${project.name}`,
          description: `${phase.name} ${dDayLabel} (${format(milestoneDate, "M/d(EEE)", { locale: ko })})`,
          date: milestoneDate,
        });
      }
    }
  }

  return events;
}

function generatePortfolioEvents(): FeedEvent[] {
  const events: FeedEvent[] = [];

  for (const biz of PORTFOLIO_BUSINESSES) {
    for (const ms of biz.milestones) {
      if (ms.completed) continue;
      const msDate = parseISO(ms.date);
      const dDays = differenceInDays(msDate, TODAY);

      if (dDays >= -3 && dDays <= 7) {
        const isOverdue = dDays < 0;
        const severity: Severity = isOverdue ? "urgent" : dDays <= 2 ? "warning" : "info";
        const dDayLabel =
          dDays === 0
            ? "D-Day"
            : dDays > 0
              ? `D-${dDays}`
              : `D+${Math.abs(dDays)}`;

        events.push({
          id: `pf-${biz.id}-${ms.id}`,
          severity,
          title: `${biz.name}: ${ms.label}`,
          description: `${dDayLabel} (${format(msDate, "M/d(EEE)", { locale: ko })})`,
          date: msDate,
        });
      }
    }
  }

  return events;
}

function generateRevenueEvents(): FeedEvent[] {
  const events: FeedEvent[] = [];
  // Check Q1 target (quarterly = annual / 4)
  const q1Months = MONTHLY_REVENUE.filter(
    (m) => m.month >= "2026-01" && m.month <= "2026-03"
  );
  const q1Actual = q1Months.reduce(
    (acc, m) => acc + m.outsource + m.platform + m.government + m.medical,
    0
  );
  const q1Target = ANNUAL_TARGET / 4;
  const q1Rate = Math.round((q1Actual / q1Target) * 100);

  if (q1Rate >= 100) {
    events.push({
      id: "rev-q1-hit",
      severity: "success",
      title: "Q1 매출 목표 달성",
      description: `Q1 실적 ${(q1Actual / 10000).toFixed(1)}억 (목표 대비 ${q1Rate}%)`,
      date: new Date("2026-04-01"),
    });
  } else {
    events.push({
      id: "rev-q1-miss",
      severity: "warning",
      title: "Q1 매출 목표 미달",
      description: `Q1 실적 ${(q1Actual / 10000).toFixed(1)}억 / 목표 ${(q1Target / 10000).toFixed(1)}억 (${q1Rate}%)`,
      date: new Date("2026-04-01"),
    });
  }

  return events;
}

function generateStaticEvents(): FeedEvent[] {
  // Countdown events from today (2026-04-07)
  return [
    {
      id: "static-1",
      severity: "info",
      title: "위팀 데스크탑 웹 오픈 D-23",
      description: "4/30 예정 - 소켓엔진 교체 및 웹 QA 진행 중",
      date: new Date("2026-04-07"),
    },
    {
      id: "static-2",
      severity: "warning",
      title: "Coffee 키오스크 납품 D-8",
      description: "4/15 목표 - 개발 85% 완료, QA 착수 예정",
      date: new Date("2026-04-07"),
    },
    {
      id: "static-3",
      severity: "warning",
      title: "리파인 중간보고 D-6",
      description: "4/13 예정 - 개발 90% 완료",
      date: new Date("2026-04-07"),
    },
  ];
}

export function EventFeed() {
  const events = useMemo(() => {
    const all: FeedEvent[] = [
      ...generateStaticEvents(),
      ...generateProjectMilestoneEvents(),
      ...generatePortfolioEvents(),
      ...generateRevenueEvents(),
    ];

    // Deduplicate by keeping unique titles (prefer static over generated)
    const seen = new Set<string>();
    const deduped: FeedEvent[] = [];
    for (const ev of all) {
      const key = ev.title;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(ev);
      }
    }

    // Sort: urgent first, then by date proximity
    const severityOrder: Record<Severity, number> = {
      urgent: 0,
      warning: 1,
      info: 2,
      success: 3,
    };

    return deduped
      .sort((a, b) => {
        const sDiff = severityOrder[a.severity] - severityOrder[b.severity];
        if (sDiff !== 0) return sDiff;
        return Math.abs(differenceInDays(a.date, TODAY)) -
          Math.abs(differenceInDays(b.date, TODAY));
      })
      .slice(0, 10);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-600" />
          <CardTitle>이벤트 피드</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {events.map((ev) => {
            const config = SEVERITY_CONFIG[ev.severity];
            const Icon = config.icon;
            return (
              <div key={ev.id} className="flex items-start gap-2.5">
                <div
                  className={`mt-0.5 p-1.5 rounded-md shrink-0 ${config.bg}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {ev.title}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ${config.badgeClass}`}
                    >
                      {config.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ev.description}
                  </p>
                </div>
              </div>
            );
          })}
          {events.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              현재 표시할 이벤트가 없습니다
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
