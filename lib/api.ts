const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
}

class ApiClient {
  private token: string | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  removeToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      Object.assign(headers, { Authorization: `Bearer ${this.token}` })
      console.log("APIClient Request - Adding Authorization header:", headers.Authorization);
    } else {
      console.log("APIClient Request - No Authorization header added. Token is null.");
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || "Error en la solicitud" }
      }

      return { data }
    } catch (error) {
      return { error: "Error de conexión" }
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: any) {
    return this.request<{ user: any; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  // Conductor endpoints
  async getConductorProfile() {
    return this.request<any>("/conductor/profile")
  }

  async getConductorRutas() {
    return this.request<any[]>("/conductor/rutas")
  }

  async verificarConductor() {
    return this.request<any>("/conductor/verificar", {
      method: "POST",
    })
  }

  // Rutas endpoints
  async getRutas(filters?: { origen?: string; destino?: string; colegio?: string }) {
    const params = new URLSearchParams()
    if (filters?.origen) params.append("origen", filters.origen)
    if (filters?.destino) params.append("destino", filters.destino)
    if (filters?.colegio) params.append("colegio", filters.colegio)

    const queryString = params.toString()
    return this.request<any[]>(`/rutas${queryString ? `?${queryString}` : ""}`)
  }

  async createRuta(rutaData: any) {
    return this.request<any>("/rutas", {
      method: "POST",
      body: JSON.stringify(rutaData),
    })
  }

  async updateRuta(id: number, rutaData: any) {
    return this.request<any>(`/rutas/${id}`, {
      method: "PUT",
      body: JSON.stringify(rutaData),
    })
  }

  async deleteRuta(id: number) {
    return this.request<any>(`/rutas/${id}`, {
      method: "DELETE",
    })
  }

  // Solicitudes endpoints
  async getSolicitudes(estado?: string) {
    const params = estado ? `?estado=${estado}` : ""
    return this.request<any[]>(`/solicitudes${params}`)
  }

  async createSolicitud(solicitudData: any) {
    return this.request<any>("/solicitudes", {
      method: "POST",
      body: JSON.stringify(solicitudData),
    })
  }

  async updateSolicitud(id: number, estado: string, respuesta?: string) {
    return this.request<any>(`/solicitudes/${id}`, {
      method: "PUT",
      body: JSON.stringify({ estado, respuesta_conductor: respuesta }),
    })
  }

  // Estudiantes endpoints
  async getEstudiantes() {
    return this.request<any[]>("/estudiantes")
  }

  async createEstudiante(estudianteData: any) {
    return this.request<any>("/estudiantes", {
      method: "POST",
      body: JSON.stringify(estudianteData),
    })
  }

  async updateEstudiante(id: number, estudianteData: any) {
    return this.request<any>(`/estudiantes/${id}`, {
      method: "PUT",
      body: JSON.stringify(estudianteData),
    })
  }

  async deleteEstudiante(id: number) {
    return this.request<any>(`/estudiantes/${id}`, {
      method: "DELETE",
    })
  }

  // Servicios endpoints
  async getServicios(estado?: string) {
    const params = estado ? `?estado=${estado}` : ""
    return this.request<any[]>(`/servicios${params}`)
  }

  async updateServicio(id: number, data: any) {
    return this.request<any>(`/servicios/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // Dashboard stats
  async getDashboardStats() {
    return this.request<any>("/dashboard/stats")
  }

  // Evaluaciones
  async createEvaluacion(evaluacionData: any) {
    return this.request<any>("/evaluaciones", {
      method: "POST",
      body: JSON.stringify(evaluacionData),
    })
  }

  // Vehículos
  async getVehiculos() {
    return this.request<any[]>("/vehiculos")
  }

  async createVehiculo(vehiculoData: any) {
    return this.request<any>("/vehiculos", {
      method: "POST",
      body: JSON.stringify(vehiculoData),
    })
  }

  async updateVehiculo(id: number, vehiculoData: any) {
    return this.request<any>(`/vehiculos/${id}`, {
      method: "PUT",
      body: JSON.stringify(vehiculoData),
    })
  }

  async deleteVehiculo(id: number) {
    return this.request<any>(`/vehiculos/${id}`, {
      method: "DELETE",
    })
  }

  // Mercado Pago
  async createMercadoPagoPreference(paymentData: any) {
    return this.request<any>("/pagos/mercadopago", {
      method: "POST",
      body: JSON.stringify(paymentData),
    })
  }

  async getMercadoPagoPaymentStatus(preferenceId: string) {
    return this.request<any>(`/pagos/mercadopago/status/${preferenceId}`);
  }
}

export const apiClient = new ApiClient()
