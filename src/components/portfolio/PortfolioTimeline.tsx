"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PROJECT_STATUS } from "@/utils/constants";
import type { PortfolioBusiness } from "@/data/portfolio-seed";
import { format, parseISO, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";

interface PortfolioTimelineProps {
  businesses: PortfolioBusiness[];
}

const dotColors: Record<string, string> = {
  planning: "bg-purple-400",
  development: "bg-blue-400",
  operation: "bg-green-400",
  hold: "bg-gray-300",
  completed: "bg-emerald-400",
  progress: "bg-cyan-400",
  exploration: "bg-amber-400",
};

export function PortfolioTimeline({ businesses }: PortfolioTimelineProps) {
  const allMilestones = useMemo(() => {
    const items: {
      id: string;
      businessName: string;
      status: string;
      label: string;
      date: Date;
      dateStr: string;
      completed: boolean;
    }[] = [];

    businesses.forEach((biz) => {
      biz.milestones.forEach((ms) => {
        items.push({
          id: ms.id,
          businessName: biz.name,
          status: biz.status,
          label: ms.label,
          date: parseISO(ms.date),
          dateStr: ms.date,
          completed: ms.completed,
        });
      });
    });

    items.sort((a, b) => a.date.getTime() - b.date.getTime());
    return items;
  }, [businesses]);

  if (allMilestones.length === 0) return null;

  const today = new Date();
  const minDate = allMilestones[0].date;
  const maxDate = allMilestones[allMilestones.length - 1].date;
  const totalDays = Math.max(differenceInDays(maxDate, minDate), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>전체 사업 마일스톤 타임라인</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Horizontal scroll container */}
        <div className="overflow-x-auto pb-4">
          <div className="relative min-w-[800px]">
            {/* Timeline bar */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />

            {/* Today marker */}
            {today >= minDate && today <= maxDate && (
              <div
                className="absolute top-0 w-px h-8 bg-red-400 z-10"
                style={{
                  left: `${(differenceInDays(today, minDate) / totalDays) * 100}%`,
                }}
              >
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-red-500 whitespace-nowrap font-medium">
                  오늘
                </span>
              </div>
            )}

            {/* Milestone dots */}
            <div className="relative h-8">
              {allMilestones.map((ms, idx) => {
                const leftPct =
                  (differenceInDays(ms.date, minDate) / totalDays) * 100;
                const dotColor = dotColors[ms.status] ?? "bg-gray-400";

                return (
                  <div
                    key={ms.id}
                    className="absolute top-2 -translate-x-1/2 group"
                    style={{ left: `${leftPct}%` }}
                  >
                    <div
                      className={`size-3 rounded-full border-2 border-white ${dotColor} ${
                        ms.completed ? "ring-2 ring-emerald-300" : ""
                      }`}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                      <div className="bg-popover text-popover-foreground rounded-lg px-3 py-2 text-xs shadow-md ring-1 ring-foreground/10 whitespace-nowrap">
                        <p className="font-medium">{ms.businessName}</p>
                        <p className="text-muted-foreground">{ms.label}</p>
                        <p className="text-muted-foreground">
                          {format(ms.date, "yyyy.MM.dd", { locale: ko })}
                        </p>
                        {ms.completed && (
                          <p className="text-emerald-600 font-medium">완료</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Date labels */}
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>{format(minDate, "yyyy.MM", { locale: ko })}</span>
              <span>{format(maxDate, "yyyy.MM", { locale: ko })}</span>
            </div>
          </div>
        </div>

        {/* Legend: list milestones */}
        <div className="mt-4 space-y-1.5 max-h-48 overflow-y-auto">
          {allMilestones.map((ms) => {
            const statusLabel =
              PROJECT_STATUS[ms.status as keyof typeof PROJECT_STATUS]?.label ??
              ms.status;
            const dotColor = dotColors[ms.status] ?? "bg-gray-400";
            const isPast = ms.date < today && !ms.completed;

            return (
              <div
                key={ms.id}
                className={`flex items-center gap-2 text-xs ${
                  ms.completed
                    ? "text-muted-foreground line-through"
                    : isPast
                      ? "text-red-500"
                      : ""
                }`}
              >
                <span className={`size-2 rounded-full ${dotColor} shrink-0`} />
                <span className="text-muted-foreground w-20 shrink-0">
                  {format(ms.date, "MM.dd", { locale: ko })}
                </span>
                <span className="font-medium truncate">{ms.businessName}</span>
                <span className="text-muted-foreground truncate">
                  {ms.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
