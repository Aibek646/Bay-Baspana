-- 001_schema.sql — таблицы, публичная витрина, хранилище фото
-- Применять первым на пустой базе Supabase, до 002_roles.sql

-- ── Города: общий справочник, читают все, включая анонимов ──
create table public.cities (
                               id text primary key,
                               name text not null
);

alter table public.cities enable row level security;

create policy "anyone can read cities" on public.cities
  for select using (true);

-- ── Квартиры ──
-- Приватные колонки (ownerName, whatsapp, mapUrl, comment) клиенту
-- не отдаются: для него есть витрина apartments_public ниже.
-- В address пишется ТОЛЬКО район, точный адрес — ссылкой в mapUrl.
create table public.apartments (
                                   id uuid primary key default gen_random_uuid(),
                                   "cityId" text not null references public.cities(id),
                                   address text not null,
                                   "ownerName" text,
                                   whatsapp text,
                                   price bigint,
                                   "isSold" boolean default false,
                                   comment text,
                                   photos text[] default '{}',
                                   "dealType" text default 'cash' check ("dealType" in ('cash', 'installment')),
                                   "downPayment" bigint,
                                   "installmentMonths" integer,
                                   "monthlyPayment" bigint,
                                   "mapUrl" text,
                                   "createdAt" timestamptz default now()
);

alter table public.apartments enable row level security;
-- Политик здесь нет намеренно: они зависят от функции is_staff() из 002_roles.sql.
-- До применения 002 таблица закрыта полностью — это безопасное состояние.

-- ── Публичная витрина ──
-- Вью принадлежит владельцу базы и читает таблицу в обход RLS. Именно поэтому
-- анонимный клиент видит каталог, не имея никакого доступа к apartments.
-- Если на новой базе гость каталога не видит — проверь security_invoker у вью.
create view public.apartments_public as
select id, "cityId", address, price, "isSold", "dealType",
       "downPayment", "installmentMonths", "monthlyPayment", photos, "createdAt"
from public.apartments;

grant select on public.apartments_public to anon, authenticated;

-- ── Хранилище фото ──
-- Bucket публичный на чтение: ссылки из photos открываются у клиентов напрямую.
-- Политики на запись — в 002_roles.sql, они тоже зависят от is_staff().
insert into storage.buckets (id, name, public)
values ('apartment-photos', 'apartment-photos', true)
    on conflict (id) do nothing;

-- ── Города клиента: подставить свои ──
-- Свои посмотри так: select * from public.cities;
insert into public.cities (id, name) values
                                         ('almaty', 'Алматы'),
                                         ('astana', 'Астана')
    on conflict (id) do nothing;