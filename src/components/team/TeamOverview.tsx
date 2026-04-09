"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2 } from "lucide-react";
import type { Profile } from "@/types/database";

interface TeamOverviewProps {
  members: Profile[];
}

const DEPT_COLORS: Record<string, string> = {
  경영: "bg-purple-500",
  기획전략: "bg-blue-500",
  "R&D": "bg-emerald-500",
  디자인: "bg-pink-500",
  미디어: "bg-amber-500",
};

export function TeamOverview({ members }: TeamOverviewProps) {
  const deptStats = useMemo(() => {
    const map = new Map<string, Profile[]>();
    for (const m of members) {
      const dept = m.department ?? "미배정";
      if (!map.has(dept)) map.set(dept, []);
      map.get(dept)!.push(m);
    }
    return Array.from(map.entries())
      .map(([dept, list]) => ({ dept, members: list, count: list.length }))
      .sort((a, b) => b.count - a.count);
  }, [members]);

  const maxCount = Math.max(...deptStats.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="size-4" />
          부서별 인원 현황
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Users className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            총 <span className="font-semibold text-foreground">{members.length}</span>명
          </span>
        </div>
        <div className="space-y-3">
          {deptStats.map(({ dept, count, members: deptMembers }) => (
            <div key={dept} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{dept}</span>
                  <Badge variant="secondary" className="text-xs">
                    {count}명
                  </Badge>
                </div>
                <div className="flex gap-1">
                  {deptMembers.map((m) => (
                    <span
                      key={m.id}
                      className="text-xs text-muted-foreground"
                      title={m.name}
                    >
                      {m.name}
                    </span>
                  )).reduce<React.ReactNode[]>((acc, el, i) => {
                    if (i > 0) acc.push(<span key={`sep-${i}`} className="text-muted-foreground/50">,</span>);
                    acc.push(el);
                    return acc;
                  }, [])}
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${DEPT_COLORS[dept] ?? "bg-gray-500"}`}
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
