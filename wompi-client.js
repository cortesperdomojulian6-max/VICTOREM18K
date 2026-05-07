// ============================================================
// VICTOREM - Cliente Wompi (Frontend)
// Integración con la pasarela de pagos
// ============================================================

class WompiClient {
  constructor() {
    this.publicKey = null;
    this.environment = null;
    this.script = null;
    this.initialized = false;
  }

  /**
   * Inicializar Wompi con configuración del servidor
   */
  async init() {
    try {
      console.log('🔄 Inicializando Wompi...');
      
      // Obtener configuración del servidor
      const response = await fetch('/api/wompi/config');
      if (!response.ok) {
        throw new Error('No se pudo obtener configuración de Wompi');
      }

      const config = await response.json();
      this.publicKey = config.publicKey;
      this.environment = config.environment;

      // Cargar script de Wompi
      if (!window.Wompi) {
        const script = document.createElement('script');
        script.src = 'https://checkout.wompi.co/woman.js';
        script.async = true;
        script.onload = () => {
          this.initialized = true;
          console.log('✅ Wompi cargado correctamente');
        };
        document.head.appendChild(script);
      } else {
        this.initialized = true;
      }

      return true;
    } catch (err) {
      console.error('❌ Error inicializando Wompi:', err.message);
      return false;
    }
  }

  /**
   * Abre el checkout de Wompi
   */
  async openCheckout(options) {
    if (!this.initialized) {
      console.error('Wompi no está inicializado');
      return false;
    }

    return new Promise((resolve, reject) => {
      const {
        amount,
        currency = 'COP',
        reference,
        customerEmail,
        customerName,
        onSuccess,
        onError
      } = options;

      if (typeof window.Wompi === 'undefined') {
        reject(new Error('Wompi no está disponible'));
        return;
      }

      // Crear token del cliente (necesario para Wompi)
      const widget = new window.Wompi({
        publicKey: this.publicKey,
        amountInCents: Math.round(amount * 100),
        currency,
        reference,
        customerEmail,
        customerName,
        onSuccess: (transactionId) => {
          console.log('✅ Pago exitoso:', transactionId);
          if (onSuccess) onSuccess(transactionId);
          resolve(true);
        },
        onError: (error) => {
          console.error('❌ Error en pago:', error);
          if (onError) onError(error);
          reject(error);
        }
      });

      widget.show();
    });
  }

  /**
   * Crear transacción directa (alternativa a widget)
   */
  async createTransaction(amount, reference, customerEmail, orderId) {
    try {
      const response = await fetch('/api/wompi/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount,
          reference,
          customerEmail,
          orderId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error creando transacción');
      }

      const data = await response.json();
      console.log('✅ Transacción creada:', data);
      return data.transaction;

    } catch (err) {
      console.error('❌ Error en createTransaction:', err.message);
      throw err;
    }
  }

  /**
   * Verificar estado de una transacción
   */
  async getTransactionStatus(transactionId) {
    try {
      const response = await fetch(`/api/wompi/transaction/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error obteniendo estado');
      }

      const data = await response.json();
      return data.transaction;

    } catch (err) {
      console.error('❌ Error en getTransactionStatus:', err.message);
      throw err;
    }
  }

  /**
   * Verificar si el pago fue exitoso basado en el estado
   */
  isPaymentSuccessful(transaction) {
    return transaction && transaction.status === 'APPROVED';
  }

  /**
   * Obtener mensaje amigable del estado del pago
   */
  getStatusMessage(status) {
    const messages = {
      'APPROVED': '✅ Pago aprobado',
      'PENDING': '⏳ Pago pendiente de validación',
      'DECLINED': '❌ Pago rechazado',
      'VOIDED': '❌ Pago cancelado',
      'ERROR': '❌ Error en el pago'
    };
    return messages[status] || 'Estado desconocido';
  }
}

// Crear instancia global
const wompiClient = new WompiClient();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WompiClient;
}
