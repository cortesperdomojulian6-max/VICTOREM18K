// ============================================================
// VICTOREM - Servidor Wompi (Pasarela de Pagos)
// ============================================================

const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ============ CONSTANTES WOMPI ============
const WOMPI_API_KEY = process.env.WOMPI_API_KEY;
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
const WOMPI_ENVIRONMENT = process.env.WOMPI_ENVIRONMENT || 'sandbox';
const WOMPI_API_URL = WOMPI_ENVIRONMENT === 'production'
  ? 'https://api.wompi.co/v1'
  : 'https://staging.wompi.co/v1';

// ============ VALIDAR CONFIGURACIÓN ============
if (!WOMPI_API_KEY || !WOMPI_PUBLIC_KEY) {
  console.warn('⚠️  Variables WOMPI_API_KEY o WOMPI_PUBLIC_KEY no configuradas');
}

// ============ ENDPOINTS ============

/**
 * GET /api/wompi/config
 * Obtiene la configuración pública de Wompi (para el frontend)
 */
router.get('/config', (req, res) => {
  if (!WOMPI_PUBLIC_KEY) {
    return res.status(500).json({
      error: 'Wompi no está configurado correctamente'
    });
  }

  res.json({
    publicKey: WOMPI_PUBLIC_KEY,
    environment: WOMPI_ENVIRONMENT,
    apiUrl: WOMPI_API_URL
  });
});

/**
 * POST /api/wompi/create-payment
 * Crear una transacción de pago
 * Body: { amount, currency, reference, customerEmail, orderId }
 */
router.post('/create-payment', requireAuth, async (req, res) => {
  try {
    const { amount, currency = 'COP', reference, customerEmail, orderId } = req.body;
    const userId = req.user.id;

    // Validaciones
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }
    if (!reference) {
      return res.status(400).json({ error: 'Referencia requerida' });
    }

    // Verificar que la orden pertenece al usuario
    if (orderId) {
      const orderResult = await db.query(
        'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
        [orderId, userId]
      );
      if (orderResult.rows.length === 0) {
        return res.status(403).json({ error: 'Orden no encontrada' });
      }
    }

    // Crear transacción en Wompi
    const paymentData = {
      amount_in_cents: Math.round(amount * 100), // Wompi usa centavos
      currency,
      customer_email: customerEmail,
      reference,
      description: `Pedido VICTOREM #${reference}`
    };

    console.log('📤 Enviando a Wompi:', paymentData);

    const wompiResponse = await fetch(`${WOMPI_API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WOMPI_API_KEY}`
      },
      body: JSON.stringify(paymentData)
    });

    if (!wompiResponse.ok) {
      const errorData = await wompiResponse.text();
      console.error('❌ Error Wompi:', errorData);
      return res.status(wompiResponse.status).json({
        error: 'Error al procesar pago en Wompi',
        details: errorData
      });
    }

    const transaction = await wompiResponse.json();
    console.log('✅ Transacción creada:', transaction.data);

    // Guardar referencia en la base de datos
    if (orderId) {
      await db.query(
        'UPDATE orders SET wompi_transaction_id = $1 WHERE id = $2',
        [transaction.data.id, orderId]
      );
    }

    res.json({
      success: true,
      transaction: transaction.data,
      redirectUrl: transaction.data.redirect_url
    });

  } catch (err) {
    console.error('❌ Error en create-payment:', err.message);
    res.status(500).json({
      error: 'Error al crear pago',
      message: err.message
    });
  }
});

/**
 * GET /api/wompi/transaction/:id
 * Obtener estado de una transacción
 */
router.get('/transaction/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const response = await fetch(`${WOMPI_API_URL}/transactions/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WOMPI_API_KEY}`
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'No se encontró la transacción'
      });
    }

    const transaction = await response.json();

    res.json({
      success: true,
      transaction: transaction.data,
      status: transaction.data.status
    });

  } catch (err) {
    console.error('❌ Error en GET transaction:', err.message);
    res.status(500).json({
      error: 'Error al obtener transacción'
    });
  }
});

/**
 * POST /api/wompi/webhook
 * Webhook para recibir eventos de Wompi
 * Este endpoint verifica la integridad del mensaje
 */
router.post('/webhook', async (req, res) => {
  try {
    const { event, data } = req.body;

    console.log(`📨 Webhook Wompi recibido: ${event}`);

    if (event === 'transaction.updated') {
      const { id, status, reference } = data;

      // Actualizar estado del pedido según el estado de Wompi
      let orderStatus = 'pendiente';
      if (status === 'APPROVED') {
        orderStatus = 'confirmado';
      } else if (status === 'DECLINED' || status === 'VOIDED') {
        orderStatus = 'cancelado';
      }

      // Buscar la orden por referencia y actualizar
      await db.query(
        'UPDATE orders SET estado = $1, metodo_pago = $2 WHERE numero_pedido = $3',
        [orderStatus, 'wompi', reference]
      );

      console.log(`✅ Pedido ${reference} actualizado a estado: ${orderStatus}`);
    }

    // Responder a Wompi que el webhook fue recibido
    res.status(200).json({ received: true });

  } catch (err) {
    console.error('❌ Error en webhook:', err.message);
    res.status(500).json({ error: 'Error procesando webhook' });
  }
});

module.exports = router;
