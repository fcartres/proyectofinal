"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api"

export default function DashboardPadre() {
  const { user, logout } = useAuth()
  const router = useRouter()
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
  })

  // Estados para pagos con Mercado Pago
  const [pagoDialog, setPagoDialog] = useState(false)
  const [solicitudPago, setSolicitudPago] = useState<any>(null)

  // Estado para detalles de servicio
  const [detalleServicioDialog, setDetalleServicioDialog] = useState(false)
  const [servicioSeleccionado, setServicioSeleccionado] = useState<any>(null)

  useEffect(() => {
    if (!user || user.tipo_usuario !== "padre") {
      router.push("/login")
      return
    }
    loadData()
  }, [user, router])

  const loadData = async () => {
    setLoading(true)
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
      const serviciosResponse = await apiClient.getServicios("activo")
      if (serviciosResponse.data) {
        setServicios(serviciosResponse.data)
      }
    } catch (error) {
      setError("Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = async () => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  const enviarSolicitud = async () => {
    if (!rutaSeleccionada || !estudianteSeleccionado) {
      setError("Selecciona una ruta y un estudiante")
      return
    }

    try {
      const response = await apiClient.createSolicitud({
        ruta_id: rutaSeleccionada.id,
        estudiante_id: Number.parseInt(estudianteSeleccionado),
        mensaje: mensajeSolicitud,
      })

      if (response.data) {
        setSuccess("Solicitud enviada exitosamente")
        setSolicitudDialog(false)
        setMensajeSolicitud("")
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
      let response
      if (estudianteEditando) {
        response = await apiClient.updateEstudiante(estudianteEditando.id, formEstudiante)
      } else {
        response = await apiClient.createEstudiante(formEstudiante)
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

  const verDetallesServicio = (servicio: any) => {
    setServicioSeleccionado(servicio)
    setDetalleServicioDialog(true)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const clearMessages = () => {
    setError("")
    setSuccess("")
  }

  if (loading && !rutas.length) {
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

            {estudiantes.length === 0 ? (
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-8 text-center">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes estudiantes registrados</h3>
                  <p className="text-gray-500 mb-4">Agrega a tus hijos para poder solicitar servicios de transporte</p>
                  <Button
                    onClick={() => abrirFormularioEstudiante()}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primer Estudiante
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {estudiantes.map((estudiante) => (
                  <Card
                    key={estudiante.id}
                    className="relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div className="relative">
                            <Avatar className="h-14 w-14 ring-4 ring-blue-100 group-hover:ring-purple-200 transition-all duration-300">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-bold">
                                {estudiante.nombre.charAt(0)}
                                {estudiante.apellido.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                              {estudiante.nombre} {estudiante.apellido}
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">{estudiante.curso}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => abrirFormularioEstudiante(estudiante)}
                            className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => eliminarEstudiante(estudiante.id)}
                            className="hover:bg-red-50 hover:border-red-300 transition-all duration-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-gray-50/80 rounded-xl">
                          <Calendar className="h-4 w-4 mr-3 text-blue-500" />
                          <span className="text-sm font-medium">
                            {new Date(estudiante.fecha_nacimiento).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50/80 rounded-xl">
                          <GraduationCap className="h-4 w-4 mr-3 text-purple-500" />
                          <span className="text-sm font-medium">{estudiante.colegio}</span>
                        </div>
                        {estudiante.necesidades_especiales && (
                          <div className="mt-3">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                              <Info className="h-3 w-3 mr-1" />
                              Necesidades Especiales
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

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
                      value={formEstudiante.necesidades_especiales}
                      onChange={(e) => setFormEstudiante({ ...formEstudiante, necesidades_especiales: e.target.value })}
                      placeholder="Describe cualquier necesidad especial..."
                      rows={3}
                    />
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

          {/* Resto de tabs simplificadas por espacio */}
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
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Servicios
                </Button>
              </CardContent>
            </Card>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rutas.map((ruta) => (
                <Card key={ruta.id} className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
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
                      >
                        Solicitar 
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
                        <Star className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Conductor</p>
                          <p className="text-base font-semibold">{ruta.conductor?.usuario?.nombre || "Conductor asignado"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="solicitudes" className="space-y-6">
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Mis Solicitudes</h3>
                <p className="text-gray-500">Lista de solicitudes enviadas</p>
              </CardContent>
            </Card>
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
                  <Card key={servicio.id} className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-green-100 text-green-700">Activo</Badge>
                        <Button variant="ghost" size="sm" onClick={() => verDetallesServicio(servicio)}>
                          <Info className="h-4 w-4" />
                        </Button>
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
                              {estudiantes.find(e => e.id === servicio.estudiante_id)?.nombre || "Estudiante"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Horario</p>
                            <p className="text-base font-semibold">
                              {new Date(servicio.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
