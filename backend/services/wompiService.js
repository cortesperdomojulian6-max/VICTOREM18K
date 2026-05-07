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

  const paymentData = {
    amount_in_cents: Math.round(amount * 100),
    currency,
    customer_email: customerEmail,
    reference,
    description: `Pedido VICTOREM #${reference}`
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

async function handleWebhook(body) {
  const { event, data } = body;

  if (event === 'transaction.updated') {
    const { id, status, reference } = data;

    let orderStatus = 'pendiente';
    if (status === 'APPROVED') orderStatus = 'confirmado';
    else if (status === 'DECLINED' || status === 'VOIDED') orderStatus = 'cancelado';

    await db.query(
      'UPDATE orders SET estado = $1, metodo_pago = $2 WHERE numero_pedido = $3',
      [orderStatus, 'wompi', reference]
    );
  }

  return { received: true };
}

module.exports = { getConfig, createPayment, getTransaction, handleWebhook };
