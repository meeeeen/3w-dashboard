"use client";

import { useState, useEffect, useCallback } from "react";
import { PORTFOLIO_BUSINESSES, type PortfolioBusiness } from "@/data/portfolio-seed";
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary";
import { BusinessPortfolioGrid } from "@/components/portfolio/BusinessPortfolioGrid";
import { PortfolioTimeline } from "@/components/portfolio/PortfolioTimeline";
import { BusinessDetailModal } from "@/components/portfolio/BusinessDetailModal";

const STORAGE_KEY = "3w-portfolio-data";

function loadPortfolioData(): PortfolioBusiness[] {
  if (typeof window === "undefined") return PORTFOLIO_BUSINESSES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return PORTFOLIO_BUSINESSES;
    const saved: Record<string, { notes: string; keyMetrics: { label: string; value: string }[] }> =
      JSON.parse(raw);
    return PORTFOLIO_BUSINESSES.map((biz) => {
      const override = saved[biz.id];
      if (!override) return biz;
      return {
        ...biz,
        notes: override.notes ?? biz.notes,
        keyMetrics: override.keyMetrics ?? biz.keyMetrics,
      };
    });
  } catch {
    return PORTFOLIO_BUSINESSES;
  }
}

function savePortfolioData(businesses: PortfolioBusiness[]) {
  if (typeof window === "undefined") return;
  const toSave: Record<string, { notes: string; keyMetrics: { label: string; value: string }[] }> = {};
  businesses.forEach((biz) => {
    const original = PORTFOLIO_BUSINESSES.find((b) => b.id === biz.id);
    const hasChanges =
      biz.notes !== (original?.notes ?? "") ||
      JSON.stringify(biz.keyMetrics) !== JSON.stringify(original?.keyMetrics ?? []);
    if (hasChanges) {
      toSave[biz.id] = { notes: biz.notes, keyMetrics: biz.keyMetrics };
    }
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

export default function PortfolioPage() {
  const [businesses, setBusinesses] = useState<PortfolioBusiness[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<PortfolioBusiness | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setBusinesses(loadPortfolioData());
    setIsLoaded(true);
  }, []);

  const handleSelect = useCallback((biz: PortfolioBusiness) => {
    setSelectedBiz(biz);
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(
    (id: string, updates: { notes: string; keyMetrics: { label: string; value: string }[] }) => {
      setBusinesses((prev) => {
        const next = prev.map((b) =>
          b.id === id ? { ...b, notes: updates.notes, keyMetrics: updates.keyMetrics } : b
        );
        savePortfolioData(next);
        return next;
      });
    },
    []
  );

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 상단 요약 */}
      <PortfolioSummary businesses={businesses} />

      {/* 사업 포트폴리오 카드 그리드 */}
      <BusinessPortfolioGrid businesses={businesses} onSelect={handleSelect} />

      {/* 타임라인 */}
      <PortfolioTimeline businesses={businesses} />

      {/* 상세 모달 */}
      <BusinessDetailModal
        business={selectedBiz}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
      />
    </div>
  );
}
