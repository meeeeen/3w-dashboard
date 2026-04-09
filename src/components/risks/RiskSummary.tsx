"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Risk } from "@/data/risk-seed";
import { AlertTriangle, ShieldAlert, ShieldCheck, FileWarning } from "lucide-react";

interface RiskSummaryProps {
  risks: Risk[];
}

export function RiskSummary({ risks }: RiskSummaryProps) {
  const total = risks.length;
  const critical = risks.filter((r) => r.score >= 16 && r.status !== "해결").length;
  const high = risks.filter((r) => r.score >= 9 && r.score < 16 && r.status !== "해결").length;
  const resolved = risks.filter((r) => r.status === "해결").length;

  const cards = [
    {
      label: "전체 리스크",
      value: total,
      icon: FileWarning,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Critical (16+)",
      value: critical,
      icon: ShieldAlert,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "High (9-15)",
      value: high,
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "해결됨",
      value: resolved,
      icon: ShieldCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon size={20} className={card.color} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
