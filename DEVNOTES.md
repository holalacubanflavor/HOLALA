# Dev Notes — HOLALA holala-web

## Comandos de desarrollo

```bash
# ⚠️ En este entorno, el proxy corporativo intercepta HTTPS
# Siempre ejecutar con la variable de entorno:
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"; npm run dev
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"; npm run build

# En macOS/Linux (cuando no sea en este equipo):
npm run dev
npm run build
```

## Instalar paquetes (mismo entorno)

```bash
npm config set strict-ssl false   # solo una vez para este proyecto
npm install <package> --legacy-peer-deps
```

---

## SESSION LOG — 2026-06-14 (sesión 5) — CIERRE

### Commits de la sesión
| Hash | Descripción |
|------|-------------|
| `e4ba618` | fix: correct canonical domain to www + fix color contrast (Lighthouse a11y) |

### Qué se completó

**DNS Cloudflare — 100% operativo:**
- Registros A del apex (`holalacubanflavor.com`) → IPs de Vercel (`64.29.17.65`, `216.198.79.65`)
- CNAME `www` → Vercel
- Registros TXT `_vercel.*` (verificación de dominio) conservados
- Verificado en producción: `holalacubanflavor.com` → 308 → `www.holalacubanflavor.com` → 307 → `/es`, SSL válido (header `Strict-Transport-Security` presente)

**Google Search Console:**
- Dominio verificado por el owner (Domain property, TXT en la raíz)
- Se eligió "Domain property" sobre "URL prefix" para cubrir el redirect apex→www sin desajustes de canonical

**Lighthouse mobile audit (producción, `https://www.holalacubanflavor.com/es`):**
- Resultado: Performance 99 / Accessibility 96 / Best Practices 100 / SEO 92 / Agentic Browsing 100
- ✅ Objetivo Sprint 1 "Lighthouse mobile ≥90" cumplido incluso antes de los fixes
- Issues encontrados: (1) canonical apuntaba a `holalacubanflavor.com` sin `www` (mismatch con la URL real), (2) contraste insuficiente en varios textos/badges (`text-cream/80` y `text-cream/40` sobre `bg-teal`/`bg-espresso`, `text-orange` sobre fondo claro, `text-teal` sobre `bg-teal/10`)
- Después del fix (verificado local): Accessibility 100, auditoría de contraste 100% pass

**Fix 1 — Canonical domain (apex → www):**
- `app/[locale]/layout.tsx`: `metadataBase`, `alternates.canonical`, `alternates.languages` (es-US/en-US) → `https://www.holalacubanflavor.com`
- `app/sitemap.ts`, `app/robots.ts`, `lib/seo/schemas.ts` (fallback BASE_URL) → mismo dominio `www`
- `.env.local` y `.env.local.example`: `NEXT_PUBLIC_SITE_URL=https://www.holalacubanflavor.com`

**Fix 2 — Contraste WCAG AA (4.5:1):**
- `app/[locale]/page.tsx`:
  - HoursStrip: `text-cream/80` → `text-cream` (sobre `bg-teal`)
  - CateringCTA badge: `bg-orange/15 text-orange` → `bg-espresso text-orange` (naranja #F97316 nunca alcanza 4.5:1 sobre fondos claros — luminancia ≈0.3245; se invirtió a chip oscuro, ratio ≈5.97:1)
  - AboutTeaser badge: `text-teal` → `text-teal-dark` (mantiene `bg-teal/10`)
- `components/marketing/Footer.tsx`: bottom bar `text-cream/40` → `text-cream/60`; links `hover:text-cream/60` → `hover:text-cream`
- Mismo patrón `bg-teal/10 text-teal` → `bg-teal/10 text-teal-dark` aplicado también en:
  - `app/[locale]/blog/page.tsx` (categoría "historia")
  - `app/[locale]/faq/page.tsx` (badge)
  - `app/[locale]/blog/[slug]/page.tsx` (categoría del artículo)
  - `app/[locale]/location/page.tsx` (pill de área)

**PR creado (pendiente review/merge del owner):**
- Branch `fix/canonical-www-a11y-contrast` → **PR #2**: https://github.com/Digisenda/holala-web/pull/2

**Fix 3 — Contraste adicional (encontrado en /review de PR #2, mismo branch):**
- `app/[locale]/blog/page.tsx`:
  - `categoryColors.recetas: 'bg-orange/10 text-orange'` (2.13:1) → `'bg-orange/10 text-espresso'` (14.0:1)
  - `categoryColors.cultura: 'bg-green/10 text-green'` (~4.39:1) → `'bg-green/10 text-green-dark'` (6.11:1), mismo patrón que "historia"
  - Badge de header (`{t('badge')}`): `bg-orange/10 text-orange` (2.13:1) → `bg-espresso text-orange` (5.97:1)
- `app/[locale]/about/page.tsx`: badge hero `bg-orange/20 text-orange` (2.13:1) → `bg-orange text-espresso` (5.97:1)
- `app/[locale]/catering/page.tsx`: badge "Solicitar Cotización" `bg-orange/20 text-orange` (2.13:1) → `bg-orange text-espresso` (5.97:1)
- `app/[locale]/location/page.tsx`: badge hero `bg-teal/20 text-teal` (~3.2:1) → `bg-teal/20 text-cream` (12.9:1)
- `app/[locale]/page.tsx`: Hero "trust indicators" (5 estrellas + "5.0 · San Antonio, TX") `text-cream/40` (3.55:1) → `text-cream/60` (6.32:1), mismo fix ya aplicado al Footer
- Confirmado: naranja (#F97316/#ea6c0a) no alcanza 4.5:1 en ninguna variante "chip claro" (`text-orange`/`text-orange-dark` sobre `bg-orange/10` o `/20`) — siempre invertir a chip oscuro (`bg-orange text-espresso` o `bg-espresso text-orange`, ambos ≈5.97:1) o usar texto neutro oscuro (`text-espresso`, 14.0:1).

### Estado al cerrar sesión
```
✅ DNS Cloudflare: completo (apex + www → Vercel, SSL válido)
✅ Google Search Console: dominio verificado
✅ Lighthouse mobile: ≥90 en todas las categorías (objetivo Sprint 1 cumplido)
✅ Fix canonical (apex→www) + contraste WCAG AA: shippeado en PR #2
✅ Contraste adicional (recetas/cultura + 4 badges/hero más): aplicado en /review, pendiente commit
⏳ PR #2: pendiente review + merge (owner, vía Vercel preview) — NO mergeado por Claude a propósito
⏳ POST-MERGE: actualizar NEXT_PUBLIC_SITE_URL en Vercel → https://www.holalacubanflavor.com + redeploy
⏳ POST-MERGE: re-correr Lighthouse en producción para confirmar canonical 100%
```

### 🎉 Sprint 1 — COMPLETO

Con DNS + GSC + Lighthouse ≥90 cerrados, **Sprint 1 está 100% completo**. Ver checklist actualizado más abajo.

---

## SESSION LOG — 2026-06-12 (sesión 4)

### Qué se completó

**Square — scaffold de integración (Sprint 2):**
- Creado `supabase/functions/square-webhook/index.ts` — Edge Function (Deno) que:
  - Valida firma HMAC-SHA256 (`x-square-hmacsha256-signature`) con `SQUARE_WEBHOOK_SIG_KEY`
  - Escucha `payment.updated` con `status=COMPLETED`
  - Llama a Square Orders API (`/v2/orders/{id}`) para obtener line items
  - Hace upsert idempotente en `sales` (por `square_order_id`) e inserta `sale_items`
  - Cruza `line_items.catalog_object_id` con `products.square_catalog_id` para `product_id`
- Documentadas todas las credenciales Square requeridas en `.env.local.example`

**Datos reales obtenidos vía Square MCP (cuenta ya conectada):**
| Campo | Valor |
|-------|-------|
| Merchant | Holala Cuban Flavors |
| Merchant ID | `MLTW1B91M2RC4` |
| Location ID (main) | `LHDV14TEF3QMK` |
| País / Moneda | US / USD |

### ✅ Hecho en esta sesión (vía MCP)
1. **Proyecto Supabase reanudado** — `holala-web` (`oifwxosgmftdplmejhgq`) estaba `INACTIVE`, se ejecutó `restore_project` (status → `COMING_UP`/activo)
2. **Edge Function desplegada** — `square-webhook` v1, status `ACTIVE`, `verify_jwt=false` (requerido: Square llama sin JWT de Supabase; la función valida su propia firma HMAC)
   - URL: `https://oifwxosgmftdplmejhgq.supabase.co/functions/v1/square-webhook`
3. `get_advisors` (security): sin warnings nuevos

**Fixes de code review (v2 del deploy):**
- `isValidSignature`: comparación de la firma HMAC ahora es timing-safe (decodifica a bytes + `timingSafeEqual` byte a byte) en vez de `===` sobre strings
- `parseQuantity`: redondea `line_item.quantity` (string decimal de Square, ej. items por peso) en vez de truncar con `parseInt`, y cae a `1` si el resultado es inválido/≤0 para cumplir `sale_items.quantity CHECK > 0`
- Re-desplegado: `square-webhook` v2, status `ACTIVE`

### 🔴 BLOQUEADO — secrets del Edge Function (acción manual del owner)
No se pudo configurar `supabase secrets set` desde esta sesión:
- El MCP de Supabase no tiene herramienta para escribir secrets (solo deploy/lectura)
- `SQUARE_ACCESS_TOKEN`: el MCP de Square no expone el token OAuth crudo
- `SQUARE_WEBHOOK_SIG_KEY`: no existe aún — se genera al crear la webhook subscription en Square, y el MCP de Square no tiene el scope `DEVELOPER_APPLICATION_WEBHOOKS_READ`/WRITE para crearla vía API

**Pasos manuales pendientes (en este orden):**
1. Square Developer Dashboard → Webhooks → Subscriptions → Add subscription:
   - Event type: `payment.updated`
   - Notification URL: `https://oifwxosgmftdplmejhgq.supabase.co/functions/v1/square-webhook`
   - Copiar el "Signature key" generado
2. Square Developer Dashboard → Apps → [app] → Credentials → copiar Access Token (sandbox o production)
3. Configurar secrets:
   ```bash
   supabase secrets set --project-ref oifwxosgmftdplmejhgq \
     SQUARE_ACCESS_TOKEN=<del paso 2> \
     SQUARE_ENVIRONMENT=sandbox \
     SQUARE_WEBHOOK_SIG_KEY=<del paso 1> \
     SQUARE_WEBHOOK_NOTIFICATION_URL=https://oifwxosgmftdplmejhgq.supabase.co/functions/v1/square-webhook
   ```
4. Probar con "Test webhook" desde Square Developer Console
5. Verificar filas nuevas en `sales`/`sale_items` y revisar `get_logs(edge-function)` si falla

### Estado al cerrar sesión
```
✅ Edge Function square-webhook: código v2 (HMAC timing-safe + quantity fix), desplegada y ACTIVE
✅ Proyecto Supabase holala-web: reanudado (estaba INACTIVE)
✅ Credenciales Square documentadas en .env.local.example
⏳ Secrets del Edge Function: NO configurados — requiere acción manual del owner (ver bloque arriba)
⏳ Webhook subscription en Square: NO creada — requiere Square Developer Dashboard
⏳ Square hardware + configuración: pendiente
⏳ Square Online Store embed en /menu: pendiente
```

---

## SESSION LOG — 2026-06-03 (sesión 3) — CIERRE

### Commits de la sesión
| Hash | Descripción |
|------|-------------|
| `5594c0c` | feat: connect menu to Sanity CMS with live revalidation |

### Qué se completó

**Sanity CMS — 100% operativo:**
- Proyecto creado en sanity.io: ID `d082imwm`, nombre `holala-cuban-flavor`
- 3 schemas: `menuItem`, `blogPost`, `scheduleItem` (horarios del truck)
- `sanity.config.ts` + `sanity.cli.ts` creados
- Studio desplegado en `https://holala-cuban-flavor.sanity.studio/`
- Dueño puede editar menú/blog/horarios desde esa URL sin código

**Integración Next.js ↔ Sanity:**
- `/menu` convertida de `'use client'` + datos estáticos → Server Component + Sanity fetch
- `components/menu/MenuGrid.tsx` — client component con filtro por categoría
- Fallback automático a datos estáticos si Sanity no tiene items
- ISR 30 min (`export const revalidate = 1800`) como seguro
- Fix: query usa `isActive != false` (maneja null en items nuevos)
- Fix: `useCdn: false` para datos siempre frescos en build

**Webhook Sanity → revalidación automática:**
- `/api/revalidate` endpoint con secret guard (`SANITY_REVALIDATE_SECRET`)
- Webhook creado via Sanity Management API: ID `EziiJqtJsV25g0kp`
- Trigger: create/update/delete en menuItem, blogPost, scheduleItem
- URL destino: `https://holala-web.vercel.app/api/revalidate?secret=holala-sanity-2026`
- Flujo: dueño publica en Studio → webhook → página actualizada en segundos

**Env vars en Vercel (agregadas esta sesión):**
- `NEXT_PUBLIC_SANITY_PROJECT_ID=d082imwm`
- `SANITY_REVALIDATE_SECRET=holala-sanity-2026`

**React 18 → 19:**
- Requerido por Sanity v5. Actualizado con `--legacy-peer-deps`. Build limpio.

### Estado al cerrar sesión
```
✅ Código: build limpio, todas las rutas OK
✅ Supabase: activo (5 tablas, 8 migraciones, RLS hardened)
✅ Vercel: READY → holala-web.vercel.app
✅ Sanity Studio: holala-cuban-flavor.sanity.studio (login requerido)
✅ /menu conectado a Sanity — verificado en producción
✅ Webhook Sanity→web configurado (ID: EziiJqtJsV25g0kp)
⚠️  Home page /menu preview: aún usa datos estáticos (lib/data/menu.ts)
    → conectar a Sanity cuando el dueño agregue el menú real
⚠️  Blog: aún usa posts estáticos hardcodeados
    → conectar a Sanity en próxima sesión o cuando haya posts reales
⏳ DNS Cloudflare: pendiente (holalacubanflavor.com → Vercel)
⏳ Admin login Supabase Auth UI: pendiente (Sprint 2)
✅ Square webhook Edge Function: desplegada (ACTIVE) — secrets + webhook subscription pendientes (ver sesión 4)
⏳ Google Search Console: pendiente post-DNS
⏳ Lighthouse mobile ≥90: pendiente post-DNS
```

### Pendiente inmediato antes del lanzamiento
1. **DNS Cloudflare** — `holalacubanflavor.com` → Vercel (CNAME `cname.vercel-dns.com`)
2. **Dueño carga menú real** en Sanity Studio → avisarme para limpiar datos estáticos
3. **Home page** → conectar a Sanity (misma sesión que #2)

### Sanity — Referencia rápida
| Campo | Valor |
|-------|-------|
| Project ID | `d082imwm` |
| Dataset | `production` |
| Studio URL | `https://holala-cuban-flavor.sanity.studio/` |
| Webhook ID | `EziiJqtJsV25g0kp` |
| Revalidate secret | `holala-sanity-2026` (en Vercel env vars) |

---

## SESSION LOG — 2026-05-24 (sesión 2) — CIERRE

### Commits de la sesión
| Hash | Descripción |
|------|-------------|
| `87dc6f3` | fix: replace next-sanity@13 with @sanity/client + add .npmrc |
| `74b2501` | docs: update DEVNOTES with Vercel deploy fix + env vars checklist |

### Qué se completó

**Diagnóstico y fix del deploy de Vercel:**
- Vercel usa `npm ci` (strict mode) → hard-fail ERESOLVE porque `next-sanity@13.0.3` requiere `next@^16`
- Fix: `next-sanity` → `@sanity/client@7.22.0` (sin peer deps), `.npmrc` con `legacy-peer-deps=true`
- Deploy: **READY** → `holala-web.vercel.app` ✅

**Env vars configuradas en Vercel:**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SANITY_DATASET`
- Middleware verificado: `/admin/dashboard` → redirige a `/admin/login` ✅
- Runtime logs: todas las rutas 200, cero errores ✅

### Estado al cerrar sesión
```
✅ Código: build limpio, todas las rutas OK
✅ Supabase: activo (5 tablas, 8 migraciones, RLS hardened)
✅ Vercel: READY → holala-web.vercel.app
✅ Env vars en Vercel: configuradas + middleware verificado
⚠️  ANON_KEY: verificar que sea el JWT completo (no texto "(del .env.local)")
⏳ Sanity: proyecto NO creado
⏳ DNS Cloudflare: pendiente
⏳ Google Search Console: pendiente
⏳ Lighthouse mobile ≥90: pendiente
```

Después: Redeploy desde el dashboard de Vercel.

---

## SESSION LOG — 2026-05-24

### Commits de la sesión
| Hash | Descripción |
|------|-------------|
| `1464355` | feat: Sprint 1 — full web app (next-intl v4, all pages, Supabase migrations, Sanity schema) |
| `898ef76` | fix: pre-infra security hardening + 3 new DB migrations |
| `c4f3c38` | chore: add migration 008 local file (admin email hardcoded in is_admin()) |
| `4c539f0` | chore: add .gstack/ to .gitignore |

### Qué se completó en esta sesión

**Sprint 1 — Código completo:**
- Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui
- next-intl v4 routing ES/EN (`/es/`, `/en/`)
- Todas las páginas: Home, /menu, /catering, /about, /location, /faq, /blog, /blog/[slug]
- GA4 component + JSON-LD schemas (Restaurant, BlogPosting, FAQ, Menu)
- Sitemap.xml + robots.txt
- Sanity schema (menuItem, blogPost) + lib/sanity/client.ts + queries.ts
- Admin skeleton: /admin/dashboard, /admin/catering, /admin/login

**Seguridad (code review pre-infra):**
- `middleware.ts` protege `/admin/*` con check de sesión Supabase (redirige a `/admin/login`)
- `/api/catering` — honeypot server-side + validación de email
- `lib/seo/schemas.ts` — BASE_URL lee de `NEXT_PUBLIC_SITE_URL`

**Supabase — 100% operativo:**
- Proyecto: `holala-web` (ID: `oifwxosgmftdplmejhgq`, región: `us-east-1`)
- 8 migraciones aplicadas (001→008)
- 5 tablas con RLS habilitado: products, sales, sale_items, customers, catering_leads
- `is_admin()` function — hardcoded a `digisenda@gmail.com`
- Catering form → Supabase real: verificado con insert/delete en vivo
- `.env.local` creado con URL y anon key

### Estado actual del proyecto
```
✅ Código Sprint 1: COMPLETO + build limpio
✅ Supabase: ACTIVO — 5 tablas, 8 migraciones, RLS hardened
✅ Catering form: graba en DB real (verificado)
⏳ Sanity: schema listo, proyecto NO creado aún
⏳ Vercel deploy: pendiente
⏳ DNS Cloudflare: pendiente
⏳ Google Search Console: pendiente
```

### Tareas pendientes para completar Sprint 1
1. **Sanity** — crear proyecto en sanity.io → copiar Project ID → agregar al `.env.local` y Vercel
2. **Vercel** — conectar repo GitHub → configurar env vars → deploy
3. **DNS** — Cloudflare: apuntar `holalacubanflavor.com` a Vercel (CNAME `cname.vercel-dns.com`)
4. **Google Search Console** — verificar dominio post-deploy
5. **Lighthouse mobile** — auditar en producción (objetivo ≥ 90)

### Problemas conocidos / advertencias
- **SSL proxy corporativo:** siempre usar `NODE_TLS_REJECT_UNAUTHORIZED=0` en este equipo para dev/build
- **Admin login:** `/admin/login` es un stub. La autenticación real (Supabase Auth UI) va en Sprint 2. Por ahora, con Supabase configurado, el admin está protegido pero no hay forma de autenticarse desde la web — acceder por Supabase Dashboard directo
- **Sanity no conectado:** páginas usan data estática (lib/data/menu.ts + posts hardcodeados en blog/[slug]/page.tsx). Conectar Sanity = Sprint 2

### Próximo paso recomendado — PRÓXIMA SESIÓN

**Objetivo de la próxima sesión: Sanity + Vercel deploy**

Orden exacto:
1. Ir a sanity.io → crear proyecto → obtener Project ID
2. Agregar `NEXT_PUBLIC_SANITY_PROJECT_ID` al `.env.local`
3. Conectar el repo de GitHub (`git@github.com:Digisenda/holala-web.git`) a Vercel
4. En Vercel: Settings → Environment Variables → agregar las 5 vars del `.env.local`
5. Deploy → verificar que build pase en Vercel
6. En Cloudflare: agregar CNAME `holalacubanflavor.com → cname.vercel-dns.com`
7. En Vercel: agregar dominio custom `holalacubanflavor.com`
8. Verificar HTTPS + Google Search Console

---

## Riesgos de migración a Sanity (Sprint 2)

### Blog slugs bilingüe
Los 3 artículos estáticos usan el mismo slug en español para ambos locales:
- `/es/blog/historia-del-sandwich-cubano`
- `/en/blog/historia-del-sandwich-cubano` (URL actualmente = slug español)

Cuando se conecte Sanity, `slug_en` generará slugs en inglés diferentes.
**Solución:** Agregar en `next.config.mjs → redirects()` los 3 slugs antes de conectar Sanity.

### readTime no existe en schema Sanity
El schema de `blogPost` no tiene campo `readTime_es`/`readTime_en`.
Si se quiere mostrar tiempo de lectura desde Sanity, agregar al schema antes de publicar artículos.

### Filtro de posts futuros en GROQ
La query actual no filtra posts con `publishedAt` en el futuro.
Agregar `&& dateTime(publishedAt) <= dateTime(now())` antes de publicar posts en Sanity.

---

## Env vars requeridas

Copia `.env.local.example` a `.env.local` y completa:

| Variable | Estado | Dónde obtener |
|----------|--------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Configurada | `https://oifwxosgmftdplmejhgq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Configurada | Ver `.env.local` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ✅ Configurada | `d082imwm` (sesión 3) |
| `NEXT_PUBLIC_SANITY_DATASET` | ✅ Default | `production` |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | ⏳ Pendiente | Google Analytics → Admin → Data Streams |
| `NEXT_PUBLIC_SITE_URL` | ✅ Configurada (código) / ⏳ Vercel pendiente post-merge PR #2 | `https://www.holalacubanflavor.com` |

---

## Supabase — Referencia rápida

| Campo | Valor |
|-------|-------|
| Proyecto | `holala-web` |
| Project ID | `oifwxosgmftdplmejhgq` |
| URL | `https://oifwxosgmftdplmejhgq.supabase.co` |
| Región | `us-east-1` (N. Virginia) |
| Organización | DigiSenda AI |
| Admin email | `digisenda@gmail.com` (en `is_admin()` function) |
| Migraciones | 001→008 aplicadas |

Tablas activas: `products`, `sales`, `sale_items`, `customers`, `catering_leads`

---

## Estado del Sprint 1

### ✅ Completado
- [x] Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui
- [x] next-intl v4 routing (ES/EN con prefijos `/es/` y `/en/`)
- [x] Design tokens (colores HOLALA, tipografía Poppins + Baloo 2)
- [x] Navbar + Footer bilingüe
- [x] Home page (Hero, Hours, Menu preview, Catering CTA, About teaser, Instagram CTA)
- [x] /menu page (con filtros por categoría, data estática)
- [x] /catering page (2-step form con honeypot — server + client side)
- [x] /about page
- [x] /location page (Google Maps embed estático)
- [x] /faq page (accordion nativo HTML + JSON-LD)
- [x] /blog page + /blog/[slug] (3 artículos estáticos)
- [x] GA4 component (NEXT_PUBLIC_GA4_MEASUREMENT_ID)
- [x] JSON-LD (Restaurant, BlogPosting, FAQ, Menu schemas)
- [x] Sitemap + robots.txt
- [x] Supabase: 8 migraciones + RLS + is_admin() hardened
- [x] API route /api/catering → Supabase real (verificado)
- [x] Admin skeleton (/admin/dashboard, /admin/catering, /admin/login)
- [x] Middleware admin auth guard
- [x] Sanity schema (menuItem, blogPost)
- [x] lib/sanity/client.ts + queries.ts

### ✅ Sprint 1 — COMPLETO (cerrado sesión 5, 2026-06-14)
- [x] Crear proyecto en Sanity + copiar Project ID al .env.local (sesión 3 — `d082imwm`)
- [x] Deploy a Vercel + configurar env vars (sesión 2 — `holala-web.vercel.app`)
- [x] DNS en Cloudflare → holalacubanflavor.com (sesión 5 — apex + www → Vercel, SSL OK)
- [x] Google Search Console verificado (sesión 5 — Domain property)
- [x] Lighthouse mobile ≥90 (sesión 5 — Perf 99 / A11y 96→100 / BP 100 / SEO 92 / Agentic 100)

### 🗓️ Sprint 2 (días 11-18)
- [ ] Admin: catering pipeline completo (conectar Supabase real + leer leads)
- [ ] Implementar login admin con Supabase Auth UI en /admin/login
- [ ] Email automático (Resend) — agregar al catering form handler
- [ ] Migrar /api/catering → Supabase Edge Function (evitar límite 10s Vercel Hobby cuando se agregue Resend)
- [x] Square webhook Edge Function — código desplegado (ACTIVE); falta crear webhook subscription en Square Dashboard + `supabase secrets set` (ver sesión 4)
- [ ] Square hardware + configuración
- [ ] Square Online Store embed en /menu
