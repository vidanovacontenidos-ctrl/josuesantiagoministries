# Kingdom in Action Family — Website

Sitio web estático para **Kingdom in Action Family Ministry**, un ministerio cristiano no denominacional llamado a alcanzar las naciones.

## 📁 Estructura del proyecto

```
kingdom-in-action/
├── index.html          # Página principal (HTML5 semántico + ARIA)
├── css/
│   └── styles.css      # Todos los estilos (tokens, layout, componentes, responsive)
├── js/
│   └── main.js         # Navbar scroll, hamburger, parallax hero, scroll reveal, validación de formulario
├── .gitignore
└── README.md
```

## 🎨 Diseño

- **Estética:** Clean/minimalista estilo *Family of Faith* + hero estilo *Leanne Goff Ministries*
- **Tipografías:** Outfit (sans-serif) + Lora (serif/itálica para citas)
- **Paleta:** Dark navy `#1A1A2E` · Teal `#07C8B5` · Blanco `#FFFFFF`
- **Íconos:** Font Awesome 6.4.2 (CDN)

## 📄 Secciones

| Sección | Descripción |
|---|---|
| Navbar | Logo + links con dropdowns oscuros + botón "Give" |
| Hero | Foto full-width, gradiente izquierda, texto + CTAs animados |
| About | Grid 2 columnas, foto + cita bíblica |
| Stats | Banda oscura con números de impacto |
| Missions | 3 tarjetas: Liderazgo, Cuba, Proyectos |
| Get Involved | 3 pasos: Orar, Ir, Dar |
| Events | 4 eventos con fechas estilo calendario |
| Connect | Formulario de contacto con validación |
| Footer | 4 columnas: Brand, Ministerio, Involúcrate, Contacto |

## 🔒 Seguridad

- `Content-Security-Policy` meta tag
- `X-Content-Type-Options` y `Referrer-Policy`
- Sanitización de inputs en el formulario (sin `eval()`, sin `innerHTML` con datos de usuario)
- `rel="noopener noreferrer"` en todos los links externos
- Atributos ARIA completos para accesibilidad

## 🚀 Cómo usar

1. Descomprimir el ZIP
2. Abrir `index.html` en el navegador — no requiere servidor ni dependencias

## 🔗 Conexión del formulario

En `js/main.js` hay un bloque `TODO` listo para conectar al backend o servicio de email (Mailchimp, ConvertKit, endpoint propio):

```js
// TODO: send to your API endpoint:
// fetch('/api/contact', { method: 'POST', ... });
```

## 📱 Responsive

- Desktop: 1160px max-width
- Tablet (≤1024px): grid de 1 columna en About y Footer
- Mobile (≤768px): menú hamburger, columnas apiladas
- Mobile S (≤480px): hero compactado, botones en columna

## 📄 Licencia

MIT — Libre uso y modificación.
