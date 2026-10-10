# Backend propio en Cloudflare — pasos para encenderlo

El código ya está escrito y probado. Hasta que hagas estos pasos, el sitio
sigue funcionando exactamente como hoy: los formularios envían a Formspree.
Cuando conectes la base, empiezan a guardarse en tu propia Cloudflare y
Formspree queda solo como respaldo.

**No hay ventana de corte.** Si algo sale mal, los envíos siguen llegando
por el camino viejo.

---

## Paso 1 · Crear la base de datos (3 minutos)

En el panel de Cloudflare:

1. **Storage & Databases → D1 → Create database**
2. Nombre: `kiaf` · Create

Ahora carga la estructura. En la misma pantalla de la base, pestaña
**Console**, pega el contenido del archivo `schema.sql` y ejecútalo.

> Si prefieres la terminal: `npx wrangler d1 execute kiaf --remote --file=schema.sql`

---

## Paso 2 · Conectar la base al sitio (1 minuto)

En **Workers & Pages → tu proyecto del sitio → Settings → Bindings**:

| Campo | Valor |
|---|---|
| Tipo | D1 database |
| Variable name | `DB` |
| D1 database | `kiaf` |

El nombre tiene que ser **`DB`** exactamente, en mayúsculas.

Vuelve a desplegar el sitio (**Deployments → Retry deployment**) para que
tome el enlace. Listo: desde ese momento todo queda guardado.

---

## Paso 3 · Proteger el panel privado (5 minutos)

`/admin.html` muestra todas las solicitudes. **Hasta que hagas este paso,
el panel no deja entrar a nadie** — está cerrado a propósito.

En **Zero Trust → Access → Applications → Add an application → Self-hosted**:

- Nombre: `KIAF · Solicitudes`
- Dominio: `kingdominactionfamily.org`, ruta `admin.html`
- Agrega una **segunda ruta** en la misma aplicación: `api/admin`
- Política: *Allow* → **Emails** → tu correo y el de quien más deba entrar

Cloudflare les pedirá un código por correo al entrar. Gratis hasta 50 personas.

> Para una prueba rápida sin Access, puedes poner la variable
> `ADMIN_ABIERTO = si`. **No la dejes puesta**: deja el panel abierto a
> cualquiera que adivine la dirección.

---

## Paso 4 · Avisos por correo (10 minutos, opcional)

Sin esto todo se guarda igual, pero no te llega aviso: tendrías que entrar
al panel a mirar. Recomendado hacerlo.

1. Crea una cuenta gratuita en **resend.com** (3.000 correos al mes).
2. **Domains → Add domain** → `kingdominactionfamily.org`. Te da unos
   registros DNS; como tu DNS ya está en Cloudflare, los agregas ahí mismo.
3. **API Keys → Create** y copia la clave.

En **tu proyecto de Pages → Settings → Variables and Secrets**:

| Nombre | Tipo | Valor |
|---|---|---|
| `RESEND_API_KEY` | **Secret** | la clave de Resend |
| `MAIL_FROM` | Variable | `KIAF <web@kingdominactionfamily.org>` |
| `MAIL_COBERTURA` | Variable | correo del liderazgo apostólico |
| `MAIL_PASTOR` | Variable | correo de quien lleva apadrinamientos |
| `MAIL_SOCIO` | Variable | correo de quien lleva donantes |
| `MAIL_NEWSLETTER` | Variable | correo de comunicación |
| `MAIL_FALLBACK` | Variable | `kingdominactionministry@gmail.com` |

`RESEND_API_KEY` va como **Secret**, no como Variable: así queda oculta.

Puedes poner varios correos separados por coma en cualquiera de los
`MAIL_*`. Los que no definas usan `MAIL_FALLBACK`.

Vuelve a desplegar.

---

## Cómo saber que funciona

1. Entra a `/colabora-pastor.html` y envía una prueba.
2. Entra a `/admin.html` — debería aparecer ahí.
3. Si configuraste Resend, revisa el correo.

En el panel, si una fila dice **«correo no enviado»** en rojo, el dato se
guardó bien pero el aviso no salió: revisa la clave de Resend. El registro
nunca se pierde por eso.

---

## El panel

- **Filtros** por formulario y estado, y búsqueda dentro de las respuestas
  (busca también en los textos largos, no solo en nombres).
- **Estados**: nuevo → en conversación → cerrado. Más una nota interna por
  solicitud.
- **Exportar CSV** respeta los filtros activos y abre bien en Excel con acentos.
- **Responder** abre tu correo con la dirección ya puesta.

---

## Paso 5 · Métricas para mostrarle al cliente (5 minutos)

Son dos piezas que se complementan:

### a) Cloudflare Web Analytics — el tráfico

Gratis, sin cookies y **sin banner de consentimiento**, porque no recoge
datos personales. Te da visitas, países, dispositivos, de dónde llega la
gente y qué páginas ven.

1. Panel de Cloudflare → **Web Analytics → Add a site**
2. Copia el **token** que te da
3. Abre `shared.js`, busca `TOKEN_AQUI` (está arriba del todo del bloque
   de métricas) y pégalo en su lugar

Mientras diga `TOKEN_AQUI` no carga nada: no rompe si lo dejas así.

### b) Tus propios contadores — las conversiones

Esto es lo que Cloudflare **no** puede decirte, y es lo que de verdad
demuestra mejoras:

| Se cuenta | Por qué importa |
|---|---|
| Páginas vistas | la base de todo |
| Abrieron el cuadro de Donar | intención |
| **Fueron a PayPal** | la métrica que vale |
| Empezaron un formulario | interés real |
| Descargaron un folleto | interés en un proyecto |

Se encienden solos con el paso 2: no hay nada que configurar. **No guardan
nada por persona** — ni IP, ni cookie, ni identificador. Solo «cuántas
veces pasó esto hoy», así que no necesitas aviso de cookies.

### Dónde se ve

En `/admin.html`, pestaña **Métricas**:

- La cifra grande: solicitudes de los últimos 12 meses.
- **Solicitudes por mes**: el gráfico que le muestras al cliente. Si la
  tendencia sube, ahí está la prueba.
- **Del visitante al donante**: dos caminos, el de la donación
  (visitas → abrieron Donar → PayPal) y el del formulario
  (visitas → empezaron → completaron), con el porcentaje de cada escalón.
- **Páginas más vistas**.

Todo el gráfico tiene también vista de tabla, para copiar los números a un
informe.

> **Empieza a medir ya, aunque todavía no cambies nada.** Para mostrar una
> mejora hace falta un punto de partida. Cada semana que pasa sin medir es
> una semana que después no podrás comparar.

---

## Cuando quieras apagar Formspree

Una vez que veas entrar solicitudes por el camino nuevo durante unas
semanas, dime y quito el respaldo. Mientras tanto no molesta: solo actúa
si `/api/form` falla.

---

## Archivos de esta parte

```
schema.sql               estructura de la base (solicitudes + contadores)
functions/api/form.js    recibe, guarda y avisa
functions/api/admin.js   lee, filtra, cambia estado, exporta, métricas
functions/api/ev.js      suma los contadores de acciones
admin.html               el panel (Solicitudes + Métricas)
wrangler.toml            solo para probar en tu computadora
```

Para probar localmente antes de subir nada:

```
npx wrangler d1 execute kiaf --local --file=schema.sql
npx wrangler pages dev .
```
