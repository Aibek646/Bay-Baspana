-- 005_delete_account.sql — удаление аккаунта самим пользователем
-- Google Play и App Store требуют такую возможность внутри приложения:
-- если аккаунт можно создать, его должно быть можно и удалить, без переписки.

-- Удаляет только себя: id берётся из токена, параметра нет намеренно —
-- иначе кто-нибудь передал бы чужой.
-- Профиль и заявки уйдут каскадом: они ссылаются на auth.users и profiles
-- с on delete cascade.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'not authenticated';
  end if;

  -- Сотрудник так себя не удалит: у админа это единственный способ
  -- потерять доступ к собственной базе одним нажатием.
  -- Такой аккаунт удаляется из дашборда Supabase, руками
  if public.is_staff() then
    raise exception 'staff account';
  end if;

  delete from auth.users where id = me;
end;
$$;

revoke execute on function public.delete_my_account() from anon;
grant execute on function public.delete_my_account() to authenticated;

notify pgrst, 'reload schema';
