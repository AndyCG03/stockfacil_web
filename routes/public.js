const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { titulo: 'StockFácil — Inventario y ventas sin internet' });
});

module.exports = router;
