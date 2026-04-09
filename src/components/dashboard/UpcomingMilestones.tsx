"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Flag, AlertCircle } from "lucide-react";
import type { ProjectWithDetails } from "@/types/database";
import { format, differenceInDays, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

interface UpcomingMilestonesProps {
  projects: ProjectWithDetails[];
}

export function UpcomingMilestones({ projects }: UpcomingMilestonesProps) {
  const today = new Date();

  // 모든 프로젝트에서 마일스톤 + 곧 끝나는 phase 수집
  const upcoming = projects
    .flatMap((project) =>
      (project.phases ?? [])
        .filter((phase) => {
          const endDate = parseISO(phase.end_date);
          const daysLeft = differenceInDays(endDate, today);
          return (
            phase.status !== "completed" &&
            daysLeft >= -3 && // 3일 지난 것도 포함 (오버듀)
            daysLeft <= 30
          );
        })
        .map((phase) => ({
          projectName: project.name,
          projectColor: project.color,
          phaseName: phase.name,
          type: phase.type,
          endDate: parseISO(phase.end_date),
          daysLeft: differenceInDays(parseISO(phase.end_date), today),
          progress: phase.progress,
        }))
    )
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 8);

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          다가오는 마일스톤 & 마감
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            30일 내 예정된 마일스톤이 없습니다
          </p>
        ) : (
          <div className="space-y-2.5">
            {upcoming.map((item, i) => {
              const isOverdue = item.daysLeft < 0;
              const isUrgent = item.daysLeft >= 0 && item.daysLeft <= 3;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 px-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="w-1 h-8 rounded-full shrink-0"
                    style={{ backgroundColor: item.projectColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {item.type === "milestone" && (
                        <Flag className="w-3 h-3 text-amber-500 shrink-0" />
                      )}
                      <p className="text-sm font-medium truncate">
                        {item.phaseName}
                      </p>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {item.projectName}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {format(item.endDate, "M/d (EEE)", { locale: ko })}
                    </p>
                    {isOverdue ? (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        <AlertCircle className="w-3 h-3 mr-0.5" />
                        {Math.abs(item.daysLeft)}일 초과
                      </Badge>
                    ) : isUrgent ? (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        D-{item.daysLeft}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        D-{item.daysLeft}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
