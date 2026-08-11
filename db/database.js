const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'stockfacil.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS claves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    nota TEXT,
    creadaEl TEXT NOT NULL,
    entregadaEl TEXT,
    activadaEl TEXT,
    estado TEXT NOT NULL DEFAULT 'disponible' -- disponible | entregada | activada | revocada
  );
`);

// Crea el usuario admin la primera vez, usando las credenciales del .env.
function asegurarAdminPorDefecto() {
  const existente = db.prepare('SELECT * FROM admins LIMIT 1').get();
  if (existente) return;

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'stockfacil';
  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare('INSERT INTO admins (username, passwordHash) VALUES (?, ?)').run(username, passwordHash);
  console.log(`[stockfacil-web] Usuario admin creado: "${username}" (definido por .env)`);
}

module.exports = { db, asegurarAdminPorDefecto };
