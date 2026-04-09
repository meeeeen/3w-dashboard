"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid } from "lucide-react";
import type { Profile, ProjectWithDetails } from "@/types/database";

interface ResourceAllocationProps {
  members: Profile[];
  projects: ProjectWithDetails[];
}

const ROLE_COLORS: Record<string, string> = {
  PM: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  개발: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  "개발/QA": "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  디자인: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
  기획: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  QA: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
};

export function ResourceAllocation({
  members,
  projects,
}: ResourceAllocationProps) {
  const activeProjects = useMemo(
    () => projects.filter((p) => p.status !== "hold"),
    [projects]
  );

  const matrix = useMemo(() => {
    const memberRoles = new Map<string, Map<string, string>>();

    for (const project of activeProjects) {
      for (const pm of project.members ?? []) {
        const profileId = pm.profile_id;
        if (!memberRoles.has(profileId)) {
          memberRoles.set(profileId, new Map());
        }
        memberRoles.get(profileId)!.set(project.id, pm.role);
      }
    }

    return members
      .filter((m) => memberRoles.has(m.id))
      .map((m) => ({
        member: m,
        assignments: memberRoles.get(m.id)!,
      }));
  }, [members, activeProjects]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutGrid className="size-4" />
          리소스 배분 매트릭스
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {matrix.length === 0 ? (
          <p className="text-sm text-muted-foreground">배정된 인원이 없습니다.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-card z-10 min-w-[100px]">
                  팀원
                </TableHead>
                {activeProjects.map((p) => (
                  <TableHead key={p.id} className="text-center min-w-[90px]">
                    <span className="text-xs">{p.name}</span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {matrix.map(({ member, assignments }) => (
                <TableRow key={member.id}>
                  <TableCell className="sticky left-0 bg-card z-10 font-medium">
                    <div className="flex flex-col">
                      <span className="text-sm">{member.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {member.department}
                      </span>
                    </div>
                  </TableCell>
                  {activeProjects.map((p) => {
                    const role = assignments.get(p.id);
                    return (
                      <TableCell key={p.id} className="text-center">
                        {role ? (
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-1.5 py-0.5 ${ROLE_COLORS[role] ?? ""}`}
                          >
                            {role}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground/30">-</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
