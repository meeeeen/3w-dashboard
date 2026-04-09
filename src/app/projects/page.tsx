"use client";

import { useState } from "react";
import Link from "next/link";
import { useProjects, useDeleteProject } from "@/hooks/useProjects";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { GanttTimeline } from "@/components/dashboard/GanttTimeline";
import { FilterBar, type ViewMode } from "@/components/dashboard/FilterBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PROJECT_CATEGORY, PRIORITY, type ProjectStatus, type ProjectCategory } from "@/utils/constants";
import { Plus, Trash2, Pencil, Calendar, List, GanttChart } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function ProjectListPage() {
  const { data: projects, isLoading } = useProjects();
  const deleteProject = useDeleteProject();
  const [tab, setTab] = useState<"list" | "timeline">("list");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<ProjectCategory | "all">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("quarter");

  if (isLoading || !projects) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" 프로젝트를 삭제하시겠습니까?`)) {
      deleteProject.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">프로젝트 목록</h1>
          <p className="text-sm text-muted-foreground mt-1">
            전체 {projects.length}개 프로젝트
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-md p-0.5">
            <button
              onClick={() => setTab("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors",
                tab === "list"
                  ? "bg-background shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List size={14} />
              목록
            </button>
            <button
              onClick={() => setTab("timeline")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors",
                tab === "timeline"
                  ? "bg-background shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <GanttChart size={14} />
              타임라인
            </button>
          </div>
          <Link href="/projects/new">
            <Button>
              <Plus size={16} className="mr-1" />
              새 프로젝트
            </Button>
          </Link>
        </div>
      </div>

      {tab === "timeline" && (
        <>
          <div className="flex items-center justify-end">
            <FilterBar
              statusFilter={statusFilter}
              categoryFilter={categoryFilter}
              viewMode={viewMode}
              onStatusChange={setStatusFilter}
              onCategoryChange={setCategoryFilter}
              onViewModeChange={setViewMode}
            />
          </div>
          <GanttTimeline
            projects={projects}
            viewMode={viewMode}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
          />
        </>
      )}

      {tab === "list" && (
        <div className="grid gap-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="flex items-center gap-4 p-4">
                <div
                  className="w-3 h-10 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      PROJECT_CATEGORY[project.category]?.color ?? project.color,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-medium hover:underline truncate"
                    >
                      {project.name}
                    </Link>
                    <StatusBadge status={project.status} />
                    <Badge
                      variant="outline"
                      className={cn("text-[10px]", PRIORITY[project.priority]?.color)}
                    >
                      {project.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{PROJECT_CATEGORY[project.category]?.label}</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {format(parseISO(project.start_date), "yy.MM.dd", {
                        locale: ko,
                      })}{" "}
                      ~{" "}
                      {format(parseISO(project.end_date), "yy.MM.dd", {
                        locale: ko,
                      })}
                    </span>
                    <span>PM: {project.pm?.name ?? "미배정"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil size={14} />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(project.id, project.name)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
