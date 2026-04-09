"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { PROJECT_STATUS, PROJECT_CATEGORY } from "@/utils/constants";
import type { PortfolioBusiness } from "@/data/portfolio-seed";

interface BusinessPortfolioGridProps {
  businesses: PortfolioBusiness[];
  onSelect: (business: PortfolioBusiness) => void;
}

const statusBorderColors: Record<string, string> = {
  planning: "border-l-purple-400",
  development: "border-l-blue-400",
  operation: "border-l-green-400",
  hold: "border-l-gray-300",
  completed: "border-l-emerald-400",
  progress: "border-l-cyan-400",
  exploration: "border-l-amber-400",
};

export function BusinessPortfolioGrid({
  businesses,
  onSelect,
}: BusinessPortfolioGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {businesses.map((biz) => {
        const statusInfo = PROJECT_STATUS[biz.status];
        const categoryInfo = PROJECT_CATEGORY[biz.category];
        const borderClass = statusBorderColors[biz.status] ?? "border-l-gray-300";

        return (
          <Card
            key={biz.id}
            className={`cursor-pointer border-l-4 ${borderClass} hover:ring-2 hover:ring-ring/30 transition-all`}
            onClick={() => onSelect(biz)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{biz.name}</CardTitle>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusInfo?.color ?? "bg-gray-100 text-gray-500"}`}
                >
                  {statusInfo?.label ?? biz.status}
                </span>
              </div>
              <CardDescription className="line-clamp-2">
                {biz.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Category */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ backgroundColor: categoryInfo?.color ?? "#6B7280" }}
                />
                <span className="text-xs text-muted-foreground">
                  {categoryInfo?.label ?? biz.category}
                </span>
              </div>

              {/* Key Metrics */}
              {biz.keyMetrics.length > 0 && (
                <div className="space-y-1">
                  {biz.keyMetrics.slice(0, 2).map((metric, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-muted-foreground">
                        {metric.label}
                      </span>
                      <span className="font-medium">{metric.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                <span>담당: {biz.assignee}</span>
                <span>{biz.estimatedRevenue}</span>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
