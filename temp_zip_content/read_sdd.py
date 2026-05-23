import docx, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
doc = docx.Document(r'temp_zip_content\Victorem_SDD_v2.1.docx')
for p in doc.paragraphs:
    txt = p.text.strip()
    if txt:
        style = p.style.name if p.style else 'Normal'
        print(f'[{style}] {txt}')
