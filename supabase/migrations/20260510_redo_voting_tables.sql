-- 1. tạo bảng voting_apps (bảng chính)
create table if not exists voting_apps (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text,               -- dùng để lọc (music_shows, awards, birthday...)
  program_name text,           -- dùng để hiển thị (m countdown, inkigayo, show champion...)
  logo_url text,
  currencies text[] default '{}', 
  collection_methods text[] default '{}', 
  android_url text,
  ios_url text,
  created_at timestamp with time zone default now()
);

-- 2. tạo bảng app_strategies (chiến thuật của app)
create table if not exists app_strategies (
  id uuid default gen_random_uuid() primary key,
  app_id uuid references voting_apps(id) on delete cascade,
  order_num int not null,
  content text not null,
  created_at timestamp with time zone default now()
);

-- 3. tạo bảng guide_steps (các bước hướng dẫn chi tiết)
create table if not exists guide_steps (
  id uuid default gen_random_uuid() primary key,
  app_id uuid references voting_apps(id) on delete cascade,
  step_num int not null,
  title text,
  description text,
  image_url text,
  created_at timestamp with time zone default now()
);

-- 4. cấu hình rls (row level security) để mọi người đều xem được (fix lỗi 403)
alter table voting_apps enable row level security;
alter table app_strategies enable row level security;
alter table guide_steps enable row level security;

-- policy cho phép khách (anon) và user đã đăng nhập được xem dữ liệu
create policy "enable read access for all users" on voting_apps for select to anon, authenticated using (true);
create policy "enable read access for all users" on app_strategies for select to anon, authenticated using (true);
create policy "enable read access for all users" on guide_steps for select to anon, authenticated using (true);

-- 5. script dọn dẹp và đồng bộ dữ liệu (trong trường hợp bạn đã có dữ liệu cũ)
-- lệnh này sẽ giúp chuyển các giá trị lỡ nhập sai từ category sang program_name và reset category
update voting_apps 
set 
  program_name = category,
  category = case 
    when name in ('mnet plus', 'higher', 'muniverse', 'mubeat', 'linc', 'tin', 'idolchamp', 'fancast') then 'music_shows'
    when name in ('choeadol', 'kdol', 'queeri', 'upick', 'picnic', 'bugs favorite') then 'birthday'
    else 'awards'
  end
where program_name is null;