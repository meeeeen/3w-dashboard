"use client";

import { use } from "react";
import { useProject, useUpdateProject } from "@/hooks/useProjects";
import { ProjectForm } from "@/components/forms/ProjectForm";
import { PhaseManager } from "@/components/forms/PhaseManager";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROJECT_CATEGORY, PRIORITY } from "@/utils/constants";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ProjectPhase } from "@/types/database";

type PhaseData = Omit<ProjectPhase, "id" | "project_id" | "created_at"> & {
  id?: string;
};

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: project, isLoading } = useProject(id);
  const updateProject = useUpdateProject();

  const handlePhasesChange = (phases: PhaseData[]) => {
    if (!project) return;
    updateProject.mutate({
      id: project.id,
      data: {
        phases: phases.map((p, i) => ({
          id: p.id ?? crypto.randomUUID(),
          project_id: project.id,
          name: p.name,
          type: p.type,
          start_date: p.start_date,
          end_date: p.end_date,
          progress: p.progress,
          status: p.status,
          sort_order: i,
          assignee_ids: p.assignee_ids ?? [],
          created_at: new Date().toISOString(),
        })),
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        프로젝트를 찾을 수 없습니다
      </div>
    );
  }

  const avgProgress =
    project.phases && project.phases.length > 0
      ? Math.round(
          project.phases.reduce((acc, p) => acc + p.progress, 0) /
            project.phases.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{project.name}</h1>
            <StatusBadge status={project.status} size="md" />
            <Badge
              variant="outline"
              className={cn("text-xs", PRIORITY[project.priority]?.color)}
            >
              {project.priority}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {PROJECT_CATEGORY[project.category]?.label} | PM:{" "}
            {project.pm?.name ?? "미배정"} |{" "}
            {format(parseISO(project.start_date), "yyyy.MM.dd", {
              locale: ko,
            })}{" "}
            ~{" "}
            {format(parseISO(project.end_date), "yyyy.MM.dd", { locale: ko })}
            {project.phases && project.phases.length > 0 && (
              <span> | 전체 진행률 {avgProgress}%</span>
            )}
          </p>
        </div>
      </div>

      <Tabs defaultValue="phases">
        <TabsList>
          <TabsTrigger value="phases">상세 일정</TabsTrigger>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="edit">프로젝트 수정</TabsTrigger>
        </TabsList>

        <TabsContent value="phases" className="mt-4">
          <PhaseManager
            phases={
              project.phases?.map((p) => ({
                id: p.id,
                name: p.name,
                type: p.type,
                start_date: p.start_date,
                end_date: p.end_date,
                progress: p.progress,
                status: p.status,
                sort_order: p.sort_order,
                assignee_ids: p.assignee_ids ?? [],
              })) ?? []
            }
            projectStartDate={project.start_date}
            projectEndDate={project.end_date}
            onChange={handlePhasesChange}
          />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {project.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">설명</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="edit" className="mt-4">
          <ProjectForm project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
