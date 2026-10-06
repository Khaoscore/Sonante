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
  data/              contenido editable (site, servicios, casos, team, tips)
  components/
    ui/              Button, Icons
    layout/          Nav (isla React), Footer
    home/            HomeHero, Marquee, Intro, Servicios (isla), Distintos, CasosPreview
    shared/          PageHero, InstagramPost, ContactForm (isla), ContactSection
    nosotros/        TeamRows
    casos/           CasosHero, CaseSection, StatsBand, Testimonials (isla), BigStats
    tips/            ProjectCard, TipsGrid, SocialWall, XPost, TweetCard
  pages/             index, quienes-somos, casos-de-exito, nuestros-tips, contacto
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
`HomeHero` desde las páginas de inicio). Las 13 piezas recorren la fila en bucle y su
forma se calcula según la posición en pantalla: grandes y giradas en perspectiva en los
bordes, planas y más pequeñas en el centro, como en Figma.

- La separación visible entre piezas vecinas es siempre la misma (`GAP_RATIO`, 25 px a 1440):
  cada pieza se coloca resolviendo su posición contra el borde proyectado de la anterior.
- Rotación automática lenta (`AUTO_SPEED`, px/s) que se pausa mientras se arrastra.
- Arrastre con ratón y táctil (Pointer Events) con inercia al soltar (`FRICTION`).
- `MAX_ROTATION` (giro en los bordes) y `MIN_SCALE` (tamaño en el centro) ajustan la forma.
- Con `prefers-reduced-motion` no gira solo, pero sigue pudiendo arrastrarse.
- Las fotos se listan en `PHOTOS` (`public/assets/img/hero/`).

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

## Pendientes de contenido (heredados del diseño)

- **Paola Pabón**: en Figma su bloque repite los textos y cifras de Sergio Fajardo. Están marcados en `src/data/casos.ts`; reemplazar con la información real.
- **Posts de la ruleta del home**: los de Luis E. Gómez (`ig-post-gomez.jpg`, `ig-avatar-gomez.png`) y Paola Pabón (`ig-post-pabon.jpg`, `ig-avatar-pabon.png`) son recortes provisionales de las fotos de la página de casos, con textos redactados a partir de esa página. Reemplazarlos por los posts reales que elija el cliente.
- **Nuestros tips**: tarjetas con título y etiquetas genéricas y bloque amarillo en lugar de imagen. Editar `src/data/tips.ts` (admite `image`).
- **Redes sociales**: las URL de `src/data/site.ts` son perfiles genéricos; falta el número de WhatsApp.
- **Testimonios**: solo existe el de Sergio Fajardo; el componente admite varios.
- **Traducción**: la versión en inglés fue redactada a partir del español del diseño; conviene una revisión final del cliente.
