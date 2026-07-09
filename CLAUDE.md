# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## gstack

Use /browse from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.

Available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review,
/design-consultation, /design-shotgun, /design-html, /review, /ship, /land-and-deploy,
/canary, /benchmark, /browse, /qa, /qa-only, /design-review, /setup-browser-cookies,
/setup-deploy, /retro, /investigate, /document-release, /document-generate, /codex,
/cso, /autoplan, /careful, /freeze, /guard, /unfreeze, /gstack-upgrade, /learn.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool.
- Product ideas/brainstorming → invoke /office-hours
- Architecture → invoke /plan-eng-review
- Bugs/errors → invoke /investigate
- QA/testing → invoke /qa or /qa-only
- Code review → invoke /review
- Ship/deploy/PR → invoke /ship or /land-and-deploy

## Proyecto: HOLALA Cuban Flavor

HOLALA es un negocio de comida cubana (food truck, con visión de expansión a local físico y múltiples unidades).

### Objetivo del proyecto

El objetivo **no** es construir software complejo. El objetivo es construir:

- Control operativo del negocio (ventas, inventario, desperdicios).
- Control financiero real (food cost por plato, márgenes, rentabilidad por evento/horario).
- Ownership total de datos de clientes y comportamiento de consumo.
- Inteligencia comercial propia (analytics, forecasting, catering pipeline).
- Automatización ligera y mantenible.
- Capacidad de escalar desde food truck hasta múltiples ubicaciones.

La filosofía central es: **usar herramientas maduras para operar, pero construir internamente la inteligencia y los datos del negocio.**

## Stack Técnico Validado (/autoplan completado 2026-05-23)

- **Framework:** Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui
- **Hosting:** Vercel (Hobby free tier → Pro $20/mes cuando escale)
- **Base de datos:** Supabase PostgreSQL + Auth + Edge Functions (Deno runtime)
- **CMS:** Sanity (free tier, projectId: `d082imwm`) — el dueño edita menú/blog sin código
- **Bilingüe:** next-intl v3 — API `createNavigation` — rutas `/es/` y `/en/`
- **Email:** Resend (3k/mes gratis)
- **POS:** Square (operativo, no estratégico) → webhook → Supabase
- **DNS/CDN:** Cloudflare (dominio ya comprado)

## Development Commands

```bash
# Desarrollo local (dos terminales)
npm run dev          # Next.js en puerto 3000
npx sanity dev       # Sanity Studio en puerto 3333

# Generar tipos TypeScript desde schema Supabase (tras cada migración)
supabase gen types typescript --project-id [ref] > lib/supabase/types.ts

# Aplicar migraciones a Supabase remoto
supabase db push

# Testing local de Edge Functions (Square webhook)
supabase functions serve square-webhook
# Usar Square Developer Console → "Test webhook" para enviar payloads de prueba
# Alternativa: ngrok para exponer localhost al webhook de Square
```

## Architecture

```
[Clientes]
    ↓  web / QR / delivery apps
[Sitio Web] (Next.js + Sanity + Vercel)
    │  catering form → Supabase Edge Function (no Vercel API route — Vercel Hobby = 10s limit)
    │  GA4 events
[Square POS] → webhook → [Supabase Edge Function (Deno)]
                                ↓
                     [PostgreSQL + RLS]   ← cerebro del negocio
                     ventas, food cost, clientes, catering, márgenes
                                ↓
                   [Admin /admin/*] (Next.js, gated por middleware.ts)
```

**Reglas críticas de implementación:**
- Edge Functions de Supabase = **Deno runtime**, no Node.js. Usar `crypto` de Deno std para HMAC, no Square SDK.
- Admin protegido en `middleware.ts` (raíz) con `matcher: ['/admin/:path*']` — NO solo en layout.tsx.
- RLS habilitado en todas las tablas. `SUPABASE_ANON_KEY` es pública — sin RLS cualquiera puede leer ventas.
- Formulario de catering: 2 pasos. Step 1: event type cards + fecha + invitados. Step 2: contacto + presupuesto.
- Menú de Sanity: todos los campos con variante `_es` y `_en`. Ejemplo: `name_es`, `name_en`, `description_es`, `description_en`.
- Hero CTA principal → `/menu`, NO iframe Square Online.

**Variables de entorno críticas:**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — OK en cliente
- `SUPABASE_SERVICE_ROLE_KEY` — NUNCA en NEXT_PUBLIC_
- `SQUARE_WEBHOOK_SIG_KEY` — en Supabase Edge Function Secrets (ver abajo)
- `SQUARE_ENVIRONMENT=sandbox` en preview, `=production` en producción

**Sentry — NO instalado (corregido 2026-07-08):**
Este archivo mencionaba `SENTRY_DSN` como si estuviera configurado; no lo está — no hay
dependencia `@sentry/*` ni `sentry.*.config.ts` en el repo. Decisión: no priorizarlo mientras
el tráfico sea bajo — Vercel ya da logs de runtime/errores de las funciones (ver `vercel-holala`
MCP). Revisar de nuevo si el negocio escala a más ubicaciones/tráfico.

**Webhook URL para Square Developer Console (producción activa):**
`https://rqpfqxmohdttghscoknh.supabase.co/functions/v1/square-webhook`

**Secrets de Supabase — regla crítica (aprendida en sesión 14):**
Los secrets de las Edge Functions van en **Settings → Edge Functions** del dashboard de Supabase, NO en Vault.
- URL: `https://supabase.com/dashboard/project/rqpfqxmohdttghscoknh/settings/functions`
- Secrets requeridos: `SQUARE_ACCESS_TOKEN`, `SQUARE_WEBHOOK_SIG_KEY`, `SQUARE_WEBHOOK_NOTIFICATION_URL`, `SQUARE_ENVIRONMENT`
- La CLI de Supabase en este equipo está vinculada a otra cuenta — gestionar secrets solo via dashboard.
- Al copiar la `SQUARE_WEBHOOK_SIG_KEY` desde Square, hacerlo con cuidado: caracteres invisibles rompen el HMAC silenciosamente con 401.

## Design Document

El design doc original del `/autoplan` (schema de DB, RLS policies, modelo Sanity
bilingüe, especificaciones UX mobile-first, audit trail) se generó en la máquina/
sesión original del 2026-05-23 en `~/.gstack/projects/HOLALA/`, una ruta local de
esa máquina (`juant`) que no existe en este equipo ni se commiteó al repo. No hay
copia disponible — el contenido relevante ya quedó reflejado en las migraciones
de `supabase/migrations/` y en este archivo. Si se necesita el doc original,
pedirlo al owner.

## Estado del Proyecto (última actualización: 2026-07-09)

### Completado y en producción

**Sitio público (`https://www.holalacubanflavor.com`)**
- Home page: Hero, Hours strip, MenuPreview (Sanity), CateringCTA, About teaser, Instagram CTA
- Menú completo (`/es/menu`, `/en/menu`) — conectado a Sanity con fallback estático
- Blog bilingüe (`/es/blog`, `/en/blog`) — 3 artículos publicados en Sanity
- Formulario de catering 2 pasos → Supabase Edge Function → email via Resend
- SEO: JSON-LD, metadata bilingüe, sitemap
- Bilingüe completo (ES/EN) via next-intl v3

**Admin (`/admin`)**
- Dashboard: ventas en tiempo real desde Supabase (6 KPIs, period filter Hoy/Semana/Mes)
- Sales trend chart: AreaChart 30 días (Recharts)
- Pipeline de catering: leads desde Supabase, ordenados por fecha de evento
- Logo HOLALA en el header del admin (sesión 2026-07-08)

**Seguridad (endurecida sesión 2026-07-08)**
- Middleware admin falla cerrado si faltan env vars de Supabase (antes dejaba pasar sin auth)
- `rls_auto_enable()` ya no ejecutable vía RPC público (`anon`/`authenticated`)
- `is_admin()` recuperó `SET search_path = public` (se había perdido silenciosamente en migración 010)
- Historial de migraciones de Supabase limpiado (9 migraciones de prueba `test_*` eliminadas, sin objetos reales asociados)

**Integraciones**
- Square webhook → Supabase Edge Function (producción activa, HMAC validado, v20 — sync de `customers` + `location_label` desde sesión 2026-07-08)
- Sanity CMS: 16 platos publicados + 3 artículos de blog
- Resend: notificaciones de leads de catering

**Sanity Content Lake (projectId: `d082imwm`)**
- `menuItem`: 17 documentos publicados. 7 marcados `isPopular`. **Son placeholders del sitio viejo, no el menú final** — se borrarán cuando el dueño defina el menú real (ver Pendiente).
- `blogPost`: 3 documentos publicados (historia, recetas, cultura)
- `scheduleItem`: pendiente de contenido
- Item de prueba "Plato de prueba" desactivado (`isActive: false`)

**Vercel**
- Proyecto bajo cuenta `holalacubanflavor@gmail.com` (migrado desde cuenta de desarrollador)
- Variables de entorno configuradas: SUPABASE_URL, SUPABASE_ANON_KEY, SANITY_PROJECT_ID, SANITY_DATASET, GA4_MEASUREMENT_ID, SITE_URL

**MCP servers scoped a este proyecto (sesión 2026-07-08/09)**
- `mcp__supabase-holala__*` — SQL, deploy de Edge Functions, logs, advisors (Supabase project `rqpfqxmohdttghscoknh`)
- `mcp__vercel-holala__*` — proyecto Vercel `holala/holala`, logueado y conectado
- `mcp__sanity-holala__*` — cuenta `holalacubanflavor@gmail.com`, logueado y conectado
- Los tres en scope local (`claude mcp list -s local`) — privados a este proyecto, no afectan la cuenta digisenda global

### Pendiente / Próximas sesiones

- **🔴 URGENTE — Menú real → Square → `products` (Sprint 4, bloqueado en dueño)**: el menú definitivo aún no está finalizado ni cargado en Square (el hardware ya lo tiene el dueño, falta el catálogo). Los ~17 `menuItem` en Sanity son placeholders del sitio viejo, no el menú final (ver nota de sesión 2026-07-08). Orden de trabajo una vez el dueño defina el menú:
  1. Cargar el catálogo real en Square (fuente de verdad operativa: precios, catálogo).
  2. Construir el sync Square catálogo → Supabase `products` (tabla ya existe con `food_cost`/`square_catalog_id`, hoy en 0 filas — sin esto no hay food cost/márgenes reales).
  3. Borrar los `menuItem` placeholder en Sanity y cargar el menú real (marcar `isPopular` en algunos para que el home no quede vacío).
  4. **Evaluar en ese momento** si vale la pena construir un sync automático Square↔Sanity (hoy no existe y no está planeado — son dos pipelines independientes; decisión pendiente de tomar cuando haya catálogo real con el que probarlo).
- **Fotos del menú**: Ricardo sube imágenes desde Sanity Studio → aparecen automáticamente en tarjetas
- **`scheduleItem`**: publicar horarios reales en Sanity para que aparezcan en el sitio
- **`sanity schema deploy`**: falla con `missing grant deployStudio` — no bloquea (content API funciona), resolver via Sanity dashboard si se necesita Studio UI validation
- **GA4**: verificar que `G-R0Q4D06G1F` está activo y recibiendo eventos en Vercel
- **Leaked password protection**: desactivada en Supabase Auth — activar manualmente en dashboard (Settings → Auth → Password Security), no requiere código
- **Impresora de recibos**: dueño evaluando compra — solo Star Micronics (recomendado: TSP143IV UE o mC-Print3) y Epson están certificados por Square; marcas genéricas (ej. "ERARROW") NO son compatibles con la app de Square aunque usen USB/BT/WiFi estándar

### Reglas Sanity aprendidas
- `schema deploy` requiere grant `sanity.project/deployStudio` — puede fallar incluso para el owner; no bloquea la creación de contenido via Content API
- Crear/publicar documentos via MCP (`create_documents` + `publish_documents`) funciona sin schema deployado
- Secrets y tokens de Sanity: autenticado como `holalacubanflavor@gmail.com` (cuenta del cliente)
