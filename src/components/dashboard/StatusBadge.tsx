"use client";

import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS, type ProjectStatus } from "@/utils/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = PROJECT_STATUS[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        config.color,
        size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5"
      )}
    >
      {config.label}
    </Badge>
  );
}
