export type RiskCategory = "기술" | "일정" | "인력" | "비용" | "외부";
export type RiskStatus = "식별" | "모니터링" | "해결" | "수용";

export interface Risk {
  id: string;
  project: string;
  name: string;
  category: RiskCategory;
  probability: number; // 1-5
  impact: number; // 1-5
  score: number; // probability * impact
  strategy: string;
  status: RiskStatus;
  owner: string;
}

export const RISK_CATEGORIES: RiskCategory[] = ["기술", "일정", "인력", "비용", "외부"];
export const RISK_STATUSES: RiskStatus[] = ["식별", "모니터링", "해결", "수용"];

export const SEED_RISKS: Risk[] = [
  {
    id: "R-001",
    project: "WiTiM",
    name: "소켓엔진 교체 지연",
    category: "기술",
    probability: 4,
    impact: 5,
    score: 20,
    strategy: "소켓엔진 교체 병렬 진행, 폴백 플랜 준비",
    status: "모니터링",
    owner: "정지은",
  },
  {
    id: "R-002",
    project: "WiTiM",
    name: "오픈 일정 지연",
    category: "일정",
    probability: 3,
    impact: 5,
    score: 15,
    strategy: "핵심 기능 우선 오픈, 단계적 릴리스",
    status: "모니터링",
    owner: "배지은",
  },
  {
    id: "R-003",
    project: "Coffee 키오스크",
    name: "납품 지연",
    category: "일정",
    probability: 2,
    impact: 4,
    score: 8,
    strategy: "4/15 목표 집중, 클라이언트 사전 소통",
    status: "식별",
    owner: "전민준",
  },
  {
    id: "R-004",
    project: "성형 숨고",
    name: "QA 이슈",
    category: "기술",
    probability: 3,
    impact: 3,
    score: 9,
    strategy: "QA 체크리스트 강화, 테스트 자동화",
    status: "모니터링",
    owner: "이한세",
  },
  {
    id: "R-005",
    project: "전사",
    name: "외주 인력 부족",
    category: "인력",
    probability: 4,
    impact: 4,
    score: 16,
    strategy: "외부 프리랜서 풀 확보, 우선순위 재조정",
    status: "모니터링",
    owner: "천동은",
  },
  {
    id: "R-006",
    project: "K-주전부리",
    name: "MOU 지연",
    category: "외부",
    probability: 2,
    impact: 5,
    score: 10,
    strategy: "카카오/지방시대위원회 주기적 팔로업",
    status: "식별",
    owner: "박민환",
  },
  {
    id: "R-007",
    project: "전사",
    name: "디자이너 리소스 경합",
    category: "인력",
    probability: 3,
    impact: 3,
    score: 9,
    strategy: "프로젝트간 디자인 일정 조율, 외주 디자이너 검토",
    status: "식별",
    owner: "남유이",
  },
  {
    id: "R-008",
    project: "여의도 LMS",
    name: "요구사항 변경",
    category: "비용",
    probability: 3,
    impact: 3,
    score: 9,
    strategy: "변경 관리 프로세스 수립, 추가 비용 사전 협의",
    status: "식별",
    owner: "전성운",
  },
  {
    id: "R-009",
    project: "의료 마케팅 AI",
    name: "기술 난이도",
    category: "기술",
    probability: 3,
    impact: 4,
    score: 12,
    strategy: "기술 PoC 선행, 외부 AI 전문가 자문",
    status: "식별",
    owner: "미정",
  },
  {
    id: "R-010",
    project: "전사",
    name: "현금 흐름 압박",
    category: "비용",
    probability: 2,
    impact: 5,
    score: 10,
    strategy: "외주 매출 조기 회수, 지출 우선순위 관리",
    status: "모니터링",
    owner: "황인회",
  },
];
