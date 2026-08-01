-- ============================================================
-- PROJETS D'EXEMPLE — à exécuter APRÈS schema.sql
-- Contenu de démonstration, à modifier/remplacer ensuite
-- depuis l'espace admin (/admin), y compris les images.
-- ============================================================

insert into projects (titre, sous_titre, description, ordre_affichage, published)
values
(
  'Maison D.',
  'Extension et rénovation — Périgueux',
  'Extension en ossature bois d''une maison des années 1970, pensée comme un prolongement discret du volume existant plutôt qu''un geste architectural démonstratif. Le projet réorganise la circulation intérieure autour d''un nouveau séjour traversant, ouvert sur le jardin par une large baie orientée sud.

Surface créée : 32 m²
Surface rénovée : 95 m²
Livraison : 2025',
  0,
  true
),
(
  'Atelier B.',
  'Réhabilitation d''un atelier en espace de vie — Angoulême',
  'Reconversion d''un ancien atelier de mécanique en habitation, en conservant la structure métallique et la charpente apparentes comme éléments identitaires du lieu. Le plan libre d''origine est conservé au maximum, les espaces intimes étant traités comme des volumes construits à l''intérieur du grand volume existant.

Surface : 140 m²
Livraison : 2024',
  1,
  true
),
(
  'Pavillon du Seuil',
  'Projet de fin d''études — ENSA',
  'Travail de diplôme portant sur la notion de seuil dans l''habitat collectif : comment un espace intermédiaire, ni tout à fait privé ni tout à fait public, peut recomposer les usages d''un immeuble de logements. Le projet propose une façade épaissie, habitée, qui absorbe rangements, loggias et assises.

Studio de projet : Master 2
Année : 2023',
  2,
  true
)
on conflict do nothing;
