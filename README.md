# Victorem 18K

**Arte en cada balín, elegancia en cada detalle.**

E-commerce de joyas artesanales en balinería con oro laminado 18K. Hechas a mano en Campoalegre, Huila, Colombia.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Estado | Zustand (auth, carrito, favoritos) |
| Animación | framer-motion, three.js |
| API | Express 4 montado dentro de Next.js (route handler catch-all) |
| Base de datos | PostgreSQL vía Supabase (pooler) |
| Auth | JWT en cookies httpOnly + bcrypt, refresh token 7d |
| Almacenamiento | Supabase Storage (imágenes de producto) |
| Pasarela de pagos | Wompi (tarjeta, Nequi, Bancolombia, PSE) |
| Testing | Vitest (unit), Playwright (e2e) |
| Deploy | Vercel (serverless) |

## Arquitectura

```
victorem18k/
├── app/                  # Next.js App Router
│   ├── api/
│   │   └── [...path]/route.ts   # Catch-all: monta la app Express como API
│   ├── page.tsx          # Landing
│   ├── catalogo/         # Catálogo con filtros y búsqueda
│   ├── personalizacion/  # Configurador de joyas paso a paso
│   ├── carrito/          # Carrito de compras
│   ├── checkout/         # Checkout con Wompi y transferencia
│   ├── miperfil/         # Perfil, pedidos, direcciones
│   ├── admin/            # Panel de administración
│   └── ...
├── backend/              # API Express (montada en /api vía catch-all)
│   ├── routes/           # Controladores HTTP
│   ├── services/         # Lógica de negocio
│   ├── middleware/       # Auth (JWT), async handler
│   ├── validators/       # Validación de entrada
│   ├── db/               # Pool PostgreSQL, migraciones
│   └── server.js         # App Express (punto de entrada)
├── components/           # UI y layout compartidos
├── store/                # Stores Zustand
├── lib/                  # api client, config, utils
├── public/assets/        # Imágenes estáticas
├── scripts/              # Utilidades (importar productos, assets, etc.)
├── __tests__/            # Tests unitarios
└── next.config.ts        # Headers de seguridad, rewrites
```

### Cómo funciona la API (importante)

La app Express de `backend/server.js` se importa desde `app/api/[...path]/route.ts`
y se adapta a un Route Handler de Next.js mediante `lib/express-adapter.ts`.
Por eso, en producción (Vercel), **toda la API vive dentro del mismo deploy**:
no hay un servidor Express separado corriendo en otro lado.

- `npm run dev` → Next.js en `:3000`; el catch-all sirve `/api/*` con Express.
- `npm run api:dev` → Express standalone (para desarrollo de API pura).
- En `backend/server.js`, el `app.listen()` solo se ejecuta fuera de Vercel
  (`require.main === module && !process.env.VERCEL`).

## Instalación

```bash
git clone <repo>
cd victorem18k
npm install
cp .env.example .env
# Editar .env con credenciales
npm run dev
```

## Variables de Entorno (.env)

| Variable | Descripción |
|----------|------------|
| DATABASE_URL | Connection string PostgreSQL (Supabase pooler) |
| SUPABASE_URL | URL del proyecto Supabase |
| SUPABASE_SERVICE_KEY | Service key de Supabase (server-only) |
| SUPABASE_BUCKET | Bucket de Storage para imágenes |
| JWT_SECRET | Secreto para firmar JWT |
| WOMPI_PUBLIC_KEY | Llave pública Wompi |
| WOMPI_API_KEY | Llave privada Wompi (server-only) |
| WOMPI_INTEGRITY_KEY | Llave de integridad del checkout Wompi |
| WOMPI_EVENTS_SECRET | Secreto webhook Wompi |
| WOMPI_ENVIRONMENT | sandbox o production |
| NEXT_PUBLIC_APP_URL | URL pública del sitio (ej. https://victorem.co) |

> `WOMPI_API_KEY`, `WOMPI_EVENTS_SECRET` y `SUPABASE_SERVICE_KEY` **nunca** deben
> llegar al bundle del cliente: solo se usan del lado del servidor.

## Scripts

- `npm run dev` — Next.js + API Express en desarrollo
- `npm run build` — Build de producción
- `npm start` — Inicia el build de producción
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript sin emisión
- `npm test` — Tests unitarios (Vitest)
- `npm run test:e2e` — Tests e2e (Playwright)
- `npm run db:setup` — Inicializa esquema de BD
- `npm run db:reset` — Reinicia esquema de BD (--reset)
- `npm run api:dev` — API Express standalone

## API

Todas las rutas viven bajo `/api` y las sirve Express. Autenticación mediante cookie
`access_token` (httpOnly) + refresh silencioso.

```
GET  /api/health                     → Health check con estado de BD
POST /api/auth/register              → Registrar usuario
POST /api/auth/login                 → Iniciar sesión
POST /api/auth/refresh               → Renovar token JWT
GET  /api/auth/me                    → Usuario actual
POST /api/auth/logout                → Cerrar sesión
GET  /api/products                   → Listar productos
GET  /api/products/:id               → Detalle de producto
POST /api/products                   → Crear producto (admin)
PUT  /api/products/:id               → Actualizar producto (admin)
DELETE /api/products/:id             → Eliminar producto (admin)
GET  /api/cart                       → Ver carrito
POST /api/cart/items                 → Agregar al carrito
PUT  /api/cart/items/:id             → Actualizar cantidad
DELETE /api/cart/items/:id           → Eliminar del carrito
POST /api/orders                     → Crear orden
GET  /api/orders                     → Mis órdenes
GET  /api/orders/:id                 → Detalle de orden (propia)
GET  /api/addresses                  → Mis direcciones
POST /api/addresses                  → Crear dirección
PUT  /api/addresses/:id              → Actualizar dirección
DELETE /api/addresses/:id            → Eliminar dirección
GET  /api/users/profile              → Mi perfil
PUT  /api/users/profile              → Actualizar perfil
PUT  /api/users/password             → Cambiar contraseña
GET  /api/wompi/config               → Config de checkout (public key)
POST /api/wompi/create-payment       → Crear transacción Wompi
GET  /api/wompi/transaction/:id      → Estado de transacción
POST /api/wompi/webhook              → Webhook de Wompi (firma verificada)
GET  /api/config                     → Config de tienda (envío)
GET  /api/categories                 → Categorías
POST /api/newsletter                 → Suscribir email
GET  /api/newsletter                 → Lista de suscriptores (admin)
GET  /api/favorites                  → Mis favoritos
POST /api/favorites/:productId       → Toggle favorito
GET  /api/custom-orders/:orderId     → Configuración personalizada
POST /api/custom-orders              → Guardar configuración (orden propia)
GET  /api/search?q=...               → Búsqueda de productos
GET  /api/recommendations/:productId → Recomendaciones por producto
POST /api/contact                    → Formulario de contacto
POST /api/upload                     → Subir imagen (admin)
GET  /api/admin/stats                → Estadísticas (admin)
GET  /api/admin/users                → Usuarios (admin)
GET  /api/admin/orders               → Todas las órdenes (admin)
PUT  /api/admin/orders/:id/status    → Cambiar estado (admin)
```

## Páginas

| Ruta | Descripción |
|------|------------|
| / | Landing page con carrusel y testimonios |
| /catalogo | Catálogo con filtros y búsqueda |
| /personalizacion | Configurador de joyas paso a paso |
| /insumos | Insumos para joyeros |
| /mayoreo | Ventas al por mayor |
| /carrito | Carrito de compras |
| /checkout | Checkout con Wompi y transferencia |
| /historia | Sobre la marca |
| /contacto | Formulario de contacto |
| /cuidado | Guía de cuidado de joyas |
| /miperfil | Perfil de usuario, pedidos, direcciones |
| /politicas | Políticas de privacidad |
| /terminos | Términos y condiciones |
| /admin | Panel de administración |
| /404 | Página no encontrada |

## Seguridad

- Headers de seguridad (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy)
  aplicados en `next.config.ts` y `vercel.json`
- Helmet + rate limiting en Express (login: 5 intentos / 15 min; global: 100 / 15 min)
- JWT en cookies httpOnly + SameSite=Strict
- Firma HMAC verificada en webhooks de Wompi
- Todas las consultas de datos de usuario filtradas por `user_id` (protección IDOR)
- Rutas admin con `requireAuth + requireAdmin`
- `WOMPI_API_KEY` y `SUPABASE_SERVICE_KEY` solo server-side
- Validación de entrada en rutas críticas (auth, direcciones, órdenes, productos)
- `.env` ignorado por git; `.env.example` solo con placeholders

## Diseño

- Paleta cálida con acentos dorados (#d4af37) sobre tonos pergamino (#fff8f0)
- Tipografía: Playfair Display (headings) + Montserrat (body)
- Sin border-radius (estética angular premium) — decisión de marca, no corregir
- Transiciones suaves con cubic-bezier
- Esqueletos de carga (skeleton) para carrito, checkout y perfil

## Funcionalidades clave

- Autenticación JWT con refresh token silencioso
- Carrito persistente (localStorage para invitados + BD al iniciar sesión, con merge)
- Personalización de joyas en pasos (tipo, dije, color, balines, resumen)
- Pago con Wompi (tarjeta, Nequi, Bancolombia, PSE) y transferencia Nequi manual
- Panel de administración para gestionar productos, pedidos y usuarios
- Favoritos, búsqueda, recomendaciones y newsletter
- Webhook de Wompi que confirma pedidos y descuenta stock automáticamente

## Despliegue (Vercel)

- `vercel.json` define framework Next.js y refuerza headers de seguridad.
- Las variables de entorno se configuran en el dashboard de Vercel (mismas del `.env`).
- El dominio de producción final es `https://victorem.co` (aún pendiente de conectar
  en Vercel; mientras tanto el sitio corre en el dominio `*.vercel.app`).
