const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.post('/', asyncHandler(async (req, res) => {
  const { file, filename } = req.body;

  if (!file || !filename) {
    return res.status(400).json({ error: 'Faltan archivo o nombre' });
  }

  const matches = file.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) {
    return res.status(400).json({ error: 'Formato de archivo inválido' });
  }

  const mime = matches[1];
  const ext = mime.split('/')[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const sanitized = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `productos/${sanitized}_${Date.now()}.${ext}`;

  const url = `${process.env.SUPABASE_URL}/storage/v1/object/${process.env.SUPABASE_BUCKET}/${path}`;

  const uploadRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': mime,
      'x-upsert': 'true',
    },
    body: buffer,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    console.error('Supabase upload error:', uploadRes.status, errText);
    return res.status(500).json({ error: 'Error al subir la imagen' });
  }

  const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${path}`;

  return res.json({ url: publicUrl, path });
}));

module.exports = router;
