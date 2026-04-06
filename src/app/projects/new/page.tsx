"use client";

import { ProjectForm } from "@/components/forms/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">프로젝트 등록</h1>
        <p className="text-sm text-muted-foreground mt-1">
          새 프로젝트를 등록합니다
        </p>
      </div>
      <ProjectForm />
    </div>
  );
}
