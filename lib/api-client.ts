// Cliente API mejorado para manejar solicitudes
export class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
      console.log("ApiClient constructor - Token from localStorage:", this.token)
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || data.message || "Error en la solicitud", data: null }
      }

      return { data, error: null }
    } catch (error) {
      console.error("API Error:", error)
      return { error: "Error de conexión", data: null }
    }
  }

  // Métodos para autenticación
  async login(email: string, password: string) {
    const result = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (result.data?.token) {
      this.setToken(result.data.token)
    }

    return result
  }

  async register(userData: any) {
    const result = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    if (result.data?.token) {
      this.setToken(result.data.token)
    }

    return result
  }

  // Métodos para solicitudes
  async createSolicitud(solicitudData: {
    ruta_id: number
    estudiante_id: number
    mensaje?: string
  }) {
    return this.request("/solicitudes", {
      method: "POST",
      body: JSON.stringify(solicitudData),
    })
  }

  async getSolicitudes() {
    return this.request("/solicitudes")
  }

  async updateSolicitud(id: number, data: any) {
    return this.request(`/solicitudes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // Métodos para estudiantes
  async getEstudiantes() {
    return this.request("/estudiantes")
  }

  async getEstudiante(id: number) {
    return this.request(`/estudiantes/${id}`)
  }

  async createEstudiante(estudianteData: any) {
    return this.request("/estudiantes", {
      method: "POST",
      body: JSON.stringify(estudianteData),
    })
  }

  async updateEstudiante(id: number, estudianteData: any) {
    return this.request(`/estudiantes/${id}`, {
      method: "PUT",
      body: JSON.stringify(estudianteData),
    })
  }

  async deleteEstudiante(id: number) {
    return this.request(`/estudiantes/${id}`, {
      method: "DELETE",
    })
  }

  // Métodos para rutas
  async getRutas(filters?: any) {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : ""
    return this.request(`/rutas${queryParams}`)
  }

  // Métodos para servicios
  async getServicios(estado?: string) {
    const queryParams = estado ? `?estado=${estado}` : ""
    return this.request(`/servicios${queryParams}`)
  }

  async updateServicio(id: number, data: any) {
    return this.request(`/servicios/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // Métodos para estadísticas
  async getDashboardStats() {
    return this.request("/dashboard/stats")
  }

  // Método para establecer token
  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  // Método para eliminar token
  removeToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  // Métodos para Mercado Pago
  async createMercadoPagoPreference(paymentData: any) {
    return this.request("/pagos/mercadopago", {
      method: "POST",
      body: JSON.stringify(paymentData),
    })
  }

  async getMercadoPagoPaymentStatus(preferenceId: string) {
    return this.request(`/pagos/mercadopago/${preferenceId}`)
  }
}

export const apiClient = new ApiClient()

