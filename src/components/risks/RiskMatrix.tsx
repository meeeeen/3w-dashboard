"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Risk } from "@/data/risk-seed";
import { cn } from "@/lib/utils";

interface RiskMatrixProps {
  risks: Risk[];
}

function getCellColor(prob: number, impact: number): string {
  const score = prob * impact;
  if (score >= 16) return "bg-red-500/80";
  if (score >= 9) return "bg-orange-400/70";
  if (score >= 4) return "bg-yellow-400/60";
  return "bg-green-400/50";
}

function getCellTextColor(prob: number, impact: number): string {
  const score = prob * impact;
  if (score >= 16) return "text-white";
  return "text-gray-900";
}

const LABELS = ["매우 낮음", "낮음", "보통", "높음", "매우 높음"];

export function RiskMatrix({ risks }: RiskMatrixProps) {
  const [selectedCell, setSelectedCell] = useState<{ prob: number; impact: number } | null>(null);

  // Group risks by (probability, impact)
  const grouped: Record<string, Risk[]> = {};
  for (const risk of risks) {
    if (risk.status === "해결") continue;
    const key = `${risk.probability}-${risk.impact}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(risk);
  }

  const selectedRisks = selectedCell
    ? grouped[`${selectedCell.prob}-${selectedCell.impact}`] ?? []
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>리스크 매트릭스 (확률 x 영향도)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* Matrix */}
          <div className="flex-1">
            <div className="flex">
              {/* Y-axis label */}
              <div className="flex flex-col items-center justify-center mr-1">
                <span className="text-[10px] text-muted-foreground [writing-mode:vertical-lr] rotate-180">
                  발생 확률
                </span>
              </div>
              <div className="flex-1">
                {/* Grid rows: probability 5 down to 1 */}
                {[5, 4, 3, 2, 1].map((prob) => (
                  <div key={prob} className="flex items-stretch">
                    <div className="w-12 flex items-center justify-end pr-1.5 shrink-0">
                      <span className="text-[10px] text-muted-foreground">{prob}-{LABELS[prob - 1]}</span>
                    </div>
                    {[1, 2, 3, 4, 5].map((impact) => {
                      const key = `${prob}-${impact}`;
                      const cellRisks = grouped[key] ?? [];
                      const isSelected =
                        selectedCell?.prob === prob && selectedCell?.impact === impact;
                      return (
                        <button
                          key={key}
                          onClick={() =>
                            setSelectedCell(
                              isSelected ? null : { prob, impact }
                            )
                          }
                          className={cn(
                            "flex-1 aspect-square flex items-center justify-center border border-white/50 rounded-sm m-0.5 min-h-[36px] transition-all",
                            getCellColor(prob, impact),
                            isSelected && "ring-2 ring-foreground ring-offset-1",
                            cellRisks.length > 0 && "cursor-pointer"
                          )}
                        >
                          {cellRisks.length > 0 && (
                            <div
                              className={cn(
                                "rounded-full flex items-center justify-center font-bold text-xs",
                                getCellTextColor(prob, impact),
                                cellRisks.length === 1
                                  ? "w-5 h-5"
                                  : cellRisks.length === 2
                                  ? "w-6 h-6"
                                  : "w-7 h-7"
                              )}
                              style={{
                                backgroundColor: "rgba(0,0,0,0.15)",
                              }}
                            >
                              {cellRisks.length}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
                {/* X-axis labels */}
                <div className="flex">
                  <div className="w-12 shrink-0" />
                  {[1, 2, 3, 4, 5].map((impact) => (
                    <div key={impact} className="flex-1 text-center m-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {impact}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-0.5">
                  <span className="text-[10px] text-muted-foreground">영향도</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected cell detail */}
        {selectedCell && selectedRisks.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              확률 {selectedCell.prob} x 영향도 {selectedCell.impact} = 점수{" "}
              {selectedCell.prob * selectedCell.impact}
            </p>
            <div className="space-y-1.5">
              {selectedRisks.map((risk) => (
                <div
                  key={risk.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {risk.id}
                  </span>
                  <span className="font-medium">{risk.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({risk.project})
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {risk.owner}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
