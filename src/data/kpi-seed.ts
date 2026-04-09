// 플랫폼 KPI 시드 데이터 (발표용 데모 데이터)

export interface DailyMetric {
  date: string;
  value: number;
}

export interface PlatformKpi {
  id: string;
  name: string;
  description: string;
  status: "live" | "development" | "hold";
  metrics: {
    dau?: number;
    wau?: number;
    mau?: number;
    totalUsers?: number;
    transactions?: number;
    transactionAmount?: number;
    commissionRevenue?: number;
    devProgress?: number;
    partnerCount?: number;
  };
  trend: DailyMetric[];
  userGrowth: DailyMetric[];
}

// 위팀 (WiTiM) — 내부 사용 중, 4-5월 정식 오픈 예정
const witimTrend: DailyMetric[] = [
  { date: "2026-03-01", value: 8 },
  { date: "2026-03-08", value: 10 },
  { date: "2026-03-15", value: 12 },
  { date: "2026-03-22", value: 14 },
  { date: "2026-03-29", value: 15 },
  { date: "2026-04-01", value: 16 },
  { date: "2026-04-05", value: 18 },
  { date: "2026-04-09", value: 18 },
];

const witimUserGrowth: DailyMetric[] = [
  { date: "2025-11", value: 5 },
  { date: "2025-12", value: 8 },
  { date: "2026-01", value: 12 },
  { date: "2026-02", value: 15 },
  { date: "2026-03", value: 18 },
  { date: "2026-04", value: 22 },
];

// wDot — 보류 상태이므로 데이터 적음
const wdotTrend: DailyMetric[] = [
  { date: "2026-03-01", value: 0 },
  { date: "2026-03-15", value: 0 },
  { date: "2026-04-01", value: 0 },
  { date: "2026-04-09", value: 0 },
];

const wdotUserGrowth: DailyMetric[] = [
  { date: "2026-01", value: 0 },
  { date: "2026-02", value: 0 },
  { date: "2026-03", value: 0 },
  { date: "2026-04", value: 0 },
];

export const PLATFORM_KPIS: PlatformKpi[] = [
  {
    id: "witim",
    name: "WiTiM (위팀)",
    description: "B2B 통합 업무관리 플랫폼",
    status: "live",
    metrics: {
      dau: 18,
      wau: 22,
      mau: 22,
      totalUsers: 22,
    },
    trend: witimTrend,
    userGrowth: witimUserGrowth,
  },
  {
    id: "wdot",
    name: "wDot",
    description: "거래 기반 수수료 플랫폼",
    status: "hold",
    metrics: {
      totalUsers: 0,
      transactions: 0,
      transactionAmount: 0,
      commissionRevenue: 0,
    },
    trend: wdotTrend,
    userGrowth: wdotUserGrowth,
  },
  {
    id: "medical",
    name: "의료통합 플랫폼",
    description: "의료 CRM / EMR / HIS / 마케팅 통합",
    status: "development",
    metrics: {
      devProgress: 15,
      partnerCount: 0,
    },
    trend: [],
    userGrowth: [],
  },
];
