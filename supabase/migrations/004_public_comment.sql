-- 004_public_comment.sql — описание объекта видят и покупатели
-- Колонка comment переезжает из приватных в публичные: риелтор пишет там
-- то, что раньше приходилось рассказывать по телефону.
-- ВАЖНО: всё, что уже лежит в comment, станет видно подписчикам.

-- drop + create, а не create or replace: replace умеет только дописывать
-- колонки в конец и падает, если порядок отличается хоть на одну позицию
-- (42P16 cannot change name of view column). Заодно приводим список колонок
-- к окончательному: с "soldAt" и material, которых покупателям не хватало.
-- После drop права слетают — grant ниже обязателен.
drop view if exists public.apartments_public;

create view public.apartments_public as
select id, "cityId", "propertyType", address, price, photos, "createdAt",
       "isSold", "soldAt",
       "dealType", "downPayment", "installmentMonths", "monthlyPayment",
       rooms, area, "landArea", floor, "floorsTotal", "builtYear", material,
       "videoUrl",
       comment
from public.apartments
where public.has_access();

-- anon не получает ничего: без аккаунта каталога нет вообще
grant select on public.apartments_public to authenticated;

notify pgrst, 'reload schema';
