# Formulario de contacto → Google Sheets + correos

Cada mensaje del formulario de sonanteagencia.com (home, `/contacto/` y sus versiones en inglés):

1. se guarda como una fila en la pestaña **Registros** de una hoja de Google;
2. llega como **aviso al equipo** de Sonante. Al responder ese correo se le escribe directo a la persona,
   y trae botones para responder por correo, escribir por WhatsApp y abrir la hoja;
3. le llega a la persona una **confirmación** con sus datos, en español o inglés según la página
   desde donde escribió.

| Archivo | Qué es |
| --- | --- |
| `Codigo.gs` | Todo el script. Arriba está `CONFIG` (destinatarios, remitente, límites). |
| `appsscript.json` | Manifiesto: zona horaria de Bogotá y permisos mínimos (solo esta hoja, enviar correo, verificar Turnstile). |

## 1. Montarlo en el Drive de Khaos Core

1. Crear una hoja nueva, por ejemplo **"Sonante · Contactos del sitio web"**.
2. **Extensiones → Apps Script**. Nombrar el proyecto "Formulario sonanteagencia.com".
3. Reemplazar todo el contenido de `Código.gs` por el de `Codigo.gs`.
4. **Configuración del proyecto** (engranaje) → marcar *Mostrar el archivo de manifiesto
   "appsscript.json" en el editor*. Volver al editor y reemplazar ese archivo por `appsscript.json`.
5. Revisar `CONFIG` al inicio del código (`AVISO_PARA`, `RESPONDER_A`).
6. Elegir la función **`configurar`** y ejecutarla. Google pide permisos. En cuentas Gmail aparece
   "Google no ha verificado esta app": *Configuración avanzada → Ir a Formulario sonanteagencia.com*. Esto deja
   lista la pestaña Registros (encabezados, anchos, lista de estados, hora de Bogotá).
7. Ejecutar **`probar`**: agrega una fila de prueba y envía la confirmación y el aviso **a la cuenta que
   ejecuta**, no a Sonante. Revisar los dos correos y **borrar la fila de prueba**.

## 2. Publicarlo como aplicación web

1. **Implementar → Nueva implementación →** tipo **Aplicación web**.
2. *Ejecutar como*: **Yo**. *Quién tiene acceso*: **Cualquier usuario**.
3. **Implementar** y copiar la URL que termina en `/exec`.
4. Abrir esa URL en el navegador. Debe responder algo como
   `{"ok":true,"remitente":"…","cuotaRestante":100}`.

## 3. Conectar el sitio

En **Vercel → Settings → Environment Variables** (y en `.env` para probar en local):

```
FORM_ENDPOINT=https://script.google.com/macros/s/…/exec
```

Es obligatoria: sin ella el formulario no envía y el build de producción en Vercel falla. Queda fija al
compilar, así que hay que **volver a desplegar** después de cambiarla. Luego enviar un mensaje de
prueba desde el sitio publicado y revisar la hoja y los correos.

## 4. Entregar la hoja a Sonante

1. **Compartir →** agregar `sonanteagencia@gmail.com` como editor → **Transferir propiedad**. La cuenta
   de Sonante tiene que aceptar la invitación.
2. **Comprobar el remitente:** abrir la URL `/exec`. El campo `remitente` es el Gmail desde el que salen
   los correos. La aplicación web corre como quien la implementó, así que después de transferir la hoja
   puede seguir mostrando la cuenta de Khaos Core.
3. Si muestra la cuenta de Khaos Core: con la sesión de `sonanteagencia@gmail.com` abrir la hoja →
   **Extensiones → Apps Script → Implementar → Gestionar implementaciones →** lápiz → *Versión*:
   **Nueva versión → Implementar**, y autorizar. Abrir `/exec` otra vez y confirmar. Si la URL cambió,
   actualizar `FORM_ENDPOINT` en Vercel y volver a desplegar.

Mientras tanto nada se pierde: aunque salgan de otra cuenta, los correos muestran "Sonante" como nombre
y las respuestas de las personas llegan a `sonanteagencia@gmail.com`.

## Uso diario (para el equipo de Sonante)

- **Estado** (Nuevo, Contactado, En propuesta, Cliente, Descartado) y **Notas** son para el seguimiento.
- Se pueden **agregar o mover columnas**: el script ubica cada dato por el nombre del encabezado. Lo que
  no se debe hacer es **renombrar** los encabezados que crea el script.
- **Aviso al equipo** y **Confirmación al contacto** dicen si cada correo salió y, si no, por qué.

## Límites y protección

- Gmail personal permite **100 destinatarios al día** (cada mensaje usa 2: aviso + confirmación).
  Google Workspace permite 1.500.
- Campo trampa oculto (`sitio_web`) y tiempo mínimo de 3 s: a los robots se les responde "ok" sin
  guardar nada.
- Confirmaciones: máximo 2 a la misma dirección cada 6 horas y 20 por hora en total, y siempre se
  reservan 10 envíos del día para los avisos. Si se pasa un límite, el mensaje **igual se guarda y se
  avisa al equipo**: solo se omite la confirmación.
- Textos que empiezan por `=`, `+`, `-` o `@` se guardan como texto, no como fórmula.

Respuestas del script al sitio: `{"ok":true}`, o `{"ok":false,"error":"datos" | "verificacion" | "servidor"}`.

## Si empieza a llegar spam

Por ahora no se usa captcha: con el volumen de Sonante bastan el campo trampa, el tiempo mínimo y los
límites de arriba. Lo que hay que cuidar es el Gmail de Sonante: si manda muchas confirmaciones a
direcciones inventadas, Google puede restringirle los envíos.

**Señales:** filas con datos basura, avisos en ráfaga, o la columna *Confirmación al contacto* llena de
"Omitida: demasiados envíos en la última hora".

**Freno inmediato:** en `CONFIG` poner `CONFIRMACIONES_POR_HORA: 0` y publicar una versión nueva (ver
abajo). Se dejan de enviar confirmaciones, pero los mensajes se siguen guardando y avisando.

**Solución:** activar Cloudflare Turnstile, el captcha gratuito de Cloudflare. Casi nunca se ve: solo
pide un clic si duda. El sitio y el script ya lo soportan, no hay que tocar código:

1. En [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile → Add widget**. Dominios:
   `sonanteagencia.com` y `www.sonanteagencia.com`. Modo: *Managed*.
2. **Site key** → variable `PUBLIC_TURNSTILE_SITE_KEY` en Vercel, y volver a desplegar.
3. **Secret key** → en Apps Script, **Configuración del proyecto → Propiedades del script →**
   propiedad `TURNSTILE_SECRET`. Desde ese momento el script exige la verificación.
4. Agregar Cloudflare Turnstile a la lista de proveedores de la Política de privacidad (sección 6).

Para probarlo en local, usar las claves de prueba de Cloudflare: site key `1x00000000000000000000AA`
(siempre pasa) o `3x00000000000000000000FF` (siempre pide el clic), con el secreto
`1x0000000000000000000000000000000AA`.

## Cambiar el código después

Pegar el código nuevo → **Implementar → Gestionar implementaciones →** lápiz → *Versión*: **Nueva
versión → Implementar**. Así la URL no cambia. Si solo se guarda el archivo, el sitio sigue usando la
versión anterior.
