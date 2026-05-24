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

## Env vars requeridas

Copia `.env.local.example` a `.env.local` y completa:

| Variable | Dónde obtener |
|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | supabase.com → Project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | mismo lugar |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | sanity.io → Create project |
| `NEXT_PUBLIC_SANITY_DATASET` | default: `production` |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Google Analytics |

## Estado del Sprint 1

### ✅ Completado
- [x] Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui
- [x] next-intl v4 routing (ES/EN con prefijos `/es/` y `/en/`)
- [x] Design tokens (colores HOLALA, tipografía Poppins + Baloo 2)
- [x] Navbar + Footer bilingüe
- [x] Home page (Hero, Hours, Menu preview, Catering CTA, About teaser, Instagram CTA)
- [x] /menu page (con filtros por categoría, data estática)
- [x] /catering page (2-step form con honeypot)
- [x] /about page
- [x] /location page (Google Maps embed estático)
- [x] /faq page (accordion nativo HTML + JSON-LD)
- [x] /blog page + /blog/[slug] (3 artículos estáticos)
- [x] GA4 component (NEXT_PUBLIC_GA4_MEASUREMENT_ID)
- [x] JSON-LD (Restaurant, BlogPosting, FAQ, Menu schemas)
- [x] Sitemap + robots.txt
- [x] Supabase migrations (products, sales, customers, catering_leads)
- [x] API route /api/catering → Supabase
- [x] Admin skeleton (/admin/dashboard, /admin/catering)
- [x] Sanity schema (menuItem, blogPost)
- [x] lib/sanity/client.ts + queries.ts

### ⏳ Pendiente para completar Sprint 1
- [ ] Crear proyecto en Supabase + aplicar migraciones
- [ ] Crear proyecto en Sanity + conectar
- [ ] Deploy a Vercel + DNS en Cloudflare
- [ ] Google Search Console verificado
- [ ] Variables de entorno en Vercel
- [ ] Lighthouse mobile ≥90 (verificar post-deploy)

### 🗓️ Sprint 2 (días 11-18)
- [ ] Admin: catering pipeline completo (conectar Supabase real)
- [ ] Email automático (Resend) — agregar al catering form handler
- [ ] Migrar /api/catering → Supabase Edge Function (evitar límite 10s Vercel Hobby cuando se agregue Resend)
- [ ] Implementar login admin con Supabase Auth UI en /admin/login
- [ ] Square hardware + configuración
- [ ] Square Online Store embed en /menu
