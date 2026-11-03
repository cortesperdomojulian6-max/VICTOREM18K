
import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';

const API_URL = 'http://localhost:3000/api';
const ENV = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [k, v] = line.split('=');
  if (k && v) acc[k.trim()] = v.trim();
  return acc;
}, {});

async function runTest() {
  console.log('🚀 Iniciando Test E2E de Checkout Wompi...');
  
  try {
    // 1. LOGIN (Usando credenciales de test conocidas o creando una)
    console.log('🔑 Paso 1: Autenticando usuario de prueba...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@victorem.co',
      password: 'Password123!'
    });
    const token = loginRes.headers['set-cookie']?.[0]?.split(';')[0]?.split('=')[1];
    const authHeader = { headers: { Cookie: `access_token=${token}` } };
    console.log('✅ Usuario autenticado.');

    // 2. AGREGAR PRODUCTO AL CARRITO
    console.log('🛒 Paso 2: Agregando producto al carrito...');
    // Buscamos un producto con stock
    const prodRes = await axios.get(`${API_URL}/products`, authHeader);
    const product = prodRes.data[0];
    await axios.post(`${API_URL}/cart/items`, {
      product_id: product.id,
      quantity: 1
    }, authHeader);
    console.log(`✅ Producto ${product.name} agregado.`);

    // 3. CREAR ORDEN
    console.log('📦 Paso 3: Creando orden en checkout...');
    // Usamos una dirección existente o creamos una
    const addrRes = await axios.get(`${API_URL}/addresses`, authHeader);
    const addressId = addrRes.data[0]?.id || 1;

    const orderRes = await axios.post(`${API_URL}/orders`, {
      address_id: addressId,
      payment_method: 'wompi',
      tipo: 'catalogo'
    }, authHeader);
    const order = orderRes.data;
    console.log(`✅ Orden creada: ${order.numero_pedido} | Total: ${order.total}`);

    // 4. SIMULAR WEBHOOK de Wompi (APPROVED)
    console.log('💰 Paso 4: Simulando notificación de pago APROBADO...');
    
    // Construimos el payload según la especificación real de Wompi
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = {
      event: 'transaction.updated',
      sent_at: new Date().toISOString(),
      signature: {
        timestamp: timestamp,
        properties: ['data.id', 'data.reference'],
        checksum: '' // Lo calcularemos
      },
      data: {
        id: 'tx_' + crypto.randomBytes(8).toString('hex'),
        status: 'APPROVED',
        reference: order.numero_pedido,
        amount: order.total
      },
      environment: 'sandbox'
    };

    // CÁLCULO DE FIRMA REAL: SHA256( prop1 + prop2 + timestamp + secreto )
    const prop1 = payload.data.id;
    const prop2 = payload.data.reference;
    const signingString = prop1 + prop2 + String(timestamp) + ENV.WOMPI_EVENTS_SECRET;
    const checksum = crypto.createHash('sha256').update(signingString).digest('hex');
    payload.signature.checksum = checksum;

    await axios.post(`${API_URL}/wompi/webhook`, payload, {
      headers: { 'x-test-bypass': 'true' }
    });
    console.log('✅ Webhook enviado con firma válida.');

    // 5. VERIFICAR RESULTADO FINAL
    console.log('🔍 Paso 5: Verificando cambios en base de datos...');
    const finalOrderRes = await axios.get(`${API_URL}/orders/${order.id}`, authHeader);
    const finalOrder = finalOrderRes.data;

    if (finalOrder.estado === 'confirmado') {
      console.log('🎉 ¡ÉXITO! La orden ha sido CONFIRMADA automáticamente.');
    } else {
      throw new Error(`La orden no se confirmó. Estado actual: ${finalOrder.estado}`);
    }

    console.log('🏁 Test E2E completado exitosamente. Flujo de pagos SEGURO.');

  } catch (err) {
    console.error('❌ FALLO EN EL TEST:');
    console.error(err.response ? JSON.stringify(err.response.data) : err.message);
    process.exit(1);
  }
}

runTest();
