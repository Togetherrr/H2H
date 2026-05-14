-- Allow service_role to write voting tables (for seeding / admin tasks).
-- Keeps anon/authenticated read-only policies intact.

-- Grants (defensive: some setups may restrict service_role privileges)
grant select, insert, update, delete on table public.voting_apps to service_role;
grant select, insert, update, delete on table public.app_strategies to service_role;
grant select, insert, update, delete on table public.guide_steps to service_role;
grant select, insert, update, delete on table public.voting_rounds to service_role;

-- RLS policies for service_role
create policy "service_role full access voting_apps"
on public.voting_apps
as permissive
for all
to service_role
using (true)
with check (true);

create policy "service_role full access app_strategies"
on public.app_strategies
as permissive
for all
to service_role
using (true)
with check (true);

create policy "service_role full access guide_steps"
on public.guide_steps
as permissive
for all
to service_role
using (true)
with check (true);

create policy "service_role full access voting_rounds"
on public.voting_rounds
as permissive
for all
to service_role
using (true)
with check (true);

