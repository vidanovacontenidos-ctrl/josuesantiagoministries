/**
 * KIAF · API del panel privado — GET/POST /api/admin
 *
 * SEGURIDAD: esta ruta NO lleva contraseña propia a propósito.
 * Se protege con Cloudflare Access sobre /admin* y /api/admin,
 * que es gratuito hasta 50 personas y maneja el inicio de sesión
 * por correo. Si Access no está configurado, la función se niega
 * a responder salvo que se declare ADMIN_ABIERTO = "si".
 *
 *   ?accion=listar   &form=&estado=&q=&pagina=
 *   ?accion=csv      &form=
 *   POST {id, estado, nota}
 */

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

const ESTADOS = ['nuevo', 'en_conversacion', 'cerrado'];
const POR_PAGINA = 40;

/** Cloudflare Access pone esta cabecera en cada petición autenticada. */
function identidad(request, env) {
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  const correo = request.headers.get('Cf-Access-Authenticated-User-Email');
  if (jwt || correo) return correo || 'access';
  if (env.ADMIN_ABIERTO === 'si') return 'sin-proteccion';
  return null;
}

function csv(filas) {
  const esc = v => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  // una columna por cada etiqueta que aparezca, para que abra bien en Excel
  const cols = new Set();
  const parsed = filas.map(f => {
    let d = {};
    try { d = JSON.parse(f.datos) || {}; } catch (_) {}
    Object.keys(d).forEach(k => cols.add(k));
    return { f, d };
  });
  const cab = ['id', 'formulario', 'creado', 'estado', 'nota', ...cols];
  const lineas = [cab.map(esc).join(',')];
  for (const { f, d } of parsed) {
    lineas.push(cab.map(c =>
      esc(['id', 'formulario', 'creado', 'estado', 'nota'].includes(c) ? f[c] : d[c])
    ).join(','));
  }
  // BOM para que Excel respete los acentos
  return '﻿' + lineas.join('\r\n');
}

export async function onRequest({ request, env }) {
  const quien = identidad(request, env);
  if (!quien) return json({ ok: false, error: 'sin_acceso' }, 403);
  if (!env.DB) return json({ ok: false, error: 'sin_base' }, 503);

  const url = new URL(request.url);

  // ---------- cambiar estado o nota ----------
  if (request.method === 'POST') {
    let b;
    try { b = await request.json(); } catch (_) { return json({ ok: false, error: 'json_invalido' }, 400); }
    const id = parseInt(b.id, 10);
    if (!id) return json({ ok: false, error: 'sin_id' }, 400);
    const sets = [], vals = [];
    if (b.estado !== undefined) {
      if (!ESTADOS.includes(b.estado)) return json({ ok: false, error: 'estado_invalido' }, 400);
      sets.push('estado=?'); vals.push(b.estado);
    }
    if (b.nota !== undefined) { sets.push('nota=?'); vals.push(String(b.nota).slice(0, 4000)); }
    if (!sets.length) return json({ ok: false, error: 'nada_que_cambiar' }, 400);
    vals.push(id);
    await env.DB.prepare(`UPDATE envios SET ${sets.join(',')} WHERE id=?`).bind(...vals).run();
    return json({ ok: true });
  }

  if (request.method !== 'GET')
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, POST' } });

  const accion = url.searchParams.get('accion') || 'listar';
  const form   = url.searchParams.get('form')   || '';
  const estado = url.searchParams.get('estado') || '';
  const q      = (url.searchParams.get('q')     || '').trim();

  const cond = [], args = [];
  if (form)   { cond.push('formulario=?'); args.push(form); }
  if (estado) { cond.push('estado=?');     args.push(estado); }
  if (q)      { cond.push('(nombre LIKE ? OR email LIKE ? OR datos LIKE ?)');
                const t = '%' + q + '%'; args.push(t, t, t); }
  const donde = cond.length ? 'WHERE ' + cond.join(' AND ') : '';

  // ---------- exportar ----------
  if (accion === 'csv') {
    const { results } = await env.DB.prepare(
      `SELECT * FROM envios ${donde} ORDER BY creado DESC LIMIT 5000`
    ).bind(...args).all();
    const hoy = new Date().toISOString().slice(0, 10);
    return new Response(csv(results || []), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="kiaf-${form || 'todos'}-${hoy}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  // ---------- métricas ----------
  if (accion === 'metricas') {
    const meses = Math.min(24, Math.max(3, parseInt(url.searchParams.get('meses') || '12', 10)));
    const desde = new Date();
    desde.setUTCMonth(desde.getUTCMonth() - (meses - 1), 1);
    const d0 = desde.toISOString().slice(0, 10);

    const [porMes, porTipo, eventos, paginas, totalEnv] = await Promise.all([
      // solicitudes por mes
      env.DB.prepare(
        `SELECT substr(creado,1,7) AS mes, COUNT(*) AS n FROM envios
         WHERE creado >= ? GROUP BY mes ORDER BY mes`
      ).bind(d0).all(),
      // solicitudes por formulario
      env.DB.prepare(
        `SELECT formulario, COUNT(*) AS n FROM envios WHERE creado >= ?
         GROUP BY formulario ORDER BY n DESC`
      ).bind(d0).all(),
      // contadores de acciones, por mes
      env.DB.prepare(
        `SELECT substr(dia,1,7) AS mes, evento, SUM(n) AS n FROM metricas
         WHERE dia >= ? GROUP BY mes, evento ORDER BY mes`
      ).bind(d0).all(),
      // páginas más vistas
      env.DB.prepare(
        `SELECT detalle, SUM(n) AS n FROM metricas
         WHERE evento='visita' AND dia >= ? GROUP BY detalle ORDER BY n DESC LIMIT 12`
      ).bind(d0).all(),
      env.DB.prepare(`SELECT COUNT(*) AS n FROM envios`).first(),
    ]);

    return json({
      ok: true, meses, desde: d0,
      porMes: porMes.results || [],
      porTipo: porTipo.results || [],
      eventos: eventos.results || [],
      paginas: paginas.results || [],
      totalHistorico: totalEnv?.n || 0,
    });
  }

  // ---------- listar ----------
  const pagina = Math.max(1, parseInt(url.searchParams.get('pagina') || '1', 10));
  const off = (pagina - 1) * POR_PAGINA;

  const [lista, total, resumen] = await Promise.all([
    env.DB.prepare(
      `SELECT id,formulario,creado,nombre,email,telefono,idioma,origen,datos,estado,nota,correo_ok
       FROM envios ${donde} ORDER BY creado DESC LIMIT ? OFFSET ?`
    ).bind(...args, POR_PAGINA, off).all(),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM envios ${donde}`).bind(...args).first(),
    env.DB.prepare(
      `SELECT formulario, estado, COUNT(*) AS n FROM envios GROUP BY formulario, estado`
    ).all(),
  ]);

  const filas = (lista.results || []).map(r => {
    let datos = {};
    try { datos = JSON.parse(r.datos) || {}; } catch (_) {}
    return { ...r, datos };
  });

  return json({
    ok: true, quien, pagina, porPagina: POR_PAGINA,
    total: total?.n || 0, filas, resumen: resumen.results || [],
  });
}
