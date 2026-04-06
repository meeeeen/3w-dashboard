"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProjectWithDetails, Project, ProjectPhase } from "@/types/database";
import { SEED_PROJECTS } from "@/data/seed";

const STORAGE_KEY = "3w-dashboard-projects";
const SEED_VERSION_KEY = "3w-dashboard-seed-version";
const CURRENT_SEED_VERSION = "2"; // 시드 데이터 변경 시 올리기

function getStoredProjects(): ProjectWithDetails[] {
  if (typeof window === "undefined") return SEED_PROJECTS;
  const storedVersion = localStorage.getItem(SEED_VERSION_KEY);
  if (storedVersion !== CURRENT_SEED_VERSION) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PROJECTS));
    localStorage.setItem(SEED_VERSION_KEY, CURRENT_SEED_VERSION);
    return SEED_PROJECTS;
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PROJECTS));
    return SEED_PROJECTS;
  }
  return JSON.parse(stored);
}

function saveProjects(projects: ProjectWithDetails[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function useProjects() {
  return useQuery<ProjectWithDetails[]>({
    queryKey: ["projects"],
    queryFn: () => getStoredProjects(),
  });
}

export function useProject(id: string) {
  return useQuery<ProjectWithDetails | undefined>({
    queryKey: ["projects", id],
    queryFn: () => {
      const projects = getStoredProjects();
      return projects.find((p) => p.id === id);
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<Project, "id" | "created_at" | "updated_at" | "workb_project_id" | "workb_last_sync"> & {
        phases?: Omit<ProjectPhase, "id" | "project_id" | "created_at">[];
      }
    ) => {
      const projects = getStoredProjects();
      const projectId = crypto.randomUUID();
      const { phases: phasesData, ...projectData } = data;

      const phases: ProjectPhase[] = (phasesData ?? []).map((p, i) => ({
        ...p,
        id: crypto.randomUUID(),
        project_id: projectId,
        sort_order: i,
        created_at: new Date().toISOString(),
      }));

      const newProject: ProjectWithDetails = {
        ...projectData,
        id: projectId,
        workb_project_id: null,
        workb_last_sync: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pm: null,
        phases,
        members: [],
      };
      projects.push(newProject);
      saveProjects(projects);
      return newProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ProjectWithDetails>;
    }) => {
      const projects = getStoredProjects();
      const index = projects.findIndex((p) => p.id === id);
      if (index === -1) throw new Error("프로젝트를 찾을 수 없습니다");
      projects[index] = {
        ...projects[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      saveProjects(projects);
      return projects[index];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const projects = getStoredProjects();
      const filtered = projects.filter((p) => p.id !== id);
      saveProjects(filtered);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// === 단계(Phase) 관리 ===

export function useAddPhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      phase,
    }: {
      projectId: string;
      phase: Omit<ProjectPhase, "id" | "project_id" | "created_at">;
    }) => {
      const projects = getStoredProjects();
      const project = projects.find((p) => p.id === projectId);
      if (!project) throw new Error("프로젝트를 찾을 수 없습니다");

      const newPhase: ProjectPhase = {
        ...phase,
        id: crypto.randomUUID(),
        project_id: projectId,
        created_at: new Date().toISOString(),
      };

      if (!project.phases) project.phases = [];
      project.phases.push(newPhase);
      project.updated_at = new Date().toISOString();
      saveProjects(projects);
      return newPhase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdatePhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      phaseId,
      data,
    }: {
      projectId: string;
      phaseId: string;
      data: Partial<ProjectPhase>;
    }) => {
      const projects = getStoredProjects();
      const project = projects.find((p) => p.id === projectId);
      if (!project?.phases) throw new Error("프로젝트를 찾을 수 없습니다");

      const phaseIndex = project.phases.findIndex((p) => p.id === phaseId);
      if (phaseIndex === -1) throw new Error("단계를 찾을 수 없습니다");

      project.phases[phaseIndex] = { ...project.phases[phaseIndex], ...data };
      project.updated_at = new Date().toISOString();
      saveProjects(projects);
      return project.phases[phaseIndex];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeletePhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      phaseId,
    }: {
      projectId: string;
      phaseId: string;
    }) => {
      const projects = getStoredProjects();
      const project = projects.find((p) => p.id === projectId);
      if (!project?.phases) throw new Error("프로젝트를 찾을 수 없습니다");

      project.phases = project.phases.filter((p) => p.id !== phaseId);
      project.updated_at = new Date().toISOString();
      saveProjects(projects);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useReorderPhases() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      phaseIds,
    }: {
      projectId: string;
      phaseIds: string[];
    }) => {
      const projects = getStoredProjects();
      const project = projects.find((p) => p.id === projectId);
      if (!project?.phases) throw new Error("프로젝트를 찾을 수 없습니다");

      const sorted = phaseIds
        .map((id, i) => {
          const phase = project.phases!.find((p) => p.id === id);
          if (phase) phase.sort_order = i;
          return phase;
        })
        .filter(Boolean) as ProjectPhase[];

      project.phases = sorted;
      project.updated_at = new Date().toISOString();
      saveProjects(projects);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
