// 경영 현황 시드 데이터
// 올해 목표: 20억 = 200,000만원

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

// 월별 지출 데이터 (만원)
export interface MonthlyExpense {
  month: string;
  label: string;
  salary: number;       // 인건비
  operation: number;    // 운영비
  outsourceCost: number; // 외주비
  marketing: number;    // 마케팅비
  etc: number;          // 기타
}

export const MONTHLY_EXPENSES: MonthlyExpense[] = [
  { month: "2026-01", label: "1월", salary: 3200, operation: 800, outsourceCost: 500, marketing: 200, etc: 150 },
  { month: "2026-02", label: "2월", salary: 3200, operation: 750, outsourceCost: 600, marketing: 250, etc: 120 },
  { month: "2026-03", label: "3월", salary: 3400, operation: 820, outsourceCost: 700, marketing: 300, etc: 180 },
  { month: "2026-04", label: "4월", salary: 3400, operation: 850, outsourceCost: 800, marketing: 400, etc: 200 },
  { month: "2026-05", label: "5월", salary: 3600, operation: 900, outsourceCost: 750, marketing: 500, etc: 180 },
  { month: "2026-06", label: "6월", salary: 3600, operation: 880, outsourceCost: 650, marketing: 550, etc: 200 },
  { month: "2026-07", label: "7월", salary: 3800, operation: 920, outsourceCost: 600, marketing: 600, etc: 220 },
  { month: "2026-08", label: "8월", salary: 3800, operation: 950, outsourceCost: 700, marketing: 650, etc: 200 },
  { month: "2026-09", label: "9월", salary: 4000, operation: 980, outsourceCost: 650, marketing: 700, etc: 250 },
  { month: "2026-10", label: "10월", salary: 4000, operation: 1000, outsourceCost: 700, marketing: 750, etc: 230 },
  { month: "2026-11", label: "11월", salary: 4200, operation: 1050, outsourceCost: 650, marketing: 800, etc: 250 },
  { month: "2026-12", label: "12월", salary: 4200, operation: 1100, outsourceCost: 700, marketing: 850, etc: 300 },
];

// 월별 매출 합계
export function getMonthlyRevenueTotal(m: MonthlyRevenue): number {
  return m.outsource + m.platform + m.government + m.medical;
}

// 월별 지출 합계
export function getMonthlyExpenseTotal(m: MonthlyExpense): number {
  return m.salary + m.operation + m.outsourceCost + m.marketing + m.etc;
}

// 현재 월 (2026-04)
export const CURRENT_MONTH = "2026-04";
export const CURRENT_MONTH_INDEX = 3; // 0-based
