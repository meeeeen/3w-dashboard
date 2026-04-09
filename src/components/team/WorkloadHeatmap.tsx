"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import type { Profile, ProjectWithDetails } from "@/types/database";

interface WorkloadHeatmapProps {
  members: Profile[];
  projects: ProjectWithDetails[];
  onMemberClick?: (memberId: string) => void;
}

function getWorkloadLevel(count: number): {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
} {
  if (count === 0) {
    return {
      label: "미배정",
      color: "bg-gray-200 dark:bg-gray-700",
      bgColor: "bg-gray-50 dark:bg-gray-900/30",
      textColor: "text-gray-500",
    };
  }
  if (count === 1) {
    return {
      label: "여유",
      color: "bg-green-400 dark:bg-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      textColor: "text-green-700 dark:text-green-400",
    };
  }
  if (count === 2) {
    return {
      label: "적정",
      color: "bg-yellow-400 dark:bg-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
      textColor: "text-yellow-700 dark:text-yellow-400",
    };
  }
  return {
    label: "과부하",
    color: "bg-red-400 dark:bg-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    textColor: "text-red-700 dark:text-red-400",
  };
}

export function WorkloadHeatmap({
  members,
  projects,
  onMemberClick,
}: WorkloadHeatmapProps) {
  const workloads = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status !== "hold");
    const countMap = new Map<string, string[]>();

    for (const project of activeProjects) {
      for (const pm of project.members ?? []) {
        if (!countMap.has(pm.profile_id)) {
          countMap.set(pm.profile_id, []);
        }
        countMap.get(pm.profile_id)!.push(project.name);
      }
    }

    return members.map((m) => ({
      member: m,
      projectNames: countMap.get(m.id) ?? [],
      count: countMap.get(m.id)?.length ?? 0,
    }));
  }, [members, projects]);

  const sorted = useMemo(
    () => [...workloads].sort((a, b) => b.count - a.count),
    [workloads]
  );

  const summary = useMemo(() => {
    const overloaded = workloads.filter((w) => w.count >= 3).length;
    const optimal = workloads.filter((w) => w.count === 2).length;
    const light = workloads.filter((w) => w.count === 1).length;
    const idle = workloads.filter((w) => w.count === 0).length;
    return { overloaded, optimal, light, idle };
  }, [workloads]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="size-4" />
          업무 부하 현황
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-green-400 dark:bg-green-500" />
            <span>여유 (1개)</span>
            <span className="text-muted-foreground">{summary.light}명</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-yellow-400 dark:bg-yellow-500" />
            <span>적정 (2개)</span>
            <span className="text-muted-foreground">{summary.optimal}명</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-red-400 dark:bg-red-500" />
            <span>과부하 (3+개)</span>
            <span className="text-muted-foreground">{summary.overloaded}명</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-gray-200 dark:bg-gray-700" />
            <span>미배정</span>
            <span className="text-muted-foreground">{summary.idle}명</span>
          </div>
        </div>

        {/* Heatmap grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {sorted.map(({ member, count, projectNames }) => {
            const level = getWorkloadLevel(count);
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => onMemberClick?.(member.id)}
                className={`relative rounded-lg p-3 text-left transition-all hover:ring-2 hover:ring-ring/50 ${level.bgColor}`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.department}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 shrink-0`}>
                    <span className={`size-2 rounded-full ${level.color}`} />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${level.textColor}`}
                  >
                    {count}개 프로젝트
                  </Badge>
                </div>
                {projectNames.length > 0 && (
                  <p className="mt-1 text-[10px] text-muted-foreground truncate">
                    {projectNames.join(", ")}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
