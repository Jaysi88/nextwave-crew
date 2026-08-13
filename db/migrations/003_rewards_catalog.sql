create table if not exists reward_catalog_items (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  cost_points bigint not null check (cost_points > 0),
  fulfillment_type text not null default 'manual',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  item_id uuid not null references reward_catalog_items(id),
  cost_points bigint not null check (cost_points > 0),
  status text not null default 'requested',
  created_at timestamptz not null default now(),
  fulfilled_at timestamptz
);
create index if not exists reward_redemptions_user_idx on reward_redemptions(user_id, created_at desc);

insert into reward_catalog_items (code, title, description, cost_points, fulfillment_type, sort_order)
values
  ('CV_REVIEW', 'Professional CV review', 'Request a structured maritime CV review from the NextWave Crew team.', 500, 'manual', 10),
  ('VERIFICATION_PRIORITY', 'CrewID verification priority', 'Move a completed CrewID verification request into the priority queue.', 750, 'manual', 20),
  ('TRAINING_CREDIT', 'Training partner credit', 'Redeem for an eligible training-partner benefit when available.', 1000, 'manual', 30)
on conflict (code) do update set title = excluded.title, description = excluded.description, cost_points = excluded.cost_points, sort_order = excluded.sort_order, updated_at = now();
