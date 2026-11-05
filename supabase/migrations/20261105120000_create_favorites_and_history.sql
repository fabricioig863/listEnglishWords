-- Favoritos e histórico por usuário, com snapshot para exibir as listas
-- sem consultar a API do dicionário para cada item.

create table public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  word text not null check (word ~ '^[a-z]+$'),
  phonetic text,
  part_of_speech text,
  first_definition text,
  has_definition boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (user_id, word)
);

create table public.history (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  word text not null check (word ~ '^[a-z]+$'),
  phonetic text,
  part_of_speech text,
  has_definition boolean not null default true,
  viewed_at timestamptz not null default now(),
  primary key (user_id, word)
);

create index favorites_user_created_at_idx on public.favorites (user_id, created_at desc);
create index history_user_viewed_at_idx on public.history (user_id, viewed_at desc);

-- Row Level Security: cada usuário acessa somente as próprias linhas.

alter table public.favorites enable row level security;
alter table public.history enable row level security;

create policy "Users can read own favorites"
  on public.favorites for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own favorites"
  on public.favorites for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own favorites"
  on public.favorites for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own favorites"
  on public.favorites for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can read own history"
  on public.history for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own history"
  on public.history for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own history"
  on public.history for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own history"
  on public.history for delete to authenticated
  using ((select auth.uid()) = user_id);
