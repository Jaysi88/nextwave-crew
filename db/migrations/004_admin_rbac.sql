-- Platform-level role separation for owner and operations access.
alter table profiles add column if not exists platform_role text not null default 'member';

do $$ begin
  alter table profiles add constraint profiles_platform_role_check
    check (platform_role in ('member','moderator','verification_officer','recruiter','admin','owner'));
exception when duplicate_object then null;
end $$;

create index if not exists profiles_platform_role_idx on profiles(platform_role);
