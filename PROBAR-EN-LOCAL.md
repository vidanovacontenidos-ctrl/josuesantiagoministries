# Probar en tu computadora (opcional)

Para levantar el sitio con backend en local hace falta un `wrangler.toml`.
**No lo subas al repositorio**: Cloudflare Pages lo lee como configuración
del proyecto y rompe el despliegue. Por eso está en `.gitignore`.

Crea el archivo a mano con esto:

```toml
name = "kiaf-local"
pages_build_output_dir = "."
compatibility_date = "2026-01-01"

[[d1_databases]]
binding = "DB"
database_name = "kiaf"
database_id = "local"

[vars]
ADMIN_ABIERTO = "si"
```

Y después:

```
npx wrangler d1 execute kiaf --local --file=schema.sql
npx wrangler pages dev .
```

En producción los enlaces y variables van en el panel de Cloudflare
(Settings → Bindings y Variables and Secrets), nunca en este archivo.
