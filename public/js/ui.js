(() => {
  const root = document.documentElement;
  const themeButtons = document.querySelectorAll('[data-theme-toggle]');
  const languageButtons = document.querySelectorAll('[data-language-toggle]');
  const dictionary = {
    'Cómo funciona': 'How it works', 'Funciones': 'Features', 'La app': 'The app',
    'Pedir clave de acceso': 'Request access key', 'Pedir mi clave de acceso': 'Request my access key',
    'Ver cómo funciona': 'See how it works', 'Cómo empezar': 'Getting started',
    'Funciones': 'Features', 'Inventario manual': 'Manual inventory', 'Ventas en segundos': 'Sales in seconds',
    'Resumen diario': 'Daily summary', 'Cero internet requerido': 'No internet required',
    'Modo tableta': 'Tablet mode', 'Backup local': 'Local backup', 'Así se ve': 'Preview',
    'Registrar venta': 'Register sale', 'Escribir para pedir clave': 'Request a key by email',
    'Ya tengo acceso de administrador': 'I already have administrator access',
    'Cerrar sesión': 'Sign out', 'Administración': 'Administration', 'Claves de acceso': 'API keys',
    'Total generadas': 'Total generated', 'Disponibles': 'Available', 'Entregadas': 'Delivered',
    'Activadas': 'Activated', 'Revocadas': 'Revoked', 'Generar nuevas claves': 'Generate API keys',
    'Cantidad': 'Quantity', 'Nota (opcional)': 'Note (optional)', 'Generar clave(s)': 'Generate key(s)',
    'Código': 'Code', 'Nota': 'Note', 'Creada': 'Created', 'Estado': 'State', 'Acciones': 'Actions',
    'Copiar': 'Copy', 'Eliminar': 'Delete', 'Disponible': 'Available', 'Entregada': 'Delivered',
    'Activada': 'Activated', 'Revocada': 'Revoked', 'Usuario': 'Username', 'Contraseña': 'Password',
    'Ingresar': 'Sign in', 'API de activación': 'Activation API',
    'Solicita tu clave': 'Request your key', 'Activa la aplicación': 'Activate the app',
    'Vende sin internet': 'Sell without internet',
    'Tres pasos y ya estás vendiendo': 'Three steps and you are ready to sell',
    'Pensada para el mostrador, no para una oficina': 'Built for the counter, not the office',
    'Catálogo y carrito, siempre a mano': 'Catalog and cart, always at hand',
    'Empieza a llevar tu negocio con más control': 'Start running your business with more control',
    'Inventario y ventas, sin internet.': 'Inventory and sales, offline.',
    'Panel de administración →': 'Administration panel →',
    'El inventario de tu mostrador,': 'Your counter inventory,',
    'sin depender de internet.': 'without relying on the internet.',
    '100% offline · sin registro en la nube': '100% offline · no cloud account',
    '0 conexión requerida': '0 connection required', '<10s por venta': '<10s per sale',
    '1 dispositivo, todo el control': '1 device, full control',
    'Ingresa para generar y gestionar claves de acceso': 'Sign in to generate and manage API keys',
    'Genera claves para quienes quieran usar StockFácil.': 'Generate API keys for StockFácil users.',
    'La aplicación debe enviar una API key disponible. Una activación correcta cambia su estado a activada y la clave no puede reutilizarse.': 'The app must send an available API key. A successful activation changes its state to activated and the key cannot be reused.',
    'Respuestas: 200 activada · 404 inexistente · 409 no disponible.': 'Responses: 200 activated · 404 not found · 409 not available.',
    'StockFácil es la app para registrar ventas, descontar stock al instante y cerrar el turno sabiendo que el inventario coincide con la caja. Todo desde el celular o la tableta del local.': 'StockFácil records sales, updates stock instantly, and helps you close each shift knowing inventory matches the register. Everything runs from the store phone or tablet.',
    'No hace falta crear una cuenta ni configurar servidores. Solicitas acceso, recibes una clave y la app queda lista para usarse desde ese momento en adelante, sin conexión.': 'No account or server setup is required. Request access, receive a key, and the app is ready to use, even offline.',
    'Escríbeme por el canal de contacto y generaré una clave de acceso única para tu negocio.': 'Contact me and I will generate a unique access key for your business.',
    'Instala StockFácil, ingresa la clave una sola vez y carga tus primeros productos desde Administración.': 'Install StockFácil, enter the key once, and add your first products from Administration.',
    'Tus vendedores registran ventas todos los días. El inventario y el resumen se actualizan solos, sin conexión.': 'Your staff records sales every day. Inventory and summaries update automatically, even offline.',
    'Cada pantalla está diseñada para resolverse en segundos, con botones grandes y sin pasos de más.': 'Every screen is designed for speed, with large buttons and no unnecessary steps.',
    'Carga productos con nombre, precio y cantidad. Ajusta el stock cuando llegue mercancía, dejando registrado el motivo.': 'Add products with a name, price, and quantity. Adjust stock when new goods arrive and keep the reason on record.',
    'Se toca el producto, se ajusta la cantidad y se confirma. El total se calcula solo, sin errores de cálculo.': 'Tap the product, adjust the quantity, and confirm. The total is calculated automatically.',
    'Total vendido, número de ventas y productos más vendidos, listos para revisar en el cambio de turno.': 'Total revenue, number of sales, and best-selling products, ready for shift review.',
    'Todos los datos se guardan en el dispositivo. Funciona igual con wifi, con datos o completamente desconectado.': 'All data stays on the device. It works with Wi-Fi, mobile data, or completely offline.',
    'En pantallas grandes, el catálogo y el carrito conviven lado a lado para vender todavía más rápido.': 'On larger screens, the catalog and cart appear side by side for even faster sales.',
    'Exporta toda tu información a un archivo en cualquier momento para no depender de un solo dispositivo.': 'Export all your information to a file at any time, so you are not tied to one device.',
    'En tableta, el vendedor ve el catálogo y el carrito al mismo tiempo, sin cambiar de pantalla.': 'On a tablet, the seller sees the catalog and cart at the same time without switching screens.',
    'Escríbeme para conseguir tu clave de acceso a StockFácil. La generación de claves es manual: yo te la envío directamente para que actives la app cuando quieras.': 'Contact me to get your StockFácil access key. Keys are generated manually and sent directly to you so you can activate the app.',
    'Cada clave tiene el formato SF-XXXX-XXXX y es única. Puedes generar varias a la vez.': 'Each key uses the SF-XXXX-XXXX format and is unique. You can generate several at once.',
    'StockFácil en acción': 'StockFácil in action',
    'Tu negocio bajo control, desde un solo lugar': 'Your business under control, from one place',
    'Este espacio está preparado para mostrar una fotografía real de StockFácil funcionando en el mostrador.': 'This space is ready for a real photo of StockFácil running at the counter.',
    'Instala StockFácil en tu dispositivo Android y gestiona inventario y ventas directamente desde el mostrador.': 'Install StockFácil on your Android device and manage inventory and sales directly from the counter.',
    'Fotografía próximamente': 'Photo coming soon',
    'Obtener clave de acceso': 'Get an access key',
    'Solicitar por WhatsApp': 'Request via WhatsApp',
    'Descargar': 'Download', 'Aplicación Android': 'Android application',
    'Lleva StockFácil contigo': 'Take StockFácil with you',
    'Descargar APK para Android': 'Download APK for Android',
    'Descarga próximamente': 'Download coming soon',
    'Android puede solicitar permiso para instalar aplicaciones desde esta fuente.': 'Android may ask for permission to install applications from this source.',
    'Descarga el APK oficial, instala la aplicación y actívala con la clave que recibas por WhatsApp.': 'Download the official APK, install the application, and activate it with the key you receive via WhatsApp.',
    'Versión': 'Version',
  };
  const originals = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const value = node.nodeValue.trim().replace(/\s+/g, ' ');
    if (dictionary[value]) {
      originals.push({
        node,
        value,
        leading: node.nodeValue.match(/^\s*/)?.[0] || '',
        trailing: node.nodeValue.match(/\s*$/)?.[0] || '',
      });
    }
  }

  function theme(value) {
    root.dataset.theme = value;
    localStorage.setItem('theme', value);
    themeButtons.forEach((button) => { button.textContent = value === 'dark' ? '☀' : '☾'; });
  }
  function language(value) {
    root.lang = value;
    localStorage.setItem('language', value);
    originals.forEach(({ node, value: original, leading, trailing }) => {
      node.nodeValue = leading + (value === 'en' ? dictionary[original] : original) + trailing;
    });
    languageButtons.forEach((button) => { button.textContent = value === 'en' ? 'ES' : 'EN'; });
  }

  themeButtons.forEach((button) => button.addEventListener('click', () => theme(root.dataset.theme === 'dark' ? 'light' : 'dark')));
  languageButtons.forEach((button) => button.addEventListener('click', () => language(root.lang === 'en' ? 'es' : 'en')));
  theme(root.dataset.theme || 'light');
  language(localStorage.getItem('language') || 'es');
})();
