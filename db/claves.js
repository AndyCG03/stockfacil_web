const { db } = require('../db/database');

// Alfabeto sin caracteres ambiguos (sin 0/O, 1/I) para que sea fácil
// de transcribir a mano cuando el admin la entrega en persona.
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generarBloque(longitud) {
  let bloque = '';
  for (let i = 0; i < longitud; i++) {
    bloque += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return bloque;
}

function generarCodigoUnico() {
  let codigo;
  let existe;
  do {
    codigo = `SF-${generarBloque(4)}-${generarBloque(4)}`;
    existe = db.prepare('SELECT 1 FROM claves WHERE codigo = ?').get(codigo);
  } while (existe);
  return codigo;
}

function crearClaves(cantidad, nota) {
  const insertar = db.prepare(
    'INSERT INTO claves (codigo, nota, creadaEl, estado) VALUES (?, ?, ?, ?)'
  );
  const ahora = new Date().toISOString();
  const codigos = [];

  const transaccion = db.transaction(() => {
    for (let i = 0; i < cantidad; i++) {
      const codigo = generarCodigoUnico();
      insertar.run(codigo, nota || null, ahora, 'disponible');
      codigos.push(codigo);
    }
  });
  transaccion();

  return codigos;
}

function listarClaves() {
  return db.prepare('SELECT * FROM claves ORDER BY id DESC').all();
}

function cambiarEstado(id, estado) {
  const campoFecha =
    estado === 'entregada' ? 'entregadaEl' : estado === 'activada' ? 'activadaEl' : null;

  if (campoFecha) {
    db.prepare(`UPDATE claves SET estado = ?, ${campoFecha} = ? WHERE id = ?`).run(
      estado,
      new Date().toISOString(),
      id
    );
  } else {
    db.prepare('UPDATE claves SET estado = ? WHERE id = ?').run(estado, id);
  }
}

function eliminarClave(id) {
  db.prepare('DELETE FROM claves WHERE id = ?').run(id);
}

function estadisticas() {
  const total = db.prepare('SELECT COUNT(*) AS n FROM claves').get().n;
  const disponibles = db.prepare("SELECT COUNT(*) AS n FROM claves WHERE estado = 'disponible'").get().n;
  const entregadas = db.prepare("SELECT COUNT(*) AS n FROM claves WHERE estado = 'entregada'").get().n;
  const activadas = db.prepare("SELECT COUNT(*) AS n FROM claves WHERE estado = 'activada'").get().n;
  const revocadas = db.prepare("SELECT COUNT(*) AS n FROM claves WHERE estado = 'revocada'").get().n;
  return { total, disponibles, entregadas, activadas, revocadas };
}

function activarClave(codigo) {
  const activar = db.transaction((codigoNormalizado) => {
    const clave = db.prepare('SELECT id, codigo, estado FROM claves WHERE codigo = ?').get(codigoNormalizado);
    if (!clave) return { resultado: 'no_existe' };
    if (clave.estado !== 'disponible') return { resultado: 'no_disponible', estado: clave.estado };

    const activadaEl = new Date().toISOString();
    const cambio = db.prepare(
      "UPDATE claves SET estado = 'activada', activadaEl = ? WHERE id = ? AND estado = 'disponible'"
    ).run(activadaEl, clave.id);

    if (cambio.changes !== 1) {
      const actual = db.prepare('SELECT estado FROM claves WHERE id = ?').get(clave.id);
      return { resultado: 'no_disponible', estado: actual?.estado || 'desconocido' };
    }
    return { resultado: 'activada', codigo: clave.codigo, activadaEl };
  });

  return activar(String(codigo || '').trim().toUpperCase());
}

module.exports = { crearClaves, listarClaves, cambiarEstado, eliminarClave, estadisticas, activarClave };
