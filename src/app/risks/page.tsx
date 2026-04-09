"use client";

import { useState, useEffect } from "react";
import { RiskSummary } from "@/components/risks/RiskSummary";
import { RiskMatrix } from "@/components/risks/RiskMatrix";
import { RiskTable } from "@/components/risks/RiskTable";
import { SEED_RISKS, type Risk } from "@/data/risk-seed";

const STORAGE_KEY = "3w-risk-register";

function loadRisks(): Risk[] {
  if (typeof window === "undefined") return SEED_RISKS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Risk[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return SEED_RISKS;
}

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>(SEED_RISKS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRisks(loadRisks());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(risks));
    }
  }, [risks, mounted]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">리스크 레지스터</h1>
        <p className="text-sm text-muted-foreground mt-1">
          프로젝트 리스크 식별, 평가, 대응 관리
        </p>
      </div>

      <RiskSummary risks={risks} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RiskMatrix risks={risks} />
        {/* Summary stats card */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 ring-1 ring-foreground/10">
            <h3 className="text-sm font-medium mb-3">카테고리별 분포</h3>
            <div className="space-y-2">
              {["기술", "일정", "인력", "비용", "외부"].map((cat) => {
                const count = risks.filter((r) => r.category === cat && r.status !== "해결").length;
                const maxScore = Math.max(
                  ...risks.filter((r) => r.category === cat && r.status !== "해결").map((r) => r.score),
                  0
                );
                return (
                  <div key={cat} className="flex items-center justify-between text-sm">
                    <span>{cat}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{count}건</span>
                      <span className="text-xs text-muted-foreground">
                        최고점수: {maxScore}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 ring-1 ring-foreground/10">
            <h3 className="text-sm font-medium mb-3">상태별 분포</h3>
            <div className="space-y-2">
              {["식별", "모니터링", "해결", "수용"].map((status) => {
                const count = risks.filter((r) => r.status === status).length;
                const colors: Record<string, string> = {
                  "식별": "bg-blue-400",
                  "모니터링": "bg-yellow-400",
                  "해결": "bg-green-400",
                  "수용": "bg-gray-400",
                };
                const pct = risks.length > 0 ? (count / risks.length) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{status}</span>
                      <span className="text-muted-foreground">{count}건</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[status]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <RiskTable risks={risks} onRisksChange={setRisks} />
    </div>
  );
}
