const express = require('express');
const router = express.Router();
const { supabasePublic, STORAGE_BUCKET } = require('../config/supabase');

function publicUrl(path) {
  if (!path) return null;
  const { data } = supabasePublic.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ---------- ACCUEIL ----------
router.get('/', async (req, res, next) => {
  try {
    const { data: projects, error } = await supabasePublic
      .from('projects')
      .select('id, titre, titre_en, titre_it, image_couverture, ordre_affichage')
      .eq('published', true)
      .order('ordre_affichage', { ascending: true });

    if (error) throw error;

    const projectsWithUrls = (projects || []).map((p) => ({
      ...p,
      image_url: publicUrl(p.image_couverture),
    }));

    res.render('index', { projects: projectsWithUrls, page: 'home' });
  } catch (err) {
    next(err);
  }
});

// ---------- PAGE PROJET ----------
router.get('/projet/:id', async (req, res, next) => {
  try {
    const { data: project, error } = await supabasePublic
      .from('projects')
      .select('*')
      .eq('id', req.params.id)
      .eq('published', true)
      .single();

    if (error || !project) {
      return res.status(404).render('404', { page: '404' });
    }

    const { data: images, error: imgError } = await supabasePublic
      .from('project_images')
      .select('*')
      .eq('project_id', project.id)
      .order('ordre', { ascending: true });

    if (imgError) throw imgError;

    const gallery = (images || []).map((img) => ({
      ...img,
      url: publicUrl(img.url_storage),
    }));

    res.render('project', { project, gallery, page: 'project' });
  } catch (err) {
    next(err);
  }
});

// ---------- PROFIL ----------
router.get('/profil', async (req, res, next) => {
  try {
    const { data: profile, error } = await supabasePublic
      .from('profile')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;

    const { data: experiences, error: expError } = await supabasePublic
      .from('experiences')
      .select('*')
      .order('ordre', { ascending: true });

    if (expError) throw expError;

    const { data: logiciels, error: logError } = await supabasePublic
      .from('logiciels')
      .select('*')
      .order('ordre', { ascending: true });

    if (logError) throw logError;

    res.render('profile', {
      profile: { ...profile, photo_url: publicUrl(profile.photo) },
      experiences: experiences || [],
      logiciels: logiciels || [],
      page: 'profile',
    });
  } catch (err) {
    next(err);
  }
});

// ---------- CONTACT ----------
router.get('/contact', async (req, res, next) => {
  try {
    const { data: contact, error } = await supabasePublic
      .from('contact')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;

    res.render('contact', { contact, page: 'contact' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;