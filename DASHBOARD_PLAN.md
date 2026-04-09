# 3W 통합 현황 대시보드 — 고도화 계획

> 목표: 다음주 전체 발표용. 3W의 모든 현황을 한눈에 볼 수 있는 대시보드.

---

## 1단계: 메인 페이지 — KPI 대시보드 ✅ 완료

기존 메인 페이지(간트 차트)를 → 수치 + 차트 중심 시각화 페이지로 교체.
간트 차트는 `/projects` 페이지로 이동 (목록/타임라인 탭 전환).

### 구현된 컴포넌트
- `KpiSummaryCards` — YTD 매출, 활성 프로젝트, 플랫폼 사용자, 목표 달성률
- `RevenueChart` — 월별 매출 추이 (스택 AreaChart)
- `RevenuePieChart` — 카테고리별 매출 도넛 차트
- `PlatformKpiCards` — 위팀/wDot/의료 플랫폼 KPI 카드 (스파크라인 포함)
- `ProjectStatusChart` — 상태별/카테고리별 BarChart
- `UpcomingMilestones` — D-day 기반 마일스톤 리스트

---

## 2단계: 경영 현황 (`/finance`) ✅ 완료 + IR 고도화

### 페이지 구조 (6개 섹션)

**섹션 1: 핵심 지표**
- `RevenueTargetTracker` — SVG 원형 게이지로 연간 목표(20억) 대비 달성률
- `GrowthMetrics` — MoM/QoQ 성장률, 분기별 매출 요약, 월평균 매출

**섹션 2: 매출 분석**
- `RevenueForecast` — 실적(실선) + 예상(점선) + 목표 라인 차트
- `RevenueMixShift` — 100% 스택 차트로 외주→플랫폼 전환 시각화 (IR 핵심 스토리)

**섹션 3: 현금 & 파이프라인**
- `CashFlowChart` — 수입/지출/순이익 BarChart
- `BurnRateRunway` — 현금 보유(편집), Burn Rate, Runway, 현금 추이 차트

**섹션 4: 외주 파이프라인**
- `OutsourcePipeline` — 수주 단계별 파이프라인 (상담→계약→진행→완료), 가중 매출 예측

**섹션 5: 중장기 성장 전략**
- `MultiYearProjection` — 4개년 성장 궤적 (20→40→80→160억), 연도별 주요 매출원(편집)

**섹션 6: 매출 상세**
- `MonthlyRevenueTable` — 월별 매출 상세 테이블 (셀 클릭 → 직접 편집)

### localStorage 키
- `3w-finance-revenue` — 월별 매출 데이터
- `3w-finance-cash` — 현금 보유액
- `3w-finance-pipeline` — 외주 파이프라인
- `3w-finance-multiyear` — 연도별 매출원 메모

---

## 3단계: 조직/인력 현황 (`/team`) ✅ 완료

### 구현된 컴포넌트
- `TeamOverview` — 부서별 인원 현황 (프로그레스 바 + 멤버 리스트)
- `ResourceAllocation` — 팀원 × 프로젝트 매트릭스 (역할별 컬러 뱃지)
- `WorkloadHeatmap` — 팀원별 업무 부하 (green/yellow/red 색상)
- `MemberDetailCard` — 팀원 상세 다이얼로그 (메모 편집 가능)

### 데이터 편집
- 팀원별 메모/노트 편집 → localStorage 저장
- localStorage 키: `3w-dashboard-member-notes`

---

## 4단계: 사업 포트폴리오 (`/portfolio`) ✅ 완료

### 구현된 컴포넌트
- `PortfolioSummary` — 총 사업 수, 상태별 분류, 예상 매출 기여
- `BusinessPortfolioGrid` — 9개 사업 카드 (상태별 컬러 코딩)
- `PortfolioTimeline` — 전체 마일스톤 수평 타임라인 (오늘 표시)
- `BusinessDetailModal` — 사업 상세 모달 (KPI/메모 편집 가능)

### 데이터: 9개 사업
1. WiTiM (위팀) — 개발중
2. wDot — 보류
3. K-주전부리 — 진행중
4. B2B 의료통합 플랫폼 — 기획
5. 의료 마케팅 AI — 기획
6. 베테랑 앱 — 기획
7. 의료관광 플랫폼 — 기획
8. 미국 K-MedSpa — 탐색
9. 외주 개발 — 운영중

### 데이터 편집
- 사업별 메모, KPI 값 편집 → localStorage 저장
- localStorage 키: `3w-portfolio-data`

---

## 사이드바 네비게이션

| 아이콘 | 라벨 | 라우트 |
|--------|------|--------|
| BarChart3 | 대시보드 | `/` |
| FolderKanban | 프로젝트 | `/projects` |
| Wallet | 경영 현황 | `/finance` |
| UsersRound | 조직/인력 | `/team` |
| Briefcase | 사업 포트폴리오 | `/portfolio` |
| Plus | 프로젝트 등록 | `/projects/new` |

---

## 명칭 변경

- WorkB / 워크비 → **WiTiM / 위팀** (전체 코드 반영)

## 추가된 상태/카테고리

- 프로젝트 상태: `progress`(진행), `exploration`(탐색) 추가
- 카테고리: `overseas`(해외) 추가
