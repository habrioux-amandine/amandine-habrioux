# Site portfolio — Architecte

Site vitrine + espace d'administration, 100% gratuit : Node.js/Express + EJS, Supabase (base de données, stockage d'images, authentification), déployé sur Render, code sur GitHub.

## 1. Créer le projet Supabase

1. Va sur https://supabase.com → **New project** (le plan gratuit suffit largement).
2. Une fois le projet créé, va dans **SQL Editor** → colle le contenu de `supabase/schema.sql` → **Run**.
   Cela crée les tables `projects`, `project_images`, `profile`, `contact`.
   Optionnel : colle ensuite `supabase/seed.sql` → **Run** pour créer 3 projets d'exemple (texte uniquement, sans images — à compléter ensuite depuis `/admin`, ou à supprimer si tu préfères repartir de zéro).
3. Va dans **Storage** → **Create a new bucket** :
   - Nom : `site-images`
   - Coche **Public bucket** (pour que les images s'affichent directement, hébergées chez toi/Supabase — jamais de redirection vers un site tiers)
4. Dans **Storage > Policies** pour le bucket `site-images`, ajoute une policy de lecture publique :
   - `SELECT` : `true` (autorisé pour tout le monde)
   - L'écriture (`INSERT`/`UPDATE`/`DELETE`) se fait uniquement via le serveur avec la clé `service_role`, qui contourne les policies — donc pas besoin de policy d'écriture ici.
5. Va dans **Authentication > Users** → **Add user** → crée ton compte admin (email + mot de passe). C'est ce compte qui te servira à te connecter sur `/admin`.
6. Récupère tes clés dans **Project Settings > API** :
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY`
   - `service_role` (secrète, ne jamais l'exposer côté navigateur) → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Configuration locale

```bash
cp .env.example .env
# renseigne SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev
```

Le site est disponible sur http://localhost:3000, l'admin sur http://localhost:3000/admin/login.

## 3. Mettre le code sur GitHub

```bash
git init
git add .
git commit -m "Site portfolio initial"
git branch -M main
git remote add origin https://github.com/TON-COMPTE/architecte-site.git
git push -u origin main
```

## 4. Déployer sur Render

1. Sur https://render.com → **New > Web Service** → connecte ton dépôt GitHub.
2. Configuration :
   - **Build command** : `npm install`
   - **Start command** : `npm start`
   - **Plan** : Free
3. Dans **Environment**, ajoute les mêmes variables que ton `.env` (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET, NODE_ENV=production).
4. Déploie. Render te donne une URL type `https://architecte-site.onrender.com`.

⚠️ Sur le plan gratuit Render, le service s'endort après 15 min d'inactivité et met quelques secondes à se réveiller au premier visiteur — normal, pas un bug.

## 5. Utiliser l'administration

- Va sur `/admin/login`, connecte-toi avec le compte créé à l'étape 1.5.
- **Projets** : crée un projet (titre, sous-titre, description, schéma affiché sur l'accueil au survol), puis ajoute les images de la galerie qui s'affichent en slide sur la page du projet. Le schéma de couverture peut être remplacé à tout moment depuis la fiche du projet.
- **Profil** : photo + texte type CV allégé.
- **Contact** : toutes les coordonnées affichées sur la page contact.
- Toute image ajoutée est automatiquement compressée et convertie en WebP côté serveur (via `sharp`) avant l'envoi vers Supabase Storage, pour ne pas surcharger la base ni la bande passante.

## Typographie

- Titres / sous-titres : **Space Grotesk** (700/500) — alternative gratuite à LemonMilk, même esprit géométrique/architectural, sans souci de licence.
- Corps de texte / légendes : **Ibarra Real Nova**.
- Les deux sont chargées via Google Fonts (gratuit, `views/partials/head.ejs`). Si tu préfères les héberger toi-même plus tard (fichiers dans `public/fonts/`), c'est possible — demande-moi et je fais la bascule en `@font-face`.

## Arborescence

```
server.js                  → point d'entrée Express
src/config/supabase.js     → clients Supabase (public / admin)
src/middleware/auth.js     → protection des routes admin
src/routes/public.js       → accueil, page projet, profil, contact
src/routes/admin.js        → login + CRUD projets/profil/contact
src/utils/imageCompress.js → compression des images (sharp)
views/                     → templates EJS (public + admin/)
public/css/style.css       → design (fond blanc, texte noir, épuré)
public/js/gallery.js       → slide horizontal de la galerie projet
supabase/schema.sql        → schéma de base de données à exécuter
```
