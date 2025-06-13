import { apiClient } from "./api-client"

export interface MercadoPagoPreference {
  preference_id: string
  init_point: string
  sandbox_init_point: string
}

export interface PaymentData {
  solicitud_id: number
  monto: number
  descripcion: string
  estudiante_nombre: string
}

export class MercadoPagoService {
  private static instance: MercadoPagoService
  private isProduction: boolean

  constructor() {
    this.isProduction = process.env.NODE_ENV === "production"
  }

  static getInstance(): MercadoPagoService {
    if (!MercadoPagoService.instance) {
      MercadoPagoService.instance = new MercadoPagoService()
    }
    return MercadoPagoService.instance
  }

  async createPaymentPreference(paymentData: PaymentData): Promise<MercadoPagoPreference> {
    const response = await apiClient.createMercadoPagoPreference(paymentData)
    
    if (response.error) {
      throw new Error(response.error || "Error al crear preferencia de pago")
    }
  
    return response.data as MercadoPagoPreference
  }

  getPaymentUrl(preference: MercadoPagoPreference): string {
    return this.isProduction ? preference.init_point : preference.sandbox_init_point
  }

  // Función para abrir el checkout de Mercado Pago
  async openCheckout(preference: MercadoPagoPreference): Promise<void> {
    const paymentUrl = this.getPaymentUrl(preference)
    const checkoutWindow = window.open(paymentUrl, '_blank')
    
    if (checkoutWindow) {
      const checkInterval = setInterval(() => {
        if (checkoutWindow.closed) {
          clearInterval(checkInterval)
          // Verificar el estado del pago
          this.checkPaymentStatus(preference.preference_id)
            .then((status) => {
              if (status === 'approved') {
                window.dispatchEvent(new CustomEvent('paymentSuccess'))
              } else if (status === 'pending') {
                window.dispatchEvent(new CustomEvent('paymentPending'))
              } else {
                window.dispatchEvent(new CustomEvent('paymentFailure'))
              }
            })
            .catch(() => {
              window.dispatchEvent(new CustomEvent('paymentError'))
            })
        }
      }, 1000)
    }
  }

  async checkPaymentStatus(preferenceId: string): Promise<string> {
    const response = await apiClient.getMercadoPagoPaymentStatus(preferenceId);
    
    if (response.error) {
      throw new Error(response.error || "Error al verificar el estado del pago")
    }
    
    return response.data.status
  }
} 