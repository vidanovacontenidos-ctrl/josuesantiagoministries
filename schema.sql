-- =============================================================
--  KIAF · base de envíos de formularios  (Cloudflare D1)
--  Aplicar con:  wrangler d1 execute kiaf --remote --file=schema.sql
-- =============================================================

CREATE TABLE IF NOT EXISTS envios (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  formulario  TEXT NOT NULL,              -- pastor | socio | cobertura | newsletter | donacion
  creado      TEXT NOT NULL,              -- ISO 8601 UTC
  nombre      TEXT,
  email       TEXT,
  telefono    TEXT,
  idioma      TEXT,
  origen      TEXT,                       -- ruta de la página
  datos       TEXT NOT NULL,              -- JSON con todas las respuestas
  estado      TEXT NOT NULL DEFAULT 'nuevo',   -- nuevo | en_conversacion | cerrado
  nota        TEXT,                       -- nota interna del equipo
  correo_ok   INTEGER NOT NULL DEFAULT 0  -- 1 si la notificación salió bien
);

CREATE INDEX IF NOT EXISTS idx_envios_form   ON envios (formulario, creado DESC);
CREATE INDEX IF NOT EXISTS idx_envios_estado ON envios (estado, creado DESC);
CREATE INDEX IF NOT EXISTS idx_envios_email  ON envios (email);

-- =============================================================
--  Métricas · contadores por día
--  No se guarda nada por persona: solo cuántas veces pasó algo
--  cada día. Sin cookies, sin IP, sin identificadores.
-- =============================================================

CREATE TABLE IF NOT EXISTS metricas (
  dia     TEXT NOT NULL,              -- YYYY-MM-DD (UTC)
  evento  TEXT NOT NULL,              -- visita | donar_abierto | paypal | form_inicio | pdf
  detalle TEXT NOT NULL DEFAULT '',   -- página o recurso
  n       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (dia, evento, detalle)
);

CREATE INDEX IF NOT EXISTS idx_metricas_dia ON metricas (dia DESC, evento);
