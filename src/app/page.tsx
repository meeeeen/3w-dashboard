"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { GanttTimeline } from "@/components/dashboard/GanttTimeline";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { FilterBar, type ViewMode } from "@/components/dashboard/FilterBar";
import type { ProjectStatus, ProjectCategory } from "@/utils/constants";

export default function DashboardPage() {
  const { data: projects, isLoading } = useProjects();
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">(
    "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<
    ProjectCategory | "all"
  >("all");
  const [viewMode, setViewMode] = useState<ViewMode>("quarter");

  if (isLoading || !projects) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SummaryCards projects={projects} />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">프로젝트 타임라인</h2>
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
    </div>
  );
}
