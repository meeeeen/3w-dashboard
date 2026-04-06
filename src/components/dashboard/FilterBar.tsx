"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_STATUS, PROJECT_CATEGORY } from "@/utils/constants";
import type { ProjectStatus, ProjectCategory } from "@/utils/constants";

export type ViewMode = "month" | "quarter" | "half";

interface FilterBarProps {
  statusFilter: ProjectStatus | "all";
  categoryFilter: ProjectCategory | "all";
  viewMode: ViewMode;
  onStatusChange: (value: ProjectStatus | "all") => void;
  onCategoryChange: (value: ProjectCategory | "all") => void;
  onViewModeChange: (value: ViewMode) => void;
}

function wrap<T extends string>(fn: (v: T) => void) {
  return (value: T | null) => {
    if (value !== null) fn(value);
  };
}

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  month: "월간",
  quarter: "분기",
  half: "반기",
};

export function FilterBar({
  statusFilter,
  categoryFilter,
  viewMode,
  onStatusChange,
  onCategoryChange,
  onViewModeChange,
}: FilterBarProps) {
  const statusLabel =
    statusFilter === "all"
      ? "전체 상태"
      : PROJECT_STATUS[statusFilter]?.label;
  const categoryLabel =
    categoryFilter === "all"
      ? "전체 카테고리"
      : PROJECT_CATEGORY[categoryFilter]?.label;
  const viewLabel = VIEW_MODE_LABELS[viewMode];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={statusFilter} onValueChange={wrap(onStatusChange)}>
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="상태">{statusLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 상태</SelectItem>
          {Object.entries(PROJECT_STATUS).map(([key, { label }]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={wrap(onCategoryChange)}>
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="카테고리">{categoryLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 카테고리</SelectItem>
          {Object.entries(PROJECT_CATEGORY).map(([key, { label }]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={viewMode} onValueChange={wrap(onViewModeChange)}>
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue>{viewLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">월간</SelectItem>
          <SelectItem value="quarter">분기</SelectItem>
          <SelectItem value="half">반기</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
