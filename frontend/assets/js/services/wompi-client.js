export class WompiClient {
  constructor() {
    this.publicKey = null;
    this.environment = null;
    this.script = null;
    this.initialized = false;
  }

  async init() {
    try {
      const response = await fetch('/api/wompi/config');
      if (!response.ok) {
        throw new Error('No se pudo obtener configuración de Wompi');
      }

      const config = await response.json();
      this.publicKey = config.publicKey;
      this.environment = config.environment;

      if (!window.Wompi) {
        const script = document.createElement('script');
        script.src = 'https://checkout.wompi.co/woman.js';
        script.async = true;
        script.onload = () => {
          this.initialized = true;
        };
        document.head.appendChild(script);
      } else {
        this.initialized = true;
      }

      return true;
    } catch (err) {
      console.error('Error inicializando Wompi:', err.message);
      return false;
    }
  }

  async openCheckout(options) {
    if (!this.initialized) {
      console.error('Wompi no está inicializado');
      return false;
    }

    return new Promise((resolve, reject) => {
      const { amount, currency = 'COP', reference, customerEmail, customerName, onSuccess, onError } = options;

      if (typeof window.Wompi === 'undefined') {
        reject(new Error('Wompi no está disponible'));
        return;
      }

      const widget = new window.Wompi({
        publicKey: this.publicKey,
        amountInCents: Math.round(amount * 100),
        currency,
        reference,
        customerEmail,
        customerName,
        onSuccess: (transactionId) => {
          if (onSuccess) onSuccess(transactionId);
          resolve(true);
        },
        onError: (error) => {
          if (onError) onError(error);
          reject(error);
        }
      });

      widget.show();
    });
  }

  async createTransaction(amount, reference, customerEmail, orderId) {
    try {
      const response = await fetch('/api/wompi/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount, reference, customerEmail, orderId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error creando transacción');
      }

      const data = await response.json();
      return data.transaction;
    } catch (err) {
      console.error('Error en createTransaction:', err.message);
      throw err;
    }
  }

  async getTransactionStatus(transactionId) {
    try {
      const response = await fetch(`/api/wompi/transaction/${transactionId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) {
        throw new Error('Error obteniendo estado');
      }

      const data = await response.json();
      return data.transaction;
    } catch (err) {
      console.error('Error en getTransactionStatus:', err.message);
      throw err;
    }
  }

  isPaymentSuccessful(transaction) {
    return transaction && transaction.status === 'APPROVED';
  }

  getStatusMessage(status) {
    const messages = {
      'APPROVED': 'Pago aprobado',
      'PENDING': 'Pago pendiente de validación',
      'DECLINED': 'Pago rechazado',
      'VOIDED': 'Pago cancelado',
      'ERROR': 'Error en el pago'
    };
    return messages[status] || 'Estado desconocido';
  }
}

export const wompiClient = new WompiClient();
