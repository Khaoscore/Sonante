# Criterios de edición — Blog de Sonante

Estos son los criterios que se aplicaron en la corrección de estilo de los artículos. Sirven también como guía para los próximos textos del blog, para que todo se vea y se lea igual.

## 1. Alcance de la corrección

- **Se corrigió:** ortografía, tildes, puntuación, concordancia, signos de apertura (¿ ¡), palabras pegadas por saltos de página, repeticiones evidentes, oraciones demasiado largas y conectores de relleno.
- **No se cambió:** el argumento, la estructura de ideas, los ejemplos, los datos ni las conclusiones. La voz sigue siendo la de Sonante: ensayística, rigurosa, en español neutro y en tercera persona.
- **Se eliminó del cuerpo:** toda nota interna de producción (referencias al “guion”, “Guion base”, encabezados tipo “VIDEO:” o “Video taiwan”, notas editoriales para el equipo). Lo que había que avisar quedó en el `README.md`.
- Los posibles errores de datos o de referencias **no se corrigieron en silencio**: se marcaron en el `README.md` para que el equipo los valide.

## 2. Estructura de cada archivo

Cada artículo es un `.md` con un bloque de metadatos (frontmatter YAML) arriba y el cuerpo en Markdown:

```yaml
---
title: "Título principal"
subtitle: "Bajada o subtítulo (vacío si no aplica)"
slug: "url-del-articulo"
description: "Resumen de 140–160 caracteres para la vista previa y el SEO."
author: "Sonante"
publishDate: ""            # Lo define el equipo al programar
category: "Estrategia electoral"
tags: ["etiqueta 1", "etiqueta 2"]
cover:
  src: "/images/blog/url-del-articulo.jpg"
  alt: "Descripción de la imagen para accesibilidad"
  credit: ""               # Autor o banco de la imagen
readingTime: 9             # Minutos
status: "listo"            # listo | revisar | incompleto
---
```

- El título **no se repite** como `#` dentro del cuerpo: la plantilla de la web lo toma del frontmatter.
- Los títulos con dos partes (separadas por dos puntos o pregunta) se dividieron en `title` + `subtitle` para usar el subtítulo como bajada.
- `readingTime` se calculó a 230 palabras por minuto.

## 3. Jerarquía dentro del cuerpo

- `##` para secciones y `###` para subsecciones. No se usa `#`.
- Se quitó el encabezado “Introducción”: el texto de apertura va directo, como entrada del artículo.
- A los artículos que venían en bloque corrido se les agregaron intertítulos cada 300–500 palabras, tomados del propio contenido, para que se puedan leer en pantalla.
- Párrafos de máximo 5–6 líneas en pantalla (unas 110–120 palabras). Los más largos se partieron donde cambia la idea.
- La fuente bibliográfica va al final, bajo `## Referencias`.

## 4. Normas ortotipográficas

| Caso | Criterio | Ejemplo |
|---|---|---|
| Comillas | Inglesas curvas “ ” y simples ‘ ’ dentro de ellas | “ganar no es convencer” |
| Extranjerismos | Cursiva | *hot streaks*, *bandwagon effect*, *issue ownership*, *outsider* |
| Obras, medios y series | Cursiva | *The Guardian*, *El Tiempo*, *Servant of the People* |
| Marcas y plataformas | Redonda, sin cursiva | TikTok, Instagram, Facebook |
| Porcentajes | Número, espacio y signo; coma decimal | 20,5 % |
| Miles | Punto como separador (uso colombiano) | 23.421 votos |
| Fechas | En letras el mes, en minúscula | 12 de septiembre de 2026 |
| Incisos | Raya de apertura y de cierre | —como en este caso— |
| Énfasis | Negrita solo para ideas clave, con moderación | |

## 5. Referencias

- Formato APA 7, una por línea, en lista.
- Revistas y libros en cursiva; volumen en cursiva.
- DOI como enlace completo: `https://doi.org/...`.
- Se limpiaron los enlaces de parámetros de rastreo (por ejemplo `?utm_source=chatgpt.com`) y de restos de formato.
- Si una fuente se cita en el texto pero no aparece en la lista (o al revés), quedó anotado en el `README.md`.

## 6. Categorías del blog

| Categoría | Qué agrupa |
|---|---|
| Estrategia electoral | Mensaje, agenda, propuestas, encuestas y decisión de voto |
| Comunicación digital | Redes, viralidad, edición y campañas en internet |
| Comunicación pública | Comunicación de gobierno y cambio de comportamiento ciudadano |
| Oficio | Cómo se aprende y se construye el trabajo en comunicación política |

## 7. Gráficas

Algunos artículos tienen gráficas o esquemas. Se definen en el frontmatter, bajo `graficas:`, y en el texto se marca dónde va cada una con una línea sola:

```markdown
<figure data-grafica="exploracion-explotacion"></figure>
```

```yaml
graficas:
  exploracion-explotacion:
    type: flow            # bars | stats | flow | cards | matrix | hub
    title: "Exploración seguida de explotación"
    steps:
      - title: "Exploración"
        text: "Mayor diversidad de temas o estilos."
    caption: "La idea que se lleva el lector, en una frase."
    source: "Elaboración de Sonante a partir de Liu et al. (2021)"
```

- Solo datos que estén en el propio artículo y con su fuente. Si una cifra está pendiente de verificar, no se grafica.
- Una gráfica por artículo, dos como máximo en los textos largos.
- Se admiten *cursiva* y **negrita** en los textos de la gráfica.

### Fotos dentro del texto

También se pueden agregar fotos con el tipo `foto`. Solo imágenes de uso libre (dominio público, CC0, CC BY o CC BY-SA), con autor, licencia y enlace a la fuente, porque la licencia exige citarlos:

```yaml
graficas:
  foto-antanas-mockus:
    type: foto
    src: /images/blog/contenido/antanas-mockus.jpg
    alt: "Descripción de la imagen para accesibilidad"
    width: 1440
    height: 959
    caption: "Pie de foto que conecta la imagen con el texto."
    credit:
      author: "Stephan Röhl / Heinrich-Böll-Stiftung"
      license: "CC BY-SA 2.0"
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/deed.es"
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Antanas_Mockus_(3).jpg"
      via: "Wikimedia Commons"
      modified: "recortada"   # solo si se recortó o editó
```

