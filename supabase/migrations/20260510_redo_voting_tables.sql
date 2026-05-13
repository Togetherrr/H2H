-- 1. tạo bảng voting_apps (bảng chính)
create table if not exists voting_apps (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text,               -- music_shows, awards, birthday...
  program_name text,           -- m countdown, inkigayo...
  logo_url text,
  currencies text[] default '{}', 
  collection_methods text[] default '{}', 
  android_url text,
  ios_url text,
  created_at timestamp with time zone default now()
);

-- 2. tạo bảng app_strategies (chiến thuật)
create table if not exists app_strategies (
  id uuid default gen_random_uuid() primary key,
  app_id uuid references voting_apps(id) on delete cascade,
  order_num int not null,
  content text not null,
  created_at timestamp with time zone default now()
);

-- 3. tạo bảng guide_steps (hướng dẫn chi tiết)
create table if not exists guide_steps (
  id uuid default gen_random_uuid() primary key,
  app_id uuid references voting_apps(id) on delete cascade,
  step_num int not null,
  title text,
  description text,
  image_url text,
  created_at timestamp with time zone default now()
);

-- 4. tạo bảng voting_rounds (bảng mới - quản lý các vòng vote theo thời gian)
create table if not exists voting_rounds (
  id uuid default gen_random_uuid() primary key,
  app_id uuid references voting_apps(id) on delete cascade,
  round_name text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  display_timezone text default 'Asia/Seoul', -- thêm để lưu múi giờ người dùng chọn
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 5. kích hoạt row level security (rls)
alter table voting_apps enable row level security;
alter table app_strategies enable row level security;
alter table guide_steps enable row level security;
alter table voting_rounds enable row level security;

-- 6. tạo policy cho phép mọi người xem dữ liệu (read-only)
create policy "enable read access for all users" on voting_apps for select to anon, authenticated using (true);
create policy "enable read access for all users" on app_strategies for select to anon, authenticated using (true);
create policy "enable read access for all users" on guide_steps for select to anon, authenticated using (true);
create policy "enable read access for all users" on voting_rounds for select to anon, authenticated using (true);

-- 7. script đồng bộ dữ liệu category (nếu cần)
update voting_apps 
set 
  program_name = category,
  category = case 
    when lower(name) in ('mnet plus', 'higher', 'muniverse', 'mubeat', 'linc', 'tin', 'idolchamp', 'fancast') then 'music_shows'
    when lower(name) in ('choeadol', 'kdol', 'queeri', 'upick', 'picnic', 'bugs favorite') then 'birthday'
    else 'awards'
  end
where program_name is null;