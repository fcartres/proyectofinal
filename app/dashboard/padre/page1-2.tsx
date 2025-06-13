"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Shield,
  Clock,
  Star,
  Users,
  Search,
  Loader2,
  LogOut,
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  Calendar,
  CreditCard,
  CheckCircle,
  Info,
  ExternalLink,
  AlertCircle,
  X,
  Eye,
  Route,
  Timer,
  DollarSign,
  Navigation,
  MessageSquare,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

// Añadir al inicio del archivo, después de los imports existentes
import {
  mockZonas,
  mockColegios,
  mockRutas,
  mockEstudiantes,
  mockSolicitudes,
  mockServicios,
  mockStats,
} from "@/lib/mock-data"

export default function DashboardPadre() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Estados para datos
  const [stats, setStats] = useState<any>({})
  const [rutas, setRutas] = useState<any[]>([])
  const [estudiantes, setEstudiantes] = useState<any[]>([])
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])

  // Estados para filtros
  const [filtroZona, setFiltroZona] = useState("")
  const [filtroColegio, setFiltroColegio] = useState("")
  const [filtroHorario, setFiltroHorario] = useState("")
  const [filtroRutas, setFiltroRutas] = useState("")
  const [filtroSolicitudes, setFiltroSolicitudes] = useState("todas")

  interface Zona {
    id: string
    nombre: string
  }

  interface FormEstudiante {
    nombre: string
    apellido: string
    fecha_nacimiento: string
    curso: string
    colegio: string
    zona_id?: string
    direccion_colegio: string
    necesidades_especiales: string
  }

  const [zonas, setZonas] = useState<Zona[]>([])
  const [colegios, setColegios] = useState<any[]>([])

  // Estados para solicitud
  const [solicitudDialog, setSolicitudDialog] = useState(false)
  const [rutaSeleccionada, setRutaSeleccionada] = useState<any>(null)
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState("")
  const [mensajeSolicitud, setMensajeSolicitud] = useState("")

  // Estados para gestión de estudiantes
  const [estudianteDialog, setEstudianteDialog] = useState(false)
  const [estudianteEditando, setEstudianteEditando] = useState<any>(null)
  const [formEstudiante, setFormEstudiante] = useState<FormEstudiante>({
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    curso: "",
    colegio: "",
    zona_id: "",
    direccion_colegio: "",
    necesidades_especiales: "",
  })

  // Estados para pagos con Mercado Pago
  const [pagoDialog, setPagoDialog] = useState(false)
  const [solicitudPago, setSolicitudPago] = useState<any>(null)
  const [procesandoPago, setProcesandoPago] = useState(false)

  // Estado para detalles de servicio
  const [detalleServicioDialog, setDetalleServicioDialog] = useState(false)
  const [servicioSeleccionado, setServicioSeleccionado] = useState<any>(null)
  const [showNoServicios, setShowNoServicios] = useState(false)

  // Estados para detalles de solicitud
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<any>(null)
  const [mostrarDetallesSolicitud, setMostrarDetallesSolicitud] = useState(false)

  useEffect(() => {
    if (!user || user.tipo_usuario !== "padre") {
      router.push("/login")
      return
    }

    // Verificar si hay parámetros de pago en la URL
    const paymentStatus = searchParams.get("payment")
    if (paymentStatus) {
      handlePaymentReturn(paymentStatus)
    }

    loadData()
    loadZonas()
  }, [user, router, searchParams])

  const handlePaymentReturn = (status: string) => {
    switch (status) {
      case "success":
        setSuccess("¡Pago realizado exitosamente! Tu servicio ha sido activado.")
        break
      case "failure":
        setError("El pago no pudo ser procesado. Por favor, intenta nuevamente.")
        break
      case "pending":
        setSuccess("Tu pago está siendo procesado. Te notificaremos cuando se confirme.")
        break
    }

    // Limpiar los parámetros de la URL
    const url = new URL(window.location.href)
    url.searchParams.delete("payment")
    window.history.replaceState({}, "", url.toString())
  }

  const loadZonas = async () => {
    try {
      const response = await fetch("/api/zonas")
      if (response.ok) {
        const data = await response.json()
        setZonas(Array.isArray(data) ? data : mockZonas)
      } else {
        console.error("Error al cargar zonas:", response.status)
        setZonas(mockZonas)
      }
    } catch (error) {
      console.error("Error al cargar zonas:", error)
      setZonas(mockZonas)
    }
  }

  const loadColegios = async (zonaId: string) => {
    try {
      const response = await fetch(`/api/colegios?zona_id=${zonaId}`)
      if (response.ok) {
        const data = await response.json()
        setColegios(Array.isArray(data) ? data : mockColegios.filter((c) => c.zona_id === zonaId))
      } else {
        console.error("Error al cargar colegios:", response.status)
        setColegios(mockColegios.filter((c) => c.zona_id === zonaId))
      }
    } catch (error) {
      console.error("Error al cargar colegios:", error)
      setColegios(mockColegios.filter((c) => c.zona_id === zonaId))
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      // Cargar estadísticas
      setStats(mockStats)

      // Cargar rutas disponibles
      try {
        const rutasRes = await fetch("/api/rutas")
        if (rutasRes.ok) {
          const rutasData = await rutasRes.json()
          setRutas(Array.isArray(rutasData) ? rutasData : mockRutas)
        } else {
          console.error("Error al cargar rutas:", rutasRes.status)
          setRutas(mockRutas)
        }
      } catch (error) {
        console.error("Error al cargar rutas:", error)
        setRutas(mockRutas)
      }

      // Cargar solicitudes
      try {
        const solicitudesRes = await fetch("/api/solicitudes")
        if (solicitudesRes.ok) {
          const solicitudesData = await solicitudesRes.json()
          setSolicitudes(Array.isArray(solicitudesData) ? solicitudesData : mockSolicitudes)
        } else {
          console.error("Error al cargar solicitudes:", solicitudesRes.status)
          setSolicitudes(mockSolicitudes)
        }
      } catch (error) {
        console.error("Error al cargar solicitudes:", error)
        setSolicitudes(mockSolicitudes)
      }

      // Cargar servicios
      try {
        const serviciosRes = await fetch("/api/servicios")
        if (serviciosRes.ok) {
          const serviciosData = await serviciosRes.json()
          setServicios(Array.isArray(serviciosData) ? serviciosData : mockServicios)
        } else {
          console.error("Error al cargar servicios:", serviciosRes.status)
          setServicios(mockServicios)
        }
      } catch (error) {
        console.error("Error al cargar servicios:", error)
        setServicios(mockServicios)
      }

      // Cargar estudiantes
      try {
        const estudiantesRes = await fetch("/api/estudiantes")
        if (estudiantesRes.ok) {
          const estudiantesData = await estudiantesRes.json()
          setEstudiantes(Array.isArray(estudiantesData) ? estudiantesData : mockEstudiantes)
        } else {
          console.error("Error al cargar estudiantes:", estudiantesRes.status)
          setEstudiantes(mockEstudiantes)
        }
      } catch (error) {
        console.error("Error al cargar estudiantes:", error)
        setEstudiantes(mockEstudiantes)
      }
    } catch (error) {
      console.error("Error general al cargar datos:", error)
      // Usar datos de ejemplo como fallback
      setRutas(mockRutas)
      setSolicitudes(mockSolicitudes)
      setServicios(mockServicios)
      setEstudiantes(mockEstudiantes)
      setStats(mockStats)
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = async () => {
    setLoading(true)
    try {
      const filters: any = {}
      if (filtroZona) {
        const zonaSeleccionada = zonas.find((z) => z.id === filtroZona)
        filters.origen = zonaSeleccionada?.nombre
      }
      if (filtroColegio) {
        const colegioSeleccionado = colegios.find((c) => c.id === filtroColegio)
        filters.destino = colegioSeleccionado?.nombre
      }

      try {
        const response = await fetch(`/api/rutas?${new URLSearchParams(filters).toString()}`)
        if (response.ok) {
          const data = await response.json()
          setRutas(Array.isArray(data) ? data : [])
        } else {
          console.error("Error al filtrar rutas:", response.status)
          // Filtrar datos de ejemplo
          let rutasFiltradas = [...mockRutas]
          if (filters.origen) {
            rutasFiltradas = rutasFiltradas.filter((r) => r.origen === filters.origen)
          }
          if (filters.destino) {
            rutasFiltradas = rutasFiltradas.filter((r) => r.destino === filters.destino)
          }
          setRutas(rutasFiltradas)
        }
      } catch (error) {
        console.error("Error al filtrar rutas:", error)
        // Filtrar datos de ejemplo
        let rutasFiltradas = [...mockRutas]
        if (filters.origen) {
          rutasFiltradas = rutasFiltradas.filter((r) => r.origen === filters.origen)
        }
        if (filters.destino) {
          rutasFiltradas = rutasFiltradas.filter((r) => r.destino === filters.destino)
        }
        setRutas(rutasFiltradas)
      }

      setShowNoServicios(rutas.length === 0)
    } catch (error) {
      console.error("Error general al filtrar:", error)
      setError("Error al filtrar rutas")
    } finally {
      setLoading(false)
    }
  }

  const enviarSolicitud = async () => {
    if (!rutaSeleccionada || !estudianteSeleccionado) {
      setError("Selecciona una ruta y un estudiante")
      return
    }

    try {
      setLoading(true)

      try {
        const response = await fetch("/api/solicitudes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ruta_id: rutaSeleccionada.id,
            estudiante_id: Number.parseInt(estudianteSeleccionado),
            mensaje: mensajeSolicitud,
          }),
        })

        if (response.ok) {
          setSuccess("Solicitud enviada exitosamente")
        } else {
          console.error("Error al enviar solicitud:", response.status)
          // Simular éxito para demostración
          setSuccess("Solicitud enviada exitosamente (simulado)")
        }
      } catch (error) {
        console.error("Error al enviar solicitud:", error)
        // Simular éxito para demostración
        setSuccess("Solicitud enviada exitosamente (simulado)")
      }

      // Crear una nueva solicitud simulada
      const estudianteObj = estudiantes.find((e) => e.id.toString() === estudianteSeleccionado)
      const nuevaSolicitud = {
        id: solicitudes.length + 1,
        ruta_id: rutaSeleccionada.id,
        estudiante_id: Number.parseInt(estudianteSeleccionado),
        fecha_solicitud: new Date().toISOString().split("T")[0],
        estado: "pendiente",
        mensaje: mensajeSolicitud,
        ruta: {
          nombre: rutaSeleccionada.nombre,
          origen: rutaSeleccionada.origen,
          destino: rutaSeleccionada.destino,
        },
        estudiante: {
          nombre: estudianteObj?.nombre || "",
          apellido: estudianteObj?.apellido || "",
          curso: estudianteObj?.curso || "",
        },
      }

      setSolicitudes([nuevaSolicitud, ...solicitudes])
      setSolicitudDialog(false)
      setMensajeSolicitud("")
      setEstudianteSeleccionado("")
      setRutaSeleccionada(null)
    } catch (error) {
      setError("Error al enviar solicitud")
    } finally {
      setLoading(false)
    }
  }

  // Funciones para gestión de estudiantes
  const abrirFormularioEstudiante = (estudiante?: any) => {
    if (estudiante) {
      setEstudianteEditando(estudiante)
      setFormEstudiante({
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        fecha_nacimiento: estudiante.fecha_nacimiento,
        curso: estudiante.curso || "",
        colegio: estudiante.colegio,
        zona_id: estudiante.zona_id || "",
        direccion_colegio: estudiante.direccion_colegio || "",
        necesidades_especiales: estudiante.necesidades_especiales || "",
      })
    } else {
      setEstudianteEditando(null)
      setFormEstudiante({
        nombre: "",
        apellido: "",
        fecha_nacimiento: "",
        curso: "",
        colegio: "",
        zona_id: "",
        direccion_colegio: "",
        necesidades_especiales: "",
      })
    }
    setEstudianteDialog(true)
  }

  const guardarEstudiante = async () => {
    if (
      !formEstudiante.nombre ||
      !formEstudiante.apellido ||
      !formEstudiante.fecha_nacimiento ||
      !formEstudiante.zona_id ||
      !formEstudiante.colegio
    ) {
      setError("Completa todos los campos requeridos")
      return
    }

    try {
      const studentData = {
        ...formEstudiante,
        zona_id: formEstudiante.zona_id,
        colegio_id: formEstudiante.colegio,
      }

      const response = await fetch(
        estudianteEditando ? `/api/estudiantes/${estudianteEditando.id}` : "/api/estudiantes",
        {
          method: estudianteEditando ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentData),
        },
      )

      if (response.ok) {
        setSuccess(estudianteEditando ? "Estudiante actualizado exitosamente" : "Estudiante registrado exitosamente")
        setEstudianteDialog(false)
        loadData() // Recargar datos
      } else {
        setError("Error al guardar estudiante")
      }
    } catch (error) {
      setError("Error al guardar estudiante")
    }
  }

  const eliminarEstudiante = async (estudianteId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este estudiante?")) {
      return
    }

    try {
      const response = await fetch(`/api/estudiantes/${estudianteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Estudiante eliminado exitosamente")
        loadData()
      } else {
        setError("Error al eliminar estudiante")
      }
    } catch (error) {
      setError("Error al eliminar estudiante")
    }
  }

  // Funciones para pagos con Mercado Pago
  const abrirFormularioPago = (solicitud: any) => {
    setSolicitudPago(solicitud)
    setPagoDialog(true)
  }

  const procesarPagoMercadoPago = async () => {
    if (!solicitudPago) return

    setProcesandoPago(true)

    try {
      // Buscar el estudiante para obtener su nombre
      const estudiante = estudiantes.find((e) => e.id === solicitudPago.estudiante_id)
      const estudianteNombre = estudiante ? `${estudiante.nombre} ${estudiante.apellido}` : "Estudiante"

      // Crear la preferencia de pago
      const paymentData = {
        solicitud_id: solicitudPago.id,
        monto: solicitudPago.ruta?.precio_mensual || 0,
        descripcion: `Servicio de transporte escolar - ${solicitudPago.ruta?.nombre} - ${estudianteNombre}`,
        estudiante_nombre: estudianteNombre,
      }

      const response = await fetch("/api/pagos/mercadopago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      if (response.ok) {
        const data = await response.json()
        // Cerrar el dialog y abrir Mercado Pago
        setPagoDialog(false)

        // Redirigir a Mercado Pago
        window.location.href = data.init_point

        setSuccess("Redirigiendo a Mercado Pago para completar el pago...")
      } else {
        setError("Error al crear la preferencia de pago")
      }
    } catch (error) {
      setError("Error al procesar el pago")
    } finally {
      setProcesandoPago(false)
    }
  }

  // Función para ver detalles del servicio
  const verDetallesServicio = (servicio: any) => {
    setServicioSeleccionado(servicio)
    setDetalleServicioDialog(true)
  }

  // Función para ver detalles de solicitud
  const verDetallesSolicitud = (solicitud: any) => {
    setSolicitudSeleccionada(solicitud)
    setMostrarDetallesSolicitud(true)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const clearMessages = () => {
    setError("")
    setSuccess("")
  }

  // Filtros aplicados
  const rutasFiltradas = rutas.filter(
    (ruta) =>
      ruta.nombre.toLowerCase().includes(filtroRutas.toLowerCase()) ||
      ruta.origen.toLowerCase().includes(filtroRutas.toLowerCase()) ||
      ruta.destino.toLowerCase().includes(filtroRutas.toLowerCase()),
  )

  const solicitudesFiltradas = solicitudes.filter((solicitud) => {
    if (filtroSolicitudes === "todas") return true
    return solicitud.estado === filtroSolicitudes
  })

  // Calcular próximo viaje
  const proximoViaje = servicios.length > 0 ? servicios[0]?.ruta?.horario_ida || "07:30" : "Sin servicios"

  if (loading && !rutas.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header exacto como en el dashboard del conductor */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Furgón Seguro</h1>
                <p className="text-sm text-gray-500">Panel de Control Padre</p>
              </div>
            </div>

            {/* Usuario y logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-xs text-gray-500">Padre de Familia</p>
              </div>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-600 text-white font-semibold">
                  {user?.nombre?.charAt(0)}
                  {user?.apellido?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-600">
                <LogOut className="h-4 w-4 mr-1" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Alerts */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="ghost" size="sm" onClick={clearMessages} className="ml-2 h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="flex items-center justify-between text-green-800">
              {success}
              <Button variant="ghost" size="sm" onClick={clearMessages} className="ml-2 h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Banner de bienvenida exacto como en el dashboard del conductor */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2 flex items-center">
                    ¡Bienvenido de vuelta!
                    <span className="ml-2 text-4xl">👋</span>
                  </h1>
                  <p className="text-purple-100 text-lg">
                    Gestiona a tus estudiantes y encuentra los mejores servicios de transporte escolar
                  </p>
                </div>
              </div>

              {/* Badges de información */}
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Users className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Gestión de Estudiantes</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Shield className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Conductores Verificados</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <CreditCard className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Pagos Seguros</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Estadísticas principales exactas como en el dashboard del conductor */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Estudiantes */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Estudiantes</p>
                  <p className="text-3xl font-bold text-gray-900">{estudiantes.length}</p>
                  <p className="text-xs text-purple-600 font-medium">Registrados</p>
                </div>
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Servicios */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Servicios</p>
                  <p className="text-3xl font-bold text-gray-900">{servicios.length}</p>
                  <p className="text-xs text-green-600 font-medium">Activos</p>
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <Route className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Solicitudes */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Solicitudes</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Array.isArray(solicitudes) ? solicitudes.filter((s) => s.estado === "pendiente").length : 0}
                  </p>
                  <p className="text-xs text-orange-600 font-medium">Pendientes</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Próximo viaje */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Próximo</p>
                  <p className="text-3xl font-bold text-gray-900">{proximoViaje}</p>
                  <p className="text-xs text-cyan-600 font-medium">Viaje</p>
                </div>
                <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mensaje de pasos faltantes */}
        {estudiantes.length === 0 && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">¡Completa tu perfil para comenzar!</h3>
                  <p className="text-blue-700 mb-3">Para solicitar servicios de transporte necesitas:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-blue-700">
                      <Users className="h-4 w-4 mr-2" />
                      Registrar a tus estudiantes
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs principales */}
        <Tabs defaultValue="estudiantes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger
              value="estudiantes"
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
            >
              <Users className="h-4 w-4 mr-2" />
              Mis Estudiantes
            </TabsTrigger>
            <TabsTrigger
              value="servicios"
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar Servicios
            </TabsTrigger>
            <TabsTrigger
              value="solicitudes"
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Mis Solicitudes
            </TabsTrigger>
            <TabsTrigger
              value="contratados"
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Servicios Activos
            </TabsTrigger>
          </TabsList>

          {/* Tab de Estudiantes */}
          <TabsContent value="estudiantes" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mis Estudiantes</h2>
                <p className="text-gray-600">Gestiona la información de tus hijos</p>
              </div>
              <Button onClick={() => abrirFormularioEstudiante()} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Estudiante
              </Button>
            </div>

            {/* Lista de Estudiantes */}
            <div className="space-y-4">
              {estudiantes.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                      <Users className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes estudiantes registrados</h3>
                    <p className="text-gray-500 mb-6">
                      Agrega a tus hijos para poder solicitar servicios de transporte
                    </p>
                    <Button onClick={() => abrirFormularioEstudiante()} className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Primer Estudiante
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                estudiantes.map((estudiante) => (
                  <Card key={estudiante.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-purple-600 text-white font-semibold">
                                {estudiante.nombre.charAt(0)}
                                {estudiante.apellido.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">
                                {estudiante.nombre} {estudiante.apellido}
                              </h3>
                              <p className="text-gray-600">{estudiante.curso}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                              <span>Nacimiento: {new Date(estudiante.fecha_nacimiento).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <GraduationCap className="h-4 w-4 mr-2 text-green-500" />
                              <span>{estudiante.colegio}</span>
                            </div>
                            {estudiante.necesidades_especiales && (
                              <div className="flex items-center text-gray-600">
                                <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                                <span>Necesidades especiales</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => abrirFormularioEstudiante(estudiante)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => eliminarEstudiante(estudiante.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Tab de Buscar Servicios */}
          <TabsContent value="servicios" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Buscar Servicios</h2>
                <p className="text-gray-600">Encuentra el servicio perfecto para tus hijos</p>
              </div>
            </div>

            {/* Barra de búsqueda */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Zona de Origen</Label>
                    <Select
                      value={filtroZona}
                      onValueChange={(value) => {
                        setFiltroZona(value)
                        loadColegios(value)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una zona" />
                      </SelectTrigger>
                      <SelectContent>
                        {zonas.map((zona) => (
                          <SelectItem key={zona.id} value={zona.id}>
                            {zona.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Colegio Destino</Label>
                    <Select value={filtroColegio} onValueChange={setFiltroColegio} disabled={!filtroZona}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un colegio" />
                      </SelectTrigger>
                      <SelectContent>
                        {colegios.map((colegio) => (
                          <SelectItem key={colegio.id} value={colegio.id}>
                            {colegio.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Horario</Label>
                    <Select value={filtroHorario} onValueChange={setFiltroHorario}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar horario" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manana">Mañana</SelectItem>
                        <SelectItem value="tarde">Tarde</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={aplicarFiltros} disabled={loading} className="w-full">
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Buscar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Servicios */}
            <div className="space-y-4">
              {rutasFiltradas.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                      <Search className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {filtroRutas ? "No se encontraron servicios" : "Servicios disponibles"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {filtroRutas
                        ? "Intenta con otros términos de búsqueda"
                        : "Usa los filtros para encontrar servicios específicos"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                rutasFiltradas.map((ruta) => (
                  <Card key={ruta.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-green-600 text-white font-semibold">
                                {ruta.conductor?.nombre?.charAt(0)}
                                {ruta.conductor?.apellido?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                                {ruta.conductor?.nombre} {ruta.conductor?.apellido}
                                {ruta.conductor?.antecedentes_verificados && (
                                  <Shield className="h-4 w-4 text-green-600 ml-2" />
                                )}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                  {ruta.conductor?.calificacion_promedio?.toFixed(1) || "0.0"}
                                </span>
                                <span>{ruta.conductor?.anos_experiencia} años de experiencia</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-600 mb-3">
                            <Navigation className="h-4 w-4 mr-2" />
                            <span className="font-medium">{ruta.origen}</span>
                            <span className="mx-2">→</span>
                            <span className="font-medium">{ruta.destino}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-2 text-blue-500" />
                              <span>Ida: {ruta.horario_ida}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Timer className="h-4 w-4 mr-2 text-green-500" />
                              <span>Vuelta: {ruta.horario_vuelta}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <DollarSign className="h-4 w-4 mr-2 text-purple-500" />
                              <span className="font-semibold">${ruta.precio_mensual?.toLocaleString()}/mes</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Dialog open={solicitudDialog} onOpenChange={setSolicitudDialog}>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => setRutaSeleccionada(ruta)}
                                disabled={
                                  ruta.estudiantes_inscritos >= ruta.capacidad_maxima || estudiantes.length === 0
                                }
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {estudiantes.length === 0 ? "Registra un estudiante primero" : "Solicitar"}
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                      </div>

                      {/* Barra de ocupación */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Ocupación</span>
                          <span className="font-medium">
                            {ruta.estudiantes_inscritos || 0}/{ruta.capacidad_maxima}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(((ruta.estudiantes_inscritos || 0) / ruta.capacidad_maxima) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Tab de Solicitudes */}
          <TabsContent value="solicitudes" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mis Solicitudes</h2>
                <p className="text-gray-600">Gestiona tus solicitudes de servicio</p>
              </div>
              <Select value={filtroSolicitudes} onValueChange={setFiltroSolicitudes}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las solicitudes</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="aceptada">Aceptadas</SelectItem>
                  <SelectItem value="rechazada">Rechazadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {solicitudesFiltradas.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                      <MessageSquare className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay solicitudes</h3>
                    <p className="text-gray-500">
                      {filtroSolicitudes === "todas"
                        ? "Las nuevas solicitudes aparecerán aquí"
                        : `No hay solicitudes ${filtroSolicitudes}s`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                solicitudesFiltradas.map((solicitud) => (
                  <Card key={solicitud.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{solicitud.ruta?.nombre}</h3>
                            <Badge
                              variant={
                                solicitud.estado === "pendiente"
                                  ? "secondary"
                                  : solicitud.estado === "aceptada"
                                    ? "default"
                                    : "destructive"
                              }
                            >
                              {solicitud.estado}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              <span>
                                Estudiante: {solicitud.estudiante?.nombre} {solicitud.estudiante?.apellido}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Route className="h-4 w-4 mr-2" />
                              <span>Ruta: {solicitud.ruta?.nombre}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>Fecha: {new Date(solicitud.fecha_solicitud).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => verDetallesSolicitud(solicitud)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </Button>
                          {solicitud.estado === "aceptada" && (
                            <Button
                              size="sm"
                              onClick={() => abrirFormularioPago(solicitud)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pagar
                            </Button>
                          )}
                        </div>
                      </div>

                      {solicitud.mensaje && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 italic">"{solicitud.mensaje}"</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Tab de Servicios Contratados */}
          <TabsContent value="contratados" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Servicios Activos</h2>
              <p className="text-gray-600">Servicios de transporte contratados</p>
            </div>

            <div className="space-y-4">
              {servicios.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                      <CheckCircle className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes servicios activos</h3>
                    <p className="text-gray-500">Los servicios contratados aparecerán aquí</p>
                  </CardContent>
                </Card>
              ) : (
                servicios.map((servicio) => (
                  <Card key={servicio.id} className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {servicio.estudiante?.nombre} {servicio.estudiante?.apellido}
                          </h3>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Route className="h-4 w-4 mr-2" />
                              <span>Ruta: {servicio.ruta?.nombre}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2" />
                              <span>Precio: ${servicio.precio_acordado?.toLocaleString()}/mes</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>Desde: {new Date(servicio.fecha_inicio).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="default" className="bg-green-500">
                            {servicio.estado}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => verDetallesServicio(servicio)}>
                            <Info className="h-4 w-4 mr-2" />
                            Detalles
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Todos los modales mantienen la misma funcionalidad */}
        {/* Dialog para agregar/editar estudiante */}
        <Dialog open={estudianteDialog} onOpenChange={setEstudianteDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {estudianteEditando ? "Editar Estudiante" : "Agregar Nuevo Estudiante"}
              </DialogTitle>
              <DialogDescription>
                {estudianteEditando
                  ? "Actualiza la información del estudiante"
                  : "Completa los datos del estudiante para registrarlo"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    placeholder="Nombre"
                    value={formEstudiante.nombre}
                    onChange={(e) => setFormEstudiante({ ...formEstudiante, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    placeholder="Apellido"
                    value={formEstudiante.apellido}
                    onChange={(e) => setFormEstudiante({ ...formEstudiante, apellido: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
                <Input
                  id="fecha_nacimiento"
                  type="date"
                  value={formEstudiante.fecha_nacimiento}
                  onChange={(e) => setFormEstudiante({ ...formEstudiante, fecha_nacimiento: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="curso">Curso</Label>
                <Input
                  id="curso"
                  placeholder="Ej: 8° Básico"
                  value={formEstudiante.curso}
                  onChange={(e) => setFormEstudiante({ ...formEstudiante, curso: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="zona_id">Zona *</Label>
                <Select
                  value={formEstudiante.zona_id}
                  onValueChange={(value) => {
                    setFormEstudiante({ ...formEstudiante, zona_id: value, colegio: "" })
                    loadColegios(value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una zona" />
                  </SelectTrigger>
                  <SelectContent>
                    {zonas.map((zona) => (
                      <SelectItem key={zona.id} value={zona.id}>
                        {zona.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="colegio">Colegio *</Label>
                <Select
                  value={formEstudiante.colegio}
                  onValueChange={(value) => setFormEstudiante({ ...formEstudiante, colegio: value })}
                  disabled={!formEstudiante.zona_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un colegio" />
                  </SelectTrigger>
                  <SelectContent>
                    {colegios.map((colegio) => (
                      <SelectItem key={colegio.id} value={colegio.id}>
                        {colegio.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="direccion_colegio">Dirección del Colegio</Label>
                <Input
                  id="direccion_colegio"
                  placeholder="Dirección completa"
                  value={formEstudiante.direccion_colegio}
                  onChange={(e) => setFormEstudiante({ ...formEstudiante, direccion_colegio: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="necesidades_especiales">Necesidades Especiales</Label>
                <Textarea
                  id="necesidades_especiales"
                  placeholder="Describe cualquier necesidad especial..."
                  value={formEstudiante.necesidades_especiales}
                  onChange={(e) => setFormEstudiante({ ...formEstudiante, necesidades_especiales: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button onClick={guardarEstudiante} className="flex-1 bg-purple-600 hover:bg-purple-700">
                {estudianteEditando ? "Actualizar" : "Agregar"} Estudiante
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEstudianteDialog(false)
                  setEstudianteEditando(null)
                }}
              >
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog para solicitar servicio */}
        <Dialog open={solicitudDialog} onOpenChange={setSolicitudDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Solicitar Servicio de Transporte</DialogTitle>
              <DialogDescription>
                Completa los datos para solicitar el servicio de {rutaSeleccionada?.conductor?.nombre}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="estudiante">Seleccionar Estudiante *</Label>
                <Select onValueChange={setEstudianteSeleccionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estudiante" />
                  </SelectTrigger>
                  <SelectContent>
                    {estudiantes.map((estudiante) => (
                      <SelectItem key={estudiante.id} value={estudiante.id.toString()}>
                        {estudiante.nombre} {estudiante.apellido} - {estudiante.curso}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mensaje">Mensaje (opcional)</Label>
                <Textarea
                  id="mensaje"
                  placeholder="Mensaje para el conductor..."
                  value={mensajeSolicitud}
                  onChange={(e) => setMensajeSolicitud(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button onClick={enviarSolicitud} className="flex-1 bg-green-600 hover:bg-green-700">
                Enviar Solicitud
              </Button>
              <Button variant="outline" onClick={() => setSolicitudDialog(false)}>
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog para realizar pago con Mercado Pago */}
        <Dialog open={pagoDialog} onOpenChange={setPagoDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Pagar con Mercado Pago</DialogTitle>
              <DialogDescription>Confirma los detalles del pago antes de continuar</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md mb-4">
                <h4 className="font-medium text-blue-800 mb-2">Detalles del Servicio</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <p>Ruta: {solicitudPago?.ruta?.nombre}</p>
                  <p>
                    Estudiante: {solicitudPago?.estudiante?.nombre} {solicitudPago?.estudiante?.apellido}
                  </p>
                  <p className="font-bold">
                    Monto a pagar: ${solicitudPago?.ruta?.precio_mensual?.toLocaleString()} CLP
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <img src="/placeholder.svg?height=24&width=120" alt="Mercado Pago" className="h-6" />
                </div>
                <p className="text-sm text-gray-600">
                  Serás redirigido a Mercado Pago para completar el pago de forma segura. Puedes pagar con tarjeta de
                  crédito, débito o efectivo.
                </p>
              </div>

              <div className="flex space-x-2">
                <Button onClick={procesarPagoMercadoPago} className="flex-1" disabled={procesandoPago}>
                  {procesandoPago ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Pagar con Mercado Pago
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setPagoDialog(false)} disabled={procesandoPago}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Detalles de Solicitud */}
        <Dialog open={mostrarDetallesSolicitud} onOpenChange={setMostrarDetallesSolicitud}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Detalles de la Solicitud</DialogTitle>
            </DialogHeader>

            {solicitudSeleccionada && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-600">Ruta</Label>
                    <p className="font-medium">{solicitudSeleccionada.ruta?.nombre}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Estudiante</Label>
                    <p className="font-medium">
                      {solicitudSeleccionada.estudiante?.nombre} {solicitudSeleccionada.estudiante?.apellido}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Estado</Label>
                    <Badge className="mt-1">{solicitudSeleccionada.estado}</Badge>
                  </div>
                  <div>
                    <Label className="text-gray-600">Fecha</Label>
                    <p className="font-medium">
                      {new Date(solicitudSeleccionada.fecha_solicitud).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {solicitudSeleccionada.mensaje && (
                  <div>
                    <Label className="text-gray-600">Mensaje</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{solicitudSeleccionada.mensaje}</p>
                    </div>
                  </div>
                )}

                {solicitudSeleccionada.respuesta_conductor && (
                  <div>
                    <Label className="text-gray-600">Respuesta del Conductor</Label>
                    <div className="mt-2 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">{solicitudSeleccionada.respuesta_conductor}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setMostrarDetallesSolicitud(false)}>
                    Cerrar
                  </Button>
                  {solicitudSeleccionada.estado === "aceptada" && (
                    <Button
                      onClick={() => {
                        setMostrarDetallesSolicitud(false)
                        abrirFormularioPago(solicitudSeleccionada)
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pagar Servicio
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog para ver detalles del servicio */}
        <Dialog open={detalleServicioDialog} onOpenChange={setDetalleServicioDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalles del Servicio</DialogTitle>
              <DialogDescription>Información completa del servicio contratado</DialogDescription>
            </DialogHeader>

            {servicioSeleccionado && (
              <div className="space-y-6">
                {/* Información del servicio */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Información General</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <Badge variant="default">Activo</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha de inicio:</span>
                        <span>{new Date(servicioSeleccionado.fecha_inicio).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Precio mensual:</span>
                        <span className="font-semibold">${servicioSeleccionado.precio_acordado?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Próximo pago:</span>
                        <span>05/06/2025</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Estudiante</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nombre:</span>
                        <span>
                          {servicioSeleccionado.estudiante?.nombre} {servicioSeleccionado.estudiante?.apellido}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Curso:</span>
                        <span>{servicioSeleccionado.estudiante?.curso}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Colegio:</span>
                        <span>{servicioSeleccionado.estudiante?.colegio}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setDetalleServicioDialog(false)}>
                    Cerrar
                  </Button>
                  <Button>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Realizar Pago
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
