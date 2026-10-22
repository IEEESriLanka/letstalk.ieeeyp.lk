# Protected super admin

Owner login: `ieeeletstalksl@gmail.com`. Passwords belong in Supabase Auth only;
no password is stored in this repository or in the membership SQL.

## Activation (required before deploying these changes)

1. In the intended Supabase project's Authentication > Users, create and confirm
   the owner account with the password supplied privately. If it already exists,
   recover/update that account rather than creating a duplicate.
2. Run `supabase-superadmin.sql` as the database owner in Supabase SQL Editor.
   It runs in one transaction and fails if the confirmed owner account is absent.
   For a fresh database, apply the base schema first and then this script. Never
   reapply an older base schema that defines every admin as a super admin.
3. Configure a valid server-only `SUPABASE_SECRET_KEY` for this same project in
   local development and Vercel. Do not place it in a `VITE_` variable. The key
   must be valid for this project. The local server key was verified on 2026-10-22.
4. Sign in at `/admin/login`, then open `/admin/admins` to create admins/editors.

Live activation completed on 2026-10-22. The owner account is confirmed and its
password was set through Supabase Auth without storing it in this repository.
Verified password sign-in, super-admin authorization, access to the two-member
directory, and restrictions on direct browser membership writes. Transactional
checks confirmed that owner demotion, membership deletion, and email changes are
rejected. Each protection check rolled back. Production hosting still needs the
same valid server-only key in its own environment.

## Access model

- Exactly one `super_admin` membership is allowed, bound to the confirmed owner.
- Only that role passes account-management server functions and RLS policies.
- Admins/editors retain existing content and storage permissions.
- The panel never offers a super-admin creation role and disables its removal.
- The manager supports searching the directory and changing ordinary admin/editor
  roles. Database membership writes are restricted to the server-only client.
- Every CMS member can change their own password from Settings using their current
  password and a confirmed new password. The owner's password can also be changed;
  their protected identity and role remain fixed.
- Database triggers reject changing/deleting the protected membership and
  deleting, renaming, banning, or soft-deleting its Auth user. Ordinary login,
  token refresh, and owner password recovery remain allowed.
- Supabase project/database owners can still change database code or disable
  triggers; application code cannot make an account immutable to its platform owner.

## Required integration verification

Use a disposable Supabase project before activation on production:

- Owner can log in, manage content, create admins/editors, and remove an ordinary admin.
- Ordinary admins/editors can manage content, but account server functions and
  direct REST writes to `admin_users` reject them (including self-promotion).
- Attempt to delete or modify the protected membership via SQL and REST: rejected.
- Attempt to delete/ban/change the owner's email via Auth admin API: rejected.
- A second super-admin insert is rejected, including with a server key.
- Owner password recovery, session refresh, and ordinary-user deletion still work.
- Reapplying the setup SQL leaves exactly one unchanged protected membership.

Never put the owner's password in committed SQL, command-line arguments, or logs.
