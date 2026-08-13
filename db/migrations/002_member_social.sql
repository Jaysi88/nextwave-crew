-- NextWave Crew member social layer
-- Apply after db/schema.sql.

alter table profiles add column if not exists cover_url text;

alter table crew_profiles add column if not exists open_to_mentor boolean not null default false;
alter table crew_profiles add column if not exists looking_for_mentor boolean not null default false;

create table if not exists member_follows (
  follower_id text not null references profiles(id) on delete cascade,
  following_id text not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
create index if not exists member_follows_following_idx on member_follows(following_id, created_at desc);
create index if not exists member_follows_follower_idx on member_follows(follower_id, created_at desc);

create table if not exists post_reactions (
  post_id uuid not null references posts(id) on delete cascade,
  user_id text not null references profiles(id) on delete cascade,
  reaction text not null default 'support' check (reaction in ('support','useful','celebrate')),
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
