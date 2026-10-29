# Sonante — sitio web

Sitio web de **Sonante**, agencia de comunicación política (Bogotá). Construido con
**Astro 7 + React 19** a partir del diseño en Figma
[Web design Sonante](https://www.figma.com/design/xtuAVV3RwZvrXPJAvlUYVt/Web-design-Sonante?node-id=2-3)
y la librería [Design library Sonante](https://www.figma.com/design/qvcWElEgHDgFSWNiP2FGn8/Design-library-Sonante?node-id=2-220).

## Comandos

```bash
npm install        # dependencias
npm run dev        # servidor de desarrollo → http://localhost:4321
npm run build      # build estático en ./dist
npm run preview    # sirve ./dist
npm run check      # comprobación de tipos (astro check)
```

## Estructura

```
public/
  assets/img/        fotos y recursos gráficos exportados de Figma
  assets/icons/      SVG (logotipo, símbolo, iconos sociales y de UI)
  fonts/             fuentes con licencia (no incluidas; ver README ahí)
src/
  styles/tokens.css  design tokens (colores, tipografía, layout) de la librería
  styles/global.css  reset, @font-face, utilidades tipográficas
  layouts/BaseLayout.astro
  layouts/ArticleLayout.astro  plantilla de artículo del blog
  content.config.ts  colección `blog` (lee blog-sonante/articulos/*.md)
  lib/blog.ts        orden, portadas y relacionados de los artículos
  data/              contenido editable (site, servicios, casos, team, tips)
  components/
    ui/              Button, Icons
    layout/          Nav (isla React), Footer
    home/            HomeHero, Marquee, Intro, Servicios (isla), Distintos, CasosPreview
    shared/          PageHero, InstagramPost, ContactForm (isla), ContactSection
    nosotros/        TeamRows
    casos/           CasosHero, CaseSection, StatsBand, Testimonials (isla), BigStats
    tips/            ProjectCard, TipsGrid, SocialWall, XPost, TweetCard,
                     ArticleHero, ArticleAside, RelatedTips, ArticleBody.module.css
  pages/             index, quienes-somos, casos-de-exito, nuestros-tips, contacto,
                     nuestros-tips/[slug] (una página por artículo)
```

Los componentes React se renderizan en el servidor; solo se hidratan los que
tienen interacción (`client:load` / `client:visible`): navegación, Servicios,
formulario de contacto y testimonios. Los estilos usan **CSS Modules** sobre
las custom properties de `tokens.css`.

## Páginas

| Ruta               | Frame en Figma  | Contenido                                                     |
| ------------------ | --------------- | ------------------------------------------------------------- |
| `/`                | Wireframe - 1   | Hero con carrusel, cinta, intro, Servicios, diferenciales, casos, contacto |
| `/quienes-somos/`  | Wireframe - 5   | Hero naranja "Somos SONANTE" + filas del equipo               |
| `/casos-de-exito/` | Wireframe - 6   | Hero amarillo, 3 casos, cifras, testimonios, cifras grandes    |
| `/nuestros-tips/`  | Wireframe - 7   | Hero magenta, tarjetas de tips, muro de redes                  |
| `/contacto/`       | Wireframe - 8   | Formulario con gota degradada                                  |

## Idiomas (ES / EN)

El sitio es bilingüe. El español vive en la raíz y el inglés bajo `/en/` con slugs
en inglés; la correspondencia está en `src/i18n/index.ts`:

| Español            | English                |
| ------------------ | ---------------------- |
| `/`                | `/en/`                 |
| `/quienes-somos/`  | `/en/about-us/`        |
| `/casos-de-exito/` | `/en/success-stories/` |
| `/nuestros-tips/`  | `/en/our-tips/`        |
| `/contacto/`       | `/en/contact/`         |

- **Textos de interfaz** (menú, footer, formulario, etiquetas accesibles): `src/i18n/ui.ts`.
- **Contenido editorial** de cada página: `src/data/home.ts`, `servicios.ts`, `casos.ts`, `team.ts`, `tips.ts`, cada uno con las claves `es` y `en`.
- Cada componente recibe `lang` y las páginas de `src/pages/en/` renderizan los mismos componentes con `lang="en"`.
- El botón **ES / EN** del menú enlaza a la misma página en el otro idioma. El layout emite `<html lang>`, `hreflang` alternos y `og:locale`.
- Para añadir un idioma: sumarlo a `locales` y `routes` en `src/i18n/index.ts`, añadir sus textos en `ui.ts` y en cada archivo de `src/data/`, y crear la carpeta de páginas correspondiente.

## Carrusel del hero

`src/components/home/HeroCarousel.tsx` (isla con `client:load`, insertada como hijo de
`HomeHero` desde las páginas de inicio). Las piezas recorren la fila en bucle y su
forma se calcula según la posición en pantalla: grandes y giradas en perspectiva en los
bordes, planas y más pequeñas en el centro, como en Figma.

- La separación visible entre piezas vecinas es siempre la misma (`GAP_RATIO`, 25 px a 1440):
  cada pieza se coloca resolviendo su posición contra el borde proyectado de la anterior.
- Rotación automática lenta (`AUTO_SPEED`, px/s) que se detiene mientras se arrastra, mientras
  el mouse está sobre una pieza, con foco del teclado dentro o mientras un video tiene sonido.
- Arrastre con ratón y táctil (Pointer Events) con inercia al soltar (`FRICTION`). Un gesto
  de menos de `DRAG_THRESHOLD` px es un clic (abre el video); más, es arrastre.
- `MAX_ROTATION` (giro en los bordes) y `MIN_SCALE` (tamaño en el centro) ajustan la forma.
- Con `prefers-reduced-motion` no gira solo ni reproduce los bucles, pero sigue pudiendo
  arrastrarse y activar el sonido.
- Si hay pocas piezas, la lista se repite hasta `MIN_ITEMS` para cubrir pantallas anchas.

### Reels y TikToks del hero

Las piezas son videos de clientes (el primero de la lista arranca centrado), como en la
galería de Elexa: se reproducen en bucle y sin sonido mientras están en pantalla, el botón
redondo les da sonido (y calla a los demás), al pasar el mouse se difuminan bajo un velo
verde con "Ver en Instagram / TikTok" y toda la pieza enlaza a la publicación. Arriba a la
izquierda muestran las visualizaciones y los me gusta (`likes`).

Los videos se listan en `src/data/hero-reels.json`, en el orden en que aparecen:

```json
[
  { "id": "fajardo-saben", "url": "https://www.instagram.com/reel/XXXX/", "views": 1250000, "likes": 98000 },
  { "id": "gomez-gobiernos", "url": "https://www.tiktok.com/@cuenta/video/123", "views": null }
]
```

y se descargan con `npm run reels` (requiere [yt-dlp](https://github.com/yt-dlp/yt-dlp) y
[ffmpeg](https://ffmpeg.org) en el PATH). Por cada `id` deja en `public/assets/video/hero/`,
en WebM (VP9 a dos pasadas + Opus, ~40 % más liviano que el MP4 equivalente):

| Archivo          | Qué es                                                        |
| ---------------- | ------------------------------------------------------------- |
| `<id>-loop.webm` | primeros 10 s sin audio (≤ 440 KB): el bucle que se ve siempre |
| `<id>.webm`      | video completo con audio: sólo se carga al activar el sonido  |
| `<id>.webp`      | póster (primer cuadro), visible mientras carga                |

- Los bucles arrancan cuando la página terminó de cargar (antes se ven los pósters) y sólo
  los de las piezas visibles; fuera de pantalla se pausan.
- Safari lee WebM desde macOS 11.3 / iOS 17.4: en equipos más viejos se ve el póster fijo.
- Codificar en VP9 es lento (unos 3 s por segundo de video): `npm run reels -- --force`
  con los 7 videos tarda alrededor de 20 minutos.

- `views: null` se completa solo con lo que reporta la plataforma. TikTok lo da; **Instagram
  no lo entrega sin sesión**, así que en los reels hay que escribir la cifra a mano (o correr
  `npm run reels -- --cookies-from-browser chrome`). Sin cifra no se muestra la etiqueta.
- `npm run reels -- --views` actualiza las visualizaciones; `-- --force` vuelve a descargar.
- Si una plataforma no deja descargar (TikTok a veces responde con una verificación
  anti-bots), deja el archivo original en `videos-originales/<id>.mp4` (carpeta fuera de git)
  y vuelve a correr `npm run reels`: usa ese archivo en lugar de descargar. En ese caso la
  cifra de visualizaciones va a mano.
- El script marca `"ready": true` los videos procesados; el carrusel sólo muestra esos.
- Mientras la lista esté vacía, el carrusel muestra las capturas fijas de
  `public/assets/img/hero/`.

## Muro de fotos de "Lo que nos hace distintos" (DriftWall)

`src/components/ui/DriftWall.tsx` (+ `DriftWall.css`) es el componente **DriftWall de
React Bits** adaptado a TypeScript, con una prop extra `decorative` para usarlo como fondo
sin elementos enfocables. `DistintosWall.tsx` lo configura (columnas, tamaño de ficha,
inclinación, velocidad, tinte) y se monta como isla `client:visible` dentro de `Distintos`.

**Las imágenes van en `src/assets/distintos/`.** Cualquier `.jpg`, `.jpeg`, `.png`, `.webp`
o `.avif` que se deje ahí entra automáticamente en el muro al compilar (`src/data/distintos.ts`
las lee con `import.meta.glob`); el nombre del archivo es el título de la ficha y el orden
es alfabético. Los `placeholder-XX.jpg` actuales son fotos del propio sitio y deben
reemplazarse por las definitivas. Detalles en el README de esa carpeta.

## Título 3D de Servicios (DepthText)

`src/components/ui/DepthText.tsx` (+ `DepthText.css`) es el componente **DepthText de
React Bits** adaptado a TypeScript: texto extruido en 3D con paralaje de puntero y órbita
sutil en reposo. Sustituye a la imagen 3D exportada de Figma, así que el título se traduce
("Servicios" / "Services") y usa la tipografía del sitio. Se monta en `Servicios.tsx` en el
estado base; al activar una tarjeta se reemplaza por el título del servicio. Los colores y
la geometría (capas, profundidad, inclinación) se pasan como props.

## Ruleta de "Casos de éxito" en el home (OptionWheel)

`src/components/ui/OptionWheel.tsx` (+ `OptionWheel.css`) es el componente **OptionWheel de
React Bits** adaptado a TypeScript. `src/components/home/CasosPreview.tsx` (isla
`client:visible`) lo usa para los tres nombres: el caso activo queda en amarillo al centro y
los demás se curvan en verde oscuro. Al girar la ruleta, el post de Instagram del caso entra
rodando en la misma dirección y enlaza a su bloque en `/casos-de-exito/`.

- Se gira con la rueda del ratón o el touchpad (sobre los nombres o sobre la tarjeta, vía
  `wheelTarget`), arrastrando, con clic en un nombre o con las flechas. En los extremos el scroll pasa a la página (`releaseScroll`), así que no atrapa
  a quien solo baja por el home.
- En táctil no se arrastra, para que el dedo siga desplazando la página; se toca el nombre.
- Casos, orden, usuarios, textos e imágenes: `casosPreview.cases` en `src/data/home.ts`.
  Los ajustes de forma (`tilt`, `curve`, `scale`, `fade`…) están en `CasosPreview.tsx`.
- El HTML del servidor ya trae la ruleta armada con Fajardo al centro, antes de hidratar.

## Animación de la intro (GSAP + ScrollTrigger)

`src/components/home/IntroSequence.tsx` (isla con `client:load`) envuelve la cinta de
título y los dos párrafos de la intro. La cinta **no se mueve sola**: todo va ligado al
scroll (`scrub`) con la sección fijada (`pin`) y centrada en la ventana:

1. Al llegar la sección al centro de la pantalla se fija. El título arranca en "Somos" y
   se desplaza hacia la izquierda a ritmo del scroll hasta que se ha visto la frase
   completa; entonces la sección se libera. `SCROLL_RATIO` convierte el recorrido
   horizontal en scroll vertical (0.9 = casi 1:1).
2. En el primer tramo del scroll fijado, los párrafos caen desde arriba a la izquierda y
   rebotan al aterrizar (`bounce.out`).
3. Después, las gotas entran en diagonal como meteoros, siguiendo la dirección de su cola,
   con un pequeño impacto al posarse (`expo.out` + `back.out`).

Los elementos se marcan con `data-anim="title" | "title-line" | "text" | "bullet"`. Los
párrafos y gotas permanecen ocultos hasta que GSAP toma el control solo si hay JavaScript
(`html.js`); sin JS todo se ve normal. Con `prefers-reduced-motion` no hay fijación ni
animación y la frase se muestra completa en varias líneas. Las frases del título están en
`src/data/home.ts` (`marquee.phrases`); con menos texto el tramo fijado es más corto.

## Cursor personalizado y estela

`src/components/effects/CursorTrail.tsx` (montado en `BaseLayout.astro` con `client:only`)
sustituye el cursor por un círculo coral y dibuja una estela tipo cometa en un canvas a
pantalla completa, con la misma forma que el recurso "Gradient-03" del diseño.

- Al hacer clic el círculo late y emite una onda; sobre enlaces y botones se abre como un
  anillo; sobre campos de texto se convierte en una barra fina.
- Solo se activa con puntero fino (`hover: hover` y `pointer: fine`) y sin
  `prefers-reduced-motion`; en móvil y táctil se conserva el cursor nativo.
- Ajustes en las constantes del archivo: `HEAD_RADIUS` (tamaño), `MAX_LENGTH` (largo de la
  estela), `TAPER` (afilado), `FOLLOW` (suavizado) y los colores `HEAD` / `TAIL`.
- Para desactivarlo, quita la línea `<CursorTrail client:only="react" />` del layout.

## Fuentes

El diseño usa **FreightBig Pro** (títulos) y **TT Commons Pro** (texto), ambas con
licencia. Colócalas en `public/fonts/` con los nombres indicados en
`public/fonts/README.md`; mientras no existan, el sitio usa **Playfair Display** y
**Manrope** desde Google Fonts.

## Formulario de contacto

Sin configuración, el botón "Enviar mensaje" abre el cliente de correo con el
mensaje prellenado hacia `sonanteagencia@gmail.com`. Para enviar a un servicio
(Formspree, Getform, webhook de n8n…), copia `.env.example` a `.env` y define
`PUBLIC_FORM_ENDPOINT` con la URL del endpoint que acepte `multipart/form-data`.

## Blog ("Nuestros tips")

Los artículos viven en `blog-sonante/articulos/*.md` (una carpeta fuera de `src/`
para que el equipo editorial la maneje sin tocar código). Astro los carga como la
colección `blog` (`src/content.config.ts`) y genera:

- `/nuestros-tips/`: la rejilla; el primer artículo va como tarjeta destacada.
  `/en/our-tips/` muestra los mismos artículos con un aviso de que están en español.
- `/nuestros-tips/<slug>/`: cada artículo con la plantilla `ArticleLayout.astro`
  (cabecera magenta, índice lateral, etiquetas, compartir y "Sigue leyendo").

Cómo se publica:

- **Nuevo artículo**: agregar el `.md` con el frontmatter de
  `blog-sonante/_criterios-de-edicion.md`. Si falta un campo o la categoría no es
  una de las cuatro, el build falla y dice qué corregir.
- **Orden**: con `publishDate`, del más reciente al más antiguo; sin fecha, por el
  número del archivo (`01-…`, `02-…`).
- **Estado**: `listo` y `revisar` se publican; `incompleto` solo se ve en
  `npm run dev` (con un aviso de borrador) y no entra en el build.
- **Portadas**: sin foto, cada artículo tiene una portada generada
  (`src/components/tips/ArticleCover.tsx` + `src/lib/cover.ts`): fondo oscuro con
  brillos de la paleta de su categoría, el símbolo "S" en un círculo y un destello;
  la variación sale del slug, así que es estable. La misma portada se renderiza como
  imagen para redes en `/og/<slug>.jpg` (endpoint con sharp). Para usar una foto,
  exportarla a `public/images/blog/<slug>.jpg` (también sirve `.webp`, `.png` o
  `.avif`) y reemplaza a la generada. El campo `cover.credit` se publica como pie de
  foto: dejarlo con el crédito final, sin notas internas.
- **Gráficas**: cada artículo las define en su frontmatter, bajo `graficas:`, y marca
  dónde va cada una con una línea propia `<figure data-grafica="id"></figure>`.
  Tipos: `bars`, `stats`, `flow`, `cards`, `matrix`, `hub` y `foto` (el esquema está en
  `src/content.config.ts`, el HTML lo genera `src/lib/graficas.mjs` y los estilos
  están en `src/components/tips/ArticleGraphics.css`). Usan solo datos del propio
  artículo (las cifras pendientes se graficaron cuando el equipo las confirmó, el
  29 de octubre de 2026). Las fotos son de uso libre (Wikimedia Commons), están en
  `public/images/blog/contenido/` y llevan autor, licencia y enlace en su pie.
- Los comentarios HTML (`<!-- PENDIENTE … -->`) no llegan a la web, y un
  encabezado final vacío (p. ej. "Referencias" sin fuentes) no se muestra.
  Los plugins están en `src/lib/markdown-plugins.mjs` (API de Sätteri, el
  procesador de Markdown de Astro 7).
- Al agregar la colección por primera vez, reiniciar `npm run dev`.

## Pendientes de contenido (heredados del diseño)

- **Paola Pabón**: en Figma su bloque repite los textos y cifras de Sergio Fajardo. Están marcados en `src/data/casos.ts`; reemplazar con la información real.
- **Posts de la ruleta del home**: los de Luis E. Gómez (`ig-post-gomez.jpg`, `ig-avatar-gomez.png`) y Paola Pabón (`ig-post-pabon.jpg`, `ig-avatar-pabon.png`) son recortes provisionales de las fotos de la página de casos, con textos redactados a partir de esa página. Reemplazarlos por los posts reales que elija el cliente.
- **Nuestros tips**: los artículos ya son reales, pero faltan las portadas y el artículo 02 está incompleto. Ver `blog-sonante/README.md` para los pendientes editoriales.
- **Redes sociales**: las URL de `src/data/site.ts` son perfiles genéricos; falta el número de WhatsApp.
- **Testimonios**: solo existe el de Sergio Fajardo; el componente admite varios.
- **Traducción**: la versión en inglés fue redactada a partir del español del diseño; conviene una revisión final del cliente.
