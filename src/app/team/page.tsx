"use client";

import { useState, useCallback } from "react";
import { useMembers } from "@/hooks/useMembers";
import { useProjects } from "@/hooks/useProjects";
import { TeamOverview } from "@/components/team/TeamOverview";
import { ResourceAllocation } from "@/components/team/ResourceAllocation";
import { WorkloadHeatmap } from "@/components/team/WorkloadHeatmap";
import { MemberDetailCard } from "@/components/team/MemberDetailCard";

export default function TeamPage() {
  const { data: members, isLoading: membersLoading } = useMembers();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleMemberClick = useCallback((memberId: string) => {
    setSelectedMemberId(memberId);
    setDialogOpen(true);
  }, []);

  const handleDialogChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) setSelectedMemberId(null);
  }, []);

  if (membersLoading || projectsLoading || !members || !projects) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  const selectedMember = selectedMemberId
    ? members.find((m) => m.id === selectedMemberId) ?? null
    : null;

  return (
    <div className="space-y-6">
      {/* 부서별 인원 현황 + 업무 부하 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TeamOverview members={members} />
        <WorkloadHeatmap
          members={members}
          projects={projects}
          onMemberClick={handleMemberClick}
        />
      </div>

      {/* 리소스 배분 매트릭스 */}
      <ResourceAllocation members={members} projects={projects} />

      {/* 팀원 상세 다이얼로그 */}
      <MemberDetailCard
        member={selectedMember}
        projects={projects}
        open={dialogOpen}
        onOpenChange={handleDialogChange}
      />
    </div>
  );
}
