-- 3W 프로젝트 대시보드 초기 스키마

-- 프로필 테이블
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  role text not null default 'viewer' check (role in ('pmo', 'pm', 'viewer')),
  department text,
  created_at timestamptz default now()
);

-- 프로젝트 테이블
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  status text not null default 'planning' check (status in ('planning', 'development', 'operation', 'hold', 'completed')),
  category text not null default 'internal' check (category in ('internal', 'outsource', 'government', 'medical')),
  pm_id uuid references profiles(id) on delete set null,
  start_date date not null,
  end_date date not null,
  color text not null default '#3B82F6',
  priority text not null default 'P2' check (priority in ('P1', 'P2', 'P3')),
  workb_project_id text,
  workb_last_sync timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 프로젝트 단계 테이블
create table if not exists project_phases (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  name text not null,
  type text not null default 'phase' check (type in ('phase', 'milestone')),
  start_date date not null,
  end_date date not null,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  status text not null default 'planning' check (status in ('planning', 'development', 'operation', 'hold', 'completed')),
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

-- 프로젝트 멤버 테이블
create table if not exists project_members (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  role text not null default 'member',
  created_at timestamptz default now(),
  unique(project_id, profile_id)
);

-- 향후 KPI 확장용 (MVP에서는 미사용)
create table if not exists project_kpis (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  metric_name text not null,
  target_value numeric,
  current_value numeric,
  unit text,
  period text,
  created_at timestamptz default now()
);

-- 향후 매출 확장용 (MVP에서는 미사용)
create table if not exists project_financials (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  type text not null check (type in ('revenue', 'cost')),
  amount numeric not null default 0,
  period text,
  description text,
  created_at timestamptz default now()
);

-- updated_at 자동 갱신 트리거
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

-- RLS 활성화
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_phases enable row level security;
alter table project_members enable row level security;
alter table project_kpis enable row level security;
alter table project_financials enable row level security;

-- 읽기: 인증된 사용자 모두 가능
create policy "인증된 사용자 읽기" on profiles for select to authenticated using (true);
create policy "인증된 사용자 읽기" on projects for select to authenticated using (true);
create policy "인증된 사용자 읽기" on project_phases for select to authenticated using (true);
create policy "인증된 사용자 읽기" on project_members for select to authenticated using (true);
create policy "인증된 사용자 읽기" on project_kpis for select to authenticated using (true);
create policy "인증된 사용자 읽기" on project_financials for select to authenticated using (true);

-- 쓰기: PMO 또는 본인 프로젝트 PM만
create policy "PMO 전체 관리" on projects for all to authenticated
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pmo')
  );

create policy "PM 본인 프로젝트 수정" on projects for update to authenticated
  using (pm_id = auth.uid());

create policy "PMO 전체 관리" on project_phases for all to authenticated
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pmo')
  );

create policy "PMO 전체 관리" on project_members for all to authenticated
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pmo')
  );

-- 프로필: 본인만 수정
create policy "본인 프로필 수정" on profiles for update to authenticated
  using (id = auth.uid());
