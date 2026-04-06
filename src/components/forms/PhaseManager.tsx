"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PROJECT_STATUS } from "@/utils/constants";
import type { ProjectPhase } from "@/types/database";
import type { ProjectStatus } from "@/utils/constants";
import { Plus, Trash2, GripVertical, Check, Diamond } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

type PhaseData = Omit<ProjectPhase, "id" | "project_id" | "created_at"> & {
  id?: string;
};

interface PhaseManagerProps {
  phases: PhaseData[];
  projectStartDate: string;
  projectEndDate: string;
  onChange: (phases: PhaseData[]) => void;
  readOnly?: boolean;
}

const EMPTY_PHASE: Omit<PhaseData, "sort_order"> = {
  name: "",
  type: "phase",
  start_date: "",
  end_date: "",
  progress: 0,
  status: "planning" as ProjectStatus,
};

export function PhaseManager({
  phases,
  projectStartDate,
  projectEndDate,
  onChange,
  readOnly = false,
}: PhaseManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Omit<PhaseData, "sort_order">>(
    EMPTY_PHASE
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const sortedPhases = [...phases].sort((a, b) => a.sort_order - b.sort_order);

  const openAddDialog = () => {
    const lastPhase = sortedPhases[sortedPhases.length - 1];
    setEditingIndex(null);
    setEditForm({
      ...EMPTY_PHASE,
      start_date: lastPhase?.end_date
        ? format(
            new Date(
              new Date(lastPhase.end_date).getTime() + 24 * 60 * 60 * 1000
            ),
            "yyyy-MM-dd"
          )
        : projectStartDate,
      end_date: projectEndDate,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (index: number) => {
    const phase = sortedPhases[index];
    setEditingIndex(index);
    setEditForm({
      name: phase.name,
      type: phase.type,
      start_date: phase.start_date,
      end_date: phase.end_date,
      progress: phase.progress,
      status: phase.status,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const updated = [...sortedPhases];
    if (editingIndex !== null) {
      updated[editingIndex] = { ...updated[editingIndex], ...editForm };
    } else {
      updated.push({ ...editForm, sort_order: updated.length });
    }
    onChange(updated.map((p, i) => ({ ...p, sort_order: i })));
    setDialogOpen(false);
  };

  const handleDelete = (index: number) => {
    const updated = sortedPhases.filter((_, i) => i !== index);
    onChange(updated.map((p, i) => ({ ...p, sort_order: i })));
  };

  const handleProgressChange = (index: number, progress: number) => {
    const updated = [...sortedPhases];
    updated[index] = { ...updated[index], progress };
    if (progress === 100) updated[index].status = "completed";
    else if (progress > 0) updated[index].status = "development";
    onChange(updated.map((p, i) => ({ ...p, sort_order: i })));
  };

  const handleMilestoneToggle = (index: number) => {
    const updated = [...sortedPhases];
    const current = updated[index];
    const isDone = current.progress === 100;
    updated[index] = {
      ...current,
      progress: isDone ? 0 : 100,
      status: isDone ? "planning" : "completed",
    };
    onChange(updated.map((p, i) => ({ ...p, sort_order: i })));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const updated = [...sortedPhases];
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    onChange(updated.map((p, i) => ({ ...p, sort_order: i })));
  };

  const totalProgress =
    sortedPhases.length > 0
      ? Math.round(
          sortedPhases.reduce((acc, p) => acc + p.progress, 0) /
            sortedPhases.length
        )
      : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-sm">상세 일정</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            전체 진행률: {totalProgress}% | {sortedPhases.length}개 단계
          </p>
        </div>
        {!readOnly && (
          <Button variant="outline" size="sm" onClick={openAddDialog}>
            <Plus size={14} className="mr-1" />
            단계 추가
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {/* 전체 진행률 바 */}
        <div className="mb-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {sortedPhases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            등록된 단계가 없습니다
            {!readOnly && (
              <p className="mt-1 text-xs">
                &quot;단계 추가&quot; 버튼으로 일정을 등록하세요
              </p>
            )}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="phases" isDropDisabled={readOnly}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {sortedPhases.map((phase, index) => (
                    <Draggable
                      key={phase.id ?? `phase-${index}`}
                      draggableId={phase.id ?? `phase-${index}`}
                      index={index}
                      isDragDisabled={readOnly}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "rounded-lg border bg-card transition-shadow",
                            snapshot.isDragging && "shadow-lg ring-2 ring-primary/20",
                            phase.type === "milestone" && "border-dashed border-amber-300 bg-amber-50/30"
                          )}
                        >
                          {phase.type === "milestone" ? (
                            /* ===== 마일스톤 행: 한 줄, 완료 토글 ===== */
                            <div className="flex items-center gap-2 px-3 py-2.5">
                              {!readOnly && (
                                <div
                                  {...provided.dragHandleProps}
                                  className="shrink-0 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-accent text-muted-foreground"
                                >
                                  <GripVertical size={14} />
                                </div>
                              )}

                              {/* 완료 토글 */}
                              <button
                                onClick={() => !readOnly && handleMilestoneToggle(index)}
                                disabled={readOnly}
                                className={cn(
                                  "shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                  phase.progress === 100
                                    ? "bg-amber-500 border-amber-500 text-white"
                                    : "border-amber-300 hover:border-amber-400"
                                )}
                              >
                                {phase.progress === 100 && <Check size={12} strokeWidth={3} />}
                              </button>

                              {/* 마일스톤 정보 */}
                              <Diamond size={12} className="text-amber-500 shrink-0" />
                              <div
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => !readOnly && openEditDialog(index)}
                              >
                                <span className={cn(
                                  "text-sm font-medium",
                                  phase.progress === 100 && "line-through text-muted-foreground"
                                )}>
                                  {phase.name}
                                </span>
                              </div>
                              <span className="text-[11px] text-muted-foreground shrink-0">
                                {format(parseISO(phase.start_date), "MM.dd", { locale: ko })}
                              </span>
                              <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-medium",
                                phase.progress === 100
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 text-gray-500"
                              )}>
                                {phase.progress === 100 ? "완료" : "예정"}
                              </span>

                              {!readOnly && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDelete(index)}
                                >
                                  <Trash2 size={13} />
                                </Button>
                              )}
                            </div>
                          ) : (
                            /* ===== 단계(Phase) 행: 2줄 구조 ===== */
                            <>
                              <div className="flex items-center gap-2 px-3 pt-3 pb-1">
                                {!readOnly && (
                                  <div
                                    {...provided.dragHandleProps}
                                    className="shrink-0 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-accent text-muted-foreground"
                                  >
                                    <GripVertical size={14} />
                                  </div>
                                )}

                                <div
                                  className="flex-1 min-w-0 cursor-pointer"
                                  onClick={() => !readOnly && openEditDialog(index)}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium truncate">
                                      {phase.name}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-[10px] shrink-0",
                                        PROJECT_STATUS[phase.status]?.color
                                      )}
                                    >
                                      {PROJECT_STATUS[phase.status]?.label}
                                    </Badge>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {format(parseISO(phase.start_date), "MM.dd", { locale: ko })}
                                    {" ~ "}
                                    {format(parseISO(phase.end_date), "MM.dd", { locale: ko })}
                                  </p>
                                </div>

                                {!readOnly && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(index)}
                                  >
                                    <Trash2 size={13} />
                                  </Button>
                                )}
                              </div>

                              <div className="flex items-center gap-3 px-3 pb-3 pt-1">
                                {readOnly ? (
                                  <>
                                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-primary rounded-full"
                                        style={{ width: `${phase.progress}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
                                      {phase.progress}%
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      step={5}
                                      value={phase.progress}
                                      onChange={(e) =>
                                        handleProgressChange(index, Number(e.target.value))
                                      }
                                      className="flex-1 h-1.5 accent-primary cursor-pointer"
                                    />
                                    <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
                                      {phase.progress}%
                                    </span>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* 추가/수정 다이얼로그 */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">
                {editingIndex !== null ? "단계 수정" : "단계 추가"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>단계명 *</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="예: 기획, 개발, QA, 납품"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>유형</Label>
                  <Select
                    value={editForm.type}
                    onValueChange={(v) => {
                      if (v)
                        setEditForm((prev) => ({
                          ...prev,
                          type: v as "phase" | "milestone",
                        }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {editForm.type === "milestone" ? "마일스톤" : "단계"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phase">단계</SelectItem>
                      <SelectItem value="milestone">마일스톤</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>상태</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(v) => {
                      if (v)
                        setEditForm((prev) => ({
                          ...prev,
                          status: v as ProjectStatus,
                        }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {PROJECT_STATUS[editForm.status]?.label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROJECT_STATUS).map(
                        ([key, { label }]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {editForm.type === "milestone" ? (
                <div className="space-y-2">
                  <Label>일자 *</Label>
                  <Input
                    type="date"
                    value={editForm.start_date}
                    min={projectStartDate}
                    max={projectEndDate}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        start_date: e.target.value,
                        end_date: e.target.value,
                      }))
                    }
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>시작일 *</Label>
                      <Input
                        type="date"
                        value={editForm.start_date}
                        min={projectStartDate}
                        max={projectEndDate}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            start_date: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>종료일 *</Label>
                      <Input
                        type="date"
                        value={editForm.end_date}
                        min={editForm.start_date || projectStartDate}
                        max={projectEndDate}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            end_date: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>진행률: {editForm.progress}%</Label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={editForm.progress}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          progress: Number(e.target.value),
                        }))
                      }
                      className="w-full h-2 accent-primary cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                취소
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  !editForm.name || !editForm.start_date || !editForm.end_date
                }
              >
                {editingIndex !== null ? "수정" : "추가"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
