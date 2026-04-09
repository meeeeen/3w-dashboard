import type { ProjectStatus, ProjectCategory } from "@/utils/constants";

export interface PortfolioMilestone {
  id: string;
  label: string;
  date: string;
  completed: boolean;
}

export interface PortfolioBusiness {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  category: ProjectCategory;
  keyMetrics: { label: string; value: string }[];
  milestones: PortfolioMilestone[];
  notes: string;
  estimatedRevenue: string;
  assignee: string;
}

export const PORTFOLIO_BUSINESSES: PortfolioBusiness[] = [
  {
    id: "pf-1",
    name: "WiTiM (위팀)",
    description:
      "B2B 통합 업무관리 플랫폼 (HR SaaS) — 근태, 프로젝트 관리, 일정, 미팅, 메신저, 조직관리를 하나로. 데스크탑 웹 4월 중 오픈, 데스크탑 앱/모바일 앱 5월 중 오픈 예정.",
    status: "development",
    category: "internal",
    keyMetrics: [
      { label: "DAU 목표", value: "1,000명" },
      { label: "가격 모델", value: "무료 (PLG)" },
    ],
    milestones: [
      { id: "m1-1", label: "MVP 개발 완료", date: "2025-12-31", completed: true },
      { id: "m1-2", label: "소켓엔진 교체", date: "2026-04-10", completed: false },
      { id: "m1-3", label: "데스크탑 웹 오픈", date: "2026-04-30", completed: false },
      { id: "m1-4", label: "데스크탑 앱 + 모바일 앱 오픈", date: "2026-05-31", completed: false },
    ],
    notes: "",
    estimatedRevenue: "PLG 모델 — 올해 매출 기여 미정",
    assignee: "배지은",
  },
  {
    id: "pf-2",
    name: "wDot",
    description:
      "거래 기반 수수료 플랫폼. 세부 사항 별도 확정 예정.",
    status: "hold",
    category: "internal",
    keyMetrics: [
      { label: "상태", value: "보류 (확정 대기)" },
    ],
    milestones: [
      { id: "m2-1", label: "사업 모델 확정", date: "2026-06-30", completed: false },
    ],
    notes: "",
    estimatedRevenue: "미정",
    assignee: "미정",
  },
  {
    id: "pf-3",
    name: "K-주전부리",
    description:
      "민관학 협력 기반 지역활성화 실증 사업. 4자 협력: 3W(주관) x 카카오(주최) x 지방시대위원회 x 숙명여대. 협력기관: 농협중앙회, 농민신문.",
    status: "progress",
    category: "government",
    keyMetrics: [
      { label: "예산", value: "~11.9억" },
      { label: "3W 순수 현금", value: "+1.14억" },
    ],
    milestones: [
      { id: "m3-1", label: "MOU 체결", date: "2026-04-30", completed: false },
      { id: "m3-2", label: "TF 킥오프", date: "2026-04-30", completed: false },
      { id: "m3-3", label: "사업 기획 / 컨소시엄 구성", date: "2026-08-31", completed: false },
      { id: "m3-4", label: "해커톤", date: "2026-09-15", completed: false },
      { id: "m3-5", label: "오프라인 거점 오픈", date: "2026-11-01", completed: false },
      { id: "m3-6", label: "최종 보고", date: "2026-12-31", completed: false },
    ],
    notes: "",
    estimatedRevenue: "~11.9억 (정부지원 포함)",
    assignee: "박민환",
  },
  {
    id: "pf-4",
    name: "B2B 의료통합 플랫폼",
    description:
      "의료 CRM / EMR / HIS / 마케팅 통합 플랫폼. WiTiM 기능까지 내재화한 의료기관 올인원 플랫폼.",
    status: "planning",
    category: "medical",
    keyMetrics: [
      { label: "타겟", value: "의료기관" },
      { label: "핵심 기능", value: "CRM+EMR+HIS+마케팅" },
    ],
    milestones: [
      { id: "m4-1", label: "시장조사 완료", date: "2026-06-30", completed: false },
      { id: "m4-2", label: "MVP 기획", date: "2026-09-30", completed: false },
      { id: "m4-3", label: "프로토타입", date: "2026-12-31", completed: false },
    ],
    notes: "",
    estimatedRevenue: "올해 직접 매출 없음 (기획 단계)",
    assignee: "미정",
  },
  {
    id: "pf-5",
    name: "의료 마케팅 AI",
    description:
      "한국+일본 이중언어 AI 콘텐츠 자동 생성. AEO + GEO 기반 마케팅. 타겟: 국내 피부과/성형외과 (방한 일본인 44만명 공략).",
    status: "planning",
    category: "medical",
    keyMetrics: [
      { label: "가격 (단독)", value: "199만/월" },
      { label: "가격 (번들)", value: "99만/월" },
    ],
    milestones: [
      { id: "m5-1", label: "AI 엔진 프로토타입", date: "2026-07-31", completed: false },
      { id: "m5-2", label: "파일럿 고객 확보", date: "2026-09-30", completed: false },
      { id: "m5-3", label: "정식 런칭", date: "2026-12-31", completed: false },
    ],
    notes: "",
    estimatedRevenue: "파일럿 매출 ~2,000만 (연내 목표)",
    assignee: "미정",
  },
  {
    id: "pf-6",
    name: "베테랑 앱",
    description:
      "AI 기반 시니어-청년 역량 매칭 플랫폼. 지자체가 시니어 경험이 필요한 프로젝트 등록 후 매칭. 프로젝트 완료 후 문화체육관광부에 기부체납 예정.",
    status: "planning",
    category: "internal",
    keyMetrics: [
      { label: "타겟", value: "시니어-청년 매칭" },
      { label: "모델", value: "지자체 연계" },
    ],
    milestones: [
      { id: "m6-1", label: "서비스 기획 완료", date: "2026-08-31", completed: false },
      { id: "m6-2", label: "MVP 개발", date: "2026-12-31", completed: false },
    ],
    notes: "",
    estimatedRevenue: "올해 직접 매출 없음 (기획 단계)",
    assignee: "미정",
  },
  {
    id: "pf-7",
    name: "의료관광 플랫폼",
    description:
      "1단계: 러시아/중앙아시아 (암 환자 등 중증, 풀 컨시어지). 2단계: 일본 (성형/피부/미용). 최종: 미국 본사 설립 + VC 유치.",
    status: "planning",
    category: "medical",
    keyMetrics: [
      { label: "1단계 타겟", value: "러시아/중앙아시아" },
      { label: "2단계 타겟", value: "일본" },
    ],
    milestones: [
      { id: "m7-1", label: "시장조사 / 파트너 확보", date: "2026-09-30", completed: false },
      { id: "m7-2", label: "1단계 서비스 런칭", date: "2027-03-31", completed: false },
    ],
    notes: "",
    estimatedRevenue: "올해 직접 매출 없음 (기획 단계)",
    assignee: "미정",
  },
  {
    id: "pf-8",
    name: "미국 K-MedSpa",
    description:
      "미국 메디스파 시장 진출. 2025년 약 $220억, CAGR 14~15%. Phase 1: 한국 작명 서비스 + 굿즈 킥스타터. Phase 2: K-MedSpa 플랫폼 크라우드펀딩.",
    status: "exploration",
    category: "overseas",
    keyMetrics: [
      { label: "시장 규모", value: "$220억 (2025)" },
      { label: "CAGR", value: "14~15%" },
    ],
    milestones: [
      { id: "m8-1", label: "시장 리서치 완료", date: "2026-06-30", completed: false },
      { id: "m8-2", label: "Phase 1 킥스타터", date: "2026-12-31", completed: false },
    ],
    notes: "",
    estimatedRevenue: "올해 직접 매출 없음 (탐색 단계)",
    assignee: "미정",
  },
  {
    id: "pf-9",
    name: "외주 개발",
    description:
      "상시 진행 외주 프로젝트. 활성: Coffee 키오스크, 리파인, 성형 숨고, 여의도 LMS. 천동은 대표님 총괄.",
    status: "operation",
    category: "outsource",
    keyMetrics: [
      { label: "활성 프로젝트", value: "4건" },
      { label: "올해 매출 기여", value: "~8억" },
    ],
    milestones: [
      { id: "m9-1", label: "Coffee 키오스크 납품", date: "2026-04-15", completed: false },
      { id: "m9-2", label: "성형 숨고 납품", date: "2026-04-15", completed: false },
      { id: "m9-3", label: "리파인 중간보고", date: "2026-04-13", completed: false },
      { id: "m9-4", label: "여의도 LMS 착수", date: "2026-04-14", completed: false },
    ],
    notes: "",
    estimatedRevenue: "~8억 (외주 매출)",
    assignee: "천동은",
  },
];
