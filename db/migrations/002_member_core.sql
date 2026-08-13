-- Member core hardening for SeaPoints idempotency.
create unique index if not exists reward_once_reference_uidx
  on reward_transactions(user_id, reference_type, reference_id)
  where reference_id is not null;
