# Fuentes con licencia

El diseño de Sonante usa dos familias comerciales que **no** se incluyen en el repositorio:

| Familia         | Pesos usados            | Origen                          |
| --------------- | ----------------------- | ------------------------------- |
| FreightBig Pro  | Bold (700), Black (900) | Adobe Fonts / GarageFonts       |
| TT Commons Pro  | Regular (400), Bold (700) | TypeType                      |

Para activarlas, coloca los archivos `.woff2` en esta carpeta con estos nombres exactos:

```
public/fonts/FreightBigPro-Bold.woff2
public/fonts/FreightBigPro-Black.woff2
public/fonts/TTCommonsPro-Regular.woff2
public/fonts/TTCommonsPro-Bold.woff2
```

Las reglas `@font-face` ya están declaradas en `src/styles/global.css`.
Mientras los archivos no existan, el sitio usa las alternativas de Google Fonts
**Playfair Display** (títulos) y **Manrope** (texto), declaradas como fallback en
`--font-display` y `--font-body` dentro de `src/styles/tokens.css`.
