create table if not exists public.feedback_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  category text not null default 'general',
  message text not null,
  status text not null default 'new' check (status in ('new', 'reviewed', 'resolved')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_feedback_messages_updated_at on public.feedback_messages;
create trigger set_feedback_messages_updated_at
  before update on public.feedback_messages
  for each row execute procedure public.set_current_timestamp_updated_at();

alter table public.feedback_messages enable row level security;

drop policy if exists "feedback_messages_insert_public" on public.feedback_messages;
create policy "feedback_messages_insert_public"
  on public.feedback_messages
  for insert
  to anon, authenticated
  with check (true);
