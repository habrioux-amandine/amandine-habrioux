const translations = require('../i18n/translations');

const SUPPORTED_LANGS = ['fr', 'en', 'it'];
const COOKIE_NAME = 'site_lang';

function detectLang(req, res, next) {
  let lang = req.query.lang;

  if (lang && SUPPORTED_LANGS.includes(lang)) {
    res.cookie(COOKIE_NAME, lang, {
      maxAge: 1000 * 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  } else {
    lang = req.cookies ? req.cookies[COOKIE_NAME] : null;
  }

  if (!SUPPORTED_LANGS.includes(lang)) {
    lang = 'fr';
  }

  req.lang = lang;
  res.locals.lang = lang;
  res.locals.currentPath = req.path;

  res.locals.t = (key) => (translations[lang] && translations[lang][key]) || translations.fr[key] || key;

  res.locals.pick = (row, field) => {
    if (!row) return '';
    if (lang !== 'fr') {
      const val = row[`${field}_${lang}`];
      if (val) return val;
    }
    return row[field] || '';
  };

  next();
}

module.exports = { detectLang, SUPPORTED_LANGS, COOKIE_NAME };