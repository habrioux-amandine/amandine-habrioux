require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const publicRoutes = require('./src/routes/public');
const adminRoutes = require('./src/routes/admin');
const { detectLang } = require('./src/middleware/lang');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(detectLang);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use('/', publicRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('404', { page: '404' });
});

// Erreurs
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Une erreur est survenue. Merci de réessayer.');
});

app.listen(PORT, () => {
  console.log(`Site en ligne sur http://localhost:${PORT}`);
});
