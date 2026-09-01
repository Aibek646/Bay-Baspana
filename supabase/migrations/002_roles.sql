-- 002_roles.sql — роли сотрудников, изоляция приватных данных, справочник партнёров
-- Применять вторым, после 001_schema.sql.

-- Роли: admin (всё), agent (видит приватное, правит), viewer (прав нет).
-- Покупатель остаётся viewer — доступ к каталогу ему даёт оплата (003).
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    role text not null default 'viewer' check (role in ('admin', 'agent', 'viewer')),
    "createdAt" timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Читать можно только свою строку. Политик insert/update нет намеренно:
-- роль меняется только из дашборда, где работает service_role
create policy "users read own profile" on public.profiles
  for select to authenticated using (id = auth.uid());

-- Хелперы для политик. security definer — чтобы обойти RLS на profiles,
-- stable — чтобы вызвались один раз на запрос, а не на каждую строку.
-- set search_path = '' обязателен: иначе владелец функции рискует выполнить
-- чужую таблицу с тем же именем, поэтому все имена пишем полностью
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = ''
as $$
select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'agent')
);
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
);
$$;

-- ── Объекты: читают и правят сотрудники, удаляет только админ ──
-- Покупатель сюда не ходит вообще, ему отдаётся вью apartments_public
create policy "staff read apartments" on public.apartments
  for select to authenticated using (public.is_staff());

create policy "staff insert apartments" on public.apartments
  for insert to authenticated with check (public.is_staff());

create policy "staff update apartments" on public.apartments
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "admin delete apartments" on public.apartments
  for delete to authenticated using (public.is_admin());

-- ── Партнёры: нотариусы, банки, оценщики ──
-- Таблица целиком закрыта от покупателей: вью для неё нет
create table public.contacts (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    role text,
    phone text,
    address text,
    "mapUrl" text,
    comment text,
    "createdAt" timestamptz default now()
);

alter table public.contacts enable row level security;

create policy "staff read contacts" on public.contacts
  for select to authenticated using (public.is_staff());

create policy "staff insert contacts" on public.contacts
  for insert to authenticated with check (public.is_staff());

create policy "staff update contacts" on public.contacts
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "admin delete contacts" on public.contacts
  for delete to authenticated using (public.is_admin());

-- ── Фото: загружают, читают и удаляют только сотрудники ──
-- SELECT нужен именно для удаления: без него storage.remove() молча
-- не находит файлы и возвращает пустой список вместо ошибки
create policy "staff upload photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'apartment-photos' and public.is_staff());

create policy "staff read photo objects" on storage.objects
  for select to authenticated
  using (bucket_id = 'apartment-photos' and public.is_staff());

create policy "staff delete photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'apartment-photos' and public.is_staff());

-- Новый аккаунт получает нулевые права автоматически.
-- В 003 функция пересоздаётся: туда добавляется почта
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Профили для пользователей, созданных до этой миграции
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

notify pgrst, 'reload schema';

-- ПОСЛЕ развёртывания вручную:
--   1) Authentication → Users → создать сотрудника (Auto Confirm)
--   2) update public.profiles set role = 'admin'
--      where id = (select id from auth.users where lower(email) = lower('его@почта'));
--      регистр почты важен — сравнение через lower() спасает от «0 rows»
