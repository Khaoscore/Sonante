/**
 * Formulario de contacto de sonante.co → Google Sheets + correos.
 *
 * Cada mensaje que llega desde el sitio:
 *   1. se guarda como una fila en la pestaña "Registros" de esta hoja;
 *   2. le llega como aviso al equipo de Sonante (al responder ese aviso se le escribe
 *      directo a la persona);
 *   3. le llega a la persona una confirmación con sus datos, en su idioma.
 *
 * Instalación y pruebas: apps-script/formulario-contacto/LEEME.md en el repositorio del sitio.
 * Si se cambia este archivo hay que publicar una versión nueva de la implementación
 * (Implementar → Gestionar implementaciones → editar → Versión: nueva), o el sitio
 * seguirá usando la anterior.
 */

const CONFIG = {
  /** Pestaña donde se guardan los mensajes */
  HOJA: 'Registros',
  /** Quién recibe el aviso de cada mensaje nuevo (varios: separados por coma) */
  AVISO_PARA: 'sonanteagencia@gmail.com',
  /** A dónde llegan las respuestas de las personas a su correo de confirmación */
  RESPONDER_A: 'sonanteagencia@gmail.com',
  /** Nombre que ve la persona como remitente de la confirmación */
  REMITENTE: 'Sonante',
  /** Nombre del remitente del aviso interno */
  REMITENTE_AVISO: 'Sitio web Sonante',
  SITIO: 'https://sonante.co',
  LOGO: 'https://sonante.co/assets/email/logo-sonante.png',
  INSTAGRAM: 'https://www.instagram.com/sonanteagencia',

  // Protección contra abuso: alguien podría usar el formulario para que esta cuenta
  // le escriba a direcciones ajenas. Si se pasa de estos límites el mensaje se guarda
  // y se avisa al equipo igual, pero no se envía la confirmación.
  /** Confirmaciones máximas a una misma dirección cada 6 horas */
  CONFIRMACIONES_POR_CORREO: 2,
  /** Confirmaciones máximas por hora en total */
  CONFIRMACIONES_POR_HORA: 20,
  /** Destinatarios del cupo diario de Gmail que se reservan para los avisos al equipo */
  RESERVA_CUOTA: 10,
  /** Menos tiempo que esto entre abrir la página y enviar = robot */
  TIEMPO_MINIMO_MS: 3000,
};

/** Opciones de la columna "Estado", para hacer seguimiento a cada contacto */
const ESTADOS = ['Nuevo', 'Contactado', 'En propuesta', 'Cliente', 'Descartado'];

/** [clave interna, encabezado en la hoja, ancho en px]. El orden es el de las columnas. */
const COLUMNAS = [
  ['fecha', 'Fecha', 140],
  ['nombre', 'Nombre', 180],
  ['telefono', 'Teléfono', 140],
  ['correo', 'Correo', 220],
  ['pais', 'País', 120],
  ['ciudad', 'Ciudad', 130],
  ['mensaje', 'Mensaje', 380],
  ['idioma', 'Idioma', 80],
  ['pagina', 'Página', 120],
  ['autorizacion', 'Autorización de datos', 260],
  ['aviso', 'Aviso al equipo', 150],
  ['confirmacion', 'Confirmación al contacto', 220],
  ['estado', 'Estado', 130],
  ['notas', 'Notas', 260],
];

const COLORES = {
  oscuro: '#003833',
  verde: '#0bb730',
  texto: '#00211d',
  fondo: '#eef3f1',
  suave: '#f3f8f5',
  gris: '#5c6f6b',
  linea: '#dde6e2',
};

/* ------------------------------------------------------------------ */
/* Entrada web                                                         */
/* ------------------------------------------------------------------ */

/** Recibe el formulario del sitio (POST application/x-www-form-urlencoded). */
function doPost(e) {
  try {
    return responder(procesar((e && e.parameter) || {}));
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return responder({ ok: false, error: 'servidor' });
  }
}

/**
 * Abrir la URL de la implementación en el navegador muestra desde qué cuenta salen
 * los correos ("remitente") y cuántos envíos le quedan hoy. Sirve para comprobar
 * que todo quedó bien después de transferir la hoja al cliente.
 */
function doGet() {
  return responder({
    ok: true,
    servicio: 'Formulario de contacto de Sonante',
    remitente: Session.getEffectiveUser().getEmail(),
    cuotaRestante: MailApp.getRemainingDailyQuota(),
  });
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * @param {Object} p parámetros del formulario
 * @param {{ avisoPara?: string, sinVerificacion?: boolean }} [opciones] solo para probar()
 */
function procesar(p, opciones) {
  opciones = opciones || {};

  // Trampas para robots: el campo oculto viene lleno o el envío fue más rápido que
  // una persona. Se responde "ok" para no darles pistas, pero no se guarda nada.
  if (texto(p.sitio_web)) return { ok: true };
  if (!(Number(p.t) >= CONFIG.TIEMPO_MINIMO_MS)) return { ok: true };

  const d = limpiar(p);
  if (!d) return { ok: false, error: 'datos' };

  const secreto = PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET');
  if (secreto && !opciones.sinVerificacion && !verificarTurnstile(secreto, p['cf-turnstile-response'])) {
    return { ok: false, error: 'verificacion' };
  }

  d.fecha = new Date();
  d.estado = ESTADOS[0];

  // La escritura y los contadores van bajo candado para que dos envíos simultáneos
  // no se pisen; los correos se mandan fuera para no hacer esperar a los demás.
  const candado = LockService.getScriptLock();
  candado.waitLock(20000);
  let fila;
  let motivoSinConfirmacion;
  try {
    d.aviso = 'Pendiente';
    d.confirmacion = 'Pendiente';
    fila = guardar(d);
    motivoSinConfirmacion = revisarLimites(d.correo);
  } finally {
    candado.releaseLock();
  }

  d.confirmacion = motivoSinConfirmacion || enviarConfirmacion(d);
  d.aviso = enviarAviso(d, opciones.avisoPara || CONFIG.AVISO_PARA);
  marcarEnvios(fila, d);

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Datos                                                               */
/* ------------------------------------------------------------------ */

/** Normaliza y valida lo que llega. Devuelve null si falta algo obligatorio. */
function limpiar(p) {
  const d = {
    nombre: texto(p.nombre, 120),
    telefono: texto(p.telefono, 40),
    correo: texto(p.correo, 254).toLowerCase(),
    pais: texto(p.pais, 80),
    ciudad: texto(p.ciudad, 80),
    mensaje: texto(p.mensaje, 5000, true),
    idioma: p.idioma === 'en' ? 'en' : 'es',
    pagina: texto(p.pagina, 200),
    autorizacion: texto(p.autorizacion_datos, 300),
  };
  const digitos = (d.telefono.match(/\d/g) || []).length;
  const valido =
    d.nombre && d.pais && d.ciudad && d.mensaje && d.autorizacion &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.correo) &&
    digitos >= 7;
  return valido ? d : null;
}

/** Texto limpio: sin caracteres de control, espacios colapsados y con largo máximo. */
function texto(valor, max, multilinea) {
  let s = String(valor == null ? '' : valor)
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ' ');
  s = multilinea ? s.replace(/[^\S\n]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n') : s.replace(/\s+/g, ' ');
  s = s.trim();
  return max ? s.slice(0, max) : s;
}

/**
 * Evita que un texto que empieza por =, +, - o @ se tome como fórmula en la hoja
 * (por ejemplo "+57 300…" o un intento de inyectar =IMPORTXML(...)).
 */
function seguro(valor) {
  return typeof valor === 'string' && /^[=+\-@]/.test(valor) ? "'" + valor : valor;
}

/** Agrega la fila y devuelve su número. Ubica cada dato por el encabezado de su columna. */
function guardar(d) {
  const hoja = obtenerHoja();
  const encabezados = asegurarEncabezados(hoja);
  const fila = encabezados.map(function (titulo) {
    const columna = COLUMNAS.find(function (c) { return c[1] === titulo; });
    return columna ? seguro(d[columna[0]] == null ? '' : d[columna[0]]) : '';
  });
  hoja.appendRow(fila);
  const numero = hoja.getLastRow();

  const colEstado = encabezados.indexOf('Estado') + 1;
  if (colEstado > 0) hoja.getRange(numero, colEstado).setDataValidation(reglaEstado());
  return numero;
}

/** Escribe cómo salieron los dos correos en la fila del mensaje. */
function marcarEnvios(fila, d) {
  const hoja = obtenerHoja();
  const encabezados = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  [['aviso', 'Aviso al equipo'], ['confirmacion', 'Confirmación al contacto']].forEach(function (par) {
    const col = encabezados.indexOf(par[1]) + 1;
    if (col > 0) hoja.getRange(fila, col).setValue(seguro(d[par[0]]));
  });
}

function obtenerHoja() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  return libro.getSheetByName(CONFIG.HOJA) || libro.insertSheet(CONFIG.HOJA);
}

/** Crea los encabezados que falten (al final, sin mover columnas) y los devuelve. */
function asegurarEncabezados(hoja) {
  const ultima = Math.max(hoja.getLastColumn(), 1);
  const actuales = hoja.getRange(1, 1, 1, ultima).getValues()[0].map(String);
  const vacia = actuales.every(function (v) { return v === ''; });
  const encabezados = vacia ? [] : actuales.slice();
  COLUMNAS.forEach(function (c) {
    if (encabezados.indexOf(c[1]) === -1) encabezados.push(c[1]);
  });
  if (vacia || encabezados.length !== actuales.length) {
    hoja.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);
  }
  return encabezados;
}

function reglaEstado() {
  return SpreadsheetApp.newDataValidation().requireValueInList(ESTADOS, true).setAllowInvalid(true).build();
}

/* ------------------------------------------------------------------ */
/* Límites y verificación                                              */
/* ------------------------------------------------------------------ */

/**
 * Decide si se puede enviar la confirmación. Devuelve el motivo si no se puede,
 * o '' si sí (y en ese caso suma el envío a los contadores).
 */
function revisarLimites(correo) {
  if (MailApp.getRemainingDailyQuota() <= CONFIG.RESERVA_CUOTA) {
    return 'Omitida: cupo diario de correos casi agotado';
  }
  const cache = CacheService.getScriptCache();
  const huella = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, correo));
  const claveCorreo = 'correo:' + huella;
  const claveHora = 'hora:' + Utilities.formatDate(new Date(), 'UTC', 'yyyyMMddHH');
  const porCorreo = Number(cache.get(claveCorreo) || 0);
  const porHora = Number(cache.get(claveHora) || 0);

  if (porCorreo >= CONFIG.CONFIRMACIONES_POR_CORREO) return 'Omitida: este correo ya recibió ' + porCorreo + ' hace poco';
  if (porHora >= CONFIG.CONFIRMACIONES_POR_HORA) return 'Omitida: demasiados envíos en la última hora';

  cache.put(claveCorreo, String(porCorreo + 1), 6 * 60 * 60);
  cache.put(claveHora, String(porHora + 1), 60 * 60);
  return '';
}

/** Comprueba el token de Cloudflare Turnstile (solo si existe la propiedad TURNSTILE_SECRET). */
function verificarTurnstile(secreto, token) {
  if (!token) return false;
  const respuesta = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'post',
    payload: { secret: secreto, response: String(token) },
    muteHttpExceptions: true,
  });
  try {
    return JSON.parse(respuesta.getContentText()).success === true;
  } catch (err) {
    console.error('Turnstile: respuesta inesperada', respuesta.getResponseCode());
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Correos                                                             */
/* ------------------------------------------------------------------ */

const TEXTOS = {
  es: {
    asunto: function (n) { return 'Recibimos tu mensaje, ' + n; },
    previa: 'Gracias por escribirnos. Te contactaremos muy pronto.',
    titulo: function (n) { return '¡Gracias por escribirnos, ' + n + '!'; },
    intro: 'Recibimos tu mensaje y alguien del equipo de Sonante te contactará muy pronto para conversar sobre tu proyecto.',
    resumen: 'Esto es lo que nos contaste:',
    campos: { nombre: 'Nombre', telefono: 'Teléfono', correo: 'Correo', lugar: 'Ubicación', mensaje: 'Sobre tu proyecto' },
    corregir: 'Si algún dato no está bien o quieres contarnos algo más, responde a este correo.',
    boton: 'Conoce nuestros casos de éxito',
    casos: '/casos-de-exito/',
    firma: 'Saludos,',
    equipo: 'Equipo Sonante',
    pie: 'Recibiste este correo porque escribiste en el formulario de sonante.co. Si no fuiste tú, puedes ignorarlo.',
    politica: 'Política de tratamiento de datos personales',
  },
  en: {
    asunto: function (n) { return 'We got your message, ' + n; },
    previa: 'Thanks for reaching out. We will be in touch very soon.',
    titulo: function (n) { return 'Thanks for reaching out, ' + n + '!'; },
    intro: 'We received your message and someone from the Sonante team will contact you very soon to talk about your project.',
    resumen: 'Here is what you told us:',
    campos: { nombre: 'Name', telefono: 'Phone', correo: 'Email', lugar: 'Location', mensaje: 'About your project' },
    corregir: 'If anything is wrong or you want to tell us more, just reply to this email.',
    boton: 'See our success stories',
    casos: '/en/success-stories/',
    firma: 'Best regards,',
    equipo: 'The Sonante team',
    pie: 'You received this email because you wrote to us through the form on sonante.co. If it was not you, you can ignore it.',
    politica: 'Personal data policy (in Spanish)',
  },
};

/** Confirmación a la persona que escribió. Devuelve el estado para la hoja. */
function enviarConfirmacion(d) {
  const t = TEXTOS[d.idioma];
  const nombre = primerNombre(d.nombre);
  const datos = [
    [t.campos.nombre, esc(d.nombre)],
    [t.campos.telefono, esc(d.telefono)],
    [t.campos.correo, esc(d.correo)],
    [t.campos.lugar, esc(d.ciudad + ', ' + d.pais)],
  ];
  const cuerpo =
    parrafo(esc(t.intro)) +
    parrafo(esc(t.resumen), 'margin:24px 0 0;') +
    tablaDatos(datos) +
    cajaMensaje(t.campos.mensaje, d.mensaje) +
    parrafo(esc(t.corregir)) +
    '<div style="margin:24px 0 28px;">' + boton(CONFIG.SITIO + t.casos, t.boton, 'principal') + '</div>' +
    parrafo(esc(t.firma) + '<br><strong style="color:' + COLORES.oscuro + ';">' + esc(t.equipo) + '</strong>', 'margin:0;');
  const pie =
    esc(t.pie) + '<br>' +
    enlace(CONFIG.SITIO + '/tratamiento-de-datos/', t.politica) + ' &nbsp;·&nbsp; ' +
    enlace(CONFIG.INSTAGRAM, 'Instagram') + ' &nbsp;·&nbsp; ' +
    enlace(CONFIG.SITIO, 'sonante.co') +
    '<br>Sonante SAS · Bogotá D.C., Colombia';

  const textoPlano = [
    t.titulo(nombre), '', t.intro, '', t.resumen,
    t.campos.nombre + ': ' + d.nombre,
    t.campos.telefono + ': ' + d.telefono,
    t.campos.correo + ': ' + d.correo,
    t.campos.lugar + ': ' + d.ciudad + ', ' + d.pais,
    '', t.campos.mensaje + ':', d.mensaje, '', t.corregir, '', t.firma, t.equipo, '', '—', t.pie,
  ].join('\n');

  try {
    MailApp.sendEmail({
      to: d.correo,
      subject: t.asunto(nombre),
      body: textoPlano,
      htmlBody: plantilla({ idioma: d.idioma, previa: t.previa, titulo: t.titulo(nombre), cuerpo: cuerpo, pie: pie }),
      name: CONFIG.REMITENTE,
      replyTo: CONFIG.RESPONDER_A,
    });
    return 'Enviada';
  } catch (err) {
    console.error('Confirmación', err);
    return 'Error: ' + (err && err.message ? err.message : err);
  }
}

/** Aviso al equipo de Sonante. Responder este correo le escribe a la persona. */
function enviarAviso(d, para) {
  const cuando = fechaLegible(d.fecha);
  const whatsapp = enlaceWhatsApp(d.telefono, d.pais);
  const asuntoRespuesta = d.idioma === 'en' ? 'Your message to Sonante' : 'Tu mensaje a Sonante';
  const datos = [
    ['Nombre', esc(d.nombre)],
    ['Teléfono', enlace('tel:' + d.telefono.replace(/[^\d+]/g, ''), d.telefono)],
    ['Correo', enlace('mailto:' + d.correo, d.correo)],
    ['Ubicación', esc(d.ciudad + ', ' + d.pais)],
    ['Idioma', d.idioma === 'en' ? 'Inglés' : 'Español'],
    ['Recibido', esc(cuando)],
    ['Confirmación', esc(d.confirmacion)],
  ];
  const botones =
    boton('mailto:' + d.correo + '?subject=' + encodeURIComponent(asuntoRespuesta), 'Responder por correo', 'principal') +
    (whatsapp ? boton(whatsapp, 'Escribir por WhatsApp', 'secundario') : '') +
    boton(SpreadsheetApp.getActiveSpreadsheet().getUrl(), 'Abrir la hoja', 'secundario');
  const cuerpo =
    parrafo('<strong>' + esc(d.nombre) + '</strong> escribió desde ' + esc(paginaLegible(d.pagina)) + '.') +
    tablaDatos(datos) +
    cajaMensaje('Sobre su proyecto', d.mensaje) +
    '<div style="margin:8px 0 12px;">' + botones + '</div>' +
    parrafo(esc(d.autorizacion) + '.', 'margin:12px 0 0;font-size:12px;color:' + COLORES.gris + ';');
  const pie = 'Aviso automático del formulario de sonante.co.<br>Si respondes este correo, le escribes directamente a ' + esc(d.nombre) + '.';

  const textoPlano = [
    d.nombre + ' escribió desde ' + paginaLegible(d.pagina) + '.', '',
    'Teléfono: ' + d.telefono, 'Correo: ' + d.correo, 'Ubicación: ' + d.ciudad + ', ' + d.pais,
    'Idioma: ' + (d.idioma === 'en' ? 'Inglés' : 'Español'), 'Recibido: ' + cuando, 'Confirmación: ' + d.confirmacion, '',
    'Sobre su proyecto:', d.mensaje, '', d.autorizacion,
  ].join('\n');

  const destinatarios = String(para).split(',').filter(function (s) { return s.trim(); }).length;
  if (MailApp.getRemainingDailyQuota() < destinatarios) return 'No enviado: se agotó el cupo diario de correos';

  try {
    MailApp.sendEmail({
      to: para,
      subject: d.nombre + ' escribió desde sonante.co',
      body: textoPlano,
      htmlBody: plantilla({ idioma: 'es', previa: d.ciudad + ', ' + d.pais + ' · ' + d.mensaje.slice(0, 90), titulo: 'Nuevo mensaje desde la web', cuerpo: cuerpo, pie: pie }),
      name: CONFIG.REMITENTE_AVISO,
      replyTo: d.correo,
    });
    return 'Enviado';
  } catch (err) {
    console.error('Aviso', err);
    return 'Error: ' + (err && err.message ? err.message : err);
  }
}

/* ------------------------------------------------------------------ */
/* Plantilla HTML (tablas y estilos en línea para que se vea bien en   */
/* Gmail, Outlook y Apple Mail)                                        */
/* ------------------------------------------------------------------ */

function plantilla(o) {
  const c = COLORES;
  return '<!doctype html><html lang="' + o.idioma + '"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">' +
    '<title>' + esc(o.titulo) + '</title></head>' +
    '<body style="margin:0;padding:0;background:' + c.fondo + ';-webkit-text-size-adjust:100%;">' +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">' + esc(o.previa) + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' + c.fondo + ';">' +
    '<tr><td align="center" style="padding:32px 12px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;">' +
    // Encabezado verde oscuro con la "S" y el nombre
    '<tr><td style="background:' + c.oscuro + ';border-radius:16px 16px 0 0;padding:22px 32px;">' +
    '<a href="' + CONFIG.SITIO + '" style="text-decoration:none;">' +
    '<img src="' + CONFIG.LOGO + '" width="30" height="40" alt="" style="display:inline-block;vertical-align:middle;border:0;">' +
    '<span style="display:inline-block;vertical-align:middle;padding-left:12px;font-family:Georgia,\'Times New Roman\',serif;font-size:24px;font-weight:bold;color:#ffffff;">Sonante</span>' +
    '</a></td></tr>' +
    // Cuerpo
    '<tr><td style="background:#ffffff;border-radius:0 0 16px 16px;padding:32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:' + c.texto + ';">' +
    '<h1 style="margin:0 0 16px;font-family:Georgia,\'Times New Roman\',serif;font-size:26px;line-height:1.25;font-weight:bold;color:' + c.oscuro + ';">' + esc(o.titulo) + '</h1>' +
    o.cuerpo +
    '</td></tr>' +
    // Pie
    '<tr><td style="padding:20px 24px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:' + c.gris + ';text-align:center;">' + o.pie + '</td></tr>' +
    '</table></td></tr></table></body></html>';
}

function parrafo(html, estilo) {
  return '<p style="margin:0 0 16px;' + (estilo || '') + '">' + html + '</p>';
}

function tablaDatos(filas) {
  const c = COLORES;
  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;border-collapse:collapse;">' +
    filas.map(function (f) {
      return '<tr>' +
        '<td style="padding:10px 12px 10px 0;border-bottom:1px solid ' + c.linea + ';width:32%;font-size:13px;color:' + c.gris + ';vertical-align:top;">' + esc(f[0]) + '</td>' +
        '<td style="padding:10px 0;border-bottom:1px solid ' + c.linea + ';font-size:15px;color:' + c.texto + ';vertical-align:top;word-break:break-word;">' + f[1] + '</td>' +
        '</tr>';
    }).join('') +
    '</table>';
}

function cajaMensaje(etiqueta, mensaje) {
  const c = COLORES;
  return '<p style="margin:0 0 8px;font-size:13px;color:' + c.gris + ';">' + esc(etiqueta) + '</p>' +
    '<div style="margin:0 0 24px;padding:16px 20px;background:' + c.suave + ';border-left:4px solid ' + c.verde + ';border-radius:0 12px 12px 0;font-size:15px;line-height:1.6;color:' + c.texto + ';">' +
    esc(mensaje).replace(/\n/g, '<br>') + '</div>';
}

function boton(href, etiqueta, variante) {
  const c = COLORES;
  const fondo = variante === 'principal' ? c.verde : c.oscuro;
  const color = variante === 'principal' ? c.oscuro : '#ffffff';
  return '<a href="' + esc(href) + '" style="display:inline-block;margin:0 8px 10px 0;padding:12px 22px;border-radius:999px;background:' + fondo + ';color:' + color + ';font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;line-height:1.2;text-decoration:none;">' + esc(etiqueta) + ' &rsaquo;</a>';
}

function enlace(href, etiqueta) {
  return '<a href="' + esc(href) + '" style="color:' + COLORES.oscuro + ';text-decoration:underline;">' + esc(etiqueta) + '</a>';
}

function esc(valor) {
  return String(valor == null ? '' : valor)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ------------------------------------------------------------------ */
/* Ayudas de formato                                                   */
/* ------------------------------------------------------------------ */

function primerNombre(nombre) {
  const primero = String(nombre).trim().split(' ')[0] || nombre;
  return primero.charAt(0).toUpperCase() + primero.slice(1);
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function fechaLegible(fecha) {
  const p = Utilities.formatDate(fecha, 'America/Bogota', 'd|M|yyyy|h:mm|a').split('|');
  return p[0] + ' de ' + MESES[Number(p[1]) - 1] + ' de ' + p[2] + ' a las ' + p[3] + ' ' + (p[4] === 'AM' ? 'a. m.' : 'p. m.');
}

function paginaLegible(ruta) {
  const r = String(ruta || '').replace(/\/?$/, '/');
  const nombres = {
    '/': 'el inicio',
    '/contacto/': 'la página de contacto',
    '/en/': 'el inicio en inglés',
    '/en/contact/': 'la página de contacto en inglés',
  };
  return nombres[r] || (ruta ? 'la página ' + ruta : 'el sitio web');
}

/** Indicativos de los países del formulario (nombres en español e inglés). */
const INDICATIVOS = {
  'Colombia': '57', 'Ecuador': '593', 'México': '52', 'Mexico': '52', 'Perú': '51', 'Peru': '51',
  'Chile': '56', 'Argentina': '54', 'Bolivia': '591', 'Venezuela': '58', 'Panamá': '507', 'Panama': '507',
  'Costa Rica': '506', 'Guatemala': '502', 'Honduras': '504', 'El Salvador': '503', 'Nicaragua': '505',
  'República Dominicana': '1', 'Dominican Republic': '1', 'Uruguay': '598', 'Paraguay': '595',
  'España': '34', 'Spain': '34', 'Estados Unidos': '1', 'United States': '1',
};

/** Enlace wa.me con el indicativo del país si la persona no lo escribió. */
function enlaceWhatsApp(telefono, pais) {
  let digitos = String(telefono).replace(/\D/g, '');
  if (!/^\s*(\+|00)/.test(telefono)) {
    const indicativo = INDICATIVOS[pais];
    if (!indicativo) return '';
    digitos = digitos.replace(/^0+/, '');
    if (!(digitos.indexOf(indicativo) === 0 && digitos.length > indicativo.length + 7)) digitos = indicativo + digitos;
  } else {
    digitos = digitos.replace(/^00/, '');
  }
  return digitos.length >= 8 ? 'https://wa.me/' + digitos : '';
}

/* ------------------------------------------------------------------ */
/* Instalación y pruebas (se ejecutan a mano desde el editor)          */
/* ------------------------------------------------------------------ */

/**
 * Prepara la hoja: zona horaria de Bogotá, pestaña "Registros", encabezados,
 * anchos, lista de estados. Al ejecutarla la primera vez Google pide los permisos.
 */
function configurar() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  libro.setSpreadsheetTimeZone('America/Bogota');

  let hoja = libro.getSheetByName(CONFIG.HOJA);
  if (!hoja) {
    const primera = libro.getSheets()[0];
    hoja = libro.getSheets().length === 1 && primera.getLastRow() === 0 ? primera.setName(CONFIG.HOJA) : libro.insertSheet(CONFIG.HOJA);
  }

  const encabezados = asegurarEncabezados(hoja);
  const total = encabezados.length;
  const filas = hoja.getMaxRows();

  hoja.setFrozenRows(1);
  hoja.getRange(1, 1, 1, total)
    .setFontWeight('bold').setFontColor('#ffffff').setBackground(COLORES.oscuro).setVerticalAlignment('middle');
  hoja.setRowHeight(1, 32);
  hoja.getRange(2, 1, filas - 1, total).setVerticalAlignment('top');

  COLUMNAS.forEach(function (c) {
    const col = encabezados.indexOf(c[1]) + 1;
    if (col > 0) hoja.setColumnWidth(col, c[2]);
  });
  const col = function (titulo) { return encabezados.indexOf(titulo) + 1; };
  hoja.getRange(2, col('Fecha'), filas - 1).setNumberFormat('yyyy-mm-dd hh:mm');
  hoja.getRange(2, col('Teléfono'), filas - 1).setNumberFormat('@');
  hoja.getRange(2, col('Mensaje'), filas - 1).setWrap(true);
  hoja.getRange(2, col('Estado'), filas - 1).setDataValidation(reglaEstado());

  console.log('Hoja lista. Los correos saldrán desde ' + Session.getEffectiveUser().getEmail() +
    ' (cupo restante hoy: ' + MailApp.getRemainingDailyQuota() + ').');
}

/**
 * Simula un mensaje del sitio: agrega una fila de prueba y envía la confirmación y el
 * aviso a la cuenta que ejecuta la prueba (no al equipo de Sonante). Borra la fila
 * de prueba antes de entregar la hoja.
 */
function probar() {
  const yo = Session.getEffectiveUser().getEmail();
  const resultado = procesar({
    nombre: 'Prueba Khaos Core',
    telefono: '300 123 4567',
    correo: yo,
    pais: 'Colombia',
    ciudad: 'Bogotá D.C.',
    mensaje: 'Este es un mensaje de prueba del formulario.\nSegunda línea para revisar los saltos.',
    idioma: 'es',
    pagina: '/contacto/',
    autorizacion_datos: 'Autorización de datos personales: Sí (Política de tratamiento de datos personales)',
    t: 10000,
  }, { avisoPara: yo, sinVerificacion: true });
  console.log(JSON.stringify(resultado) + ' — revisa la bandeja de ' + yo);
}
