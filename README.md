# StockFácil Web

Sitio de promoción de la app StockFácil, con un panel de administración
para generar y gestionar claves de acceso que se entregan manualmente.

## Stack

- Node.js + Express
- EJS (vistas renderizadas en servidor, sin frontend framework)
- SQLite (`better-sqlite3`) para persistencia de claves y del usuario admin
- Sesiones con `express-session` + contraseña hasheada con `bcryptjs`

No requiere ninguna base de datos externa: todo corre con un solo archivo SQLite local (`db/stockfacil.db`), que se crea automáticamente al arrancar.

## Cómo correr el proyecto

```bash
npm install
cp .env.example .env
```

Editar `.env` y definir:

- `SESSION_SECRET`: un string largo y random (`openssl rand -hex 32`).
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`: las credenciales del panel de administración. **Se usan solo la primera vez que arranca el servidor**, para crear el usuario admin en la base de datos (después el password queda hasheado y cambiar el `.env` no lo modifica).

Luego:

```bash
npm start
```

- Sitio público: http://localhost:3000
- Panel de administración: http://localhost:3000/admin

## Cómo funciona la generación de claves

1. Entra a `/admin` con el usuario y contraseña definidos en `.env`.
2. En "Generar nuevas claves" elige cuántas claves crear (hasta 100 por vez) y opcionalmente una nota (por ejemplo, el nombre del negocio al que se la entregarás).
3. Cada clave tiene el formato `SF-XXXX-XXXX`, generada con un alfabeto sin caracteres ambiguos (sin `0`/`O`, sin `1`/`I`) para que sea fácil de transcribir a mano.
4. Cada clave tiene un estado: `disponible` → `entregada` → `activada`, o `revocada` si quieres invalidarla. Puedes cambiar el estado manualmente desde la tabla.
5. El botón "Copiar" junto a cada código la copia al portapapeles para pegarla en un mensaje.

**Importante**: este sitio genera y administra las claves, pero **no valida automáticamente contra la app StockFácil** (la app no tiene conexión a internet, así que no puede consultar este servidor). El flujo pensado es:

1. Genera la clave aquí.
2. Se la das manualmente a la persona (por WhatsApp, en persona, etc.).
3. Lleva el registro de la clave entregada usando la columna "Nota" y el cambio de estado a "Entregada"/"Activada".

La aplicación puede validar la clave mediante `POST /api/activate` enviando `{ "apiKey": "SF-XXXX-XXXX" }`. Una respuesta `200` confirma que puede activarse; `404` indica que no existe y `409` que no está disponible.

## Estructura

```
stockfacil-web/
  db/
    database.js     # conexión SQLite + creación del admin por defecto
    claves.js        # lógica de generación y gestión de claves
  middleware/
    auth.js           # protección de rutas de administración
  routes/
    public.js         # landing page
    admin.js           # login, dashboard, generar/cambiar estado/eliminar claves
  views/
    index.ejs            # landing
    admin/login.ejs
    admin/dashboard.ejs
    404.ejs
  public/
    css/
      base.css           # variables de diseño y reset
      landing.css         # estilos de la landing (incluye el motivo animado del logo)
      admin.css            # estilos del panel de administración
    img/logo.png
  server.js
```

## Seguridad — antes de poner esto en producción

- Cambiar `SESSION_SECRET` y las credenciales de `.env` por valores propios (no dejar los de ejemplo).
- Servir el sitio detrás de HTTPS (por ejemplo, con un proxy como Nginx o directamente en un hosting que provea TLS). Las cookies de sesión no tienen `secure: true` activado por defecto porque eso requiere HTTPS; si vas a exponer el sitio en internet, activarlo en `server.js`.
- Considerar agregar rate-limiting al login de administración (por ejemplo con `express-rate-limit`) para evitar intentos de fuerza bruta contra la contraseña.
- Hacer backup periódico de `db/stockfacil.db` (contiene el historial completo de claves generadas).
