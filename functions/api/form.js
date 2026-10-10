/**
 * KIAF · recepción de formularios
 * Cloudflare Pages Function — responde en  POST /api/form
 *
 * Orden de prioridad: primero GUARDAR, después avisar.
 * Si el correo falla, el dato ya está a salvo en la base.
 *
 * Enlaces que espera el proyecto de Pages:
 *   DB              (D1)      · obligatorio para guardar
 *   RESEND_API_KEY  (secreto) · opcional, para el aviso por correo
 *   MAIL_FROM       (variable) · ej. "KIAF <web@kingdominactionfamily.org>"
 *   MAIL_PASTOR / MAIL_SOCIO / MAIL_COBERTURA / MAIL_NEWSLETTER (variables)
 *                              · destino de cada formulario; si falta uno
 *                                se usa MAIL_FALLBACK
 *   MAIL_FALLBACK   (variable) · destino por defecto
 */

const FORMULARIOS = {
  pastor:     { etiqueta: 'Apadrina a un Pastor',          buzon: 'MAIL_PASTOR' },
  socio:      { etiqueta: 'Hazte Socio de KIAF',           buzon: 'MAIL_SOCIO' },
  cobertura:  { etiqueta: 'Solicitud de Cobertura',        buzon: 'MAIL_COBERTURA' },
  newsletter: { etiqueta: 'Newsletter',                    buzon: 'MAIL_NEWSLETTER' },
  donacion:   { etiqueta: 'Intención de donación',         buzon: 'MAIL_SOCIO' },
};

const LIMITE_CAMPOS = 60;
const LIMITE_VALOR  = 8000;   // un testimonio largo entra de sobra
const LIMITE_TOTAL  = 60000;

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

function limpiar(v) {
  if (v === null || v === undefined) return '';
  return String(v).replace(/\u0000/g, '').slice(0, LIMITE_VALOR).trim();
}

function escapar(s) {
  return String(s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/** Arma el correo de aviso con las respuestas ya ordenadas. */
function cuerpoCorreo(etiqueta, campos, meta) {
  const filas = Object.entries(campos).map(([k, v]) =>
    `<tr>
       <td style="padding:10px 14px;border-bottom:1px solid #E2E0DC;vertical-align:top;
                  font:600 12px/1.5 system-ui,sans-serif;letter-spacing:.06em;
                  text-transform:uppercase;color:#64696F;white-space:nowrap;">${escapar(k)}</td>
       <td style="padding:10px 14px;border-bottom:1px solid #E2E0DC;
                  font:400 15px/1.7 system-ui,sans-serif;color:#101215;">${escapar(v).replace(/\n/g, '<br>')}</td>
     </tr>`).join('');

  return `<!doctype html><html><body style="margin:0;background:#FAF9F7;padding:24px;">
  <table role="presentation" style="max-width:640px;margin:0 auto;background:#fff;
         border:1px solid #E2E0DC;border-collapse:collapse;width:100%;">
    <tr><td style="background:#101215;padding:20px 24px;">
      <div style="font:700 11px/1 system-ui,sans-serif;letter-spacing:.4em;
                  text-transform:uppercase;color:#EF3951;">Kingdom in Action Family</div>
      <div style="font:800 22px/1.2 system-ui,sans-serif;color:#fff;margin-top:8px;">${escapar(etiqueta)}</div>
    </td></tr>
    <tr><td style="padding:0;"><table role="presentation" style="width:100%;border-collapse:collapse;">${filas}</table></td></tr>
    <tr><td style="padding:16px 24px;background:#FAF9F7;
                   font:400 12px/1.6 system-ui,sans-serif;color:#64696F;">
      Registro #${meta.id} · ${escapar(meta.creado)} UTC · ${escapar(meta.origen || '—')}<br>
      Guardado en la base del sitio. Puedes revisarlo en /admin.
    </td></tr>
  </table></body></html>`;
}

async function avisar(env, destino, asunto, html, responderA) {
  if (!env.RESEND_API_KEY || !destino) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.MAIL_FROM || 'KIAF <onboarding@resend.dev>',
        to: destino.split(',').map(s => s.trim()).filter(Boolean),
        subject: asunto,
        html,
        ...(responderA ? { reply_to: responderA } : {}),
      }),
    });
    return r.ok;
  } catch (_) {
    return false;
  }
}

/** Único punto de entrada: Pages enruta aquí todos los métodos. */
export async function onRequest(ctx) {
  if (ctx.request.method === 'OPTIONS')
    return new Response(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } });
  if (ctx.request.method !== 'POST')
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  return recibir(ctx);
}

async function recibir({ request, env }) {
  // ---- leer el cuerpo ----
  let entrada;
  try {
    const txt = await request.text();
    if (txt.length > LIMITE_TOTAL) return json({ ok: false, error: 'demasiado_largo' }, 413);
    entrada = JSON.parse(txt);
  } catch (_) {
    return json({ ok: false, error: 'json_invalido' }, 400);
  }
  if (!entrada || typeof entrada !== 'object') return json({ ok: false, error: 'json_invalido' }, 400);

  // ---- trampa antirrobot: contestamos bien y no guardamos nada ----
  if (limpiar(entrada._gotcha)) return json({ ok: true });

  const tipo = limpiar(entrada._form).toLowerCase();
  const def = FORMULARIOS[tipo];
  if (!def) return json({ ok: false, error: 'formulario_desconocido' }, 400);

  // ---- separar metadatos de respuestas ----
  // Estas tres ya viajan como columnas propias: no se repiten como respuesta.
  const METADATOS = new Set(['Formulario', 'Idioma', 'Origen']);
  const campos = {};
  let n = 0;
  for (const [k, v] of Object.entries(entrada)) {
    if (k.startsWith('_') || METADATOS.has(k)) continue;
    if (++n > LIMITE_CAMPOS) break;
    const val = limpiar(v);
    if (val) campos[limpiar(k).slice(0, 120)] = val;
  }
  if (!Object.keys(campos).length) return json({ ok: false, error: 'vacio' }, 400);

  const email = limpiar(entrada._email || campos['Correo electrónico'] || campos['Email'] || '');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return json({ ok: false, error: 'email_invalido' }, 400);

  const nombre = [campos['Nombre'], campos['Apellido']].filter(Boolean).join(' ')
    || limpiar(entrada._nombre) || '';
  const creado = new Date().toISOString();
  const origen = limpiar(entrada._origen).slice(0, 200);

  // ---- 1. GUARDAR (lo más importante) ----
  if (!env.DB) return json({ ok: false, error: 'sin_base' }, 503);
  let id;
  try {
    const r = await env.DB.prepare(
      `INSERT INTO envios (formulario, creado, nombre, email, telefono, idioma, origen, datos)
       VALUES (?,?,?,?,?,?,?,?)`
    ).bind(
      tipo, creado, nombre, email,
      limpiar(campos['Teléfono'] || campos['Phone'] || ''),
      limpiar(entrada._idioma) || 'es',
      origen,
      JSON.stringify(campos)
    ).run();
    id = r.meta?.last_row_id;
  } catch (e) {
    return json({ ok: false, error: 'no_guardado' }, 500);
  }

  // ---- 2. avisar (si falla, el dato ya está guardado) ----
  const destino = env[def.buzon] || env.MAIL_FALLBACK || '';
  const enviado = await avisar(
    env, destino,
    `${def.etiqueta}${nombre ? ' · ' + nombre : ''}`,
    cuerpoCorreo(def.etiqueta, campos, { id, creado, origen }),
    email
  );
  if (enviado) {
    try { await env.DB.prepare('UPDATE envios SET correo_ok=1 WHERE id=?').bind(id).run(); } catch (_) {}
  }

  return json({ ok: true, id, aviso: enviado });
}
