# TODO

## Completado
- [x] Helmet + rate limiting en server.js
- [x] Validaciones en rutas: register, login, address, product, order
- [x] Health check endpoint con verificación de BD
- [x] Refresh token silencioso en 401 interceptor
- [x] Cart PUT endpoint (actualizar cantidad)
- [x] Migración a Next.js 15 App Router + React 19 + Tailwind 4
- [x] API Express montada en Next.js (catch-all + express-adapter)
- [x] Migración de BD a Supabase (PostgreSQL pooler)
- [x] Headers de seguridad en next.config.ts y vercel.json
- [x] Auth JWT en cookies httpOnly + SameSite=Strict
- [x] Firma HMAC verificada en webhook de Wompi
- [x] Protección IDOR en órdenes, direcciones, carrito, favoritos, custom-orders
- [x] Carrito persistente (localStorage + BD con merge al iniciar sesión)
- [x] Skeleton de carga en carrito, checkout y perfil
- [x] OG image 1200×630 (public/assets/images/og.jpg)
- [x] Lint activo (eslint.config.mjs) + typecheck en CI
- [x] Validación de stock en agregar y actualizar carrito
- [x] Limpieza de repo: files.zip, archivo suelto, código muerto (lib/auth.tsx)
- [x] README actualizado con el stack real

## Pendiente
- [ ] Tests e2e con Playwright (flujo checkout completo con Wompi sandbox)
- [ ] Pentest manual con dos cuentas de prueba (IDOR/auth en /api/*)
- [ ] Conectar dominio victorem.co en Vercel y validar OG/social previews
- [ ] sameAs con perfiles de redes sociales en JSON-LD
- [ ] Panel de admin mejorado (dashboard, analytics, exportar pedidos)
- [ ] Imágenes WebP <200KB (optimización de assets)
- [ ] Pruebas de accesibilidad (axe-core / Lighthouse) y navegación por teclado
