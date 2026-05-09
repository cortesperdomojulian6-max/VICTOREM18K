-- ============================================================
-- VICTOREM - Esquema de base de datos (PostgreSQL)
-- ============================================================
-- Este archivo crea todas las tablas necesarias.
-- Es idempotente: se puede ejecutar varias veces sin error.
-- ============================================================

-- Limpiar BD si existe (en orden inverso por las FKs)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- TABLA: users
-- Almacena usuarios y administradores
-- ============================================================
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url      TEXT,
    registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ============================================================
-- TABLA: categories
-- Categorías de productos (pulseras, anillos, manillas, etc.)
-- ============================================================
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(80) NOT NULL UNIQUE,
    slug        VARCHAR(80) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: products
-- Catálogo de productos (reemplaza productos hardcoded)
-- ============================================================
CREATE TABLE products (
    id              SERIAL PRIMARY KEY,
    category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    price           NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    image_url       VARCHAR(500),
    features        JSONB DEFAULT '[]'::jsonb,
    stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active   ON products(active);

-- ============================================================
-- TABLA: addresses
-- Direcciones de envío de cada usuario
-- ============================================================
CREATE TABLE addresses (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alias         VARCHAR(80),
    destinatario  VARCHAR(150) NOT NULL,
    ciudad        VARCHAR(100) NOT NULL,
    departamento  VARCHAR(100) NOT NULL,
    direccion     VARCHAR(255) NOT NULL,
    telefono      VARCHAR(30)  NOT NULL,
    es_principal  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- ============================================================
-- TABLA: cart_items
-- Carrito de compras persistente
-- ============================================================
CREATE TABLE cart_items (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    cantidad    INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_user ON cart_items(user_id);

-- ============================================================
-- TABLA: orders
-- Pedidos realizados por los usuarios
-- ============================================================
CREATE TABLE orders (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    address_id      INTEGER REFERENCES addresses(id) ON DELETE SET NULL,
    numero_pedido   VARCHAR(50) NOT NULL UNIQUE,
    tipo            VARCHAR(30) NOT NULL DEFAULT 'catalogo'
                    CHECK (tipo IN ('catalogo', 'personalizado', 'carrito')),
    subtotal        NUMERIC(12, 2) NOT NULL DEFAULT 0,
    envio           NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total           NUMERIC(12, 2) NOT NULL,
    estado          VARCHAR(30) NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'pagado', 'confirmado', 'enviado', 'entregado', 'cancelado')),
    metodo_pago     VARCHAR(30),
    wompi_transaction_id VARCHAR(100),
    notas           TEXT,
    fecha           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user   ON orders(user_id);
CREATE INDEX idx_orders_estado ON orders(estado);
CREATE INDEX idx_orders_numero ON orders(numero_pedido);

-- ============================================================
-- TABLA: order_items
-- Detalle de cada pedido (productos comprados)
-- ============================================================
CREATE TABLE order_items (
    id              SERIAL PRIMARY KEY,
    order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      INTEGER REFERENCES products(id) ON DELETE SET NULL,
    nombre_producto VARCHAR(200) NOT NULL, -- snapshot por si el producto se elimina
    cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal        NUMERIC(12, 2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================================
-- TABLA: payments
-- Registro de transacciones (preparada para Wompi/MercadoPago/etc.)
-- ============================================================
CREATE TABLE payments (
    id              SERIAL PRIMARY KEY,
    order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider        VARCHAR(30) NOT NULL,           -- 'wompi', 'mercadopago', 'manual', etc.
    transaction_id  VARCHAR(100),                   -- ID que devuelve la pasarela
    status          VARCHAR(30) NOT NULL,           -- 'PENDING', 'APPROVED', 'DECLINED', 'VOIDED'
    amount          NUMERIC(12, 2) NOT NULL,
    currency        VARCHAR(10) NOT NULL DEFAULT 'COP',
    raw_response    JSONB,                          -- respuesta completa de la pasarela
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order  ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- TRIGGER: actualizar 'updated_at' automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
