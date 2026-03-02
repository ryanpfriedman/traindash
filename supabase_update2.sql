-- Trigger to automatically create a profile entry for new users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, subscription_status)
  values (new.id, new.email, 'inactive');
  return new;
end;
$$;

-- Bind the trigger to the auth.users table
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profile for any users that signed up before the trigger was created
insert into public.profiles (id, email, subscription_status)
select id, email, 'inactive' from auth.users
where id not in (select id from public.profiles);
