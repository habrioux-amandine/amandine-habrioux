const sharp = require('sharp');

/**
 * Compresse et redimensionne une image en mémoire (buffer -> buffer WebP).
 * Objectif : ne pas surcharger le stockage / la bande passante, tout en gardant
 * une qualité suffisante pour un portfolio d'architecture.
 *
 * @param {Buffer} inputBuffer - Buffer de l'image originale (venant de multer)
 * @param {Object} options
 * @param {number} options.maxWidth - largeur max en px (défaut 1920, adapté aux grandes images de projet)
 * @param {number} options.quality - qualité webp 1-100 (défaut 80)
 * @returns {Promise<{ buffer: Buffer, contentType: string, ext: string }>}
 */
async function compressImage(inputBuffer, options = {}) {
  const { maxWidth = 1920, quality = 80 } = options;

  const buffer = await sharp(inputBuffer)
    .rotate() // corrige l'orientation EXIF automatiquement
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  return { buffer, contentType: 'image/webp', ext: 'webp' };
}

/**
 * Version "miniature" pour les vignettes de la page d'accueil (plus légère).
 */
async function compressThumbnail(inputBuffer, options = {}) {
  const { maxWidth = 900, quality = 75 } = options;
  return compressImage(inputBuffer, { maxWidth, quality });
}

module.exports = { compressImage, compressThumbnail };
