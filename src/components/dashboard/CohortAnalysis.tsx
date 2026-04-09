"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "3w-cohort-data";

interface CohortRow {
  month: string;
  initialUsers: number;
  retention: (number | null)[]; // M0-M5, null = not yet available
}

const DEFAULT_COHORTS: CohortRow[] = [
  { month: "2025-11", initialUsers: 5, retention: [100, 80, 60, 60, 60, 60] },
  { month: "2025-12", initialUsers: 3, retention: [100, 67, 67, 67, 67, null] },
  { month: "2026-01", initialUsers: 4, retention: [100, 75, 75, 75, null, null] },
  { month: "2026-02", initialUsers: 3, retention: [100, 100, 100, null, null, null] },
  { month: "2026-03", initialUsers: 3, retention: [100, 100, null, null, null, null] },
  { month: "2026-04", initialUsers: 4, retention: [100, null, null, null, null, null] },
];

function loadCohorts(): CohortRow[] {
  if (typeof window === "undefined") return DEFAULT_COHORTS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CohortRow[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return DEFAULT_COHORTS;
}

function getRetentionColor(pct: number | null): string {
  if (pct === null) return "";
  if (pct >= 90) return "bg-green-600 text-white";
  if (pct >= 70) return "bg-green-500 text-white";
  if (pct >= 50) return "bg-green-400 text-white";
  if (pct >= 30) return "bg-green-300 text-green-900";
  if (pct >= 10) return "bg-green-200 text-green-900";
  return "bg-green-100 text-green-900";
}

function getAbsoluteCount(initialUsers: number, pct: number | null): number | null {
  if (pct === null) return null;
  return Math.round((pct / 100) * initialUsers);
}

export function CohortAnalysis() {
  const [cohorts, setCohorts] = useState<CohortRow[]>(DEFAULT_COHORTS);
  const [mounted, setMounted] = useState(false);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    setCohorts(loadCohorts());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cohorts));
    }
  }, [cohorts, mounted]);

  const handleStartEdit = (rowIdx: number, colIdx: number, currentValue: number | null) => {
    if (currentValue === null) return;
    setEditingCell({ row: rowIdx, col: colIdx });
    setEditValue(String(currentValue));
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;
    const num = Math.min(100, Math.max(0, Number(editValue) || 0));
    const updated = cohorts.map((row, ri) => {
      if (ri !== editingCell.row) return row;
      const newRetention = [...row.retention];
      newRetention[editingCell.col] = num;
      return { ...row, retention: newRetention };
    });
    setCohorts(updated);
    setEditingCell(null);
  };

  // Calculate average retention per month column
  const avgRetention: (number | null)[] = [];
  for (let col = 0; col < 6; col++) {
    const values = cohorts
      .map((r) => r.retention[col])
      .filter((v): v is number => v !== null);
    avgRetention.push(values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null);
  }

  const months = ["M0", "M1", "M2", "M3", "M4", "M5"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>위팀 코호트 리텐션 분석</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground border-b">
                코호트
              </th>
              <th className="text-center py-2 px-2 text-xs font-medium text-muted-foreground border-b">
                가입자
              </th>
              {months.map((m) => (
                <th
                  key={m}
                  className="text-center py-2 px-2 text-xs font-medium text-muted-foreground border-b"
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((row, ri) => (
              <tr key={row.month}>
                <td className="py-1.5 px-2 text-xs font-medium border-b">
                  {row.month}
                </td>
                <td className="py-1.5 px-2 text-center text-xs text-muted-foreground border-b">
                  {row.initialUsers}명
                </td>
                {row.retention.map((pct, ci) => {
                  const isEditing =
                    editingCell?.row === ri && editingCell?.col === ci;
                  const absCount = getAbsoluteCount(row.initialUsers, pct);

                  if (pct === null) {
                    return (
                      <td
                        key={ci}
                        className="py-1.5 px-1 text-center border-b"
                      >
                        <span className="text-xs text-muted-foreground">--</span>
                      </td>
                    );
                  }

                  if (isEditing) {
                    return (
                      <td
                        key={ci}
                        className="py-1.5 px-1 text-center border-b"
                      >
                        <input
                          autoFocus
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleSaveEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit();
                            if (e.key === "Escape") setEditingCell(null);
                          }}
                          className="w-14 h-6 text-center text-xs rounded border border-input bg-background outline-none"
                          min={0}
                          max={100}
                        />
                      </td>
                    );
                  }

                  return (
                    <td
                      key={ci}
                      className="py-1.5 px-1 text-center border-b"
                    >
                      <button
                        onClick={() => handleStartEdit(ri, ci, pct)}
                        className={cn(
                          "inline-flex flex-col items-center justify-center rounded px-2 py-1 min-w-[48px] cursor-pointer transition-opacity hover:opacity-80",
                          getRetentionColor(pct)
                        )}
                      >
                        <span className="text-xs font-semibold">{pct}%</span>
                        <span className="text-[10px] opacity-75">
                          {absCount}명
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Average row */}
            <tr className="bg-muted/30">
              <td className="py-1.5 px-2 text-xs font-medium">평균</td>
              <td className="py-1.5 px-2 text-center text-xs text-muted-foreground">
                --
              </td>
              {avgRetention.map((avg, ci) => (
                <td key={ci} className="py-1.5 px-1 text-center">
                  {avg !== null ? (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded px-2 py-1 min-w-[48px] text-xs font-semibold",
                        getRetentionColor(avg)
                      )}
                    >
                      {avg}%
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">--</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
