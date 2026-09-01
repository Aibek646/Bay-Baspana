-- 001_schema.sql — таблицы, публичная витрина, хранилище фото
-- Применять первым на пустой базе Supabase, затем 002_roles.sql и 003_subscriptions.sql.
-- На уже работающей базе НЕ прогонять: файл рассчитан на пустую.

-- ── Города: общий справочник ──
create table public.cities (
    id text primary key,
    name text not null
);

alter table public.cities enable row level security;

create policy "authenticated read cities" on public.cities
  for select to authenticated using (true);

-- ── Объекты: квартиры, дома, коммерция, земля ──
-- Приватные колонки (ownerName, whatsapp, mapUrl, yandexUrl, comment, complex)
-- покупателю не отдаются: для него есть витрина apartments_public ниже.
-- В address пишется ТОЛЬКО район, точный адрес — ссылкой в mapUrl.
create table public.apartments (
    id uuid primary key default gen_random_uuid(),
    "cityId" text not null references public.cities(id),
    "propertyType" text not null default 'apartment'
        check ("propertyType" in ('apartment', 'house', 'commercial', 'land')),
    address text not null,
    price bigint,
    photos text[] default '{}',
    "createdAt" timestamptz default now(),

    -- продано: дата нужна, чтобы через три дня объект ушёл в архив
    "isSold" boolean default false,
    "soldAt" timestamptz,

    -- рассрочка
    "dealType" text default 'cash' check ("dealType" in ('cash', 'installment')),
    "downPayment" bigint,
    "installmentMonths" integer,
    "monthlyPayment" bigint,

    -- характеристики; какие из них показывать, решает тип объекта (src/property.ts)
    rooms smallint,
    area numeric(6, 1),
    "landArea" numeric(6, 1),
    floor smallint,
    "floorsTotal" smallint,
    "builtYear" smallint,
    material text,      -- из чего построен дом: кирпич, шпальный, камыш
    "videoUrl" text,

    -- приватное: видят только сотрудники
    "ownerName" text,
    whatsapp text,
    complex text,       -- ЖК
    "mapUrl" text,      -- 2ГИС
    "yandexUrl" text,   -- Яндекс.Карты
    comment text
);

alter table public.apartments enable row level security;
-- Политик здесь нет намеренно: они зависят от функции is_staff() из 002_roles.sql.
-- До применения 002 таблица закрыта полностью — это безопасное состояние.

-- ── Публичная витрина ──
-- Вью принадлежит владельцу базы и читает таблицу в обход RLS. Именно поэтому
-- покупатель видит каталог, не имея доступа к самой apartments.
-- Здесь перечислено ровно то, что можно показывать: приватных колонок нет.
-- В 003_subscriptions.sql это вью пересоздаётся с проверкой оплаты.
-- Если на новой базе каталог пустой — проверь security_invoker у вью.
create view public.apartments_public as
select id, "cityId", "propertyType", address, price, photos, "createdAt",
       "isSold", "soldAt",
       "dealType", "downPayment", "installmentMonths", "monthlyPayment",
       rooms, area, "landArea", floor, "floorsTotal", "builtYear", material,
       "videoUrl"
from public.apartments;

grant select on public.apartments_public to authenticated;

-- ── Счётчики объектов по городам ──
-- Нужны главной странице: без них она выкачивала бы весь каталог ради цифр.
-- PostgREST не умеет GROUP BY, поэтому группирует база.
create view public.city_apartment_counts as
select "cityId", count(*)::int as total
from public.apartments
group by "cityId";

grant select on public.city_apartment_counts to authenticated;

-- ── Хранилище фото ──
-- Bucket публичный на чтение: ссылки из photos открываются напрямую, без токена.
-- Политики на запись — в 002_roles.sql, они зависят от is_staff().
insert into storage.buckets (id, name, public)
values ('apartment-photos', 'apartment-photos', true)
on conflict (id) do nothing;

-- ── Города клиента: подставить свои ──
insert into public.cities (id, name) values
  ('almaty', 'Алматы'),
  ('astana', 'Астана'),
  ('karaganda', 'Караганда'),
  ('zhezkazgan', 'Жезказган')
on conflict (id) do nothing;

notify pgrst, 'reload schema';
