create table if not exists merchant_access_requests (
 id uuid primary key default gen_random_uuid(),
 phone text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
 shop_name text not null,
 reason text not null check (reason in ('forgot','first-access')),
 created_at timestamptz not null default now(),
 resolved_at timestamptz,
 resolved_by text,
 email_status text not null default 'queued' check(email_status in ('queued','sending','sent','failed','unconfigured')),
 last_attempt_at timestamptz
);
alter table merchant_access_requests enable row level security;
create unique index if not exists merchant_access_requests_pending_phone on merchant_access_requests(phone) where resolved_at is null;
