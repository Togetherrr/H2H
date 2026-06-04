alter table public.h2h_item_snapshots
add column if not exists source_daily_kworb bigint;

alter table public.h2h_item_snapshots
add constraint h2h_item_snapshots_source_daily_kworb_check
check (source_daily_kworb is null or source_daily_kworb >= 0);
