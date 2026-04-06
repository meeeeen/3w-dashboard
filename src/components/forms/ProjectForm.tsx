"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addDays, format as fmtDate } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PROJECT_STATUS, PROJECT_CATEGORY, PRIORITY } from "@/utils/constants";
import { useCreateProject, useUpdateProject } from "@/hooks/useProjects";
import { PhaseManager } from "./PhaseManager";
import {
  PHASE_TEMPLATES,
  generatePhasesFromTemplate,
} from "@/utils/phase-templates";
import type { ProjectWithDetails, ProjectPhase } from "@/types/database";
import type {
  ProjectStatus,
  ProjectCategory,
  Priority,
} from "@/utils/constants";

type PhaseData = Omit<ProjectPhase, "id" | "project_id" | "created_at"> & {
  id?: string;
};

interface ProjectFormProps {
  project?: ProjectWithDetails;
}

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const [form, setForm] = useState({
    name: project?.name ?? "",
    description: project?.description ?? "",
    status: (project?.status ?? "planning") as ProjectStatus,
    category: (project?.category ?? "internal") as ProjectCategory,
    priority: (project?.priority ?? "P2") as Priority,
    start_date: project?.start_date ?? fmtDate(new Date(), "yyyy-MM-dd"),
    end_date: project?.end_date ?? fmtDate(addDays(new Date(), 90), "yyyy-MM-dd"),
    color: project?.color ?? PROJECT_CATEGORY["internal"].color,
    pm_id: project?.pm_id ?? null,
  });

  const [phases, setPhases] = useState<PhaseData[]>(
    project?.phases?.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      start_date: p.start_date,
      end_date: p.end_date,
      progress: p.progress,
      status: p.status,
      sort_order: p.sort_order,
    })) ?? []
  );

  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    project ? "" : "standard"
  );

  const isEdit = !!project;

  // 새 프로젝트에서 템플릿 선택 시 자동 단계 생성
  useEffect(() => {
    if (isEdit || !selectedTemplate) return;
    const template = PHASE_TEMPLATES.find((t) => t.name === selectedTemplate);
    if (!template) return;
    const generated = generatePhasesFromTemplate(
      template,
      form.start_date,
      form.end_date
    );
    setPhases(generated);
  }, [selectedTemplate, form.start_date, form.end_date, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit) {
      await updateProject.mutateAsync({
        id: project.id,
        data: {
          ...form,
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
            created_at: new Date().toISOString(),
          })),
        },
      });
    } else {
      await createProject.mutateAsync({
        ...form,
        phases,
      });
    }

    router.push("/projects");
  };

  const handleCategoryChange = (value: ProjectCategory | null) => {
    if (!value) return;
    setForm((prev) => ({
      ...prev,
      category: value,
      color: PROJECT_CATEGORY[value].color,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">프로젝트명 *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="프로젝트명을 입력하세요"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="프로젝트 설명"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select
                value={form.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue>{PROJECT_CATEGORY[form.category]?.label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_CATEGORY).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>상태</Label>
              <Select
                value={form.status}
                onValueChange={(v) => {
                  if (v)
                    setForm((prev) => ({
                      ...prev,
                      status: v as ProjectStatus,
                    }));
                }}
              >
                <SelectTrigger>
                  <SelectValue>{PROJECT_STATUS[form.status]?.label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_STATUS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>우선순위</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => {
                  if (v)
                    setForm((prev) => ({
                      ...prev,
                      priority: v as Priority,
                    }));
                }}
              >
                <SelectTrigger>
                  <SelectValue>{PRIORITY[form.priority]?.label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>색상</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">
                  {form.color}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">전체 일정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">시작일 *</Label>
              <Input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, start_date: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">종료일 *</Label>
              <Input
                id="end_date"
                type="date"
                value={form.end_date}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, end_date: e.target.value }))
                }
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 단계 템플릿 선택 (새 프로젝트만) */}
      {!isEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">일정 템플릿</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PHASE_TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setSelectedTemplate(t.name)}
                  className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                    selectedTemplate === t.name
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border hover:bg-accent/50"
                  }`}
                >
                  <p className="font-medium text-xs">{t.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {t.phases.length > 0
                      ? t.phases.map((p) => p.name).join(" → ")
                      : "직접 구성"}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 상세 단계 관리 */}
      <PhaseManager
        phases={phases}
        projectStartDate={form.start_date}
        projectEndDate={form.end_date}
        onChange={setPhases}
      />

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={createProject.isPending || updateProject.isPending}
        >
          {isEdit ? "수정" : "등록"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
      </div>
    </form>
  );
}
