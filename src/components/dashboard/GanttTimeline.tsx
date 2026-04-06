"use client";

import { useMemo, useRef, useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { PROJECT_CATEGORY, PROJECT_STATUS } from "@/utils/constants";
import type { ProjectStatus, ProjectCategory } from "@/utils/constants";
import type { ProjectWithDetails, ProjectPhase } from "@/types/database";
import type { ViewMode } from "./FilterBar";
import {
  getTimelineRange,
  getBarPosition,
  getTodayPosition,
} from "@/utils/gantt-helpers";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, Milestone } from "lucide-react";

interface GanttTimelineProps {
  projects: ProjectWithDetails[];
  viewMode: ViewMode;
  statusFilter: ProjectStatus | "all";
  categoryFilter: ProjectCategory | "all";
}

const ROW_HEIGHT = 40;
const PHASE_ROW_HEIGHT = 32;

export function GanttTimeline({
  projects,
  viewMode,
  statusFilter,
  categoryFilter,
}: GanttTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set()
  );

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter)
        return false;
      return true;
    });
  }, [projects, statusFilter, categoryFilter]);

  const timeline = useMemo(() => getTimelineRange(viewMode), [viewMode]);
  const todayPos = useMemo(() => getTodayPosition(timeline), [timeline]);

  const toggleExpand = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  if (filteredProjects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        표시할 프로젝트가 없습니다
      </div>
    );
  }

  // 연도별 그룹핑
  const yearGroups = new Map<string, typeof timeline.columns>();
  timeline.columns.forEach((col) => {
    const year = col.label;
    if (!yearGroups.has(year)) yearGroups.set(year, []);
    yearGroups.get(year)!.push(col);
  });

  // 행 목록 생성 (프로젝트 + 펼쳐진 단계)
  type Row =
    | { type: "project"; project: ProjectWithDetails }
    | {
        type: "phase";
        project: ProjectWithDetails;
        phase: ProjectPhase;
        isLast: boolean;
      };

  const rows: (Row & { key: string })[] = [];
  filteredProjects.forEach((project) => {
    rows.push({ type: "project", project, key: project.id });
    if (
      expandedProjects.has(project.id) &&
      project.phases &&
      project.phases.length > 0
    ) {
      const sortedPhases = [...project.phases].sort(
        (a, b) => a.sort_order - b.sort_order
      );
      sortedPhases.forEach((phase, i) => {
        rows.push({
          type: "phase",
          project,
          phase,
          isLast: i === sortedPhases.length - 1,
          key: `${project.id}-${phase.id}`,
        });
      });
    }
  });

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="flex">
        {/* 좌측 패널 */}
        <div className="w-[280px] min-w-[280px] border-r bg-muted/30">
          <div className="h-[60px] border-b flex items-end px-3 pb-2">
            <span className="text-xs font-medium text-muted-foreground">
              프로젝트 ({filteredProjects.length})
            </span>
          </div>

          {rows.map((row) => {
            if (row.type === "project") {
              const { project } = row;
              const hasPhases =
                project.phases && project.phases.length > 0;
              const isExpanded = expandedProjects.has(project.id);

              return (
                <div
                  key={row.key}
                  className="flex items-center gap-1.5 px-2 border-b hover:bg-accent/50 transition-colors"
                  style={{ height: ROW_HEIGHT }}
                >
                  {/* 펼치기/접기 */}
                  <button
                    onClick={() => hasPhases && toggleExpand(project.id)}
                    className={cn(
                      "p-0.5 rounded shrink-0",
                      hasPhases
                        ? "hover:bg-accent text-muted-foreground"
                        : "invisible"
                    )}
                  >
                    {isExpanded ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        PROJECT_CATEGORY[project.category]?.color ??
                        project.color,
                    }}
                  />
                  <Link
                    href={`/projects/${project.id}`}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-medium truncate leading-tight">
                      {project.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {project.pm?.name ?? "미배정"}
                    </p>
                  </Link>
                  <StatusBadge status={project.status} />
                </div>
              );
            }

            // 단계 행
            const { phase, isLast } = row;
            return (
              <div
                key={row.key}
                className={cn(
                  "flex items-center gap-1.5 pl-9 pr-2 bg-muted/10 hover:bg-accent/30 transition-colors",
                  !isLast && "border-b border-dashed border-border/40"
                )}
                style={{ height: PHASE_ROW_HEIGHT }}
              >
                {phase.type === "milestone" ? (
                  <Milestone size={10} className="text-amber-500 shrink-0" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-sm bg-muted-foreground/40 shrink-0" />
                )}
                <span className="text-xs truncate flex-1">{phase.name}</span>
                <span
                  className={cn(
                    "text-[10px] shrink-0 px-1 rounded",
                    PROJECT_STATUS[phase.status as ProjectStatus]?.color
                  )}
                >
                  {phase.progress}%
                </span>
              </div>
            );
          })}
        </div>

        {/* 우측 타임라인 */}
        <div className="flex-1 overflow-x-auto" ref={scrollRef}>
          <div className="min-w-[600px] relative">
            {/* 헤더 */}
            <div className="h-[60px] border-b flex flex-col">
              <div className="flex h-[28px]">
                {Array.from(yearGroups.entries()).map(([year, cols]) => (
                  <div
                    key={year}
                    className="border-r border-b flex items-center justify-center text-[10px] font-semibold text-muted-foreground"
                    style={{
                      width: `${(cols.length / timeline.columns.length) * 100}%`,
                    }}
                  >
                    {year}
                  </div>
                ))}
              </div>
              <div className="flex flex-1">
                {timeline.columns.map((col, i) => (
                  <div
                    key={i}
                    className="border-r flex items-center justify-center text-[10px] text-muted-foreground"
                    style={{
                      width: `${(1 / timeline.columns.length) * 100}%`,
                    }}
                  >
                    {col.subLabel}
                  </div>
                ))}
              </div>
            </div>

            {/* 바 영역 */}
            <div className="relative">
              {/* 그리드 */}
              <div className="absolute inset-0 flex pointer-events-none">
                {timeline.columns.map((_, i) => (
                  <div
                    key={i}
                    className="border-r border-dashed border-border/50"
                    style={{
                      width: `${(1 / timeline.columns.length) * 100}%`,
                    }}
                  />
                ))}
              </div>

              {/* 오늘선 */}
              {todayPos && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-red-400 z-10 pointer-events-none"
                  style={{ left: todayPos }}
                >
                  <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-red-400 text-white text-[9px] px-1 rounded-b">
                    오늘
                  </div>
                </div>
              )}

              {/* 행 바 렌더링 */}
              {rows.map((row) => {
                if (row.type === "project") {
                  const { project } = row;
                  const pos = getBarPosition(
                    project.start_date,
                    project.end_date,
                    timeline
                  );
                  const avgProgress =
                    project.phases && project.phases.length > 0
                      ? Math.round(
                          project.phases.reduce(
                            (acc, p) => acc + p.progress,
                            0
                          ) / project.phases.length
                        )
                      : 0;

                  return (
                    <div
                      key={row.key}
                      className="relative border-b"
                      style={{ height: ROW_HEIGHT }}
                    >
                      {pos && (
                        <Tooltip>
                          <TooltipTrigger>
                            <div
                              className={cn(
                                "absolute top-2 h-4 rounded-full cursor-pointer transition-all hover:brightness-110 hover:shadow-md overflow-hidden",
                                project.status === "completed" && "opacity-60"
                              )}
                              style={{
                                left: pos.left,
                                width: pos.width,
                                backgroundColor:
                                  PROJECT_CATEGORY[project.category]?.color ??
                                  project.color,
                                minWidth: 8,
                              }}
                            >
                              {avgProgress > 0 && (
                                <div
                                  className="h-full rounded-full bg-white/30"
                                  style={{ width: `${avgProgress}%` }}
                                />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            <div className="space-y-1">
                              <p className="font-semibold">{project.name}</p>
                              <p>
                                {format(
                                  parseISO(project.start_date),
                                  "yy.MM.dd",
                                  { locale: ko }
                                )}{" "}
                                ~{" "}
                                {format(
                                  parseISO(project.end_date),
                                  "yy.MM.dd",
                                  { locale: ko }
                                )}
                              </p>
                              <p>
                                {PROJECT_CATEGORY[project.category]?.label} |{" "}
                                {project.priority} | 진행률 {avgProgress}%
                              </p>
                              {project.phases &&
                                project.phases.length > 0 && (
                                  <p className="text-muted-foreground">
                                    {project.phases.length}개 단계
                                  </p>
                                )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  );
                }

                // 단계 바
                const { phase, project, isLast } = row;
                const pos = getBarPosition(
                  phase.start_date,
                  phase.end_date,
                  timeline
                );

                const phaseColor =
                  PROJECT_CATEGORY[project.category]?.color ?? project.color;

                return (
                  <div
                    key={row.key}
                    className={cn(
                      "relative bg-muted/5",
                      !isLast && "border-b border-dashed border-border/40"
                    )}
                    style={{ height: PHASE_ROW_HEIGHT }}
                  >
                    {pos && (
                      <Tooltip>
                        <TooltipTrigger>
                          {phase.type === "milestone" ? (
                            <div
                              className="absolute top-2 w-3 h-3 rotate-45 cursor-pointer hover:scale-125 transition-transform"
                              style={{
                                left: pos.left,
                                backgroundColor: "#F59E0B",
                              }}
                            />
                          ) : (
                            <div
                              className="absolute top-2.5 h-2.5 rounded-sm cursor-pointer transition-all hover:brightness-110 overflow-hidden"
                              style={{
                                left: pos.left,
                                width: pos.width,
                                backgroundColor: phaseColor,
                                opacity: 0.5,
                                minWidth: 4,
                              }}
                            >
                              {phase.progress > 0 && (
                                <div
                                  className="h-full rounded-sm"
                                  style={{
                                    width: `${phase.progress}%`,
                                    backgroundColor: phaseColor,
                                    opacity: 1,
                                  }}
                                />
                              )}
                            </div>
                          )}
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <div className="space-y-0.5">
                            <p className="font-semibold">{phase.name}</p>
                            <p>
                              {format(
                                parseISO(phase.start_date),
                                "yy.MM.dd",
                                { locale: ko }
                              )}{" "}
                              ~{" "}
                              {format(
                                parseISO(phase.end_date),
                                "yy.MM.dd",
                                { locale: ko }
                              )}
                            </p>
                            <p>
                              {PROJECT_STATUS[phase.status as ProjectStatus]?.label} |{" "}
                              진행률 {phase.progress}%
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
