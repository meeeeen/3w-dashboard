"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FolderKanban, PlayCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ProjectWithDetails } from "@/types/database";

interface SummaryCardsProps {
  projects: ProjectWithDetails[];
}

export function SummaryCards({ projects }: SummaryCardsProps) {
  const total = projects.length;
  const inProgress = projects.filter(
    (p) => p.status === "development" || p.status === "operation"
  ).length;
  const onHold = projects.filter((p) => p.status === "hold").length;
  const completed = projects.filter((p) => p.status === "completed").length;

  const cards = [
    {
      label: "전체 프로젝트",
      value: total,
      icon: FolderKanban,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "진행중",
      value: inProgress,
      icon: PlayCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "보류",
      value: onHold,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "완료",
      value: completed,
      icon: CheckCircle2,
      color: "text-gray-600",
      bg: "bg-gray-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
