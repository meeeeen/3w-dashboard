import type { ProjectStatus, ProjectCategory, Priority } from "@/utils/constants";

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: "pmo" | "pm" | "viewer";
  department: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  category: ProjectCategory;
  pm_id: string | null;
  start_date: string;
  end_date: string;
  color: string;
  priority: Priority;
  workb_project_id: string | null;
  workb_last_sync: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectPhase {
  id: string;
  project_id: string;
  name: string;
  type: "phase" | "milestone";
  start_date: string;
  end_date: string;
  progress: number;
  status: ProjectStatus;
  sort_order: number;
  assignee_ids: string[];
  created_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  profile_id: string;
  role: string;
  created_at: string;
}

export interface ProjectWithDetails extends Project {
  pm?: Profile | null;
  phases?: ProjectPhase[];
  members?: (ProjectMember & { profile?: Profile })[];
}
