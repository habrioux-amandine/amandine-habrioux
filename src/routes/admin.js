const express = require('express');
const multer = require('multer');
const router = express.Router();
const { supabaseAdmin, supabaseAuth, STORAGE_BUCKET } = require('../config/supabase');
const { requireAuth, redirectIfAuthenticated, COOKIE_NAME } = require('../middleware/auth');
const { compressImage, compressThumbnail } = require('../utils/imageCompress');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 Mo max en entrée, compressé ensuite
});

function publicUrl(path) {
  if (!path) return null;
  const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function uploadToStorage(buffer, contentType, folder) {
  const filename = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e6)}.webp`;
  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(filename, buffer, { contentType, upsert: false });
  if (error) throw error;
  return filename;
}

// ---------- LOGIN ----------
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('admin/login', { error: null, page: 'admin-login' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });

if (error) {
  console.error('[admin login] échec pour', email, '-', error.message);
}

  if (error || !data.session) {
    return res.render('admin/login', {
      error: 'Identifiants incorrects.',
      page: 'admin-login',
    });
  }

  res.cookie(COOKIE_NAME, data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
  });

  res.redirect('/admin');
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.redirect('/admin/login');
});

// Tout ce qui suit nécessite d'être connecté
router.use(requireAuth);

// ---------- DASHBOARD ----------
router.get('/', async (req, res, next) => {
  try {
    const { data: projects, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .order('ordre_affichage', { ascending: true });
    if (error) throw error;

    res.render('admin/dashboard', {
      projects: (projects || []).map((p) => ({ ...p, image_url: publicUrl(p.image_couverture) })),
      page: 'admin-dashboard',
    });
  } catch (err) {
    next(err);
  }
});

// ---------- CREER UN PROJET (formulaire) ----------
router.get('/projets/nouveau', (req, res) => {
  res.render('admin/project-edit', { project: null, gallery: [], page: 'admin-project' });
});

router.post('/projets/nouveau', upload.single('image_couverture'), async (req, res, next) => {
  try {
    const { titre, sous_titre, description, ordre_affichage, published } = req.body;
    let image_couverture = null;

    if (req.file) {
      const { buffer, contentType } = await compressThumbnail(req.file.buffer);
      image_couverture = await uploadToStorage(buffer, contentType, 'covers');
    }

    const { error } = await supabaseAdmin.from('projects').insert({
      titre,
      sous_titre,
      description,
      ordre_affichage: parseInt(ordre_affichage, 10) || 0,
      published: published === 'on',
      image_couverture,
    });
    if (error) throw error;

    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

// ---------- EDITER UN PROJET ----------
router.get('/projets/:id', async (req, res, next) => {
  try {
    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error || !project) return res.redirect('/admin');

    const { data: images, error: imgError } = await supabaseAdmin
      .from('project_images')
      .select('*')
      .eq('project_id', project.id)
      .order('ordre', { ascending: true });
    if (imgError) throw imgError;

    res.render('admin/project-edit', {
      project: { ...project, image_url: publicUrl(project.image_couverture) },
      gallery: (images || []).map((img) => ({ ...img, url: publicUrl(img.url_storage) })),
      page: 'admin-project',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/projets/:id', upload.single('image_couverture'), async (req, res, next) => {
  try {
    const { titre, sous_titre, description, ordre_affichage, published } = req.body;
    const updates = {
      titre,
      sous_titre,
      description,
      ordre_affichage: parseInt(ordre_affichage, 10) || 0,
      published: published === 'on',
    };

    if (req.file) {
      const { buffer, contentType } = await compressThumbnail(req.file.buffer);
      updates.image_couverture = await uploadToStorage(buffer, contentType, 'covers');
    }

    const { error } = await supabaseAdmin.from('projects').update(updates).eq('id', req.params.id);
    if (error) throw error;

    res.redirect(`/admin/projets/${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

router.post('/projets/:id/supprimer', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('projects').delete().eq('id', req.params.id);
    if (error) throw error;
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

// ---------- AJOUTER DES IMAGES A LA GALERIE D'UN PROJET ----------
router.post('/projets/:id/images', upload.array('images', 20), async (req, res, next) => {
  try {
    const files = req.files || [];

    const { data: existing } = await supabaseAdmin
      .from('project_images')
      .select('ordre')
      .eq('project_id', req.params.id)
      .order('ordre', { ascending: false })
      .limit(1);

    let nextOrdre = existing && existing[0] ? existing[0].ordre + 1 : 0;

    for (const file of files) {
      const { buffer, contentType } = await compressImage(file.buffer);
      const path = await uploadToStorage(buffer, contentType, 'gallery');
      await supabaseAdmin.from('project_images').insert({
        project_id: req.params.id,
        url_storage: path,
        ordre: nextOrdre++,
      });
    }

    res.redirect(`/admin/projets/${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

router.post('/projets/:id/images/:imageId/supprimer', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('project_images')
      .delete()
      .eq('id', req.params.imageId);
    if (error) throw error;
    res.redirect(`/admin/projets/${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

// ---------- PROFIL ----------
router.get('/profil', async (req, res, next) => {
  try {
    const { data: profile, error } = await supabaseAdmin.from('profile').select('*').eq('id', 1).single();
    if (error) throw error;
    res.render('admin/profile-edit', {
      profile: { ...profile, photo_url: publicUrl(profile.photo) },
      page: 'admin-profile',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/profil', upload.single('photo'), async (req, res, next) => {
  try {
    const { texte } = req.body;
    const updates = { texte };

    if (req.file) {
      const { buffer, contentType } = await compressImage(req.file.buffer, { maxWidth: 1200 });
      updates.photo = await uploadToStorage(buffer, contentType, 'profile');
    }

    const { error } = await supabaseAdmin.from('profile').update(updates).eq('id', 1);
    if (error) throw error;

    res.redirect('/admin/profil');
  } catch (err) {
    next(err);
  }
});

// ---------- CONTACT ----------
router.get('/contact', async (req, res, next) => {
  try {
    const { data: contact, error } = await supabaseAdmin.from('contact').select('*').eq('id', 1).single();
    if (error) throw error;
    res.render('admin/contact-edit', { contact, page: 'admin-contact' });
  } catch (err) {
    next(err);
  }
});

router.post('/contact', async (req, res, next) => {
  try {
    const { email, telephone, adresse, instagram, linkedin, autre } = req.body;
    const { error } = await supabaseAdmin
      .from('contact')
      .update({ email, telephone, adresse, instagram, linkedin, autre })
      .eq('id', 1);
    if (error) throw error;
    res.redirect('/admin/contact');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
