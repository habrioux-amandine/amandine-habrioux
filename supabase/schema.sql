-- ============================================================
-- SCHEMA SUPABASE - Site portfolio architecte
-- A exécuter dans Supabase > SQL Editor
-- ============================================================

-- Extension pour UUID
create extension if not exists "pgcrypto";

-- ---------- PROJECTS ----------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  sous_titre text,
  description text,
  ordre_affichage integer not null default 0,
  image_couverture text, -- chemin storage de l'image de couverture (utilisée sur l'accueil)
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- PROJECT_IMAGES (galerie d'un projet) ----------
create table if not exists project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  url_storage text not null, -- chemin dans le bucket Supabase Storage
  ordre integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- PROFILE (page "profil", une seule ligne) ----------
create table if not exists profile (
  id integer primary key default 1,
  photo text, -- chemin storage
  texte text, -- texte type CV allégé (peut contenir du markdown simple)
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into profile (id, texte) values (1, '') on conflict (id) do nothing;

-- ---------- CONTACT (une seule ligne) ----------
create table if not exists contact (
  id integer primary key default 1,
  email text,
  telephone text,
  adresse text,
  instagram text,
  linkedin text,
  autre text,
  updated_at timestamptz not null default now(),
  constraint single_row_contact check (id = 1)
);

insert into contact (id) values (1) on conflict (id) do nothing;

-- ---------- Trigger updated_at ----------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_projects_updated on projects;
create trigger trg_projects_updated before update on projects
  for each row execute function set_updated_at();

drop trigger if exists trg_profile_updated on profile;
create trigger trg_profile_updated before update on profile
  for each row execute function set_updated_at();

drop trigger if exists trg_contact_updated on contact;
create trigger trg_contact_updated before update on contact
  for each row execute function set_updated_at();

-- ---------- Row Level Security ----------
-- Lecture publique des projets publiés, écriture réservée aux utilisateurs authentifiés (l'admin)
alter table projects enable row level security;
alter table project_images enable row level security;
alter table profile enable row level security;
alter table contact enable row level security;

create policy "Lecture publique projets publiés" on projects
  for select using (published = true);

create policy "Ecriture admin projets" on projects
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Lecture publique images" on project_images
  for select using (true);

create policy "Ecriture admin images" on project_images
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Lecture publique profil" on profile
  for select using (true);

create policy "Ecriture admin profil" on profile
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Lecture publique contact" on contact
  for select using (true);

create policy "Ecriture admin contact" on contact
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE : à créer manuellement dans Supabase > Storage
-- Bucket "site-images" (public en lecture)
-- Voir README.md pour les policies de ce bucket.
-- ============================================================
