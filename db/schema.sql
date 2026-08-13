-- NextWave Crew v0.1 foundation schema for Neon Postgres
-- Financial modules are planning/education records only. No custody ledger exists in this schema.

create extension if not exists pgcrypto;

do $$ begin create type membership_status as enum ('trial','active','past_due','cancelled','paused'); exception when duplicate_object then null; end $$;
do $$ begin create type visibility_level as enum ('private','members','public'); exception when duplicate_object then null; end $$;
do $$ begin create type verification_status as enum ('unverified','pending','verified','rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type application_status as enum ('saved','applied','screening','interview','offer','hired','withdrawn','rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type moderation_status as enum ('open','reviewing','resolved','dismissed'); exception when duplicate_object then null; end $$;

create table if not exists profiles (
  id text primary key,
  email text not null unique,
  display_name text not null,
  avatar_url text,
  nationality text,
  country_of_residence text,
  timezone text,
  preferred_language text not null default 'en',
  visibility visibility_level not null default 'members',
  verification verification_status not null default 'unverified',
  platform_role text not null default 'member' check (platform_role in ('member','moderator','verification_officer','recruiter','admin','owner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists crew_profiles (
  user_id text primary key references profiles(id) on delete cascade,
  department text,
  current_position text,
  ship_segment text,
  years_at_sea numeric(5,2) not null default 0,
  available_from date,
  career_summary text,
  profile_score integer not null default 0 check (profile_score between 0 and 100),
  open_to_work boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_type text,
  website text,
  country text,
  verification verification_status not null default 'unverified',
  created_at timestamptz not null default now()
);

create table if not exists vessels (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  name text not null,
  vessel_type text not null,
  imo_number text unique,
  flag_state text,
  created_at timestamptz not null default now()
);

create table if not exists sea_service (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  vessel_id uuid references vessels(id) on delete set null,
  company_name_snapshot text not null,
  vessel_name_snapshot text not null,
  position_title text not null,
  department text not null,
  started_on date not null,
  ended_on date,
  verification verification_status not null default 'unverified',
  notes text,
  created_at timestamptz not null default now(),
  check (ended_on is null or ended_on >= started_on)
);
create index if not exists sea_service_user_idx on sea_service(user_id, started_on desc);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  certificate_type text not null,
  certificate_name text not null,
  certificate_number_ciphertext text,
  issuing_authority text,
  issued_on date,
  expires_on date,
  verification verification_status not null default 'unverified',
  storage_key text,
  visibility visibility_level not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists certificate_expiry_idx on certificates(user_id, expires_on);

create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  community_type text not null default 'department',
  department text,
  vessel_type text,
  visibility visibility_level not null default 'members',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists community_members (
  community_id uuid not null references communities(id) on delete cascade,
  user_id text not null references profiles(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);
create index if not exists community_member_user_idx on community_members(user_id);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities(id) on delete cascade,
  author_id text not null references profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 10000),
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_community_created_idx on posts(community_id, created_at desc);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_id text not null references profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  status text not null default 'published',
  created_at timestamptz not null default now()
);
create index if not exists comments_post_created_idx on comments(post_id, created_at);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  recruiter_user_id text references profiles(id) on delete set null,
  title text not null,
  department text not null,
  vessel_type text,
  region text,
  description text not null,
  salary_min numeric(14,2),
  salary_max numeric(14,2),
  salary_currency char(3),
  contract_months numeric(4,1),
  status text not null default 'draft',
  published_at timestamptz,
  closes_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists jobs_active_idx on jobs(status, department, published_at desc);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  user_id text not null references profiles(id) on delete cascade,
  status application_status not null default 'saved',
  match_score integer check (match_score between 0 and 100),
  cv_snapshot jsonb,
  applied_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(job_id, user_id)
);

create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  plan text not null default 'free',
  status membership_status not null default 'active',
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists membership_provider_subscription_uidx on memberships(provider, provider_subscription_id) where provider_subscription_id is not null;
create index if not exists membership_user_idx on memberships(user_id, status);

create table if not exists savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  name text not null,
  goal_type text not null,
  target_amount numeric(16,2) not null check (target_amount >= 0),
  current_amount numeric(16,2) not null default 0 check (current_amount >= 0),
  currency char(3) not null default 'USD',
  target_date date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists savings_goals_user_idx on savings_goals(user_id, status);

create table if not exists financial_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  snapshot_date date not null default current_date,
  monthly_ship_income numeric(16,2) not null default 0,
  contract_months numeric(4,1) not null default 0,
  planned_leave_months numeric(4,1) not null default 0,
  monthly_family_support numeric(16,2) not null default 0,
  emergency_fund numeric(16,2) not null default 0,
  savings_total numeric(16,2) not null default 0,
  investment_total numeric(16,2) not null default 0,
  debt_total numeric(16,2) not null default 0,
  currency char(3) not null default 'USD',
  created_at timestamptz not null default now(),
  unique(user_id, snapshot_date)
);

create table if not exists investment_watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  symbol text not null,
  asset_type text not null,
  note text,
  created_at timestamptz not null default now(),
  unique(user_id, symbol, asset_type)
);

create table if not exists reward_accounts (
  user_id text primary key references profiles(id) on delete cascade,
  points_balance bigint not null default 0 check (points_balance >= 0),
  lifetime_earned bigint not null default 0 check (lifetime_earned >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists reward_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  amount bigint not null,
  reason_code text not null,
  reference_type text,
  reference_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists rewards_user_created_idx on reward_transactions(user_id, created_at desc);

create table if not exists moderation_cases (
  id uuid primary key default gen_random_uuid(),
  reporter_id text references profiles(id) on delete set null,
  target_type text not null,
  target_id text not null,
  reason text not null,
  status moderation_status not null default 'open',
  assigned_to text references profiles(id) on delete set null,
  resolution_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists moderation_status_idx on moderation_cases(status, created_at);

create table if not exists support_payments (
  id uuid primary key default gen_random_uuid(),
  tx_hash text not null unique,
  network text not null,
  token_symbol text not null default 'USDC',
  token_contract text not null,
  sender_address text not null,
  recipient_address text not null,
  amount_atomic numeric(78,0) not null check (amount_atomic > 0),
  amount_display numeric(20,6) not null check (amount_display > 0),
  supporter_name text,
  supporter_message text,
  block_number bigint,
  status text not null default 'verified',
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists support_payments_verified_idx on support_payments(status, verified_at desc);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  action_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications(user_id, read_at, created_at desc);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id text,
  action text not null,
  entity_type text not null,
  entity_id text,
  ip_hash text,
  user_agent text,
  changes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_actor_created_idx on audit_logs(actor_user_id, created_at desc);
create index if not exists audit_entity_idx on audit_logs(entity_type, entity_id, created_at desc);

-- Recommended production hardening after auth claims are wired to Postgres:
-- 1. enable RLS on member-owned and sensitive tables;
-- 2. connect Neon Auth JWT claims to request context;
-- 3. use a non-owner runtime database role without BYPASSRLS;
-- 4. encrypt sensitive identifiers before storage and keep keys outside Postgres.
