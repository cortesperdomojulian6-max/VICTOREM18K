-- ============================================================
-- VICTOREM - Datos iniciales (seed)
-- ============================================================
-- Inserta categorías, productos y un usuario administrador.
-- ============================================================

-- ============================================================
-- CATEGORÍAS
-- ============================================================
INSERT INTO categories (name, slug, description) VALUES
    ('Pulseras',  'pulseras',  'Pulseras artesanales en balinería'),
    ('Anillos',   'anillos',   'Anillos con diseños exclusivos'),
    ('Manillas',  'manillas',  'Manillas únicas de edición limitada'),
    ('Collares',  'collares',  'Collares y cadenas');

-- ============================================================
-- PRODUCTOS (12 piezas iniciales)
-- ============================================================
INSERT INTO products (category_id, name, description, price, image_url, features, stock) VALUES
    (
        (SELECT id FROM categories WHERE slug = 'pulseras'),
        'Pulsera Clásica Dorada',
        'Elegante pulsera con diseño tradicional en balinería y acabado dorado de alta calidad. Perfecta para ocasiones formales y uso diario.',
        125000,
        'imagenes/balines dorados.jpeg',
        '["Material: Acero inoxidable con baño de oro","Técnica: Balinería tradicional","Cierre: Seguro de resorte","Ajuste: Universal para muñecas de 15-18 cm","Garantía: 1 año contra defectos de fabricación"]'::jsonb,
        20
    ),
    (
        (SELECT id FROM categories WHERE slug = 'pulseras'),
        'Pulsera Van Cleef Dorada',
        'Diseño contemporáneo con balinería de diferentes tamaños y acabado plateado brillante. Ideal para quienes buscan un estilo moderno y sofisticado.',
        165000,
        'imagenes/van cleef dorada.jpeg',
        '["Material: Acero quirúrgico 316L","Técnica: Balinería multiformato","Cierre: Doble seguro magnético","Ajuste: Personalizable","Resistente al agua y al sudor"]'::jsonb,
        15
    ),
    (
        (SELECT id FROM categories WHERE slug = 'pulseras'),
        'Pulsera Van Cleef Negra',
        'Edición especial con balinería de alta gama y detalles únicos en acabado dorado rosa. Una pieza exclusiva para ocasiones especiales.',
        150000,
        'imagenes/van cleef negra.jpeg',
        '["Material: Acero inoxidable con baño de oro rosa","Técnica: Balinería premium de precisión","Cierre: Seguro de lujo con doble mecanismo","Incluye: Estuche de regalo premium","Garantía: 2 años"]'::jsonb,
        10
    ),
    (
        (SELECT id FROM categories WHERE slug = 'pulseras'),
        'Pulsera Van Cleef Roja',
        'Diseño vanguardista con patrones geométricos en acabado negro mate resistente. Para quienes buscan un estilo urbano y contemporáneo.',
        150000,
        'imagenes/van cleef roja.jpeg',
        '["Material: Acero con recubrimiento PVD negro","Técnica: Balinería geométrica artesanal","Cierre: Seguro deslizante ajustable","Resistente: A rayaduras y desgaste","Estilo: Unisex"]'::jsonb,
        12
    ),
    (
        (SELECT id FROM categories WHERE slug = 'anillos'),
        'Anillo Clásico Dorado',
        'Anillo tradicional con diseño en balinería y acabado dorado de larga duración. Elegancia atemporal para cualquier ocasión.',
        50000,
        'imagenes/AnilloDiseñoExclusivo.jpg',
        '["Material: Acero inoxidable con baño de oro","Técnica: Balinería tradicional","Tallas disponibles: 12-20","Acabado: Brillante de alta resistencia","Incluye: Estuche de regalo"]'::jsonb,
        30
    ),
    (
        (SELECT id FROM categories WHERE slug = 'anillos'),
        'Anillo Tres Carriles Diamantado',
        'Diseño contemporáneo con detalles únicos en balinería y acabado plateado brillante. Perfecto para complementar tu estilo personal.',
        75000,
        'imagenes/AnilloTresCarriles.jpg',
        '["Material: Acero quirúrgico 316L","Técnica: Balinería con diseño asimétrico","Tallas disponibles: 12-20","Acabado: Plateado brillante resistente","Garantía: 1 año"]'::jsonb,
        25
    ),
    (
        (SELECT id FROM categories WHERE slug = 'anillos'),
        'Anillo Tres Carriles Liso',
        'Diseño contemporáneo con dije central en balinería y cadena ajustable. Una pieza versátil que combina con cualquier estilo.',
        50000,
        'imagenes/AnilloTresCarrilesLiso.jpg',
        '["Material: Acero inoxidable con baño de plata","Longitud: Cadena ajustable 40-50 cm","Dije: Diseño en balinería de 3 cm","Cierre: Seguro de resorte","Resistente: Al agua y la oxidación"]'::jsonb,
        25
    ),
    (
        (SELECT id FROM categories WHERE slug = 'manillas'),
        'Manilla 7 Balines Diamantada',
        'Edición limitada con diseño exclusivo y detalles en balinería de alta calidad. La pieza perfecta para hacer una declaración de estilo.',
        120000,
        'imagenes/Manilla7BalinesDiamantada.jpg',
        '["Material: Acero quirúrgico premium","Longitud: 45 cm con extensión de 5 cm","Dije: Diseño exclusivo en balinería","Cierre: Seguro de doble bloqueo","Incluye: Certificado de autenticidad"]'::jsonb,
        8
    ),
    (
        (SELECT id FROM categories WHERE slug = 'manillas'),
        'Manilla Bolsa Dinero',
        'Edición limitada con diseño exclusivo y detalles en balinería de alta calidad. La pieza perfecta para hacer una declaración de estilo.',
        120000,
        'imagenes/ManillaBolsaDinero.jpg',
        '["Material: Acero quirúrgico premium","Longitud: 45 cm con extensión de 5 cm","Dije: Diseño exclusivo en balinería","Cierre: Seguro de doble bloqueo","Incluye: Certificado de autenticidad"]'::jsonb,
        10
    ),
    (
        (SELECT id FROM categories WHERE slug = 'manillas'),
        'Manilla Diamantada Centrado',
        'Edición limitada con diseño exclusivo y detalles en balinería de alta calidad. La pieza perfecta para hacer una declaración de estilo.',
        120000,
        'imagenes/ManillaDiamantadaCentro.jpg',
        '["Material: Acero quirúrgico premium","Longitud: 45 cm con extensión de 5 cm","Dije: Diseño exclusivo en balinería","Cierre: Seguro de doble bloqueo","Incluye: Certificado de autenticidad"]'::jsonb,
        10
    ),
    (
        (SELECT id FROM categories WHERE slug = 'manillas'),
        'Manilla Dollar',
        'Edición limitada con diseño exclusivo y detalles en balinería de alta calidad. La pieza perfecta para hacer una declaración de estilo.',
        150000,
        'imagenes/ManillaDollar.jpg',
        '["Material: Acero quirúrgico premium","Longitud: 45 cm con extensión de 5 cm","Dije: Diseño exclusivo en balinería","Cierre: Seguro de doble bloqueo","Incluye: Certificado de autenticidad"]'::jsonb,
        7
    ),
    (
        (SELECT id FROM categories WHERE slug = 'manillas'),
        'Manilla Full Balin Liso',
        'Edición limitada con diseño exclusivo y detalles en balinería de alta calidad. La pieza perfecta para hacer una declaración de estilo.',
        115000,
        'imagenes/ManillaFullBalinLiso.jpg',
        '["Material: Acero quirúrgico premium","Longitud: 45 cm con extensión de 5 cm","Dije: Diseño exclusivo en balinería","Cierre: Seguro de doble bloqueo","Incluye: Certificado de autenticidad"]'::jsonb,
        12
    );

-- ============================================================
-- USUARIO ADMINISTRADOR DE PRUEBA
-- ============================================================
-- Email:    admin@victorem.co
-- Password: Admin123!  (hash bcrypt generado con 10 rounds)
-- ============================================================
-- IMPORTANTE: cambia esta contraseña después del primer login.
INSERT INTO users (name, email, password, role) VALUES
    (
        'Administrador Victorem',
        'admin@victorem.co',
        '$2b$10$rQOeJFKZgGNrwQ/7vQ4wGOuxMz4pwPo3oH0MYXQqf8I.k4.6Kz4Iq',
        'admin'
    );
