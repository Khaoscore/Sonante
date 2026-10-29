# Blog de Sonante — artículos listos para la web

Catorce artículos extraídos del documento *Artículos guiones*, con corrección de estilo, separados en un `.md` por artículo y con metadatos listos para una web en Astro, Next o cualquier CMS que lea Markdown.

## Qué hay en la carpeta

| Archivo | Para qué sirve |
|---|---|
| `articulos/NN-slug.md` | Un artículo por archivo: metadatos arriba (título, bajada, categoría, etiquetas, imagen, tiempo de lectura, estado) y el texto en Markdown. |
| `_criterios-de-edicion.md` | Las normas aplicadas: estructura, ortotipografía, referencias y categorías. Sirve como guía para los próximos artículos. |
| `README.md` | Este índice: orden, estado de cada texto y lo que falta resolver antes de publicar. |

## Índice de artículos

| # | Título | Categoría | Lectura | Estado | Imagen |
|---|---|---|---|---|---|
| 01 | ¿El éxito también se construye experimentando? | Oficio | 8 min | listo | Imagen 1 · Unsplash+, con marca de agua |
| 02 | La edición también es poder | Comunicación digital | — | **incompleto** | Imagen 2 · foto de prensa, sin crédito |
| 03 | Tres errores en la construcción de una campaña digital | Comunicación digital | 6 min | listo | Imagen 3 |
| 04 | ¿Se puede aprender marketing político sin estudiar marketing político? | Oficio | 7 min | listo | Imagen 4 · Unsplash+, con marca de agua |
| 05 | De la factura al incentivo | Comunicación pública | 7 min | listo | Imagen 5 · © taiwanderers.com |
| 06 | Cuando el mimo reemplaza al comparendo | Comunicación pública | 9 min | listo | Imagen 6 · foto de prensa, sin crédito |
| 07 | Cuando una buena política no basta | Estrategia electoral | 9 min | listo | Imagen 7 |
| 08 | Cuando el evento se vuelve más importante que el mensaje | Comunicación digital | 8 min | listo | Imagen 8 · foto de prensa, sin crédito |
| 09 | Cuando una propuesta se convierte en meme | Estrategia electoral | 8 min | revisar | **Falta** (el ítem 9 del documento está vacío) |
| 10 | No todos pueden ser Mamdani | Estrategia electoral | 9 min | **revisar** | Imagen 10 · foto de prensa, sin crédito |
| 11 | El miedo también comunica | Comunicación pública | 10 min | revisar | Imagen 11 |
| 12 | Zelenski: cuando una campaña no usa internet como canal, sino como lógica | Comunicación digital | 11 min | revisar | **Falta** |
| 13 | Que una propuesta sea popular no significa que la gente vote por ella | Estrategia electoral | 10 min | revisar | **Falta** |
| 14 | Las encuestas no solo miden una elección | Estrategia electoral | 11 min | revisar | Imagen 12 |

**Estados.** *listo*: se puede publicar; los pendientes son menores. *revisar*: hay fuentes por completar o datos por confirmar. *incompleto*: no se puede publicar todavía.

Cada artículo apunta su portada a `/images/blog/<slug>.jpg`. Basta con exportar la imagen con ese nombre.

## Lo que hay que resolver antes de publicar

### 1. Bloqueantes

- **02 · Falta el inicio del artículo.** El documento arranca en “¿Qué nos enseña este caso sobre las campañas digitales?”: no están la introducción ni el relato del debate Collor–Lula de 1989 y la edición del *Jornal Nacional*. Lo que queda habla de “este caso” y “aquella cobertura” sin antecedente. Tampoco tenía título; el propuesto es “La edición también es poder”. El archivo tiene un comentario `PENDIENTE` (no se publica) donde va el texto faltante.
- **10 · No tiene referencias.** El texto cita un análisis (78 % frente a 32 %), la cobertura de *The Guardian* y “análisis posteriores”, pero el original no traía fuentes. Quedó un comentario `PENDIENTE` bajo `## Referencias`.
- **Imágenes con derechos sin resolver:**
  - **01 y 04** son vistas previas de Unsplash+ con marca de agua visible. Hay que descargarlas con licencia o cambiarlas.
  - **05** tiene marca “© taiwanderers.com”. Hay que pedir permiso o cambiarla.
  - **02, 06, 08 y 10** parecen fotos de prensa y no tienen autor. Hay que identificar el crédito y los derechos antes de usarlas.
- **Sin imagen:** 09, 12 y 13.

### 2. Referencias que ya se corrigieron

- **09:** la referencia “González, M., & otros (2024)” tenía mal los autores y las páginas. El estudio es de Cruz, Keefer, Labonne y Trebbi (2024), *The Economic Journal*, 134(661), 1875–1913. Ya está corregido y con DOI.
- **14:** el experimento en Países Bajos con 23.421 participantes no tenía fuente. Es Van der Meer, Hakhverdian y Aaldering (2016), *International Journal of Public Opinion Research*. Ya está citado en el texto y en la lista.
- **01:** se agregaron los DOI de los dos estudios de Liu et al.
- **05:** se limpiaron los enlaces que traían `?utm_source=chatgpt.com`.

### 3. Notas internas que se quitaron del texto

Se eliminaron o reformularon todas las huellas de producción: “Guion base: …” (07), “según el guion” (04, 07 y 14), los encabezados “VIDEO: …” y “Video taiwan” (03, 04 y 05) y la “Nota editorial” del 02. Esa nota decía que el artículo debe distinguir entre la controversia histórica sobre la edición del debate y lo que el estudio académico estima como efecto electoral. Hay que tenerlo en cuenta al escribir el inicio que falta.

### 4. Desajuste en el documento de imágenes

El documento trae 16 imágenes para 14 artículos, y no coinciden:

- Las imágenes **13 a 16** (embudo de conversión, *buyer persona*, *customer journey* y estudio de mercado) no tienen artículo. ¿Faltan cuatro textos o son para más adelante?
- Los artículos de **Zelenski** y **“Que una propuesta sea popular…”** no tienen imagen ni etiquetas. Las etiquetas se propusieron siguiendo el estilo de las demás.
- Además, la imagen 13 (embudo) dice “VENTA”: en un contexto electoral conviene adaptarla.

## Decisiones editoriales que se pueden revertir

- **Títulos en dos partes.** Los títulos con dos puntos o con pregunta se dividieron en `title` y `subtitle` para usar la segunda parte como bajada.
- **03:** se invirtió el título para que la idea fuerte quede como titular: “Tres errores en la construcción de una campaña digital”, con la bajada “Redes sociales y comunicación política”.
- **12:** se aplicaron las grafías que recomienda FundéuRAE (Volodímir Zelenski, Petró Poroshenko, Kiev). Si se prefieren las inglesas (Zelensky, Kyiv), es un buscar y reemplazar. La serie quedó como *Servidor del pueblo* (*Servant of the People*).
- **14:** *underdog effect* se tradujo como “efecto de simpatía por el perdedor”.
- **Intertítulos.** Los artículos que venían en bloque corrido (01, 07, 10, 11, 12, 13 y 14) recibieron intertítulos tomados de su propio contenido.

## Pendientes por artículo

> **Actualización (29 de octubre de 2026).** El equipo confirmó las cifras marcadas abajo para verificar (01, 05, 06, 07, 09, 10 y 11) y ya están graficadas en los artículos. Siguen pendientes las referencias que faltan (por ejemplo, en el 10 y el 11). Las fotos de uso libre agregadas al texto vienen de Wikimedia Commons y llevan autor y licencia en su pie.

Son puntos de verificación, no errores confirmados. Ninguno se cambió en silencio.

**01 — ¿El éxito también se construye experimentando?**
- Confirmar si los porcentajes 20,5 %, 13,8 % y 19,2 % son aumentos relativos o puntos porcentuales. Es el dato central.

**02 — La edición también es poder**
- Escribir la introducción y el relato del caso.
- Citar en el cuerpo a Cavgias et al. (2024) y a Memória Globo.
- Probar que abre la URL de Memória Globo, que venía partida.

**03 — Tres errores en la construcción de una campaña digital**
- El cuerpo no tiene citas autor-año y hay afirmaciones sin fuente clara (por ejemplo, que los candidatos no hablan de los temas prioritarios para las audiencias).
- McGregor et al. (2017) está en la lista pero no se asocia a nada del texto.

**04 — ¿Se puede aprender marketing político sin estudiar marketing político?**
- Que los fundadores aprueben cómo se cuenta su trayectoria.
- Verificar la ficha de Zajdowski (2026).

**05 — De la factura al incentivo**
- El aumento de 29 a 51 millones da 75,9 %. El texto dice “cercano al 75 %”; se podría ajustar a 76 %.
- Confirmar el autor y el año de la referencia del National Development Council.

**06 — Cuando el mimo reemplaza al comparendo**
- Las cifras de 1996 (76,46 % y 72,25 %) y el “estudio sobre las experiencias de Cultura Ciudadana” no tienen fuente concreta.
- Mockus y Corzo (2003) está en la lista pero no se cita en el texto.

**07 — Cuando una buena política no basta**
- Las cifras de 84 %, 74 % y 69 % parecen venir de Caughey, Dafoe y Miratrix (2017). Hay que confirmarlo y citarlo en esa frase.
- A esa referencia y a Wantchekon y Guardado (2023) les faltan volumen, páginas y DOI.

**08 — Cuando el evento se vuelve más importante que el mensaje**
- El caso es de septiembre de 2026: confirmar nombres y cargos.
- “Los medios que cubrieron…” no cita ningún medio.
- Dayan y Katz (1992) no se cita en el texto.
- “Economía política de la atención” no tiene fuente.

**09 — Cuando una propuesta se convierte en meme**
- Agregar las URL de las notas de *ABC Color* y confirmar el resultado oficial (24.553 frente a 20.084 votos).
- Amsalem (2019) no se cita en el texto.

**10 — No todos pueden ser Mamdani**
- Completar todas las referencias.
- Confirmar qué abarca el 78 % (anuncios, YouTube, TikTok).

**11 — El miedo también comunica**
- Faltan en la lista:
  - la nota de *El Tiempo* de 2003 (20,13 %);
  - el proyecto de acuerdo del Concejo de 2021 (1.500 estrellas y recordación superior al 80 %);
  - la documentación académica sobre las tres etapas de la campaña.
- La teoría de la motivación de protección es de Rogers (1975), no de Rogers y Mewborn (1976).

**12 — Zelenski: cuando una campaña no usa internet como canal, sino como lógica**
- Falta la referencia del informe de AFP.
- La entrada de Reuters está incompleta y no coincide con el uso que le da el texto.
- Agregar la URL de la Comisión Electoral para respaldar las cifras.
- A Zakharchenko et al. (2019) y Dorosh et al. (2021) les faltan revista y DOI.

**13 — Que una propuesta sea popular no significa que la gente vote por ella**
- Citas y referencias cuadran. Solo falta la imagen.

**14 — Las encuestas no solo miden una elección**
- El proyecto de ley colombiano de 2022 no tiene número ni fuente.
- Strijbis (2026) trata de democracia directa: conviene matizar cómo se usa.
- Obermaier et al. (2017) no se cita en el texto.
