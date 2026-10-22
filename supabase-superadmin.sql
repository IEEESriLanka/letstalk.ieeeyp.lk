-- Run once as the database owner in Supabase SQL Editor AFTER creating and
-- confirming the owner's account in Supabase Authentication. No password here.
begin;

alter table public.admin_users drop constraint if exists admin_users_role_check;
alter table public.admin_users add constraint admin_users_role_check
  check (role in ('super_admin', 'admin', 'editor'));

create unique index if not exists admin_users_single_super_admin
  on public.admin_users (role) where role = 'super_admin';

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admin_users
    where user_id = (select auth.uid()) and role in ('super_admin', 'admin', 'editor'));
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users a join auth.users u on u.id = a.user_id
    where a.user_id = (select auth.uid()) and a.role = 'super_admin'
      and lower(u.email) = 'ieeeletstalksl@gmail.com' and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.is_admin() from public;
revoke all on function public.is_super_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;
grant execute on function public.is_super_admin() to anon, authenticated, service_role;

-- Membership provisioning is deliberately independent of password handling.
do $$
declare owner_id uuid;
begin
  select id into strict owner_id from auth.users
    where lower(email) = 'ieeeletstalksl@gmail.com'
      and email_confirmed_at is not null for update;
  insert into public.admin_users (user_id, role) values (owner_id, 'super_admin')
    on conflict (user_id) do update set role = 'super_admin'
    where public.admin_users.role <> 'super_admin';
exception when no_data_found then
  raise exception 'Create and confirm the owner account in Supabase Authentication first.';
end;
$$;

-- Existing RLS policies call these functions: content access stays available
-- to admins/editors; account-management policies now require super_admin.
alter table public.admin_users enable row level security;

-- Membership changes go through the authenticated server functions. Browsers
-- can read their own membership; only the owner can read the full directory.
revoke insert, update, delete on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
drop policy if exists "Admins can read their admin record" on public.admin_users;
create policy "Admins can read their admin record" on public.admin_users
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_super_admin()));
drop policy if exists "Admins manage admin users" on public.admin_users;

create schema if not exists private;
revoke all on schema private from public;

create or replace function private.protect_super_admin_membership()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.role = 'super_admin' then
      raise exception 'The super-admin membership cannot be deleted.';
    end if;
    return old;
  end if;
  if tg_op = 'UPDATE' then
    if old.role = 'super_admin' and new is distinct from old then
      raise exception 'The super-admin membership cannot be changed.';
    end if;
  end if;
  if new.role = 'super_admin' and not exists (
    select 1 from auth.users u where u.id = new.user_id
      and lower(u.email) = 'ieeeletstalksl@gmail.com' and u.email_confirmed_at is not null
  ) then
    raise exception 'Only the designated owner can hold super-admin access.';
  end if;
  return new;
end;
$$;

create or replace function private.protect_super_admin_identity()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if exists (select 1 from public.admin_users where user_id = old.id and role = 'super_admin') then
    if tg_op = 'DELETE' then
      raise exception 'The super-admin account cannot be deleted.';
    end if;
    if new.id is distinct from old.id or new.email is distinct from old.email
      or new.email_confirmed_at is distinct from old.email_confirmed_at
      or new.banned_until is distinct from old.banned_until
      or new.deleted_at is distinct from old.deleted_at then
      raise exception 'The super-admin identity and access cannot be changed.';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function private.protect_super_admin_membership() from public, anon, authenticated;
revoke all on function private.protect_super_admin_identity() from public, anon, authenticated;

create or replace trigger protect_super_admin_membership
  before insert or update or delete on public.admin_users
  for each row execute function private.protect_super_admin_membership();
create or replace trigger protect_super_admin_identity
  before update or delete on auth.users
  for each row execute function private.protect_super_admin_identity();

commit;
