"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ArrowUpDown } from "lucide-react";
import {
  RISK_CATEGORIES,
  RISK_STATUSES,
  type Risk,
  type RiskCategory,
  type RiskStatus,
} from "@/data/risk-seed";
import { cn } from "@/lib/utils";

interface RiskTableProps {
  risks: Risk[];
  onRisksChange: (risks: Risk[]) => void;
}

type SortField = "score" | "probability" | "impact";
type SortDir = "asc" | "desc";

function EditableCell({
  value,
  onSave,
  type = "text",
  options,
  className,
}: {
  value: string | number;
  onSave: (val: string) => void;
  type?: "text" | "number" | "select";
  options?: string[];
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const handleSave = useCallback(() => {
    setEditing(false);
    if (draft !== String(value)) {
      onSave(draft);
    }
  }, [draft, value, onSave]);

  if (!editing) {
    return (
      <span
        onClick={() => {
          setDraft(String(value));
          setEditing(true);
        }}
        className={cn(
          "cursor-pointer hover:bg-muted/80 px-1 py-0.5 rounded text-sm inline-block min-w-[24px]",
          className
        )}
      >
        {value}
      </span>
    );
  }

  if (type === "select" && options) {
    return (
      <select
        autoFocus
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
        }}
        onBlur={() => {
          setEditing(false);
          if (draft !== String(value)) onSave(draft);
        }}
        className="h-7 rounded border border-input bg-background px-1 text-sm outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  return (
    <Input
      autoFocus
      type={type}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") setEditing(false);
      }}
      className={cn("h-7 w-full min-w-[40px]", type === "number" && "w-14")}
      min={type === "number" ? 1 : undefined}
      max={type === "number" ? 5 : undefined}
    />
  );
}

function getScoreColor(score: number) {
  if (score >= 16) return "bg-red-100 text-red-700 font-bold";
  if (score >= 9) return "bg-orange-100 text-orange-700 font-semibold";
  if (score >= 4) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

function getStatusColor(status: RiskStatus) {
  switch (status) {
    case "식별": return "bg-blue-100 text-blue-700";
    case "모니터링": return "bg-yellow-100 text-yellow-700";
    case "해결": return "bg-green-100 text-green-700";
    case "수용": return "bg-gray-100 text-gray-700";
  }
}

export function RiskTable({ risks, onRisksChange }: RiskTableProps) {
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const projects = Array.from(new Set(risks.map((r) => r.project)));

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const filteredRisks = risks
    .filter((r) => filterProject === "all" || r.project === filterProject)
    .filter((r) => filterCategory === "all" || r.category === filterCategory)
    .filter((r) => filterStatus === "all" || r.status === filterStatus)
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      return sortDir === "desc" ? Number(bVal) - Number(aVal) : Number(aVal) - Number(bVal);
    });

  const updateRisk = (id: string, field: keyof Risk, value: string) => {
    const updated = risks.map((r) => {
      if (r.id !== id) return r;
      const newRisk = { ...r, [field]: field === "probability" || field === "impact" ? Number(value) : value };
      if (field === "probability" || field === "impact") {
        newRisk.score = newRisk.probability * newRisk.impact;
      }
      return newRisk;
    });
    onRisksChange(updated);
  };

  const addRisk = () => {
    const nextId = `R-${String(risks.length + 1).padStart(3, "0")}`;
    const newRisk: Risk = {
      id: nextId,
      project: "",
      name: "새 리스크",
      category: "기술",
      probability: 3,
      impact: 3,
      score: 9,
      strategy: "",
      status: "식별",
      owner: "",
    };
    onRisksChange([...risks, newRisk]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>리스크 레지스터</CardTitle>
          <Button onClick={addRisk} size="sm">
            <Plus size={14} className="mr-1" />
            리스크 추가
          </Button>
        </div>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="h-7 rounded border border-input bg-background px-2 text-xs outline-none"
          >
            <option value="all">전체 프로젝트</option>
            {projects.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-7 rounded border border-input bg-background px-2 text-xs outline-none"
          >
            <option value="all">전체 카테고리</option>
            {RISK_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-7 rounded border border-input bg-background px-2 text-xs outline-none"
          >
            <option value="all">전체 상태</option>
            {RISK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>프로젝트</TableHead>
              <TableHead>리스크명</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("probability")}
              >
                <span className="flex items-center gap-1">
                  확률
                  <ArrowUpDown size={12} />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("impact")}
              >
                <span className="flex items-center gap-1">
                  영향도
                  <ArrowUpDown size={12} />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("score")}
              >
                <span className="flex items-center gap-1">
                  점수
                  <ArrowUpDown size={12} />
                </span>
              </TableHead>
              <TableHead>대응 전략</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>담당자</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRisks.map((risk) => (
              <TableRow key={risk.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {risk.id}
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={risk.project}
                    onSave={(v) => updateRisk(risk.id, "project", v)}
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={risk.name}
                    onSave={(v) => updateRisk(risk.id, "name", v)}
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={risk.category}
                    type="select"
                    options={[...RISK_CATEGORIES]}
                    onSave={(v) => updateRisk(risk.id, "category", v)}
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={risk.probability}
                    type="number"
                    onSave={(v) => {
                      const n = Math.min(5, Math.max(1, Number(v)));
                      updateRisk(risk.id, "probability", String(n));
                    }}
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={risk.impact}
                    type="number"
                    onSave={(v) => {
                      const n = Math.min(5, Math.max(1, Number(v)));
                      updateRisk(risk.id, "impact", String(n));
                    }}
                  />
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center justify-center rounded px-2 py-0.5 text-xs",
                      getScoreColor(risk.score)
                    )}
                  >
                    {risk.score}
                  </span>
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <EditableCell
                    value={risk.strategy}
                    onSave={(v) => updateRisk(risk.id, "strategy", v)}
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={risk.status}
                    type="select"
                    options={[...RISK_STATUSES]}
                    onSave={(v) => updateRisk(risk.id, "status", v)}
                    className={cn(
                      "rounded px-1.5 py-0.5 text-xs",
                      getStatusColor(risk.status)
                    )}
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={risk.owner}
                    onSave={(v) => updateRisk(risk.id, "owner", v)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filteredRisks.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  해당 조건의 리스크가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
