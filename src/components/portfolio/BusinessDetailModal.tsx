"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { PROJECT_STATUS, PROJECT_CATEGORY } from "@/utils/constants";
import type { PortfolioBusiness } from "@/data/portfolio-seed";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { Check, Circle, Save } from "lucide-react";

interface BusinessDetailModalProps {
  business: PortfolioBusiness | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: { notes: string; keyMetrics: { label: string; value: string }[] }) => void;
}

export function BusinessDetailModal({
  business,
  open,
  onOpenChange,
  onSave,
}: BusinessDetailModalProps) {
  const [notes, setNotes] = useState("");
  const [editableMetrics, setEditableMetrics] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    if (business) {
      setNotes(business.notes);
      setEditableMetrics(business.keyMetrics.map((m) => ({ ...m })));
    }
  }, [business]);

  const handleMetricChange = useCallback(
    (idx: number, value: string) => {
      setEditableMetrics((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], value };
        return next;
      });
    },
    []
  );

  const handleSave = useCallback(() => {
    if (!business) return;
    onSave(business.id, { notes, keyMetrics: editableMetrics });
    onOpenChange(false);
  }, [business, notes, editableMetrics, onSave, onOpenChange]);

  if (!business) return null;

  const statusInfo = PROJECT_STATUS[business.status];
  const categoryInfo = PROJECT_CATEGORY[business.category];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {business.name}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusInfo?.color ?? "bg-gray-100 text-gray-500"}`}
            >
              {statusInfo?.label ?? business.status}
            </span>
          </DialogTitle>
          <DialogDescription>{business.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">카테고리</p>
              <p className="font-medium flex items-center gap-1.5 mt-0.5">
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ backgroundColor: categoryInfo?.color ?? "#6B7280" }}
                />
                {categoryInfo?.label ?? business.category}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">담당자</p>
              <p className="font-medium mt-0.5">{business.assignee}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground text-xs">예상 매출 기여</p>
              <p className="font-medium mt-0.5">{business.estimatedRevenue}</p>
            </div>
          </div>

          <Separator />

          {/* Editable KPI Metrics */}
          <div>
            <p className="text-sm font-medium mb-2">핵심 KPI (편집 가능)</p>
            <div className="space-y-2">
              {editableMetrics.map((metric, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-28 shrink-0">
                    {metric.label}
                  </span>
                  <Input
                    value={metric.value}
                    onChange={(e) =>
                      handleMetricChange(idx, e.target.value)
                    }
                    className="h-7 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Milestones */}
          <div>
            <p className="text-sm font-medium mb-2">주요 마일스톤</p>
            <div className="space-y-1.5">
              {business.milestones.map((ms) => (
                <div
                  key={ms.id}
                  className="flex items-center gap-2 text-xs"
                >
                  {ms.completed ? (
                    <Check className="size-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="size-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span
                    className={`w-20 shrink-0 ${
                      ms.completed ? "text-muted-foreground line-through" : ""
                    }`}
                  >
                    {format(parseISO(ms.date), "yyyy.MM.dd", { locale: ko })}
                  </span>
                  <span
                    className={
                      ms.completed ? "text-muted-foreground line-through" : ""
                    }
                  >
                    {ms.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Editable Notes */}
          <div>
            <p className="text-sm font-medium mb-2">메모 (편집 가능)</p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="이 사업에 대한 메모를 입력하세요..."
              className="text-xs min-h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
          <Button onClick={handleSave}>
            <Save className="size-3.5 mr-1" />
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
