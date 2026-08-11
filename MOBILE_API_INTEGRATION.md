# Integración de la aplicación móvil con la API de StockFácil

Este documento describe lo que debe implementar la aplicación móvil para validar una API key y activar StockFácil.

## Objetivo

Durante la primera configuración, la aplicación debe solicitar una API key al usuario y enviarla al servidor.

Si la clave existe y está disponible, el servidor:

1. Cambia su estado de `disponible` a `activada`.
2. Devuelve una confirmación de activación.
3. Impide que la misma clave vuelva a utilizarse.

Después de recibir la confirmación, la aplicación debe guardar localmente que el dispositivo está activado.

## URL base

La URL del servidor debe configurarse según el entorno:

```text
Desarrollo: http://localhost:3000
Producción:  https://TU-DOMINIO.com
```

En un dispositivo físico, `localhost` apunta al propio teléfono y no al equipo de desarrollo. Durante las pruebas se debe utilizar la IP local del equipo, por ejemplo:

```text
http://192.168.1.20:3000
```

En producción se debe utilizar siempre HTTPS.

## Endpoint de activación

```http
POST /api/activate
Content-Type: application/json
Accept: application/json
```

### Cuerpo de la solicitud

```json
{
  "apiKey": "SF-XXXX-XXXX"
}
```

El nombre del campo debe ser exactamente `apiKey`.

La aplicación puede eliminar espacios al inicio y al final antes de enviar la clave. El servidor también normaliza la clave a mayúsculas.

## Activación correcta

Código HTTP: `200 OK`

```json
{
  "ok": true,
  "code": "ACTIVATED",
  "message": "La aplicación puede activarse.",
  "activation": {
    "apiKey": "SF-ABCD-2345",
    "state": "activada",
    "activatedAt": "2026-08-11T15:31:33.911Z"
  }
}
```

La aplicación debe considerar la activación válida únicamente cuando se cumplan las dos condiciones siguientes:

```text
HTTP status == 200
response.code == "ACTIVATED"
```

No se recomienda depender del texto de `message`, porque puede cambiar o traducirse.

## Respuestas de error

### No se envió la API key

Código HTTP: `400 Bad Request`

```json
{
  "ok": false,
  "code": "MISSING_API_KEY",
  "message": "Debes enviar apiKey en el cuerpo JSON."
}
```

La aplicación debe mostrar que el campo es obligatorio.

### La API key no existe

Código HTTP: `404 Not Found`

```json
{
  "ok": false,
  "code": "API_KEY_NOT_FOUND",
  "message": "La API key no existe."
}
```

La aplicación debe solicitar al usuario que revise la clave introducida.

### La API key no está disponible

Código HTTP: `409 Conflict`

```json
{
  "ok": false,
  "code": "API_KEY_NOT_AVAILABLE",
  "message": "La API key no está disponible para activación.",
  "state": "activada"
}
```

Esto puede ocurrir si la clave está:

- `entregada`
- `activada`
- `revocada`

Solamente una clave con estado `disponible` puede activar la aplicación.

### Error del servidor

Para cualquier respuesta `5xx`, la aplicación debe indicar que el servicio no está disponible temporalmente y permitir reintentar.

### Error de conexión

Si hay timeout, falta de internet, error DNS o cualquier excepción de red, no se debe marcar la aplicación como activada.

La interfaz debe conservar la clave escrita y ofrecer un botón para reintentar.

## Flujo recomendado en la aplicación

1. Al iniciar, consultar el estado de activación guardado localmente.
2. Si ya está activada, abrir la aplicación sin consultar nuevamente al servidor.
3. Si no está activada, mostrar la pantalla de activación.
4. Solicitar la API key.
5. Normalizar el valor con `trim()` y `toUpperCase()`.
6. Desactivar temporalmente el botón para evitar solicitudes duplicadas.
7. Enviar `POST /api/activate`.
8. Evaluar primero el código HTTP y después el campo `code`.
9. Si la respuesta es `ACTIVATED`, guardar la activación localmente.
10. Abrir la pantalla principal.

## Persistencia local

Después de una respuesta correcta se recomienda guardar, como mínimo:

```json
{
  "activated": true,
  "apiKey": "SF-ABCD-2345",
  "activatedAt": "2026-08-11T15:31:33.911Z"
}
```

La API key y el estado de activación deben almacenarse en almacenamiento seguro cuando la plataforma lo permita, por ejemplo con `flutter_secure_storage` en Flutter.

No se debe guardar el estado `activated: true` antes de recibir una respuesta `200` con código `ACTIVATED`.

## Consideración importante sobre reintentos

La clave es de un solo uso. Si el servidor activa la clave pero la respuesta no llega al teléfono por una interrupción de red, un segundo intento devolverá `API_KEY_NOT_AVAILABLE` con estado `activada`.

Con el contrato actual, la aplicación no puede demostrar que esa activación anterior pertenece al mismo dispositivo. Por ello:

- No debe interpretar automáticamente un `409` como activación correcta.
- Debe mostrar un mensaje para contactar con soporte.
- Para una integración más resistente se recomienda agregar en el futuro un identificador de instalación y un endpoint de consulta o recuperación de activación.

## Ejemplo con Flutter y Dart

Dependencia sugerida:

```yaml
dependencies:
  http: ^1.2.0
  flutter_secure_storage: ^9.2.0
```

Servicio de activación:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ActivationResult {
  final bool activated;
  final String code;
  final String? message;
  final String? activatedAt;

  const ActivationResult({
    required this.activated,
    required this.code,
    this.message,
    this.activatedAt,
  });
}

class ActivationService {
  final String baseUrl;
  final http.Client client;

  ActivationService({required this.baseUrl, http.Client? client})
      : client = client ?? http.Client();

  Future<ActivationResult> activate(String value) async {
    final apiKey = value.trim().toUpperCase();

    if (apiKey.isEmpty) {
      return const ActivationResult(
        activated: false,
        code: 'MISSING_API_KEY',
        message: 'Introduce una API key.',
      );
    }

    try {
      final response = await client
          .post(
            Uri.parse('$baseUrl/api/activate'),
            headers: const {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: jsonEncode({'apiKey': apiKey}),
          )
          .timeout(const Duration(seconds: 15));

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final code = body['code'] as String? ?? 'UNKNOWN_ERROR';

      if (response.statusCode == 200 && code == 'ACTIVATED') {
        final activation = body['activation'] as Map<String, dynamic>?;
        return ActivationResult(
          activated: true,
          code: code,
          message: body['message'] as String?,
          activatedAt: activation?['activatedAt'] as String?,
        );
      }

      return ActivationResult(
        activated: false,
        code: code,
        message: body['message'] as String?,
      );
    } on FormatException {
      return const ActivationResult(
        activated: false,
        code: 'INVALID_SERVER_RESPONSE',
        message: 'El servidor devolvió una respuesta no válida.',
      );
    } catch (_) {
      return const ActivationResult(
        activated: false,
        code: 'NETWORK_ERROR',
        message: 'No se pudo conectar con el servidor.',
      );
    }
  }
}
```

Guardar la confirmación:

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const secureStorage = FlutterSecureStorage();

Future<void> saveActivation(ActivationResult result, String apiKey) async {
  if (!result.activated || result.code != 'ACTIVATED') return;

  await secureStorage.write(key: 'stockfacil_activated', value: 'true');
  await secureStorage.write(
    key: 'stockfacil_api_key',
    value: apiKey.trim().toUpperCase(),
  );
  if (result.activatedAt != null) {
    await secureStorage.write(
      key: 'stockfacil_activated_at',
      value: result.activatedAt,
    );
  }
}
```

## Mensajes sugeridos para la interfaz

| Código | Mensaje para el usuario |
|---|---|
| `ACTIVATED` | Activación completada correctamente. |
| `MISSING_API_KEY` | Introduce una API key. |
| `API_KEY_NOT_FOUND` | La clave no es válida. Revisa el código e inténtalo de nuevo. |
| `API_KEY_NOT_AVAILABLE` | Esta clave ya fue utilizada o no está disponible. Contacta con soporte. |
| `NETWORK_ERROR` | No se pudo conectar. Revisa tu conexión e inténtalo de nuevo. |
| `INVALID_SERVER_RESPONSE` | El servidor devolvió una respuesta no válida. |
| Otro código | No se pudo completar la activación. |

## Pruebas mínimas

Antes de publicar la aplicación se deben comprobar estos casos:

- Campo vacío.
- Clave inexistente.
- Clave disponible.
- Reutilización de una clave activada.
- Clave revocada.
- Servidor sin conexión.
- Timeout de la solicitud.
- Respuesta JSON no válida.
- Cierre y reapertura de la aplicación después de activarla.
- Dos solicitudes de activación casi simultáneas con la misma clave.

## Resumen del contrato

```text
POST /api/activate
Body: { "apiKey": "SF-XXXX-XXXX" }

200 + ACTIVATED             -> guardar activación y continuar
400 + MISSING_API_KEY       -> solicitar la clave
404 + API_KEY_NOT_FOUND     -> indicar que la clave no existe
409 + API_KEY_NOT_AVAILABLE -> indicar que no puede utilizarse
5xx o error de red          -> permitir reintentar, sin activar localmente
```
