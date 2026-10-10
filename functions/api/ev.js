/**
 * KIAF · contador de eventos — POST /api/ev
 *
 * Suma uno a un contador del día. No guarda nada por persona:
 * ni IP, ni cookie, ni identificador. Solo "cuántas veces pasó
 * esto hoy", que es lo que hace falta para medir mejoras.
 *
 * Cuerpo:  { e: "paypal", d: "/cuba.html" }
 */

const PERMITIDOS = new Set([
  'visita',          // alguien abrió una página
  'donar_abierto',   // abrió el cuadro de donar
  'paypal',          // salió hacia PayPal   ← la métrica que importa
  'form_inicio',     // empezó a llenar un formulario
  'pdf',             // descargó un folleto
]);

const vacio = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return vacio();
  if (!env.DB) return vacio();

  let b;
  try {
    const t = await request.text();
    if (t.length > 600) return vacio();
    b = JSON.parse(t);
  } catch (_) { return vacio(); }

  const evento = String(b?.e || '');
  if (!PERMITIDOS.has(evento)) return vacio();

  const detalle = String(b?.d || '').replace(/[^\w/.\-]/g, '').slice(0, 120);
  const dia = new Date().toISOString().slice(0, 10);

  try {
    await env.DB.prepare(
      `INSERT INTO metricas (dia, evento, detalle, n) VALUES (?,?,?,1)
       ON CONFLICT(dia, evento, detalle) DO UPDATE SET n = n + 1`
    ).bind(dia, evento, detalle).run();
  } catch (_) { /* una métrica perdida nunca rompe la página */ }

  return vacio();
}
