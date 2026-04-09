"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

const STORAGE_KEY = "3w-okr-data";

interface KeyResult {
  id: string;
  name: string;
  progress: number;
}

interface Objective {
  id: string;
  title: string;
  keyResults: KeyResult[];
}

const DEFAULT_OKRS: Objective[] = [
  {
    id: "o1",
    title: "O1: 위팀(WiTiM) 정식 오픈",
    keyResults: [
      { id: "o1-kr1", name: "데스크탑 웹 오픈 (4월)", progress: 70 },
      { id: "o1-kr2", name: "데스크탑 앱 + 모바일 앱 오픈 (5월)", progress: 30 },
      { id: "o1-kr3", name: "DAU 100명 달성", progress: 18 },
    ],
  },
  {
    id: "o2",
    title: "O2: 외주 매출 목표 달성",
    keyResults: [
      { id: "o2-kr1", name: "Coffee 키오스크 납품 (4/15)", progress: 85 },
      { id: "o2-kr2", name: "성형 숨고 납품 (4/15)", progress: 85 },
      { id: "o2-kr3", name: "분기 외주 매출 1.5억", progress: 60 },
    ],
  },
  {
    id: "o3",
    title: "O3: 신규 사업 기반 구축",
    keyResults: [
      { id: "o3-kr1", name: "K-주전부리 MOU 체결", progress: 50 },
      { id: "o3-kr2", name: "의료 마케팅 AI 프로토타입", progress: 10 },
      { id: "o3-kr3", name: "베테랑 앱 기획 완료", progress: 5 },
    ],
  },
];

function getProgressColor(progress: number) {
  if (progress > 70) return "bg-emerald-500";
  if (progress >= 30) return "bg-amber-500";
  return "bg-red-500";
}

function getProgressBgColor(progress: number) {
  if (progress > 70) return "bg-emerald-100";
  if (progress >= 30) return "bg-amber-100";
  return "bg-red-100";
}

function getProgressTextColor(progress: number) {
  if (progress > 70) return "text-emerald-700";
  if (progress >= 30) return "text-amber-700";
  return "text-red-700";
}

export function OkrTracker() {
  const [okrs, setOkrs] = useState<Objective[]>(DEFAULT_OKRS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Objective[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOkrs(parsed);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save to localStorage
  const saveOkrs = useCallback((updated: Objective[]) => {
    setOkrs(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleProgressClick = (krId: string, currentProgress: number) => {
    setEditingId(krId);
    setEditValue(String(currentProgress));
  };

  const handleProgressSave = (objectiveId: string, krId: string) => {
    const numValue = Math.min(100, Math.max(0, parseInt(editValue, 10) || 0));
    const updated = okrs.map((obj) => {
      if (obj.id !== objectiveId) return obj;
      return {
        ...obj,
        keyResults: obj.keyResults.map((kr) =>
          kr.id === krId ? { ...kr, progress: numValue } : kr
        ),
      };
    });
    saveOkrs(updated);
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, objectiveId: string, krId: string) => {
    if (e.key === "Enter") {
      handleProgressSave(objectiveId, krId);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  const overallProgress = Math.round(
    okrs.reduce((acc, obj) => {
      const objAvg =
        obj.keyResults.reduce((s, kr) => s + kr.progress, 0) / obj.keyResults.length;
      return acc + objAvg;
    }, 0) / okrs.length
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            <CardTitle>Q2 2026 OKR 트래커</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            전체 {overallProgress}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {okrs.map((obj) => {
          const objProgress = Math.round(
            obj.keyResults.reduce((s, kr) => s + kr.progress, 0) /
              obj.keyResults.length
          );
          return (
            <div key={obj.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">{obj.title}</h4>
                <span
                  className={`text-xs font-medium ${getProgressTextColor(objProgress)}`}
                >
                  {objProgress}%
                </span>
              </div>
              {/* Objective-level progress bar */}
              <div className={`h-1.5 rounded-full ${getProgressBgColor(objProgress)}`}>
                <div
                  className={`h-full rounded-full transition-all ${getProgressColor(objProgress)}`}
                  style={{ width: `${objProgress}%` }}
                />
              </div>
              {/* Key Results */}
              <div className="space-y-1.5 pl-2">
                {obj.keyResults.map((kr) => (
                  <div key={kr.id} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground flex-1 truncate">
                      {kr.name}
                    </span>
                    <div
                      className={`w-20 h-1.5 rounded-full shrink-0 ${getProgressBgColor(kr.progress)}`}
                    >
                      <div
                        className={`h-full rounded-full transition-all ${getProgressColor(kr.progress)}`}
                        style={{ width: `${kr.progress}%` }}
                      />
                    </div>
                    {editingId === kr.id ? (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleProgressSave(obj.id, kr.id)}
                        onKeyDown={(e) => handleKeyDown(e, obj.id, kr.id)}
                        className="w-12 text-xs text-right border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => handleProgressClick(kr.id, kr.progress)}
                        className={`w-10 text-xs text-right font-medium cursor-pointer hover:underline ${getProgressTextColor(kr.progress)}`}
                        title="클릭하여 수정"
                      >
                        {kr.progress}%
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
