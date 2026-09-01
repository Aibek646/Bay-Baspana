-- 003_subscriptions.sql — платный доступ к каталогу для покупателей
-- Бесплатных просмотров нет: без оплаты витрина возвращает пустой список.

-- ── Срок подписки хранится в профиле ──
alter table public.profiles
  add column if not exists "paidUntil" timestamptz,
  add column if not exists email text;

-- Почта дублируется из auth.users, чтобы админ видел, кому открывает доступ:
-- к auth.users из клиента обращаться нельзя
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

-- Новый аккаунт: профиль с нулевыми правами и почтой
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

-- ── Главный вратарь: сотрудник или оплативший покупатель ──
create or replace function public.has_access() returns boolean
language sql stable security definer set search_path = ''
as $$
select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and (role in ('admin', 'agent') or "paidUntil" > now())
);
$$;

-- Админ видит все профили — это список подписчиков
create policy "staff read profiles" on public.profiles
  for select to authenticated using (public.is_staff());

-- ── Витрина закрывается тем же условием ──
-- Вью читает таблицу в обход RLS, поэтому проверка живёт прямо в нём.
-- drop + create, а не create or replace: в списке колонок появились "soldAt"
-- и material, а replace умеет только дописывать колонки в конец.
-- Права после drop слетают, поэтому grant ниже обязателен.
drop view if exists public.apartments_public;

create view public.apartments_public as
select id, "cityId", "propertyType", address, price, photos, "createdAt",
       "isSold", "soldAt",
       "dealType", "downPayment", "installmentMonths", "monthlyPayment",
       rooms, area, "landArea", floor, "floorsTotal", "builtYear", material,
       "videoUrl"
from public.apartments
where public.has_access();

drop view if exists public.city_apartment_counts;

create view public.city_apartment_counts as
select "cityId", count(*)::int as total
from public.apartments
where public.has_access()
group by "cityId";

-- anon не получает ничего: без аккаунта каталога нет вообще
grant select on public.apartments_public to authenticated;
grant select on public.city_apartment_counts to authenticated;

-- ── Заявки на оплату ──
-- Покупатель переводит на Kaspi и жмёт «Я оплатил» — появляется строка здесь
create table if not exists public.access_requests (
    id uuid primary key default gen_random_uuid(),
    -- ссылка на profiles, а не на auth.users: так PostgREST умеет отдавать
    -- заявку вместе с профилем плательщика одним запросом
    "userId" uuid not null references public.profiles(id) on delete cascade,
    code text not null,              -- код из приложения, его пишут в комментарии к переводу
    "payerName" text,
    status text not null default 'pending'
        check (status in ('pending', 'approved', 'rejected')),
    "createdAt" timestamptz not null default now(),
    "decidedAt" timestamptz
);

alter table public.access_requests enable row level security;

-- Свои заявки: видно и можно создать. Решение принимает только сотрудник
create policy "users read own requests" on public.access_requests
  for select to authenticated using ("userId" = auth.uid() or public.is_staff());

create policy "users create own requests" on public.access_requests
  for insert to authenticated with check ("userId" = auth.uid());

-- update-политики нет намеренно: статус меняют только функции ниже

-- ── Решение админа ──
-- Досрочное продление добавляется к остатку, а не сбрасывает его
create or replace function public.approve_access(request_id uuid, months int default 12)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  target uuid;
begin
  if not public.is_staff() then
    raise exception 'forbidden';
  end if;

  select "userId" into target from public.access_requests where id = request_id;
  if target is null then
    raise exception 'request not found';
  end if;

  update public.profiles
  set "paidUntil" = greatest(coalesce("paidUntil", now()), now())
                    + make_interval(months => months)
  where id = target;

  update public.access_requests
  set status = 'approved', "decidedAt" = now()
  where id = request_id;
end;
$$;

create or replace function public.reject_access(request_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_staff() then
    raise exception 'forbidden';
  end if;

  update public.access_requests
  set status = 'rejected', "decidedAt" = now()
  where id = request_id;
end;
$$;

revoke execute on function public.approve_access(uuid, int) from anon;
revoke execute on function public.reject_access(uuid) from anon;
grant execute on function public.approve_access(uuid, int) to authenticated;
grant execute on function public.reject_access(uuid) to authenticated;

notify pgrst, 'reload schema';

-- ПОСЛЕ применения вручную в дашборде:
--   1) Authentication → Providers → Email → включить «Allow new users to sign up»
--   2) там же выключить «Confirm email» — иначе покупатель ждёт письмо
--   3) выдать себе подписку без заявки:
--      update public.profiles set "paidUntil" = now() + interval '1 year'
--      where email = 'клиент@почта';
