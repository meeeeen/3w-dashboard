// 매출 시드 데이터 (발표용 데모 데이터)
// 올해 목표: 20억

export interface MonthlyRevenue {
  month: string;        // "2026-01" 형식
  label: string;        // "1월" 형식
  outsource: number;    // 외주 매출 (만원)
  platform: number;     // 자체 플랫폼 매출 (만원)
  government: number;   // 정부사업 매출 (만원)
  medical: number;      // 의료 매출 (만원)
}

export const MONTHLY_REVENUE: MonthlyRevenue[] = [
  { month: "2026-01", label: "1월", outsource: 2800, platform: 0, government: 0, medical: 0 },
  { month: "2026-02", label: "2월", outsource: 3200, platform: 0, government: 0, medical: 150 },
  { month: "2026-03", label: "3월", outsource: 4500, platform: 0, government: 0, medical: 300 },
  { month: "2026-04", label: "4월", outsource: 3800, platform: 0, government: 1200, medical: 450 },
  { month: "2026-05", label: "5월", outsource: 4200, platform: 200, government: 1500, medical: 600 },
  { month: "2026-06", label: "6월", outsource: 3500, platform: 500, government: 1800, medical: 800 },
  { month: "2026-07", label: "7월", outsource: 3000, platform: 800, government: 1800, medical: 1000 },
  { month: "2026-08", label: "8월", outsource: 3500, platform: 1200, government: 2000, medical: 1200 },
  { month: "2026-09", label: "9월", outsource: 3000, platform: 1500, government: 2200, medical: 1500 },
  { month: "2026-10", label: "10월", outsource: 2800, platform: 2000, government: 2500, medical: 1800 },
  { month: "2026-11", label: "11월", outsource: 2500, platform: 2500, government: 2800, medical: 2000 },
  { month: "2026-12", label: "12월", outsource: 2500, platform: 3000, government: 3000, medical: 2200 },
];

// 연간 목표 (만원)
export const ANNUAL_TARGET = 200000; // 20억 = 200,000만원

// 현재까지 실적 (1~4월)
export function getYtdRevenue() {
  const currentMonth = "2026-04";
  const ytdData = MONTHLY_REVENUE.filter((m) => m.month <= currentMonth);
  return ytdData.reduce(
    (acc, m) => acc + m.outsource + m.platform + m.government + m.medical,
    0
  );
}

// 카테고리별 누적
export function getRevenueByCategoryYtd() {
  const currentMonth = "2026-04";
  const ytdData = MONTHLY_REVENUE.filter((m) => m.month <= currentMonth);
  return {
    outsource: ytdData.reduce((acc, m) => acc + m.outsource, 0),
    platform: ytdData.reduce((acc, m) => acc + m.platform, 0),
    government: ytdData.reduce((acc, m) => acc + m.government, 0),
    medical: ytdData.reduce((acc, m) => acc + m.medical, 0),
  };
}
