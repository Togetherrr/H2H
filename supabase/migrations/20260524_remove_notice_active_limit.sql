drop trigger if exists enforce_notice_display_rules on public.notices;

create or replace function public.enforce_notice_display_rules()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_pinned and not new.is_active then
    raise exception 'A pinned notice must be active.';
  end if;

  return new;
end;
$$;

create trigger enforce_notice_display_rules
  before insert or update on public.notices
  for each row execute procedure public.enforce_notice_display_rules();
