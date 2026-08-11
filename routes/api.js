const express = require('express');
const { activarClave } = require('../db/claves');

const router = express.Router();

router.post('/activate', (req, res) => {
  const apiKey = req.body?.apiKey;
  if (typeof apiKey !== 'string' || !apiKey.trim()) {
    return res.status(400).json({ ok: false, code: 'MISSING_API_KEY', message: 'Debes enviar apiKey en el cuerpo JSON.' });
  }

  const activacion = activarClave(apiKey);
  if (activacion.resultado === 'no_existe') {
    return res.status(404).json({ ok: false, code: 'API_KEY_NOT_FOUND', message: 'La API key no existe.' });
  }
  if (activacion.resultado === 'no_disponible') {
    return res.status(409).json({
      ok: false,
      code: 'API_KEY_NOT_AVAILABLE',
      message: 'La API key no está disponible para activación.',
      state: activacion.estado,
    });
  }

  return res.status(200).json({
    ok: true,
    code: 'ACTIVATED',
    message: 'La aplicación puede activarse.',
    activation: { apiKey: activacion.codigo, state: 'activada', activatedAt: activacion.activadaEl },
  });
});

module.exports = router;
