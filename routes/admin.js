const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db/database');
const { crearClaves, listarClaves, cambiarEstado, eliminarClave, estadisticas } = require('../db/claves');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// --- Login ---

router.get('/login', (req, res) => {
  if (req.session.adminId) return res.redirect('/admin');
  res.render('admin/login', { titulo: 'Ingresar — Administración StockFácil', error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);

  if (!admin || !bcrypt.compareSync(password || '', admin.passwordHash)) {
    return res.status(401).render('admin/login', {
      titulo: 'Ingresar — Administración StockFácil',
      error: 'Usuario o contraseña incorrectos.',
    });
  }

  req.session.adminId = admin.id;
  req.session.adminUsername = admin.username;
  res.redirect('/admin');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// --- Dashboard de claves (protegido) ---

router.get('/', requireAdmin, (req, res) => {
  res.render('admin/dashboard', {
    titulo: 'Claves de acceso — Administración StockFácil',
    claves: listarClaves(),
    stats: estadisticas(),
    adminUsername: req.session.adminUsername,
    mensaje: req.query.mensaje || null,
  });
});

router.post('/claves/generar', requireAdmin, (req, res) => {
  const cantidad = Math.min(Math.max(parseInt(req.body.cantidad, 10) || 1, 1), 100);
  const nota = (req.body.nota || '').trim();
  crearClaves(cantidad, nota);
  res.redirect(`/admin?mensaje=${encodeURIComponent(`${cantidad} clave(s) generada(s) ✓`)}`);
});

router.post('/claves/:id/estado', requireAdmin, (req, res) => {
  const { estado } = req.body;
  const estadosValidos = ['disponible', 'entregada', 'activada', 'revocada'];
  if (estadosValidos.includes(estado)) {
    cambiarEstado(req.params.id, estado);
  }
  res.redirect('/admin');
});

router.post('/claves/:id/eliminar', requireAdmin, (req, res) => {
  eliminarClave(req.params.id);
  res.redirect(`/admin?mensaje=${encodeURIComponent('Clave eliminada')}`);
});

module.exports = router;
