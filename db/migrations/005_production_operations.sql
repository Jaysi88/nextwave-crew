-- Production operations: account controls, encrypted documents and plan requests.
alter table profiles add column if not exists account_status text not null default 'active';
alter table profiles add column if not exists last_seen_at timestamptz;

do $$ begin
  alter table profiles add constraint profiles_account_status_check
    check (account_status in ('active','suspended','closed'));
exception when duplicate_object then null;
end $$;

create table if not exists document_files (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  filename text not null,
  mime_type text not null,
  byte_size integer not null check (byte_size between 1 and 10485760),
  ciphertext text not null,
  iv text not null,
  auth_tag text not null,
  created_at timestamptz not null default now()
);
create index if not exists document_files_user_idx on document_files(user_id, created_at desc);

create table if not exists membership_change_requests (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  requested_plan text not null check (requested_plan in ('plus','pro')),
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly','annual')),
  status text not null default 'pending' check (status in ('pending','approved','declined','cancelled')),
  reviewed_by text references profiles(id) on delete set null,
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create unique index if not exists membership_change_pending_uidx
  on membership_change_requests(user_id) where status = 'pending';

create index if not exists profiles_account_status_idx on profiles(account_status);
