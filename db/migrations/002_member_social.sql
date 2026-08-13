-- NextWave Crew member social layer
alter table profiles add column if not exists cover_url text;
alter table crew_profiles add column if not exists open_to_mentor boolean not null default false;
alter table crew_profiles add column if not exists seeking_mentor boolean not null default false;

create table if not exists member_follows (
  follower_id text not null references profiles(id) on delete cascade,
  followed_id text not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);
create index if not exists member_follows_followed_idx on member_follows(followed_id, created_at desc);

create table if not exists post_reactions (
  post_id uuid not null references posts(id) on delete cascade,
  user_id text not null references profiles(id) on delete cascade,
  reaction text not null check (reaction in ('like','helpful','respect','celebrate')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index if not exists post_reactions_post_idx on post_reactions(post_id, created_at desc);

create table if not exists saved_posts (
  post_id uuid not null references posts(id) on delete cascade,
  user_id text not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index if not exists saved_posts_user_idx on saved_posts(user_id, created_at desc);

create table if not exists mentor_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id text not null references profiles(id) on delete cascade,
  mentor_id text not null references profiles(id) on delete cascade,
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(requester_id, mentor_id),
  check (requester_id <> mentor_id)
);
create index if not exists mentor_requests_mentor_idx on mentor_requests(mentor_id, status, created_at desc);
