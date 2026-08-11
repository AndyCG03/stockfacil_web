const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', {
    titulo: 'StockFácil — Inventario y ventas sin internet',
    appDownloadUrl: process.env.ANDROID_APK_URL || '',
    appVersion: process.env.ANDROID_APP_VERSION || 'Próximamente',
    appSize: process.env.ANDROID_APK_SIZE || 'APK firmado',
    appSha256: process.env.ANDROID_APK_SHA256 || '',
  });
});

module.exports = router;
