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

## SESSION LOG — 2026-06-19 (sesión 8) — Square webhook Production + cierre migración

### Qué se completó

**PR #5 — mergeado a `main`** (`d33bdf8`): la migración de Supabase a holala
(sesión 7, commit `974e7b4`) ya está en `main`, incluyendo `009_security_hardening.sql`.

**Square — webhook Production, end-to-end:**
1. Owner creó la suscripción en Square Developer Dashboard (modo Production,
   desde el panel unificado `app.squareup.com/dashboard/apps/my-applications`,
   no el developer console legacy) → URL
   `https://rqpfqxmohdttghscoknh.supabase.co/functions/v1/square-webhook`.
   Eventos habilitados: `payment.updated`, `order.updated`,
   `inventory.count.updated`, `refund.created`, `refund.updated`,
   `customer.created`, `customer.updated` — solo `payment.updated` lo procesa
   el código hoy; el resto se ignora (200 "ok") hasta que se construya su
   tabla/lógica. Confirmado vía Square API docs que editar los event types de
   una suscripción ya creada **no regenera la Signature Key** (son operaciones
   independientes), así que esto se puede ampliar después sin tocar secrets.
2. Owner copió Access Token + Application ID de **Production** (`sq0idp-...`,
   distinto del de Sandbox `sandbox-sq0idb-...` que se obtuvo por error la
   primera vez) desde Credentials.
3. `supabase secrets set --project-ref rqpfqxmohdttghscoknh` con los 4 valores
   (`SQUARE_ACCESS_TOKEN`, `SQUARE_ENVIRONMENT=production`,
   `SQUARE_WEBHOOK_SIG_KEY`, `SQUARE_WEBHOOK_NOTIFICATION_URL`) — verificado
   con `secrets list` (4 entradas nuevas).
4. "Test webhook" desde Square Developer Console → `200` en los logs de la
   Edge Function (no `401`) → firma válida. `sales` se mantuvo vacía porque el
   payload sintético de Square no trae un pago con `status=COMPLETED` — el
   código lo descarta de forma segura sin escribir nada. Falta confirmar el
   camino completo (fetch a Orders API + insert) con la primera venta real;
   queda pendiente de forma pasiva, sin acción programada.

**Proyecto viejo pausado:** verificado primero que nada en producción
dependía ya de `oifwxosgmftdplmejhgq` (Vercel Production y secrets de GitHub
Actions ya apuntaban al proyecto nuevo desde el cutover de sesión 7, hace
~11h) → `pause_project` ejecutado. Queda como respaldo en frío, reversible
con `restore_project` si hace falta.

### Nota técnica — auth del CLI de Supabase por cuenta, no por proyecto
El CLI local (`npx supabase`) estaba logueado con un Personal Access Token de
la cuenta DigiSenda, que no ve proyectos de la cuenta holala
(`holalacubanflavor@gmail.com`) aunque ambas estén en la misma máquina. Se
resolvió generando un PAT nuevo desde la cuenta holala y pasándolo inline vía
`SUPABASE_ACCESS_TOKEN=<token> npx supabase ...` en vez de `supabase login`
— evita pisar la sesión global del CLI (que sigue logueada como DigiSenda
para los otros proyectos de esa cuenta).

### Estado al cerrar sesión
```
✅ PR #5 mergeado a main — migración Supabase holala 100% en main
✅ Square webhook Production: suscripción creada, 4 secrets configurados, test 200 OK
✅ Proyecto viejo (oifwxosgmftdplmejhgq): pausado como respaldo en frío
⏳ Primera venta real: confirmar que sales/sale_items se llenan correctamente (pasivo, sin acción programada)
⏳ Square hardware + configuración: pendiente
⏳ Square Online Store embed en /menu: pendiente
```

---

## SESSION LOG — 2026-06-19 (sesión 7) — Migración Supabase DigiSenda → holala

### Por qué
El owner está consolidando HOLALA en una cuenta/org Supabase dedicada
(`holalacubanflavor@gmail.com`, proyecto `rqpfqxmohdttghscoknh`) en vez de
seguir en el proyecto original alojado en la cuenta multi-proyecto DigiSenda AI
(`oifwxosgmftdplmejhgq`). El proyecto origen tenía 0 filas en las 5 tablas →
migración de schema/infra, sin migración de datos.

### Qué se completó
**Schema (Fase 1):** las 9 migraciones del repo (`001`–`009`) aplicadas al
proyecto destino, vacío, vía `execute_sql` (no `apply_migration` — ver nota
abajo). Incluye `009_security_hardening.sql`, un archivo **nuevo** creado esta
sesión: recupera el SQL exacto de 2 fixes de seguridad que en el proyecto
original se aplicaron directo a la BD el 2026-05-27 y nunca se commitearon
(`fix_function_security_search_path_and_anon_execute`,
`revoke_public_execute_on_is_admin`) — ahora el historial del repo coincide
con lo que realmente corre en producción. Verificado con `list_tables` (5
tablas, RLS on) y `get_advisors` (mismas 2 WARN preexistentes del proyecto
original — `catering_leads_public_insert` con `WITH CHECK(true)` y `is_admin()`
ejecutable por `authenticated`; el destino también muestra una función
`rls_auto_enable()` propia de Supabase que no existe en el origen — feature de
plataforma de proyectos más nuevos, no algo introducido por esta migración).

**Edge Function (Fase 2):** `square-webhook` (mismo código v3, `verify_jwt=false`)
desplegada y `ACTIVE` en el destino.

**Cutover de la app (Fase 5):** `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`
actualizadas en Vercel (Preview+Production, vía `vercel env rm`/`add`) y en los
secrets de GitHub Actions (`gh secret set`, usados por `keep-supabase-alive.yml`);
`.env.local` recreado localmente y `.env.local.example` actualizado (URL de
ejemplo de `SQUARE_WEBHOOK_NOTIFICATION_URL`). Redeploy de producción
(`vercel --prod`) y `npm run build` local, ambos limpios.

**Smoke test contra el proyecto nuevo:** home (`/es`, 200), `/es/menu` (200),
`/admin/dashboard` (307 → `/admin/login`, igual que antes), y un envío real al
form de catering vía `/api/catering` en producción → fila verificada en
`catering_leads` del proyecto destino y luego borrada (era solo de prueba).

### ⏳ Pendiente — Square (acción manual del owner, pausado a pedido suyo)
No se tocó nada de Square esta sesión más allá de desplegar el código de la
Edge Function. Falta, en este orden:
1. Owner: Square Developer Dashboard → Webhooks → Subscriptions → nueva
   suscripción → URL `https://rqpfqxmohdttghscoknh.supabase.co/functions/v1/square-webhook`,
   evento `payment.updated` → copiar el Signature Key nuevo (no se puede
   reutilizar el del proyecto viejo, está atado 1:1 a la URL).
2. Owner: confirmar/reenviar el Access Token de Square (no es legible vía API
   desde el proyecto viejo) y el `SQUARE_ENVIRONMENT` (sandbox/production).
3. Claude: `supabase secrets set` en el proyecto destino con los 4 valores +
   probar con "Test webhook" desde Square Developer Console.
4. Solo después de eso: confirmar con el owner si pausar (no borrar)
   `oifwxosgmftdplmejhgq` como respaldo en frío.

### Nota técnica — bug/quirk de `apply_migration` en el MCP `supabase-holala`
`apply_migration` falla de forma intermitente con (a) funciones multilínea que
usan `RETURNS TRIGGER ... AS $$` con dollar-quote sin nombre, y (b) más de un
`CREATE POLICY`/statement por llamada, o llamadas en paralelo muy rápidas
(probable colisión de versión en su tabla de tracking interna). `execute_sql`
con el mismo SQL (dollar-quote con tag, ej. `$body$`, y una sola
declaración/objeto por llamada, ejecutadas secuencialmente) funcionó de forma
100% confiable y fue el método usado para toda la migración de schema.

### Estado al cerrar sesión
```
✅ Schema: 9 migraciones aplicadas y verificadas en rqpfqxmohdttghscoknh
✅ Edge Function square-webhook: desplegada, ACTIVE, mismo código v3
✅ Vercel + GitHub Actions: env vars de Supabase actualizadas, redeploy OK
✅ Smoke test (home/menu/admin-redirect/catering-insert): OK contra el proyecto nuevo
⏳ Square: webhook subscription + secrets — bloqueado en acción del owner (pausado a su pedido)
⏳ Proyecto viejo (oifwxosgmftdplmejhgq): sigue activo, decisión de pausarlo pendiente hasta cerrar Square
⏳ Commit + PR de 009_security_hardening.sql + estos docs — próximo paso
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

## SESSION LOG — 2026-06-15 (sesión 6) — CIERRE

### Commits de la sesión
| Hash | Descripción |
|------|-------------|
| `b0c1a31` | fix: idempotent sale_items repair on retry, surface productsError (cherry-pick de `d33bc20`, branch `fix/square-webhook-idempotent-retry` → PR #3) |
| `0cbb047` | chore: ignore supabase/.temp local link metadata |

Sin cambios de código nuevos directos a `main` esta sesión (PR #2 ya estaba mergeado al iniciar, vía `c24bcb6`). El trabajo fue configuración de infraestructura (Vercel CLI, env vars, GA4) + recuperar un commit huérfano vía PR #3.

### Qué se completó

**PR #2 — POST-MERGE (completo):**
- Vercel CLI autenticado localmente (`vercel login` + `vercel link` → proyecto `holala-web`, team `digisenda-4410s-projects`)
- `NEXT_PUBLIC_SITE_URL` actualizado a `https://www.holalacubanflavor.com` (Production) vía `vercel env rm/add` + `vercel redeploy`
- Verificado en vivo: canonical tag y `/sitemap.xml` ya usan `www`

**GA4 configurado:**
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-R0Q4D06G1F` agregado a `.env.local` y a Vercel Production (`components/analytics/GoogleAnalytics.tsx` ya estaba implementado y wireado en `layout.tsx`, solo faltaba el ID)
- Redeploy + verificado: `googletagmanager.com/gtag/js?id=G-R0Q4D06G1F` presente en `/es` producción

**PR #3 — abierto, listo para merge:**
- `d33bc20` (fix de idempotencia del Square webhook, ya desplegado como `square-webhook` v3 en sesión 5) vivía en `origin/claude/mcp-squarre-access-3avb2s` sin mergear a `main`
- Cherry-pick limpio → branch `fix/square-webhook-idempotent-retry` (commit `b0c1a31`) → **PR #3**: https://github.com/Digisenda/holala-web/pull/3
- Estado: `MERGEABLE`, CI verde (Vercel build + preview comments OK), sin conflictos. El código YA corre en producción (Supabase v3) — este PR solo sincroniza `main`. Listo para mergear, pendiente de decisión del owner.

**Investigación Square MCP (sin cambios de código, sin bloqueos nuevos):**
- Se evaluó si ampliar scopes del conector Square MCP (`DEVELOPER_APPLICATION_WEBHOOKS_READ`/`WRITE`) destrabaría la configuración de secrets del webhook. Conclusión: el Access Token de Square NUNCA es accesible vía API (siempre Dashboard manual, sea cual sea el scope); el bloqueo de `supabase secrets set` es por falta de auth de la CLI de Supabase local (`supabase login`), totalmente independiente de Square/MCP.

**Supabase CLI — autenticado y proyecto vinculado:**
- El CLI ya estaba autenticado (sesión previa del owner) — `npx supabase projects list` funcionó sin necesidad del Personal Access Token nuevo que se generó (no se usó)
- `npx supabase link --project-ref oifwxosgmftdplmejhgq` → éxito, proyecto `holala-web` vinculado
- Verificado: `npx supabase secrets list --project-ref oifwxosgmftdplmejhgq` devuelve los secrets actuales — confirma acceso de lectura/escritura a secrets de este proyecto
- `supabase/.temp/` (metadata local del link) agregado a `.gitignore` (commit `0cbb047`)
- **Esto desbloquea por completo el lado de Supabase para el Square webhook** — solo falta lo que el owner debe hacer en Square Developer Dashboard (ver abajo)

### Estado al cerrar sesión
```
✅ PR #2 post-merge: NEXT_PUBLIC_SITE_URL → www, redeploy y verificación en producción OK
✅ GA4: G-R0Q4D06G1F configurado y verificado en producción
✅ PR #3 mergeado a main (confirmado por el owner)
✅ Supabase CLI autenticado + proyecto holala-web vinculado (npx supabase link, listo para secrets set)
⏳ PRÓXIMA SESIÓN — arranca directo aquí: Square webhook secrets
   1. Owner: Square Developer Dashboard → Webhooks → Subscriptions → Add subscription
      - Event: payment.updated
      - Notification URL: https://oifwxosgmftdplmejhgq.supabase.co/functions/v1/square-webhook
      - Copiar el "Signature Key" generado
   2. Owner: Square Developer Dashboard → Apps → [app] → Credentials → copiar Access Token
   3. Claude: supabase secrets set --project-ref oifwxosgmftdplmejhgq SQUARE_ACCESS_TOKEN=... SQUARE_ENVIRONMENT=sandbox SQUARE_WEBHOOK_SIG_KEY=... SQUARE_WEBHOOK_NOTIFICATION_URL=...
   4. Probar con "Test webhook" desde Square Developer Console, verificar filas en sales/sale_items
⏳ Re-correr Lighthouse mobile en producción (confirmar si SEO sube de 92 con canonical www)
⏳ Admin login real (Supabase Auth UI) — Sprint 2, no iniciado
```

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

**Fixes de code review automatizado (Codex, post-merge de PR #1 → v3 del deploy):**
- Reparación de `sale_items` en reintentos: si `sales` upsert no inserta (orden ya existía por `ignoreDuplicates`), ahora se busca el `id` existente vía `square_order_id` y se usa esa `saleId` — antes un reintento que falló tras el upsert nunca insertaba los `sale_items`
- Se agrega chequeo de `existingItemCount` en `sale_items` antes de insertar, para que ese camino de reparación sea idempotente (no duplica items si ya se insertaron)
- `productsError` ahora se captura y lanza (antes se ignoraba silenciosamente si el `.in("square_catalog_id", ...)` fallaba)
- `supabase/migrations/001_products.sql`: comentario de `square_catalog_id` aclarado — debe ser el id de **CatalogItemVariation**, no el de CatalogItem padre, para que el cruce con `line_items[].catalog_object_id` funcione
- Re-desplegado: `square-webhook` v3, status `ACTIVE`

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
✅ Edge Function square-webhook: código v3 (HMAC timing-safe + quantity fix +
   reparación idempotente de sale_items en reintentos + productsError handling),
   desplegada y ACTIVE
✅ Proyecto Supabase holala-web: reanudado (estaba INACTIVE)
✅ Credenciales Square documentadas en .env.local.example
⏳ Secrets del Edge Function: NO configurados — requiere acción manual del owner (ver bloque arriba)
⏳ Webhook subscription en Square: NO creada — requiere Square Developer Dashboard
⏳ Square hardware + configuración: pendiente
⏳ Square Online Store embed en /menu: pendiente
```

> Nota: PR #1 (mergeado a `main`) incluye el código hasta v2. Los fixes de v3
> (arriba) se commitearon en `claude/mcp-squarre-access-3avb2s` después del merge,
> en respuesta a comentarios automáticos de Codex sobre el diff de PR #1. Quedan
> en la rama pendientes de un nuevo PR — no se abrió uno automáticamente por
> instrucción explícita de no reabrir/recrear PR para el mismo cambio.

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
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Configurada | `https://rqpfqxmohdttghscoknh.supabase.co` (sesión 7) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Configurada | Ver `.env.local` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ✅ Configurada | `d082imwm` (sesión 3) |
| `NEXT_PUBLIC_SANITY_DATASET` | ✅ Default | `production` |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | ✅ Configurada | `G-R0Q4D06G1F` (sesión 6, verificado en producción) |
| `NEXT_PUBLIC_SITE_URL` | ✅ Configurada (código + Vercel Production) | `https://www.holalacubanflavor.com` (sesión 6) |

---

## Supabase — Referencia rápida

| Campo | Valor |
|-------|-------|
| Proyecto | `holala-web` |
| Project ID | `rqpfqxmohdttghscoknh` |
| URL | `https://rqpfqxmohdttghscoknh.supabase.co` |
| Organización | holala (holalacubanflavor@gmail.com) |
| Admin email | `digisenda@gmail.com` (en `is_admin()` function) |
| Migraciones | 001→009 aplicadas |

Tablas activas: `products`, `sales`, `sale_items`, `customers`, `catering_leads`

> Migrado desde el proyecto original `oifwxosgmftdplmejhgq` (org DigiSenda AI,
> `us-east-1`) el 2026-06-19 — ver sesión 7. Ese proyecto quedó **pausado**
> (no borrado) el 2026-06-19 (sesión 8) como respaldo en frío, una vez
> verificado el corte completo incluyendo Square. Reactivar con
> `restore_project` si hace falta.

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
- [x] Square webhook Edge Function — código desplegado (ACTIVE), suscripción Production creada y 4 secrets configurados en `rqpfqxmohdttghscoknh`, test webhook 200 OK (ver sesión 8). Falta solo confirmar el insert completo con la primera venta real.
- [ ] Square hardware + configuración
- [ ] Square Online Store embed en /menu
