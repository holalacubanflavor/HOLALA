Resumen de Contexto — HOLALA Cuban Flavor

Para iniciar nueva sesión · 2026-07-08

---
Estado del proyecto

Stack: Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui · Vercel · Supabase · Sanity · Resend · Square POS · next-intl (es/en)

Repo: https://github.com/holalacubanflavor/HOLALA · branch main · último commit 370b173

---
Lo que está LIVE y funcionando

┌──────────────────────────────────┬────────────────────────────────────────────────────┐
│              Módulo              │                       Estado                       │
├──────────────────────────────────┼────────────────────────────────────────────────────┤
│ Sitio público bilingüe (es/en)   │ ✅ Productivo en Vercel                            │
├──────────────────────────────────┼────────────────────────────────────────────────────┤
│ Admin login (Supabase Auth)      │ ✅ Operacional                                     │
├──────────────────────────────────┼────────────────────────────────────────────────────┤
│ Admin catering pipeline (Kanban) │ ✅ Conectado a Supabase, datos reales              │
├──────────────────────────────────┼────────────────────────────────────────────────────┤
│ Edge Function catering-submit    │ ✅ Activa — envía email via Resend y guarda lead   │
├──────────────────────────────────┼────────────────────────────────────────────────────┤
│ Edge Function square-webhook     │ ✅ Activa en producción desde sesión 14            │
├──────────────────────────────────┼────────────────────────────────────────────────────┤
│ Square → Supabase pipeline       │ ✅ Primer pago real capturado ($1.00 · 2026-07-08) │
├──────────────────────────────────┼────────────────────────────────────────────────────┤
│ Tabla sales en Supabase          │ ✅ Con datos reales de producción                  │
└──────────────────────────────────┴────────────────────────────────────────────────────┘

---
Deuda pendiente Sprint 1-2 (a auditar en nueva sesión)

Menú:
- app/[locale]/menu/page.tsx y la preview en home usan datos hardcodeados de lib/data/menu.ts — no están conectados a Sanity CMS. El objetivo es que el dueño edite el menú desde Sanity Studio sin tocar código.
- Verificar que lib/sanity/queries.ts tiene las queries correctas para menú y blog.
- products table en Supabase tiene columna square_catalog_id pero no hay sync entre Sanity/Square y la tabla — el webhook busca items por square_catalog_id y no los encuentra (product_id queda null en sale_items).

Blog:
- app/[locale]/blog/page.tsx y [slug]/page.tsx — verificar si conectan a Sanity o usan datos placeholder.

Admin dashboard:
- app/admin/(protected)/dashboard/page.tsx — 100% placeholder, muestra $0.00 hardcodeado. Sprint 3 lo reemplaza con datos reales de Supabase.

Square webhook — campo location_label:
- La tabla sales tiene columna location_label pero el webhook solo guarda square_location_id. No hay mapeo de location ID → nombre legible ("Food Truck", etc.).

Tabla customers:
- Existe en Supabase (migración 003) pero nada la popula todavía. El webhook de Square no captura datos del cliente.

GA4:
- Mencionado en la arquitectura de CLAUDE.md pero no verificado si está implementado en el sitio.

---
Sprint 3 — Lo que sigue (una vez confirmada deuda S1-S2)

Dashboard admin con datos reales:
/admin/dashboard → conectar a Supabase:
- Ventas Hoy (SUM total_amount WHERE date = today)
- Esta Semana (SUM últimos 7 días)
- Tabla de ventas recientes (order_id, amount, method, timestamp)

---
Datos críticos de infraestructura

- Supabase project ref: rqpfqxmohdttghscoknh
- Supabase dashboard: https://supabase.com/dashboard/project/rqpfqxmohdttghscoknh
- Secrets Edge Functions: van en Settings → Edge Functions (NO en Vault)
- CLI Supabase: autenticada en cuenta diferente — gestionar secrets solo via dashboard
- Square webhook URL producción: https://rqpfqxmohdttghscoknh.supabase.co/functions/v1/square-webhook
- MCP disponibles: mcp__supabase-holala__* (ejecuta SQL, deploya funciones, revisa logs)

---
Comando para arrancar en nueva sesión

Lee CLAUDE.md, revisa qué páginas del sitio aún usan datos hardcodeados en lugar de Sanity,
cuáles usan datos placeholder en lugar de Supabase, y dame una lista priorizada de deuda
pendiente de Sprint 1-2 antes de construir el dashboard de Sprint 3.

✻ Worked for 55s

─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
>
─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  ⏵⏵ accept edits on (shift+tab to cycle) · ← for agents