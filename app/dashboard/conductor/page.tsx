"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Shield,
  Clock,
  Star,
  Users,
  Plus,
  Car,
  DollarSign,
  Edit,
  Trash2,
  Check,
  X,
  MessageSquare,
  Loader2,
  LogOut,
  Route,
  Calendar,
  Phone,
  Navigation,
  Timer,
  Search,
  Eye,
  UserCheck,
  AlertCircle,
  CheckCircle,
  MapPin,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api"

export default function DashboardConductor() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Estados para datos del conductor
  const [conductorData, setConductorData] = useState<any>(null)
  const [stats, setStats] = useState<any>({})
  const [rutasActivas, setRutasActivas] = useState<any[]>([])
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<any[]>([])
  const [vehiculos, setVehiculos] = useState<any[]>([])
  const [serviciosActivos, setServiciosActivos] = useState<any[]>([])

  // Estados para formularios
  const [mostrarFormularioRuta, setMostrarFormularioRuta] = useState(false)
  const [mostrarFormularioVehiculo, setMostrarFormularioVehiculo] = useState(false)
  const [rutaEditando, setRutaEditando] = useState<any>(null)
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<any>(null)
  const [mostrarDetallesSolicitud, setMostrarDetallesSolicitud] = useState(false)

  // Estados de filtros
  const [filtroRutas, setFiltroRutas] = useState("")
  const [filtroSolicitudes, setFiltroSolicitudes] = useState("todas")

  // Formulario de ruta
  const [formRuta, setFormRuta] = useState({
    nombre: "",
    origen: "",
    destino: "",
    colegio_destino: "",
    horario_ida: "07:30",
    horario_vuelta: "17:00",
    precio_mensual: "",
    capacidad_maxima: "",
    descripcion: "",
    dias_servicio: "lunes-viernes",
    activa: true,
  })

  // Formulario de vehículo
  const [formVehiculo, setFormVehiculo] = useState({
    marca: "",
    modelo: "",
    ano: "",
    patente: "",
    color: "",
    capacidad_maxima: "",
    tipo_vehiculo: "Furgón",
  })

  useEffect(() => {
    // Originalmente aquí había una redirección temprana que se eliminó
    // para evitar conflictos con el estado de carga del AuthContext.
    // La lógica de redirección ahora se maneja después del bloque de carga inicial.
    loadData()
  }, [user, router])

  console.log("DashboardConductor - user:", user, "loading:", loading);

  const loadData = async () => {
    setLoading(true)
    try {
      // Cargar datos del conductor actual
      const conductorResponse = await apiClient.getConductorProfile()
      if (conductorResponse.data) {
        setConductorData(conductorResponse.data)
      }

      // Cargar estadísticas
      const statsResponse = await apiClient.getDashboardStats()
      if (statsResponse.data) {
        setStats(statsResponse.data)
      }

      // Cargar rutas del conductor
      const rutasResponse = await apiClient.getConductorRutas()
      if (rutasResponse.data) {
        setRutasActivas(rutasResponse.data)
      }

      // Cargar solicitudes pendientes
      const solicitudesResponse = await apiClient.getSolicitudes("pendiente")
      if (solicitudesResponse.data) {
        setSolicitudesPendientes(solicitudesResponse.data)
      }

      // Cargar vehículos
      const vehiculosResponse = await apiClient.getVehiculos()
      if (vehiculosResponse.data) {
        setVehiculos(vehiculosResponse.data)
      }

      // Cargar servicios activos
      const serviciosResponse = await apiClient.getServicios("activo")
      if (serviciosResponse.data) {
        setServiciosActivos(serviciosResponse.data)
      }
    } catch (error) {
      // No mostrar error aquí, solo cargar lo que se pueda
    } finally {
      setLoading(false)
    }
  }

  const crearRuta = async () => {
    if (
      !formRuta.nombre ||
      !formRuta.origen ||
      !formRuta.destino ||
      !formRuta.colegio_destino ||
      !formRuta.precio_mensual ||
      !formRuta.capacidad_maxima
    ) {
      setError("Completa todos los campos requeridos")
      return
    }

    try {
      const rutaData = {
        ...formRuta,
        precio_mensual: Number.parseInt(formRuta.precio_mensual),
        capacidad_maxima: Number.parseInt(formRuta.capacidad_maxima),
        activa: formRuta.activa ? 1 : 0,
      }

      let response
      if (rutaEditando) {
        response = await apiClient.updateRuta(rutaEditando.id, rutaData)
      } else {
        response = await apiClient.createRuta(rutaData)
      }

      if (response.data) {
        setSuccess(rutaEditando ? "Ruta actualizada exitosamente" : "Ruta creada exitosamente")
        setMostrarFormularioRuta(false)
        setRutaEditando(null)
        resetFormRuta()

        if (!rutaEditando) {
          setRutasActivas((prev) => [...prev, response.data.ruta])
        } else {
          setRutasActivas((prev) => prev.map((ruta) => (ruta.id === rutaEditando.id ? response.data.ruta : ruta)))
        }
      } else {
        setError(response.error || "Error al guardar la ruta")
      }
    } catch (error) {
      setError("Error al guardar la ruta")
    }
  }

  const crearVehiculo = async () => {
    if (
      !formVehiculo.marca ||
      !formVehiculo.modelo ||
      !formVehiculo.ano ||
      !formVehiculo.patente ||
      !formVehiculo.capacidad_maxima
    ) {
      setError("Completa todos los campos requeridos del vehículo")
      return
    }

    try {
      const vehiculoData = {
        ...formVehiculo,
        ano: Number.parseInt(formVehiculo.ano),
        capacidad_maxima: Number.parseInt(formVehiculo.capacidad_maxima),
      }

      const response = await apiClient.createVehiculo(vehiculoData)

      if (response.data) {
        setSuccess("Vehículo registrado exitosamente")
        setMostrarFormularioVehiculo(false)
        resetFormVehiculo()
        setVehiculos((prev) => [...prev, response.data.vehiculo])
        verificarConductor()
      } else {
        setError(response.error || "Error al registrar el vehículo")
      }
    } catch (error) {
      setError("Error al registrar el vehículo")
    }
  }

  const responderSolicitud = async (solicitudId: number, estado: "aceptada" | "rechazada", respuesta?: string) => {
    try {
      const response = await apiClient.updateSolicitud(solicitudId, estado, respuesta)

      if (response.data) {
        setSuccess(`Solicitud ${estado} exitosamente`)
        loadData()
        setMostrarDetallesSolicitud(false)
      } else {
        setError(response.error || "Error al responder la solicitud")
      }
    } catch (error) {
      setError("Error al responder la solicitud")
    }
  }

  const editarRuta = (ruta: any) => {
    setRutaEditando(ruta)
    setFormRuta({
      nombre: ruta.nombre,
      origen: ruta.origen,
      destino: ruta.destino,
      colegio_destino: ruta.colegio_destino,
      horario_ida: ruta.horario_ida,
      horario_vuelta: ruta.horario_vuelta,
      precio_mensual: ruta.precio_mensual.toString(),
      capacidad_maxima: ruta.capacidad_maxima.toString(),
      descripcion: ruta.descripcion || "",
      dias_servicio: ruta.dias_servicio || "lunes-viernes",
      activa: ruta.activa === 1,
    })
    setMostrarFormularioRuta(true)
  }

  const eliminarRuta = async (rutaId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta ruta?")) {
      return
    }

    try {
      const response = await apiClient.deleteRuta(rutaId)
      if (response.data) {
        setSuccess("Ruta eliminada exitosamente")
        loadData()
      } else {
        setError(response.error || "Error al eliminar la ruta")
      }
    } catch (error) {
      setError("Error al eliminar la ruta")
    }
  }

  const resetFormRuta = () => {
    setFormRuta({
      nombre: "",
      origen: "",
      destino: "",
      colegio_destino: "",
      horario_ida: "07:30",
      horario_vuelta: "17:00",
      precio_mensual: "",
      capacidad_maxima: "",
      descripcion: "",
      dias_servicio: "lunes-viernes",
      activa: true,
    })
  }

  const resetFormVehiculo = () => {
    setFormVehiculo({
      marca: "",
      modelo: "",
      ano: "",
      patente: "",
      color: "",
      capacidad_maxima: "",
      tipo_vehiculo: "Furgón",
    })
  }

  const verificarConductor = async () => {
    try {
      const response = await apiClient.verificarConductor()

      if (response.data) {
        setSuccess("¡Tu cuenta ha sido verificada! Ya puedes comenzar a ofrecer servicios.")

        if (!conductorData) {
          setConductorData({
            estado: "verificado",
            antecedentes_verificados: true,
            calificacion_promedio: 0,
            total_viajes: 0,
            anos_experiencia: 0,
          })
        } else {
          setConductorData({
            ...conductorData,
            estado: "verificado",
            antecedentes_verificados: true,
          })
        }
      }
    } catch (error) {
      console.error("Error al verificar conductor:", error)
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

  const verDetallesSolicitud = (solicitud: any) => {
    setSolicitudSeleccionada(solicitud)
    setMostrarDetallesSolicitud(true)
  }

  const rutasFiltradas = rutasActivas.filter(
    (ruta) =>
      ruta.nombre.toLowerCase().includes(filtroRutas.toLowerCase()) ||
      ruta.origen.toLowerCase().includes(filtroRutas.toLowerCase()) ||
      ruta.destino.toLowerCase().includes(filtroRutas.toLowerCase()),
  )

  const solicitudesFiltradas = solicitudesPendientes.filter((solicitud) => {
    if (filtroSolicitudes === "todas") return true
    return solicitud.estado === filtroSolicitudes
  })

  // Calcular próximo viaje
  const proximoViaje = rutasActivas.length > 0 ? rutasActivas[0]?.horario_ida || "07:30" : "Sin rutas"

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  // Aquí se maneja la redirección después de que la carga ha terminado
  if (!user || user.tipo_usuario !== "conductor") {
    router.push("/login")
    return null; // Devolver null o un componente de carga vacío para evitar renderizado antes de la redirección
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header exacto como en la imagen */}
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
                <p className="text-sm text-gray-500">Panel de Control Conductor</p>
              </div>
            </div>

            {/* Usuario y logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {conductorData?.nombre} {conductorData?.apellido}
                </p>
                <p className="text-xs text-gray-500">Conductor Profesional</p>
                {conductorData?.calificacion_promedio !== undefined && conductorData.calificacion_promedio !== null ? (
                  <div className="flex items-center justify-end text-yellow-500 mt-1">
                    <Star className="h-4 w-4 fill-yellow-500 mr-1" />
                    <span className="font-semibold text-gray-800 text-sm">
                      {conductorData.calificacion_promedio.toFixed(1)}
                    </span>
                    <span className="text-gray-500 text-sm">/5.0</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-end text-gray-500 mt-1">
                    <Star className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="font-semibold text-gray-600 text-sm">Sin calificación</span>
                  </div>
                )}
              </div>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-600 text-white font-semibold">
                  {conductorData?.nombre?.charAt(0)}
                  {conductorData?.apellido?.charAt(0)}
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

        {/* Banner de bienvenida exacto como en la imagen */}
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
                    Gestiona tus rutas y servicios de transporte escolar de forma profesional
                  </p>
                </div>
              </div>

              {/* Badges de verificación */}
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Shield className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">
                    {conductorData?.antecedentes_verificados ? "100% Verificado" : "Verificación Pendiente"}
                  </span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Star className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Conductor Calificado</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Seguimiento GPS</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Estadísticas principales exactas como en la imagen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Rutas */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Rutas</p>
                  <p className="text-3xl font-bold text-gray-900">{rutasActivas.length}</p>
                  <p className="text-xs text-purple-600 font-medium">Activas</p>
                </div>
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Route className="h-6 w-6 text-white" />
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
                  <p className="text-3xl font-bold text-gray-900">{serviciosActivos.length}</p>
                  <p className="text-xs text-green-600 font-medium">Activos</p>
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <Car className="h-6 w-6 text-white" />
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
                  <p className="text-3xl font-bold text-gray-900">{solicitudesPendientes.length}</p>
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
        {(vehiculos.length === 0 || rutasActivas.length === 0) && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">¡Completa tu perfil para comenzar!</h3>
                  <p className="text-blue-700 mb-3">Para ofrecer servicios de transporte necesitas:</p>
                  <ul className="space-y-2">
                    {vehiculos.length === 0 && (
                      <li className="flex items-center text-blue-700">
                        <Car className="h-4 w-4 mr-2" />
                        Registrar tu vehículo
                      </li>
                    )}
                    {rutasActivas.length === 0 && (
                      <li className="flex items-center text-blue-700">
                        <Route className="h-4 w-4 mr-2" />
                        Crear una ruta de transporte
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs principales */}
        <Tabs defaultValue="rutas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="rutas" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
              <Route className="h-4 w-4 mr-2" />
              Mis Rutas
            </TabsTrigger>
            <TabsTrigger
              value="solicitudes"
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Solicitudes
            </TabsTrigger>
            <TabsTrigger
              value="vehiculos"
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
            >
              <Car className="h-4 w-4 mr-2" />
              Vehículos
            </TabsTrigger>
            <TabsTrigger
              value="servicios"
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Servicios
            </TabsTrigger>
          </TabsList>

          {/* Tab de Rutas */}
          <TabsContent value="rutas" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mis Rutas</h2>
                <p className="text-gray-600">Gestiona tus rutas de transporte escolar</p>
              </div>
              <Button onClick={() => setMostrarFormularioRuta(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Ruta
              </Button>
            </div>

            {/* Barra de búsqueda */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar rutas por nombre, origen o destino..."
                    value={filtroRutas}
                    onChange={(e) => setFiltroRutas(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Lista de Rutas */}
            <div className="space-y-4">
              {rutasFiltradas.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                      <Route className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {filtroRutas ? "No se encontraron rutas" : "No tienes rutas creadas"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {filtroRutas
                        ? "Intenta con otros términos de búsqueda"
                        : "Crea tu primera ruta para comenzar a ofrecer servicios"}
                    </p>
                    {!filtroRutas && (
                      <Button
                        onClick={() => setMostrarFormularioRuta(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Primera Ruta
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                rutasFiltradas.map((ruta) => (
                  <Card key={ruta.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{ruta.nombre}</h3>
                            <Badge variant={ruta.activa ? "default" : "secondary"}>
                              {ruta.activa ? "Activa" : "Inactiva"}
                            </Badge>
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
                          <Button variant="outline" size="sm" onClick={() => editarRuta(ruta)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => eliminarRuta(ruta.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                <h2 className="text-2xl font-bold text-gray-900">Solicitudes</h2>
                <p className="text-gray-600">Gestiona las solicitudes de servicio</p>
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
                            <h3 className="text-lg font-semibold text-gray-900">
                              {solicitud.padre?.nombre} {solicitud.padre?.apellido}
                            </h3>
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
                            {solicitud.padre?.telefono && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2" />
                                <span>{solicitud.padre.telefono}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => verDetallesSolicitud(solicitud)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Button>
                      </div>

                      {solicitud.mensaje && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 italic">"{solicitud.mensaje}"</p>
                        </div>
                      )}

                      {solicitud.estado === "pendiente" && (
                        <div className="flex space-x-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => responderSolicitud(solicitud.id, "aceptada")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Aceptar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => responderSolicitud(solicitud.id, "rechazada")}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Tab de Vehículos */}
          <TabsContent value="vehiculos" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mis Vehículos</h2>
                <p className="text-gray-600">Gestiona tu flota de vehículos</p>
              </div>
              <Button onClick={() => setMostrarFormularioVehiculo(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Vehículo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehiculos.length === 0 ? (
                <Card className="col-span-full border-0 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                      <Car className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes vehículos registrados</h3>
                    <p className="text-gray-500 mb-6">Registra tu vehículo para poder crear rutas</p>
                    <Button
                      onClick={() => setMostrarFormularioVehiculo(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar Primer Vehículo
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                vehiculos.map((vehiculo) => (
                  <Card key={vehiculo.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-green-600 rounded-full">
                            <Car className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {vehiculo.marca} {vehiculo.modelo}
                            </h3>
                            <p className="text-sm text-gray-600">Patente: {vehiculo.patente}</p>
                          </div>
                        </div>
                        <Badge variant={vehiculo.activo ? "default" : "secondary"}>
                          {vehiculo.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Año:</span>
                          <span className="font-medium">{vehiculo.ano}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Color:</span>
                          <span className="font-medium">{vehiculo.color || "No especificado"}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Capacidad:</span>
                          <span className="font-medium">{vehiculo.capacidad_maxima} estudiantes</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Tipo:</span>
                          <span className="font-medium">{vehiculo.tipo_vehiculo}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Tab de Servicios Activos */}
          <TabsContent value="servicios" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Servicios Activos</h2>
              <p className="text-gray-600">Estudiantes que utilizan tus servicios</p>
            </div>

            <div className="space-y-4">
              {serviciosActivos.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                      <UserCheck className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes servicios activos</h3>
                    <p className="text-gray-500">Los servicios contratados aparecerán aquí</p>
                  </CardContent>
                </Card>
              ) : (
                serviciosActivos.map((servicio) => (
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
                        <Badge variant="default" className="bg-green-500">
                          {servicio.estado}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Todos los modales mantienen la misma funcionalidad */}
        {/* Formulario de Ruta - Modal */}
        <Dialog open={mostrarFormularioRuta} onOpenChange={setMostrarFormularioRuta}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {rutaEditando ? "Editar Ruta" : "Crear Nueva Ruta"}
              </DialogTitle>
              <DialogDescription>
                {rutaEditando ? "Actualiza la información de la ruta" : "Define una nueva ruta de transporte escolar"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre de la Ruta *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Villa San Pedro - Colegio San José"
                  value={formRuta.nombre}
                  onChange={(e) => setFormRuta({ ...formRuta, nombre: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origen">Punto de Origen *</Label>
                  <Input
                    id="origen"
                    placeholder="Ej: Villa San Pedro"
                    value={formRuta.origen}
                    onChange={(e) => setFormRuta({ ...formRuta, origen: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="destino">Destino *</Label>
                  <Input
                    id="destino"
                    placeholder="Ej: Colegio San José"
                    value={formRuta.destino}
                    onChange={(e) => setFormRuta({ ...formRuta, destino: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="colegio_destino">Colegio Destino *</Label>
                <Select
                  value={formRuta.colegio_destino}
                  onValueChange={(value) => setFormRuta({ ...formRuta, colegio_destino: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el colegio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Colegio San José">Colegio San José</SelectItem>
                    <SelectItem value="Colegio Alemán">Colegio Alemán</SelectItem>
                    <SelectItem value="Liceo Bicentenario">Liceo Bicentenario</SelectItem>
                    <SelectItem value="Colegio Concepción">Colegio Concepción</SelectItem>
                    <SelectItem value="Instituto Nacional">Instituto Nacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="horario-ida">Horario Ida *</Label>
                  <Input
                    id="horario-ida"
                    type="time"
                    value={formRuta.horario_ida}
                    onChange={(e) => setFormRuta({ ...formRuta, horario_ida: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="horario-vuelta">Horario Vuelta *</Label>
                  <Input
                    id="horario-vuelta"
                    type="time"
                    value={formRuta.horario_vuelta}
                    onChange={(e) => setFormRuta({ ...formRuta, horario_vuelta: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="precio">Precio Mensual (CLP) *</Label>
                  <Input
                    id="precio"
                    type="number"
                    placeholder="45000"
                    value={formRuta.precio_mensual}
                    onChange={(e) => setFormRuta({ ...formRuta, precio_mensual: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="capacidad">Capacidad Máxima *</Label>
                  <Input
                    id="capacidad"
                    type="number"
                    placeholder="12"
                    value={formRuta.capacidad_maxima}
                    onChange={(e) => setFormRuta({ ...formRuta, capacidad_maxima: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción de la Ruta</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe las paradas y características especiales..."
                  value={formRuta.descripcion}
                  onChange={(e) => setFormRuta({ ...formRuta, descripcion: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="dias_servicio">Días de Servicio</Label>
                <Select
                  value={formRuta.dias_servicio}
                  onValueChange={(value) => setFormRuta({ ...formRuta, dias_servicio: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona los días" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lunes-viernes">Lunes a Viernes</SelectItem>
                    <SelectItem value="lunes-sabado">Lunes a Sábado</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estado_ruta">Estado de la Ruta</Label>
                <Select
                  value={formRuta.activa ? "true" : "false"}
                  onValueChange={(value) => setFormRuta({ ...formRuta, activa: value === "true" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activa</SelectItem>
                    <SelectItem value="false">Inactiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button onClick={crearRuta} className="flex-1 bg-purple-600 hover:bg-purple-700">
                {rutaEditando ? "Actualizar" : "Crear"} Ruta
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMostrarFormularioRuta(false)
                  setRutaEditando(null)
                  resetFormRuta()
                }}
              >
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Formulario de Vehículo - Modal */}
        <Dialog open={mostrarFormularioVehiculo} onOpenChange={setMostrarFormularioVehiculo}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Registrar Nuevo Vehículo</DialogTitle>
              <DialogDescription>Completa la información de tu vehículo de transporte</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marca">Marca *</Label>
                  <Input
                    id="marca"
                    placeholder="Toyota"
                    value={formVehiculo.marca}
                    onChange={(e) => setFormVehiculo({ ...formVehiculo, marca: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="modelo">Modelo *</Label>
                  <Input
                    id="modelo"
                    placeholder="Hiace"
                    value={formVehiculo.modelo}
                    onChange={(e) => setFormVehiculo({ ...formVehiculo, modelo: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ano">Año *</Label>
                  <Input
                    id="ano"
                    type="number"
                    placeholder="2020"
                    value={formVehiculo.ano}
                    onChange={(e) => setFormVehiculo({ ...formVehiculo, ano: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="patente">Patente *</Label>
                  <Input
                    id="patente"
                    placeholder="ABCD-12"
                    value={formVehiculo.patente}
                    onChange={(e) => setFormVehiculo({ ...formVehiculo, patente: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    placeholder="Blanco"
                    value={formVehiculo.color}
                    onChange={(e) => setFormVehiculo({ ...formVehiculo, color: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="capacidad_vehiculo">Capacidad *</Label>
                  <Input
                    id="capacidad_vehiculo"
                    type="number"
                    placeholder="12"
                    value={formVehiculo.capacidad_maxima}
                    onChange={(e) => setFormVehiculo({ ...formVehiculo, capacidad_maxima: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tipo_vehiculo">Tipo de Vehículo</Label>
                <Select
                  value={formVehiculo.tipo_vehiculo}
                  onValueChange={(value) => setFormVehiculo({ ...formVehiculo, tipo_vehiculo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Furgón">Furgón</SelectItem>
                    <SelectItem value="Minibús">Minibús</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Automóvil">Automóvil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button onClick={crearVehiculo} className="flex-1 bg-green-600 hover:bg-green-700">
                Registrar Vehículo
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMostrarFormularioVehiculo(false)
                  resetFormVehiculo()
                }}
              >
                Cancelar
              </Button>
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
                    <Label className="text-gray-600">Padre</Label>
                    <p className="font-medium">
                      {solicitudSeleccionada.padre?.nombre} {solicitudSeleccionada.padre?.apellido}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Estudiante</Label>
                    <p className="font-medium">
                      {solicitudSeleccionada.estudiante?.nombre} {solicitudSeleccionada.estudiante?.apellido}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Ruta</Label>
                    <p className="font-medium">{solicitudSeleccionada.ruta?.nombre}</p>
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
                  {solicitudSeleccionada.padre?.telefono && (
                    <div>
                      <Label className="text-gray-600">Teléfono</Label>
                      <p className="font-medium">{solicitudSeleccionada.padre.telefono}</p>
                    </div>
                  )}
                </div>

                {solicitudSeleccionada.mensaje && (
                  <div>
                    <Label className="text-gray-600">Mensaje</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{solicitudSeleccionada.mensaje}</p>
                    </div>
                  </div>
                )}

                {solicitudSeleccionada.estado === "pendiente" && (
                  <div className="flex space-x-2 pt-4">
                    <Button
                      onClick={() => responderSolicitud(solicitudSeleccionada.id, "aceptada")}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Aceptar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => responderSolicitud(solicitudSeleccionada.id, "rechazada")}
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Rechazar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
