# Imágenes del muro "Lo que nos hace distintos"

Deja aquí las fotos que quieras mostrar en el muro animado de la sección
**Lo que nos hace distintos** del inicio. No hay que tocar código: todos los
archivos `.jpg`, `.jpeg`, `.png`, `.webp` o `.avif` de esta carpeta entran
automáticamente en el muro al compilar (`src/data/distintos.ts` los lee).

Recomendaciones:

- Formato apaisado, alrededor de **640 × 420 px** (proporción 3:2 aprox.). Las fichas
  recortan la imagen para llenar su caja, así que centra el sujeto.
- No hace falta reducirlas a mano: al compilar se convierten en .webp de 800 px.
- El nombre del archivo, sin extensión, se usa como texto alternativo de la foto.
  Los guiones se convierten en espacios: `equipo-en-campana.jpg` → "equipo en campana".
  Los nombres de cámara (`DSCF0043.jpg`) se cambian por "Equipo de Sonante".
- El orden es alfabético; usa prefijos numéricos (`01-`, `02-`…) para controlarlo.
- Entre 10 y 20 fotos funciona bien; con menos, el muro repite las mismas fichas.
