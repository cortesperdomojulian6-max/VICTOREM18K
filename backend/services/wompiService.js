const db = require('../db');
const { ValidationError, ForbiddenError } = require('./errors');

const WOMPI_API_KEY = process.env.WOMPI_API_KEY;
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
const WOMPI_ENVIRONMENT = process.env.WOMPI_ENVIRONMENT || 'sandbox';
const WOMPI_API_URL = WOMPI_ENVIRONMENT === 'production'
  ? 'https://api.wompi.co/v1'
  : 'https://staging.wompi.co/v1';

function getConfig() {
  if (!WOMPI_PUBLIC_KEY) {
    throw new ValidationError('Wompi no está configurado correctamente');
  }
  return { publicKey: WOMPI_PUBLIC_KEY, environment: WOMPI_ENVIRONMENT, apiUrl: WOMPI_API_URL };
}

async function createPayment(userId, { amount, currency = 'COP', reference, customerEmail, orderId }) {
  if (!amount || amount <= 0) {
    throw new ValidationError('Monto inválido');
  }
  if (!reference) {
    throw new ValidationError('Referencia requerida');
  }

  if (orderId) {
    const orderResult = await db.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );
    if (orderResult.rows.length === 0) {
      throw new ForbiddenError('Orden no encontrada');
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  const paymentData = {
    amount_in_cents: Math.round(amount * 100),
    currency,
    customer_email: customerEmail,
    reference,
    description: `Pedido VICTOREM #${reference}`,
    ...(currency === 'COP' ? {
      redirect_url: `${baseUrl}/checkout?status=success&transaction_id=:transaction_id`,
      success_url: `${baseUrl}/checkout?status=success`,
      failure_url: `${baseUrl}/checkout?status=failure`,
    } : {}),
  };

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
    throw new ValidationError(`Error al procesar pago en Wompi: ${errorData}`);
  }

  const transaction = await wompiResponse.json();

  if (orderId) {
    await db.query(
      'UPDATE orders SET wompi_transaction_id = $1 WHERE id = $2',
      [transaction.data.id, orderId]
    );
  }

  return { success: true, transaction: transaction.data, redirectUrl: transaction.data.redirect_url };
}

async function getTransaction(transactionId) {
  const response = await fetch(`${WOMPI_API_URL}/transactions/${transactionId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${WOMPI_API_KEY}` }
  });

  if (!response.ok) {
    throw new ValidationError('No se encontró la transacción');
  }

  const transaction = await response.json();
  return { success: true, transaction: transaction.data, status: transaction.data.status };
}

const crypto = require('crypto');

const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET;

function verifyWebhookSignature(body, signature) {
  if (!WOMPI_EVENTS_SECRET) {
    throw new Error('WOMPI_EVENTS_SECRET no está configurado');
  }
  if (!signature) {
    return false;
  }
  const calculated = crypto
    .createHmac('sha256', WOMPI_EVENTS_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(signature));
}

async function handleWebhook(body, headers) {
  const signature = headers['x-wompi-signature'];
  if (!verifyWebhookSignature(body, signature)) {
    throw new ForbiddenError('Firma de webhook inválida');
  }

  const { event, data } = body;

  if (event === 'transaction.updated') {
    const { id, status, reference } = data;

    let orderStatus = 'pendiente';
    if (status === 'APPROVED') orderStatus = 'confirmado';
    else if (status === 'DECLINED' || status === 'VOIDED') orderStatus = 'cancelado';

    const orderResult = await db.query(
      'SELECT id, user_id, total FROM orders WHERE numero_pedido = $1',
      [reference]
    );

    if (orderResult.rows.length > 0) {
      const order = orderResult.rows[0];

      await db.query(
        'UPDATE orders SET estado = $1, wompi_transaction_id = $2 WHERE id = $3',
        [orderStatus, id, order.id]
      );

      await db.query(
        `INSERT INTO payments (order_id, provider, transaction_id, status, amount, currency, raw_response)
         VALUES ($1, 'wompi', $2, $3, $4, 'COP', $5)`,
        [order.id, id, status, order.total, JSON.stringify(data)]
      );

      if (status === 'APPROVED') {
        await db.query('DELETE FROM cart_items WHERE user_id = $1', [order.user_id]);
      }
    }
  }

  return { received: true };
}

module.exports = { getConfig, createPayment, getTransaction, handleWebhook };
