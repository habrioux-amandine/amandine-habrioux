const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn('[supabase] SUPABASE_URL / SUPABASE_ANON_KEY manquants dans .env');
}

// Client "public" : utilisé pour toutes les lectures côté site public.
// Respecte les policies RLS (lecture seule sur ce qui est publié).
const supabasePublic = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Client "admin" : utilisé uniquement dans les routes protégées par le middleware requireAuth.
// La clé service_role contourne le RLS, donc ne JAMAIS l'exposer côté client.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Client utilisé uniquement pour vérifier les identifiants de connexion admin
// (auth.signInWithPassword), avec la clé anon.
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'site-images';

module.exports = { supabasePublic, supabaseAdmin, supabaseAuth, STORAGE_BUCKET };
