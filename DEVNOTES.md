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
⏳ Square webhook Edge Function: pendiente (Sprint 2)
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
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ⏳ Pendiente | sanity.io → Create project |
| `NEXT_PUBLIC_SANITY_DATASET` | ✅ Default | `production` |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | ⏳ Pendiente | Google Analytics → Admin → Data Streams |
| `NEXT_PUBLIC_SITE_URL` | ✅ Configurada | `https://holalacubanflavor.com` |

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

### ⏳ Pendiente para completar Sprint 1
- [ ] Crear proyecto en Sanity + copiar Project ID al .env.local
- [ ] Deploy a Vercel + configurar env vars
- [ ] DNS en Cloudflare → holalacubanflavor.com
- [ ] Google Search Console verificado
- [ ] Lighthouse mobile ≥90 (verificar post-deploy)

### 🗓️ Sprint 2 (días 11-18)
- [ ] Admin: catering pipeline completo (conectar Supabase real + leer leads)
- [ ] Implementar login admin con Supabase Auth UI en /admin/login
- [ ] Email automático (Resend) — agregar al catering form handler
- [ ] Migrar /api/catering → Supabase Edge Function (evitar límite 10s Vercel Hobby cuando se agregue Resend)
- [ ] Square hardware + configuración
- [ ] Square Online Store embed en /menu
