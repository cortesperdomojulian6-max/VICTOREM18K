from pathlib import Path
import re

files = [
    'index.html', 'catalogo.html', 'cuidado.html', 'historia.html',
    'personalizacion.html', 'checkout.html', 'contacto.html', 'politicas.html',
    'terminos.html', 'miperfil.html'
]

for filename in files:
    path = Path(filename)
    if not path.exists():
        print('missing', filename)
        continue

    text = path.read_text(encoding='utf-8')
    original = text

    text = re.sub(r'<header>.*?</header>\s*', '<div id="header-root"></div>\n\n', text, flags=re.S)
    text = re.sub(r'<!-- Modal para inicio de sesi[oó]n -->.*?<!-- Scripts de autenticaci[oó]n y API.*', '<!-- Header compartido e modales de auth cargados dinámicamente -->\n', text, flags=re.S)
    text = text.replace('<script src="auth.js"></script>', '<script src="header-loader.js" defer></script>\n  <script src="auth.js" defer></script>')
    text = re.sub(r'<script src="(main\.js|catalogo\.js|checkout\.js|miperfil\.js|personalizacion\.js|historia\.js|contacto\.js|politicas\.js|terminos\.js)"(?!.*defer)(.*?)></script>', lambda m: f'<script src="{m.group(1)}" defer{m.group(2)}></script>', text)

    if text != original:
        path.write_text(text, encoding='utf-8')
        print('updated', filename)
    else:
        print('unchanged', filename)
