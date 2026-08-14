-- ============================================================
-- MIGRATION : Diaporama plein écran sur la page d'accueil
-- A exécuter dans Supabase > SQL Editor (site déjà existant)
-- ============================================================

-- ---------- HERO_SLIDES (photos du diaporama d'accueil) ----------
create table if not exists hero_slides (
  id uuid primary key default gen_random_uuid(),
  image text not null, -- chemin storage de la photo
  ordre integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- HERO_SETTINGS (réglages du diaporama, une seule ligne) ----------
create table if not exists hero_settings (
  id integer primary key default 1,
  vitesse_ms integer not null default 5000, -- durée d'affichage de chaque photo, en millisecondes
  updated_at timestamptz not null default now(),
  constraint single_row_hero check (id = 1)
);

insert into hero_settings (id) values (1) on conflict (id) do nothing;

drop trigger if exists trg_hero_settings_updated on hero_settings;
create trigger trg_hero_settings_updated before update on hero_settings
  for each row execute function set_updated_at();

-- ---------- RLS ----------
alter table hero_slides enable row level security;
alter table hero_settings enable row level security;

create policy "Lecture publique diaporama" on hero_slides
  for select using (true);

create policy "Ecriture admin diaporama" on hero_slides
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Lecture publique reglages diaporama" on hero_settings
  for select using (true);

create policy "Ecriture admin reglages diaporama" on hero_settings
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
