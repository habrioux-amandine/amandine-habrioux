const { supabaseAuth } = require('../config/supabase');

const COOKIE_NAME = 'sb_access_token';

/**
 * Protège les routes admin : vérifie que le cookie contient un token
 * Supabase valide. Si non connecté -> redirige vers /admin/login.
 */
async function requireAuth(req, res, next) {
  const token = req.cookies ? req.cookies[COOKIE_NAME] : null;

  if (!token) {
    return res.redirect('/admin/login');
  }

  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error || !data || !data.user) {
    res.clearCookie(COOKIE_NAME);
    return res.redirect('/admin/login');
  }

  req.adminUser = data.user;
  next();
}

/**
 * Si déjà connecté, redirige depuis /admin/login vers /admin
 */
async function redirectIfAuthenticated(req, res, next) {
  const token = req.cookies ? req.cookies[COOKIE_NAME] : null;
  if (!token) return next();

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (!error && data && data.user) {
    return res.redirect('/admin');
  }
  next();
}

module.exports = { requireAuth, redirectIfAuthenticated, COOKIE_NAME };
