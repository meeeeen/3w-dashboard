import { addDays, differenceInDays, format } from "date-fns";
import type { ProjectPhase } from "@/types/database";
import type { ProjectStatus } from "./constants";

export interface PhaseTemplate {
  name: string;
  label: string;
  phases: { name: string; ratio: number; type: "phase" | "milestone" }[];
}

export const PHASE_TEMPLATES: PhaseTemplate[] = [
  {
    name: "standard",
    label: "표준 (기획→개발→QA→납품)",
    phases: [
      { name: "기획", ratio: 0.2, type: "phase" },
      { name: "디자인", ratio: 0.15, type: "phase" },
      { name: "개발", ratio: 0.35, type: "phase" },
      { name: "QA", ratio: 0.15, type: "phase" },
      { name: "납품/배포", ratio: 0.15, type: "phase" },
    ],
  },
  {
    name: "outsource",
    label: "외주 (요구사항→개발→QA→납품)",
    phases: [
      { name: "요구사항 정의", ratio: 0.15, type: "phase" },
      { name: "설계", ratio: 0.15, type: "phase" },
      { name: "개발", ratio: 0.4, type: "phase" },
      { name: "QA/테스트", ratio: 0.15, type: "phase" },
      { name: "납품", ratio: 0.15, type: "phase" },
    ],
  },
  {
    name: "agile",
    label: "애자일 (스프린트 기반)",
    phases: [
      { name: "Sprint 1", ratio: 0.25, type: "phase" },
      { name: "Sprint 2", ratio: 0.25, type: "phase" },
      { name: "Sprint 3", ratio: 0.25, type: "phase" },
      { name: "릴리즈 준비", ratio: 0.25, type: "phase" },
    ],
  },
  {
    name: "simple",
    label: "간단 (기획→개발→배포)",
    phases: [
      { name: "기획", ratio: 0.25, type: "phase" },
      { name: "개발", ratio: 0.5, type: "phase" },
      { name: "배포", ratio: 0.25, type: "phase" },
    ],
  },
  {
    name: "empty",
    label: "빈 템플릿 (직접 추가)",
    phases: [],
  },
];

export function generatePhasesFromTemplate(
  template: PhaseTemplate,
  projectStartDate: string,
  projectEndDate: string
): Omit<ProjectPhase, "id" | "project_id" | "created_at">[] {
  const start = new Date(projectStartDate);
  const end = new Date(projectEndDate);
  const totalDays = differenceInDays(end, start);

  let cursor = start;
  return template.phases.map((tp, index) => {
    const phaseDays = Math.round(totalDays * tp.ratio);
    const phaseStart = cursor;
    const phaseEnd = addDays(cursor, Math.max(phaseDays - 1, 0));
    cursor = addDays(phaseEnd, 1);

    return {
      name: tp.name,
      type: tp.type,
      start_date: format(phaseStart, "yyyy-MM-dd"),
      end_date: format(
        index === template.phases.length - 1 ? end : phaseEnd,
        "yyyy-MM-dd"
      ),
      progress: 0,
      status: "planning" as ProjectStatus,
      sort_order: index,
      assignee_ids: [],
    };
  });
}
