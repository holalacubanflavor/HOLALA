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
- `SENTRY_DSN` — en Vercel + Sentry wizard lo configura automáticamente en `sentry.client.config.ts`

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
