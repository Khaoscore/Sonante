# Documentos legales del sitio

Política de privacidad, Términos y condiciones de uso y Política de tratamiento de
datos personales (Ley 1581 de 2012). Un mismo texto alimenta la web y los Word
que se envían al cliente.

| Archivo | Qué es |
|---|---|
| `documentos/*.md` | Texto de cada documento. El nombre del archivo es la URL: `/politica-de-privacidad/`, `/terminos-de-uso/`, `/tratamiento-de-datos/`. |
| `datos.json` | Datos de la empresa que llenan los campos `{{clave}}` del texto (razón social, NIT, dirección, proveedores…). |
| `instrucciones-para-el-cliente.md` | Texto del Word "00 - Instrucciones y datos por completar". La línea `{{tabla_datos}}` se convierte en la tabla de datos. |
| `para-el-cliente/` | Los Word que se envían al cliente. Se generan con `npm run legal:docx`; no se editan a mano. |

## Campos `{{clave}}`

- **Valor vacío en `datos.json`:** en la web sale resaltado como `[Etiqueta]`, la
  página muestra el aviso "Borrador en revisión" y lleva `noindex`. En Word sale en
  amarillo (o en gris si `responde` es "Khaos Core").
- **Valor con `"confirmado": false`:** en la web sale normal; en Word sale en verde
  para que el cliente lo confirme.
- **`tipo`:** `correo`, `telefono` o `web` convierten el valor en enlace en la web.
- Un campo que no existe en `datos.json` hace fallar `npm run legal:docx`.

## Flujo con el cliente

1. `npm run legal:docx` y enviar la carpeta `para-el-cliente/` (los Word 01–03
   tienen el control de cambios activado).
2. Con la respuesta: pasar los datos a `datos.json` (y `"confirmado": true`), y
   los ajustes de texto a `documentos/*.md`.
3. Al publicar, completar `fecha_vigencia`, `proveedor_hosting` y regenerar los Word.
   Cuando todos los datos están llenos y confirmados, los Word salen como versión
   final: "Vigente desde el …", sin resaltados ni control de cambios.

Estado (30/10/2026): todos los datos completos y confirmados por el cliente (ver
`para-el-cliente/00 - Instrucciones y datos completo.pdf`). Alojamiento en Vercel;
vigencia desde el 2 de noviembre de 2026.

## Notas internas

Un comentario `<!-- NOTA: … -->` en un `.md` no se publica en la web y en Word sale
como un recuadro azul "Nota para Sonante". Hoy no hay ninguno: el cliente confirmó
que tiene las autorizaciones de imagen y de clientes, y que la única base de
contactos será la hoja de Google Sheets del formulario.

## Pendientes técnicos

- **Formulario → Google Sheets:** hecho con Apps Script (`apps-script/formulario-contacto/`,
  variable `FORM_ENDPOINT`); guarda la casilla de autorización (`autorizacion_datos`)
  en la hoja. Los contactos de la hoja se deben borrar al cumplir el plazo de
  `plazo_contactos` (hoy, dos años).
- **Analítica o píxeles:** el sitio no usa cookies. Si se instala Google Analytics,
  Meta Pixel u otro, hay que actualizar el numeral 5 de la Política de privacidad y
  agregar un aviso de cookies.
- **Inglés:** los documentos solo están en español (rigen por la ley colombiana);
  el pie de página en inglés enlaza a ellos con `hreflang="es"`.
