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

## Estado del Proyecto (última actualización: 2026-07-12, sesión 18)

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
- Logo HOLALA en el header del admin, con chip crema circular para contraste sobre el fondo espresso (sesión 2026-07-09) — el SVG del logo es un badge oscuro, sin fondo claro detrás se pierde visualmente

**Seguridad (endurecida sesión 2026-07-08)**
- Middleware admin falla cerrado si faltan env vars de Supabase (antes dejaba pasar sin auth)
- `rls_auto_enable()` ya no ejecutable vía RPC público (`anon`/`authenticated`)
- `is_admin()` recuperó `SET search_path = public` (se había perdido silenciosamente en migración 010)
- Historial de migraciones de Supabase limpiado (9 migraciones de prueba `test_*` eliminadas, sin objetos reales asociados)

**Integraciones**
- Square webhook → Supabase Edge Function (producción activa, HMAC validado, v20 — sync de `customers` + `location_label` desde sesión 2026-07-08)
- Sanity CMS: 20 platos del menú real publicados + 3 artículos de blog
- Resend: notificaciones de leads de catering
- Square catálogo → Supabase `products` (Edge Function `square-catalog-sync`, botón manual en `/admin` — ver sesión 2026-07-12 abajo)

**Menú real cargado en las 3 capas (Sprint 4 completado, sesión 2026-07-12)**
El dueño proveyó la foto del menú real (`menu holala.jpeg`, transcrito en `HOLALA_menu_inicial_extraido.md`). Con eso se cargó:
- **Sanity** (`menuItem`): 20 documentos reales, reemplazando los 17 placeholders del sitio viejo (borrados). "Pollo Holalá" marcado `isPopular`.
- **Square** (merchant `MLTW1B91M2RC4` "Holala Cuban Flavors", location `LHDV14TEF3QMK`): 7 categorías + 20 ítems (Tostones Rellenos con 2 variaciones: Atún/Camarón). Ítem de prueba "Té helado" eliminado.
- **Supabase `products`**: 21 filas (20 platos, 21 porque Tostones cuenta 2 variaciones), sincronizadas desde Square vía la función `square-catalog-sync` — botón "Sincronizar desde Square" en el dashboard de `/admin` (`app/admin/(protected)/dashboard/MenuSyncButton.tsx`). La función preserva `food_cost`/`is_popular`/`image_url` en cada re-sync (curados a mano, nunca sobreescritos).

**Categorías extendidas de 5 a 9** en los tres sistemas para reflejar la estructura real del menú (antes solo `mains/sides/drinks/desserts/specials`): se agregaron `appetizers`, `tacos`, `sandwiches`, `seafood`. Cambiado en `sanity/schema/menuItem.ts`, `components/menu/MenuGrid.tsx` (tabs ahora dinámicos según categorías presentes), `messages/{es,en}.json`, y el `CHECK` constraint de `products.category` (migración `013_extend_products_category_check.sql`).

**Gaps conocidos, dejados pendientes a propósito:**
- 3 bebidas (Jugos, Agua, Refrescos) no están cargadas en ningún lado — la foto del menú no trae precio ("por definir"). Agregar cuando el dueño confirme precios.
- Los acompañantes incluidos (Congrí, Yuca con Mojo, Ensalada) no son `menuItem`/productos independientes — son notas de "todo plato incluye X" en la imagen del menú, no ítems vendibles por separado.
- `square-catalog-sync` tiene un mapa estático ES→EN (`EN_COPY` en el archivo de la función) porque Square no tiene campos bilingües — si se agrega un plato nuevo directo en Square sin actualizar ese mapa, el sitio le mostrará el nombre en español como si fuera el inglés hasta que se corrija.
- El Studio de Sanity todavía no muestra las 4 categorías nuevas en su selector (el problema pre-existente de `sanity schema deploy` con el grant `deployStudio` sigue sin resolver) — la Content API y el sitio ya las usan bien, pero si Ricardo intenta agregar un plato nuevo desde Studio con una de esas categorías, no la va a ver en el picker.

**Sanity — proyecto migrado de organización (sesión 2026-07-12)**
El proyecto `d082imwm` vivía bajo la organización personal de digisenda (el desarrollador), nunca bajo la cuenta real del dueño — por eso `mcp__sanity-holala__` fallaba con errores de acceso/organización. Se transfirió a la organización real de Ricardo (`outmeacZe`, ligada a `holalacubanflavor@gmail.com`). Ojo: existe una organización *distinta* también llamada "Ricardo Pupo" (`oN5zwGS2F`) visible desde la cuenta de digisenda — es un duplicado/accidente, no confundir con la real (`outmeacZe`).

**Sanity Content Lake (projectId: `d082imwm`)**
- `menuItem`: 20 documentos reales publicados (ver arriba). 1 marcado `isPopular`.
- `blogPost`: 3 documentos publicados (historia, recetas, cultura)
- `scheduleItem`: pendiente de contenido

**Vercel**
- Proyecto bajo cuenta `holalacubanflavor@gmail.com` (migrado desde cuenta de desarrollador)
- Variables de entorno configuradas: SUPABASE_URL, SUPABASE_ANON_KEY, SANITY_PROJECT_ID, SANITY_DATASET, GA4_MEASUREMENT_ID, SITE_URL

**MCP servers scoped a este proyecto (sesión 2026-07-08/09)**
- `mcp__supabase-holala__*` — SQL, deploy de Edge Functions, logs, advisors (Supabase project `rqpfqxmohdttghscoknh`)
- `mcp__vercel-holala__*` — proyecto Vercel `holala/holala`, logueado y conectado
- `mcp__sanity-holala__*` — cuenta `holalacubanflavor@gmail.com`, logueado y conectado (proyecto transferido a la org real del dueño en sesión 2026-07-12, ver detalle abajo)
- Los tres en scope local (`claude mcp list -s local`) — privados a este proyecto, no afectan la cuenta digisenda global

### Pendiente / Próximas sesiones

- **Bebidas sin precio**: Jugos Naturales, Agua, Refrescos — confirmar precios con el dueño y cargarlas en Sanity + Square + `products` (mismo proceso que el resto del menú).
- **Fotos del menú**: Ricardo sube imágenes desde Sanity Studio → aparecen automáticamente en tarjetas (aún sin imágenes ninguno de los 20 platos reales).
- **`scheduleItem`**: publicar horarios reales en Sanity para que aparezcan en el sitio.
- **`sanity schema deploy`**: sigue fallando con `missing grant deployStudio` — no bloquea (Content API funciona), pero el Studio no muestra las 4 categorías nuevas (`appetizers`/`tacos`/`sandwiches`/`seafood`) en su selector. Resolver via Sanity dashboard si Ricardo necesita agregar platos de esas categorías desde Studio.
- **`food_cost`**: sigue en `NULL` para los 20 productos — el dueño tiene que cargarlo a mano (directo en Supabase o vía una UI futura) para que el food cost/márgenes real funcione. La tabla y el sync ya están listos para recibirlo.
- **Bloqueador del navegador en `/admin` (sesión 2026-07-12)**: `/admin` carga en blanco en el Chrome normal del dueño (probado en varias cuentas/perfiles, cache limpio) pero funciona bien en incógnito y en pruebas automatizadas — apunta a una extensión de Chrome (ad-blocker o privacidad) interfiriendo. Pendiente que el dueño identifique cuál desactivando extensiones una por una.
- **GA4**: verificar que `G-R0Q4D06G1F` está activo y recibiendo eventos en Vercel.
- **Leaked password protection**: desactivada en Supabase Auth — activar manualmente en dashboard (Settings → Auth → Password Security), no requiere código.
- **Impresora de recibos**: dueño evaluando compra — solo Star Micronics (recomendado: TSP143IV UE o mC-Print3) y Epson están certificados por Square; marcas genéricas (ej. "ERARROW") NO son compatibles con la app de Square aunque usen USB/BT/WiFi estándar.
- **Evaluar sync automático Square↔Sanity**: hoy siguen siendo pipelines independientes sincronizados a mano por Claude/el dueño cuando el menú cambia. Con datos reales ya cargados en ambos lados, se puede evaluar si vale la pena automatizarlo (webhook `catalog.version.updated` de Square) si el menú empieza a cambiar seguido.

### Reglas Sanity aprendidas
- `schema deploy` requiere grant `sanity.project/deployStudio` — puede fallar incluso para el owner; no bloquea la creación de contenido via Content API
- Crear/publicar documentos via MCP (`create_documents` + `publish_documents`) funciona sin schema deployado
- Secrets y tokens de Sanity: autenticado como `holalacubanflavor@gmail.com` (cuenta del cliente)
- Transferir un proyecto entre organizaciones requiere ser Administrador en el proyecto **y en la organización de origen** — agregar a alguien como miembro del proyecto NO mueve el proyecto ni cambia quién lo factura. La transferencia real se hace desde `sanity.io/manage/project/<id>/settings`.
- Si `mcp__sanity-holala__` da error de organización/proyecto no encontrado pese a tener membresía correcta, probar un ciclo completo de `/mcp` (limpiar auth → reconectar) para forzar un nuevo consentimiento OAuth — un simple "reconectar" no siempre refresca el scope de organización.
- Hay un `SANITY_AUTH_TOKEN` (token personal, no OAuth) en `.claude/settings.local.json` que pega directo a `https://d082imwm.api.sanity.io/v2024-01-01/data/{query,mutate}/production` — útil como bypass cuando el MCP OAuth falla. Documentos creados con `_id` sin prefijo `drafts.` quedan publicados de inmediato (sin paso de publish aparte).

### Reglas Square API aprendidas
- El endpoint de `SearchCatalogObjects` es `POST /v2/catalog/search`, **no** `/v2/catalog/search-catalog-objects` — el nombre de la operación en la doc no coincide con la URL real. Un 404 "Resource not found" en la función de sync fue por este typo.
- `catalog.batchUpsertCatalogObjects`: las referencias con id temporal (`#miId`) solo se resuelven **dentro del mismo batch**, no entre batches distintos de la misma request. Para crear categorías + ítems que las referencian: primero un request solo con las categorías, capturar los IDs reales de `id_mappings`, y usar esos IDs reales (no temporales) al crear los ítems en un request separado.
- Edge Functions de Supabase con `verify_jwt: true` aceptan cualquier JWT válido firmado con el secret del proyecto — incluida la anon key pública, no solo tokens de sesión de usuarios logueados. Útil para probar una función por `curl`/PowerShell sin necesitar una sesión de navegador real.
