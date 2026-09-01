-- 004_public_comment.sql — описание объекта видят и покупатели
-- Колонка comment переезжает из приватных в публичные: риелтор пишет там
-- то, что раньше приходилось рассказывать по телефону.
-- ВАЖНО: всё, что уже лежит в comment, станет видно подписчикам.

-- create or replace здесь работает, потому что колонка дописывается в конец
-- списка. Права на вью при replace сохраняются, grant не нужен
create or replace view public.apartments_public as
select id, "cityId", "propertyType", address, price, photos, "createdAt",
       "isSold", "soldAt",
       "dealType", "downPayment", "installmentMonths", "monthlyPayment",
       rooms, area, "landArea", floor, "floorsTotal", "builtYear", material,
       "videoUrl",
       comment
from public.apartments
where public.has_access();

notify pgrst, 'reload schema';
