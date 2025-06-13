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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Shield,
  MapPin,
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
  CheckCircle,
  Info,
  Car,
  AlertCircle,
  X,
  CreditCard,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api"
import { MercadoPagoService } from "@/lib/mercadopago"

export default function DashboardPadre() {
  const { user, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [loadingFiltro, setLoadingFiltro] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  // Estados para datos
  const [stats, setStats] = useState<any>({})
  const [rutas, setRutas] = useState<any[]>([])
  const [estudiantes, setEstudiantes] = useState<any[]>([])
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])

  // Estado para detalles de servicio
  const [detalleServicioDialog, setDetalleServicioDialog] = useState(false)
  const [servicioSeleccionado, setServicioSeleccionado] = useState<any>(null)

  // Estados para evaluación
  const [evaluacionDialog, setEvaluacionDialog] = useState(false)
  const [evaluacionServicio, setEvaluacionServicio] = useState<any>(null)
  const [formEvaluacion, setFormEvaluacion] = useState({
    calificacion: 0,
    comentario: "",
    aspectos_evaluados: [] as string[],
  })

  // Estados para filtros
  const [filtroZona, setFiltroZona] = useState("")
  const [filtroColegio, setFiltroColegio] = useState("")
  const [filtroHorario, setFiltroHorario] = useState("")

  // Estados para solicitud
  const [solicitudDialog, setSolicitudDialog] = useState(false)
  const [rutaSeleccionada, setRutaSeleccionada] = useState<any>(null)
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState("")
  const [mensajeSolicitud, setMensajeSolicitud] = useState("")

  // Estados para gestión de estudiantes
  const [estudianteDialog, setEstudianteDialog] = useState(false)
  const [estudianteEditando, setEstudianteEditando] = useState<any>(null)
  const [formEstudiante, setFormEstudiante] = useState({
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    curso: "",
    colegio: "",
    direccion_colegio: "",
    necesidades_especiales: "",
    activa: true,
  })

  // Estados para pagos con Mercado Pago
  const [pagoDialog, setPagoDialog] = useState(false)
  const [solicitudPago, setSolicitudPago] = useState<any>(null)

  useEffect(() => {
    console.log("DashboardPadre useEffect - user:", user, "authLoading:", authLoading, "dashboardLoading:", dashboardLoading);
    
    // Esperar a que el contexto de autenticación termine de cargar
    if (authLoading) {
      return;
    }

    // Si no hay usuario o el tipo de usuario no es 'padre', redirigir
    if (!user || user.tipo_usuario !== "padre") {
      router.push("/login")
      return
    }
    
    // Si el usuario está autenticado como padre y el dashboard aún no ha cargado los datos,
    // entonces cargar los datos del dashboard.
    // Esto asegura que loadData se llame solo una vez y después de que el AuthContext esté listo.
    if (dashboardLoading) { // Solo cargar si dashboardLoading es true (estado inicial o después de un error)
      loadData()
    }
    
  }, [user, router, authLoading, dashboardLoading]) // Añadir dashboardLoading como dependencia

  const loadData = async () => {
    setDashboardLoading(true)
    try {
      // Cargar estadísticas
      const statsResponse = await apiClient.getDashboardStats()
      if (statsResponse.data) {
        setStats(statsResponse.data)
      }

      // Cargar rutas disponibles
      const rutasResponse = await apiClient.getRutas()
      if (rutasResponse.data) {
        setRutas(rutasResponse.data)
      }

      // Cargar estudiantes
      const estudiantesResponse = await apiClient.getEstudiantes()
      if (estudiantesResponse.data) {
        setEstudiantes(estudiantesResponse.data)
      }

      // Cargar solicitudes
      const solicitudesResponse = await apiClient.getSolicitudes()
      if (solicitudesResponse.data) {
        setSolicitudes(solicitudesResponse.data)
      }

      // Cargar servicios activos
      const serviciosResponse = await apiClient.getServicios()
      if (serviciosResponse.data) {
        setServicios(serviciosResponse.data)
      }
    } catch (error) {
      setError("Error al cargar los datos")
    } finally {
      setDashboardLoading(false)
    }
  }

  const aplicarFiltros = async () => {
    setLoadingFiltro(true)
    try {
      const filters: any = {}
      if (filtroZona) filters.origen = filtroZona
      if (filtroColegio) filters.colegio = filtroColegio

      const response = await apiClient.getRutas(filters)
      if (response.data) {
        setRutas(response.data)
      }
    } catch (error) {
      setError("Error al filtrar rutas")
    } finally {
      setLoadingFiltro(false)
    }
  }

  const enviarSolicitud = async () => {
    if (!rutaSeleccionada || !estudianteSeleccionado) {
      setError("Selecciona una ruta y un estudiante")
      return
    }

    try {
      console.log("User en enviarSolicitud:", user);
      console.log("Estudiante seleccionado (ID):", estudianteSeleccionado);
      console.log("Ruta seleccionada (ID):", rutaSeleccionada?.id);
      const response = await apiClient.createSolicitud({
        ruta_id: rutaSeleccionada.id,
        estudiante_id: Number.parseInt(estudianteSeleccionado),
        mensaje: mensajeSolicitud,
      })

      if (response.data) {
        setSuccess("Solicitud enviada exitosamente")
        setSolicitudDialog(false)
        setMensajeSolicitud("")
        setEstudianteSeleccionado("")
        setRutaSeleccionada(null)
        loadData()
      } else {
        setError(response.error || "Error al enviar solicitud")
      }
    } catch (error) {
      setError("Error al enviar solicitud")
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
        direccion_colegio: estudiante.direccion_colegio || "",
        necesidades_especiales: estudiante.necesidades_especiales || "",
        activa: estudiante.activa === 1,
      })
    } else {
      setEstudianteEditando(null)
      setFormEstudiante({
        nombre: "",
        apellido: "",
        fecha_nacimiento: "",
        curso: "",
        colegio: "",
        direccion_colegio: "",
        necesidades_especiales: "",
        activa: true,
      })
    }
    setEstudianteDialog(true)
  }

  const guardarEstudiante = async () => {
    if (
      !formEstudiante.nombre ||
      !formEstudiante.apellido ||
      !formEstudiante.fecha_nacimiento ||
      !formEstudiante.colegio
    ) {
      setError("Completa todos los campos requeridos")
      return
    }

    try {
      const estudianteData = {
        ...formEstudiante,
        activa: formEstudiante.activa ? 1 : 0,
      }

      let response
      if (estudianteEditando) {
        response = await apiClient.updateEstudiante(estudianteEditando.id, estudianteData)
      } else {
        response = await apiClient.createEstudiante(estudianteData)
      }

      if (response.data) {
        setSuccess(estudianteEditando ? "Estudiante actualizado exitosamente" : "Estudiante registrado exitosamente")
        setEstudianteDialog(false)
        loadData()
      } else {
        setError(response.error || "Error al guardar estudiante")
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
      const response = await apiClient.deleteEstudiante(estudianteId)
      if (response.data) {
        setSuccess("Estudiante eliminado exitosamente")
        loadData()
      } else {
        setError(response.error || "Error al eliminar estudiante")
      }
    } catch (error) {
      setError("Error al eliminar estudiante")
    }
  }

  const activarEstudiante = async (estudianteId: number) => {
    try {
      const response = await apiClient.updateEstudiante(estudianteId, { activo: 1 });
      if (response.data) {
        setSuccess("Estudiante activado exitosamente");
        loadData(); // Recargar los datos para reflejar el cambio
      } else {
        setError(response.error || "Error al activar estudiante");
      }
    } catch (error) {
      setError("Error al activar estudiante");
    }
  };

  const verDetallesServicio = (servicio: any) => {
    setServicioSeleccionado(servicio)
    setDetalleServicioDialog(true)
  }

  const desactivarServicio = async (servicioId: number) => {
    if (!confirm("¿Estás seguro de que quieres desactivar este servicio?")) {
      return
    }

    try {
      // Placeholder para la llamada a la API. Asume que apiClient tiene un método updateServicio
      // Necesitarás asegurarte de que tu backend maneje la desactivación de servicios.
      const response = await (apiClient as any).updateServicio(servicioId, { estado: "cancelado" }); // Cambiado a "cancelado"

      if (response.data) {
        setSuccess("Servicio desactivado exitosamente.")
        loadData()
      } else {
        setError(response.error || "Error al desactivar el servicio.")
      }
    } catch (error) {
      setError("Error al desactivar el servicio.")
      console.error("Error al desactivar servicio:", error)
    }
  }

  const cambiarEstadoServicio = async (servicioId: number, nuevoEstado: string) => {
    try {
      setDashboardLoading(true)
      const response = await apiClient.updateServicio(servicioId, { estado: nuevoEstado })

      if (response.data) {
        alert(`Servicio ${nuevoEstado} exitosamente`)
        loadData()
      } else {
        alert(response.error || "Error al cambiar el estado del servicio")
      }
    } catch (error) {
      alert("Error al cambiar el estado del servicio")
    } finally {
      setDashboardLoading(false)
    }
  }

  const abrirFormularioEvaluacion = (servicio: any) => {
    setEvaluacionServicio(servicio)
    setFormEvaluacion({
      calificacion: 0,
      comentario: "",
      aspectos_evaluados: [],
    })
    setEvaluacionDialog(true)
  }

  const handleEvaluacionChange = (field: string, value: any) => {
    setFormEvaluacion((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const toggleAspectoEvaluado = (aspecto: string) => {
    setFormEvaluacion((prev) => {
      const currentAspectos = prev.aspectos_evaluados
      if (currentAspectos.includes(aspecto)) {
        return {
          ...prev,
          aspectos_evaluados: currentAspectos.filter((a) => a !== aspecto),
        }
      } else {
        return {
          ...prev,
          aspectos_evaluados: [...currentAspectos, aspecto],
        }
      }
    })
  }

  const enviarEvaluacion = async () => {
    if (!evaluacionServicio || !formEvaluacion.calificacion) {
      setError("Por favor, selecciona una calificación.")
      return
    }

    try {
      const response = await apiClient.createEvaluacion({
        servicio_id: evaluacionServicio.id,
        evaluado_id: evaluacionServicio.conductor.id, // ID del usuario conductor
        calificacion: formEvaluacion.calificacion,
        comentario: formEvaluacion.comentario,
        aspectos_evaluados: formEvaluacion.aspectos_evaluados,
      })

      if (response.data) {
        alert("Evaluación enviada exitosamente.")
        setEvaluacionDialog(false)
        loadData()
      } else if (response.error && response.error.includes("ya ha sido evaluado")) {
        alert("Este servicio ya ha sido evaluado.")
        setEvaluacionDialog(false)
      } else {
        alert(response.error || "Error al enviar la evaluación.")
      }
    } catch (error) {
      console.error("Error enviando evaluación:", error)
      alert("Error interno del servidor al enviar la evaluación.")
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const clearMessages = () => {
    setError("")
    setSuccess("")
  }

  // Funciones para pagos con Mercado Pago
  const abrirFormularioPago = (solicitud: any) => {
    setSolicitudPago(solicitud)
    setPagoDialog(true)
  }

  const handlePaymentSuccess = (paymentData: any) => {
    setSuccess("¡Pago realizado exitosamente! Tu servicio ha sido activado.")
    setPagoDialog(false)
    loadData()
  }

  const handlePaymentError = (error: any) => {
    setError("Error al procesar el pago. Por favor, intenta nuevamente.")
    console.error("Payment error:", error)
  }

  const handlePaymentPending = (paymentData: any) => {
    setSuccess("Tu pago está siendo procesado. Te notificaremos cuando se confirme.")
    setPagoDialog(false)
  }

  const realizarPago = async (servicio: any) => {
    try {
      console.log("Iniciando realizarPago para servicio:", servicio)
      if (!servicio?.id || !servicio?.precio_acordado) {
        setError("No se puede procesar el pago: faltan datos del servicio (precio).")
        console.log("Error: Faltan datos del servicio (precio).")
        return
      }

      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        console.log("Error: Token de autenticación faltante.")
        return
      }

      console.log("Datos del servicio y token OK. Creando preferencia de pago...")
      const mercadoPago = MercadoPagoService.getInstance()
      const estudiante = servicio.estudiante || {}
      
      const paymentData = {
        solicitud_id: servicio.id,
        monto: servicio.precio_acordado,
        descripcion: `Pago de servicio de transporte - ${servicio.ruta?.nombre || 'Ruta'} - ${estudiante?.nombre || 'Estudiante'}!`,
        estudiante_nombre: estudiante?.nombre || 'Estudiante'
      }

      const preference = await mercadoPago.createPaymentPreference(paymentData)
      console.log("Preferencias de Mercado Pago obtenidas:", preference)
      if (!preference?.init_point && !preference?.sandbox_init_point) {
        throw new Error("No se pudo obtener la URL de pago")
      }
      console.log("Mercado Pago Preference:", preference)
      mercadoPago.openCheckout(preference)
    } catch (error: any) {
      console.error("Error en el proceso de pago:", error)
      setError(error instanceof Error ? error.message : String(error || "Error al procesar el pago. Por favor, intenta nuevamente."))
    }
  }

  if (dashboardLoading && !rutas.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header mejorado */}
      <header className="bg-white/90 backdrop-blur-xl shadow-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-75"></div>
                <div className="relative p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Furgón Seguro
                </h1>
                <p className="text-sm text-gray-600">Panel de Control Familiar</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-800">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-sm text-gray-500">Padre de Familia</p>
              </div>
              <Avatar className="h-12 w-12 ring-4 ring-purple-100">
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-lg font-bold">
                  {user?.nombre?.charAt(0)}
                  {user?.apellido?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-2 border-purple-200 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:border-transparent transition-all duration-300 transform hover:scale-105"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Alerts mejorados */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50/80 backdrop-blur-sm" variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={clearMessages} className="hover:bg-red-100">
                ✕
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50/80 backdrop-blur-sm">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-green-800">{success}</span>
              <Button variant="ghost" size="sm" onClick={clearMessages} className="hover:bg-green-100">
                ✕
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
        <div className="mb-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 p-8 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-3">¡Bienvenido de vuelta! 👋</h1>
              <p className="text-xl opacity-90 mb-6">
                Gestiona el transporte escolar de tus hijos de forma segura y confiable
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
                  <Shield className="h-5 w-5 mr-2" />
                  <span>100% Verificado</span>
                </div>
                <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
                  <Star className="h-5 w-5 mr-2" />
                  <span>Conductores Calificados</span>
                </div>
                <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>Seguimiento GPS</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Estudiantes</p>
                  <p className="text-3xl font-bold text-gray-900">{estudiantes.length}</p>
                  <p className="text-xs text-purple-600 font-medium">Registrados</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Servicios</p>
                  <p className="text-3xl font-bold text-gray-900">{servicios.length}</p>
                  <p className="text-xs text-emerald-600 font-medium">Activos</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Car className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-600/10"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Solicitudes</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {solicitudes.filter((s) => s.estado === "pendiente").length}
                  </p>
                  <p className="text-xs text-amber-600 font-medium">Pendientes</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Próximo</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.proximo_viaje || "07:30"}</p>
                  <p className="text-xs text-cyan-600 font-medium">Viaje</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="estudiantes" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-4xl grid-cols-4 bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg border-0">
              <TabsTrigger
                value="estudiantes"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Users className="h-4 w-4 mr-2" />
                Mis Estudiantes
              </TabsTrigger>
              <TabsTrigger
                value="servicios"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar Servicios
              </TabsTrigger>
              <TabsTrigger
                value="solicitudes"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Clock className="h-4 w-4 mr-2" />
                Mis Solicitudes
              </TabsTrigger>
              <TabsTrigger
                value="contratados"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Contratados
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab de Estudiantes */}
          <TabsContent value="estudiantes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Mis Estudiantes</h2>
              <Button
                onClick={() => abrirFormularioEstudiante()}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 hover:scale-105 transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Estudiante
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {estudiantes.length === 0 ? (
                <Card className="col-span-full border-0 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                      <GraduationCap className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes estudiantes registrados</h3>
                    <p className="text-gray-500 mb-6">Registra a tus hijos para comenzar a buscar rutas</p>
                    <Button
                      onClick={() => abrirFormularioEstudiante()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar Primer Estudiante
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                estudiantes.map((estudiante) => (
                  <Card key={estudiante.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-blue-600 rounded-full">
                            <GraduationCap className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {estudiante.nombre} {estudiante.apellido}
                            </h3>
                            <p className="text-sm text-gray-600">Colegio: {estudiante.colegio}</p>
                          </div>
                        </div>
                        <Badge variant={estudiante.activo ? "default" : "secondary"}>
                          {estudiante.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Fecha Nacimiento:</span>
                          <span className="font-medium">{estudiante.fecha_nacimiento}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Curso:</span>
                          <span className="font-medium">{estudiante.curso || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Necesidades:</span>
                          <span className="font-medium">
                            {estudiante.necesidades_especiales || "Ninguna"}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2 mt-4">
                        <Button size="sm" variant="outline" onClick={() => abrirFormularioEstudiante(estudiante)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => eliminarEstudiante(estudiante.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                        {!estudiante.activo && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => activarEstudiante(estudiante.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Activar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Dialog para agregar/editar estudiante */}
            <Dialog open={estudianteDialog} onOpenChange={setEstudianteDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{estudianteEditando ? "Editar Estudiante" : "Agregar Nuevo Estudiante"}</DialogTitle>
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
                        value={formEstudiante.nombre}
                        onChange={(e) => setFormEstudiante({ ...formEstudiante, nombre: e.target.value })}
                        placeholder="Nombre"
                      />
                    </div>
                    <div>
                      <Label htmlFor="apellido">Apellido *</Label>
                      <Input
                        id="apellido"
                        value={formEstudiante.apellido}
                        onChange={(e) => setFormEstudiante({ ...formEstudiante, apellido: e.target.value })}
                        placeholder="Apellido"
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
                      value={formEstudiante.curso}
                      onChange={(e) => setFormEstudiante({ ...formEstudiante, curso: e.target.value })}
                      placeholder="Ej: 8° Básico"
                    />
                  </div>

                  <div>
                    <Label htmlFor="colegio">Colegio *</Label>
                    <Input
                      id="colegio"
                      value={formEstudiante.colegio}
                      onChange={(e) => setFormEstudiante({ ...formEstudiante, colegio: e.target.value })}
                      placeholder="Nombre del colegio"
                    />
                  </div>

                  <div>
                    <Label htmlFor="direccion_colegio">Dirección del Colegio</Label>
                    <Input
                      id="direccion_colegio"
                      value={formEstudiante.direccion_colegio}
                      onChange={(e) => setFormEstudiante({ ...formEstudiante, direccion_colegio: e.target.value })}
                      placeholder="Dirección completa"
                    />
                  </div>

                  <div>
                    <Label htmlFor="necesidades_especiales">Necesidades Especiales</Label>
                    <Textarea
                      id="necesidades_especiales"
                      placeholder="Ej: Alergia al maní, requiere silla de ruedas, etc."
                      value={formEstudiante.necesidades_especiales}
                      onChange={(e) => setFormEstudiante({ ...formEstudiante, necesidades_especiales: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="estado_estudiante">Estado del Estudiante</Label>
                    <Select
                      value={formEstudiante.activa ? "true" : "false"}
                      onValueChange={(value) => setFormEstudiante({ ...formEstudiante, activa: value === "true" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Activo</SelectItem>
                        <SelectItem value="false">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={guardarEstudiante}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                    >
                      {estudianteEditando ? "Actualizar" : "Agregar"} Estudiante
                    </Button>
                    <Button variant="outline" onClick={() => setEstudianteDialog(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Tab de Buscar Servicios */}
          <TabsContent value="servicios" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Buscar Servicios</h2>
            </div>

            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <Label htmlFor="filtroZona">Zona</Label>
                    <Input
                      id="filtroZona"
                      value={filtroZona}
                      onChange={(e) => setFiltroZona(e.target.value)}
                      placeholder="Ej: Las Condes"
                    />
                  </div>
                  <div>
                    <Label htmlFor="filtroColegio">Colegio</Label>
                    <Input
                      id="filtroColegio"
                      value={filtroColegio}
                      onChange={(e) => setFiltroColegio(e.target.value)}
                      placeholder="Nombre del colegio"
                    />
                  </div>
                  <div>
                    <Label htmlFor="filtroHorario">Horario</Label>
                    <Input
                      id="filtroHorario"
                      value={filtroHorario}
                      onChange={(e) => setFiltroHorario(e.target.value)}
                      placeholder="Ej: Mañana"
                    />
                  </div>
                </div>

                <Button
                  onClick={aplicarFiltros}
                  disabled={loadingFiltro}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                >
                  {loadingFiltro ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Buscar Servicios
                </Button>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rutas.map((ruta) => (
                <Card
                  key={ruta.id}
                  className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-blue-100 text-blue-700">{ruta.tipo || "Regular"}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRutaSeleccionada(ruta)
                          setSolicitudDialog(true)
                        }}
                        disabled={estudiantes.length === 0}
                      >
                        {estudiantes.length === 0 ? "Sin estudiantes" : "Solicitar"}
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Zona</p>
                          <p className="text-base font-semibold">{ruta.origen}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <GraduationCap className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Colegio</p>
                          <p className="text-base font-semibold">{ruta.destino}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Horario</p>
                          <p className="text-base font-semibold">{ruta.horario}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Asientos Disponibles</p>
                          <p className="text-base font-semibold">{ruta.asientos_disponibles || 0}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Conductor</p>
                          <p className="text-base font-semibold">{ruta.conductor ? `${ruta.conductor.nombre} ${ruta.conductor.apellido}` : "Sin conductor asignado"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="solicitudes" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mis Solicitudes</h2>
            </div>

            {solicitudes.length === 0 ? (
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes</h3>
                  <p className="text-gray-500">Aún no has enviado ninguna solicitud de servicio</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {solicitudes.map((solicitud) => (
                  <Card
                    key={solicitud.id}
                    className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge
                          className={solicitud.estado === 'pendiente'
                            ? 'bg-yellow-100 text-yellow-700'
                            : solicitud.estado === 'aceptada'
                            ? 'bg-green-100 text-green-700'
                            : solicitud.estado === 'rechazada'
                            ? 'bg-red-100 text-red-700'
                            : ''
                          }
                        >
                          {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Car className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Ruta</p>
                            <p className="text-base font-semibold">{solicitud.ruta?.nombre}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <GraduationCap className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Estudiante</p>
                            <p className="text-base font-semibold">
                              {solicitud.estudiante?.nombre} {solicitud.estudiante?.apellido}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Fecha de Solicitud</p>
                            <p className="text-base font-semibold">
                              {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {solicitud.respuesta_conductor && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">{solicitud.respuesta_conductor}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contratados" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Servicios Contratados</h2>
            </div>

            {servicios.length === 0 ? (
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-8 text-center">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes servicios activos</h3>
                  <p className="text-gray-500">Busca y contrata servicios de transporte para tus estudiantes</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servicios.map((servicio) => (
                  <Card
                    key={servicio.id}
                    className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge 
                          className={`cursor-pointer ${servicio.estado === 'activo'
                            ? 'bg-green-100 text-green-700'
                            : servicio.estado === 'cancelado'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                          }`}
                          onClick={() => cambiarEstadoServicio(servicio.id, servicio.estado === 'activo' ? 'cancelado' : 'activo')}
                        >
                          {servicio.estado.charAt(0).toUpperCase() + servicio.estado.slice(1)}
                        </Badge>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => verDetallesServicio(servicio)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 transition-colors"
                          >
                            <Info className="h-4 w-4 mr-1" />
                            Detalles
                          </Button>
                          {servicio.estado === 'activo' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => abrirFormularioPago(servicio)}
                              type="button"
                              className="bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 border-green-200 hover:border-green-300 transition-colors relative z-10"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pagar
                            </Button>
                          )}
                          {servicio.estado === 'cancelado' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cambiarEstadoServicio(servicio.id, 'activo')}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Activar
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Car className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Ruta</p>
                            <p className="text-base font-semibold">{servicio.ruta?.nombre || "Ruta sin nombre"}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <GraduationCap className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Estudiante</p>
                            <p className="text-base font-semibold">
                              {estudiantes.find((e) => e.id === servicio.estudiante_id)?.nombre || "Estudiante"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Horario</p>
                            <p className="text-base font-semibold">
                              {new Date(servicio.fecha_inicio).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Star className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Conductor</p>
                            <p className="text-base font-semibold">
                              {servicio.conductor?.nombre} {servicio.conductor?.apellido}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => abrirFormularioEvaluacion(servicio)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Evaluar Conductor
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modal de Solicitud de Servicio - Exacto como en la imagen */}
        <Dialog open={solicitudDialog} onOpenChange={setSolicitudDialog}>
          <DialogContent className="max-w-md bg-white rounded-lg border-0 shadow-2xl p-0">
            {/* Header con botón X */}
            <div className="flex items-center justify-between p-6 pb-4">
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900 mb-1">
                  Solicitar Servicio de Transporte
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  Completa los datos para solicitar el servicio de{" "}
                  {rutaSeleccionada?.conductor?.usuario?.nombre || "Carlos"}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSolicitudDialog(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4 text-gray-500" />
              </Button>
            </div>

            <div className="px-6 pb-6 space-y-4">
              {/* Seleccionar Estudiante */}
              <div>
                <Label htmlFor="estudiante" className="text-sm font-medium text-gray-900 mb-2 block">
                  Seleccionar Estudiante
                </Label>
                <Select onValueChange={setEstudianteSeleccionado} value={estudianteSeleccionado}>
                  <SelectTrigger className="w-full h-11 border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
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

              {/* Mensaje opcional */}
              <div>
                <Label htmlFor="mensaje" className="text-sm font-medium text-gray-900 mb-2 block">
                  Mensaje (opcional)
                </Label>
                <Textarea
                  id="mensaje"
                  placeholder="Mensaje para el conductor..."
                  value={mensajeSolicitud}
                  onChange={(e) => setMensajeSolicitud(e.target.value)}
                  rows={4}
                  className="w-full border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none text-sm"
                />
              </div>

              {/* Botones */}
              <div className="flex space-x-3 pt-2">
                <Button
                  onClick={enviarSolicitud}
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
                  disabled={!estudianteSeleccionado}
                >
                  Enviar Solicitud
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSolicitudDialog(false)}
                  className="px-6 h-11 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-md transition-colors duration-200"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Dialog open={detalleServicioDialog} onOpenChange={setDetalleServicioDialog}>
        <DialogContent className="sm:max-w-[800px] p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold">Detalles del Servicio</DialogTitle>
            <DialogDescription className="text-base text-gray-600">Información completa del servicio contratado</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {servicioSeleccionado && (
              <div className="grid grid-cols-3 gap-8">
                {/* Columna 1: Información General */}
                <div className="space-y-5">
                  <h3 className="text-xl font-bold text-gray-900">Información General</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-gray-600">Estado:</Label>
                      <Badge className="text-sm px-3 py-1 bg-blue-100 text-blue-700">{servicioSeleccionado.estado || "Activo"}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-gray-600">Fecha de inicio:</Label>
                      <span className="text-sm font-semibold text-gray-900">{new Date(servicioSeleccionado.fecha_inicio).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-gray-600">Precio mensual:</Label>
                      <span className="text-sm font-semibold text-gray-900">${servicioSeleccionado.precio_acordado?.toLocaleString() || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-gray-600">Próximo pago:</Label>
                      <span className="text-sm font-semibold text-gray-900">{servicioSeleccionado.proximo_pago ? new Date(servicioSeleccionado.proximo_pago).toLocaleDateString() : "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Columna 2: Información del Estudiante */}
                <div className="space-y-5">
                  <h3 className="text-xl font-bold text-gray-900">Estudiante</h3>
                  {(() => {
                    const estudiante = estudiantes.find((e) => e.id === servicioSeleccionado.estudiante_id)
                    return estudiante ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium text-gray-600">Nombre:</Label>
                          <span className="text-sm font-semibold text-gray-900">{estudiante.nombre} {estudiante.apellido}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium text-gray-600">Curso:</Label>
                          <span className="text-sm font-semibold text-gray-900">{estudiante.curso || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium text-gray-600">Colegio:</Label>
                          <span className="text-sm font-semibold text-gray-900">{estudiante.colegio || "N/A"}</span>
                        </div>
                      </div>
                    ) : <p className="text-sm text-gray-500">Estudiante no encontrado</p>
                  })()}
                </div>

                {/* Columna 3: Detalles de la Ruta */}
                <div className="space-y-5">
                  <h3 className="text-xl font-bold text-gray-900">Detalles de la Ruta</h3>
                  {(() => {
                    const ruta = rutas.find((r) => r.id === servicioSeleccionado.ruta_id)
                    return ruta ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium text-gray-600">Ruta:</Label>
                          <span className="text-sm font-semibold text-gray-900">{ruta.origen} → {ruta.destino}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium text-gray-600">Vehículo:</Label>
                          <span className="text-sm font-semibold text-gray-900">{ruta.vehiculo?.patente || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium text-gray-600">Horarios:</Label>
                          <span className="text-sm font-semibold text-gray-900">Ida: {ruta.horario_ida || "N/A"} | Vuelta: {ruta.horario_vuelta || "N/A"}</span>
                        </div>
                      </div>
                    ) : <p className="text-sm text-gray-500">Ruta no encontrada</p>
                  })()}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Pago con Mercado Pago */}
      <Dialog open={pagoDialog} onOpenChange={setPagoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Realizar Pago con Mercado Pago</DialogTitle>
            <DialogDescription>
              Estás a punto de pagar el servicio para {solicitudPago?.estudiante_nombre} de ${solicitudPago?.monto?.toLocaleString()}. Serás redirigido a Mercado Pago para completar la transacción.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-700">Haz clic en "Continuar" para ser redirigido a la plataforma de pago de Mercado Pago.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setPagoDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => realizarPago(solicitudPago)} className="bg-blue-600 hover:bg-blue-700">
                Continuar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Evaluación de Conductor */}
      <Dialog open={evaluacionDialog} onOpenChange={setEvaluacionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Evaluar a {evaluacionServicio?.conductor?.nombre} {evaluacionServicio?.conductor?.apellido}</DialogTitle>
            <DialogDescription>Tu opinión es importante para mejorar la calidad del servicio.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="calificacion" className="mb-2 block">Calificación</Label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 cursor-pointer ${star <= formEvaluacion.calificacion ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    onClick={() => handleEvaluacionChange("calificacion", star)}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="comentario" className="mb-2 block">Comentario (opcional)</Label>
              <Textarea
                id="comentario"
                placeholder="Describe tu experiencia con el conductor..."
                value={formEvaluacion.comentario}
                onChange={(e) => handleEvaluacionChange("comentario", e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <Label className="mb-2 block">Aspectos a Evaluar</Label>
              <div className="flex flex-wrap gap-2">
                {[ "Puntualidad", "Seguridad", "Comunicación", "Amabilidad", "Limpieza del Vehículo", "Manejo Seguro", "Flexibilidad" ].map((aspecto) => (
                  <Badge
                    key={aspecto}
                    variant={formEvaluacion.aspectos_evaluados.includes(aspecto) ? 'default' : 'outline'}
                    className={`cursor-pointer ${formEvaluacion.aspectos_evaluados.includes(aspecto) ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                    onClick={() => toggleAspectoEvaluado(aspecto)}
                  >
                    {aspecto}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setEvaluacionDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={enviarEvaluacion}
                disabled={formEvaluacion.calificacion === 0}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                Enviar Evaluación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
