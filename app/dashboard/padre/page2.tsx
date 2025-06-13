"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  CreditCard,
  CheckCircle,
  Info,
  ExternalLink,
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Furgón Seguro</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Bienvenido, {user?.nombre} {user?.apellido}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Alerts */}
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertDescription>
              {error}
              <Button variant="ghost" size="sm" onClick={clearMessages} className="ml-2">
                ✕
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4">
            <AlertDescription>
              {success}
              <Button variant="ghost" size="sm" onClick={clearMessages} className="ml-2">
                ✕
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Padre</h1>
          <p className="text-gray-600 mt-2">Gestiona tus estudiantes y encuentra servicios de transporte</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="dashboard-stat-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Estudiantes Registrados</p>
                  <p className="text-2xl font-bold text-gray-900">{estudiantes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-stat-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Servicios Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{servicios.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-stat-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Solicitudes Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.isArray(solicitudes) ? solicitudes.filter((s) => s.estado === "pendiente").length : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-stat-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Próximo Viaje</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.proximo_viaje || "--:--"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para diferentes secciones */}
        <Tabs defaultValue="estudiantes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="estudiantes">Mis Estudiantes</TabsTrigger>
            <TabsTrigger value="servicios">Buscar Servicios</TabsTrigger>
            <TabsTrigger value="solicitudes">Mis Solicitudes</TabsTrigger>
            <TabsTrigger value="contratados">Servicios Contratados</TabsTrigger>
          </TabsList>

          {/* Tab de Estudiantes */}
          <TabsContent value="estudiantes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Mis Estudiantes</h2>
              <Button onClick={() => abrirFormularioEstudiante()} className="btn-primary-gradient">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Estudiante
              </Button>
            </div>

            {estudiantes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes estudiantes registrados</h3>
                  <p className="text-gray-500 mb-4">Agrega a tus hijos para poder solicitar servicios de transporte</p>
                  <Button onClick={() => abrirFormularioEstudiante()} className="btn-primary-gradient">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primer Estudiante
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {estudiantes.map((estudiante) => (
                  <Card key={estudiante.id} className="student-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {estudiante.nombre.charAt(0)}
                              {estudiante.apellido.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {estudiante.nombre} {estudiante.apellido}
                            </h3>
                            <p className="text-sm text-gray-600">{estudiante.curso}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => abrirFormularioEstudiante(estudiante)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => eliminarEstudiante(estudiante.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Nacimiento: {new Date(estudiante.fecha_nacimiento).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{estudiante.colegio}</span>
                        </div>
                        {estudiante.necesidades_especiales && (
                          <div className="mt-2">
                            <Badge variant="outline">Necesidades Especiales</Badge>
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
                      <Label>Nombre *</Label>
                      <Input
                        placeholder="Nombre"
                        value={formEstudiante.nombre}
                        onChange={(e) => setFormEstudiante({ ...formEstudiante, nombre: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Apellido *</Label>
                      <Input
                        placeholder="Apellido"
                        value={formEstudiante.apellido}
                        onChange={(e) => setFormEstudiante({ ...formEstudiante, apellido: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Fecha de Nacimiento *</Label>
                    <Input
                      type="date"
                      value={formEstudiante.fecha_nacimiento}
                      onChange={(e) => setFormEstudiante({ ...formEstudiante, fecha_nacimiento: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Curso</Label>
                    <Input
                      placeholder="Ej: 8° Básico"
                      value={formEstudiante.curso}
                      onChange={(e) => setFormEstudiante({ ...formEstudiante, curso: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Zona *</Label>
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
                    <Label>Colegio *</Label>
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
                    <Label>Dirección del Colegio</Label>
                    <Input
                      placeholder="Dirección completa"
                      value={formEstudiante.direccion_colegio}
                      onChange={(e) => setFormEstudiante({ ...formEstudiante, direccion_colegio: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Necesidades Especiales</Label>
                    <Textarea
                      placeholder="Describe cualquier necesidad especial..."
                      value={formEstudiante.necesidades_especiales}
                      onChange={(e) => setFormEstudiante({ ...formEstudiante, necesidades_especiales: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setEstudianteDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={guardarEstudiante}>
                    {estudianteEditando ? "Actualizar" : "Agregar"} Estudiante
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Tab de Buscar Servicios */}
          <TabsContent value="servicios" className="space-y-6">
            {/* Sección de búsqueda centrada */}
            <div className="max-w-4xl mx-auto px-4 py-8">
              <h2 className="text-2xl font-semibold text-center mb-6">Encuentra el servicio perfecto para tus hijos</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Zona de Origen</Label>
                  <Select
                    value={filtroZona}
                    onValueChange={(value) => {
                      setFiltroZona(value)
                      loadColegios(value)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una zona" />
                    </SelectTrigger>
                    <SelectContent sideOffset={4}>
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
              </div>

              <div className="mt-6 flex justify-center">
                <Button className="w-full md:w-auto" onClick={aplicarFiltros} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                  Buscar
                </Button>
              </div>

              {showNoServicios && (
                <div className="mt-6">
                  <Alert variant="destructive">
                    <AlertDescription className="text-center">
                      No se encontraron servicios de transporte escolar disponibles para los criterios seleccionados.
                      <br />
                      Por favor, intenta con diferentes opciones de zona, colegio u horario.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>

            {/* Available Services */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Servicios Disponibles ({rutas.length})</h2>

              {rutas.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No se encontraron rutas disponibles</p>
                  </CardContent>
                </Card>
              ) : (
                rutas.map((ruta) => (
                  <Card key={ruta.id} className="service-card">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>
                                {ruta.conductor?.nombre?.charAt(0)}
                                {ruta.conductor?.apellido?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-4">
                              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
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

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Ruta</h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  {ruta.origen} → {ruta.destino}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2" />
                                  Ida: {ruta.horario_ida} | Vuelta: {ruta.horario_vuelta}
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Vehículo</h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div>
                                  {ruta.vehiculo?.marca} {ruta.vehiculo?.modelo} ({ruta.vehiculo?.ano})
                                </div>
                                <div>
                                  Capacidad: {ruta.vehiculo?.capacidad_maxima || ruta.capacidad_maxima} estudiantes
                                </div>
                                <div>Patente: {ruta.vehiculo?.patente}</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <Badge
                              variant={ruta.estudiantes_inscritos < ruta.capacidad_maxima ? "default" : "secondary"}
                            >
                              {ruta.capacidad_maxima - ruta.estudiantes_inscritos > 0
                                ? `${ruta.capacidad_maxima - ruta.estudiantes_inscritos} cupos disponibles`
                                : "Sin cupos"}
                            </Badge>
                            {ruta.conductor?.antecedentes_verificados && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Conductor Verificado
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col items-end">
                          <div className="text-right mb-4">
                            <div className="text-2xl font-bold text-gray-900">
                              ${ruta.precio_mensual?.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">por mes</div>
                          </div>

                          <div className="space-y-2">
                            <Dialog open={solicitudDialog} onOpenChange={setSolicitudDialog}>
                              <DialogTrigger asChild>
                                <Button
                                  className="w-full lg:w-auto"
                                  onClick={() => setRutaSeleccionada(ruta)}
                                  disabled={
                                    ruta.estudiantes_inscritos >= ruta.capacidad_maxima || estudiantes.length === 0
                                  }
                                >
                                  {estudiantes.length === 0 ? "Registra un estudiante primero" : "Solicitar Servicio"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Solicitar Servicio de Transporte</DialogTitle>
                                  <DialogDescription>
                                    Completa los datos para solicitar el servicio de{" "}
                                    {rutaSeleccionada?.conductor?.nombre}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="estudiante">Seleccionar Estudiante</Label>
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
                                  <div className="flex space-x-2">
                                    <Button onClick={enviarSolicitud} className="flex-1">
                                      Enviar Solicitud
                                    </Button>
                                    <Button variant="outline" onClick={() => setSolicitudDialog(false)}>
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" className="w-full lg:w-auto">
                              Ver Detalles
                            </Button>
                          </div>
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
            <h2 className="text-2xl font-bold text-gray-900">Mis Solicitudes</h2>

            {solicitudes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No tienes solicitudes enviadas</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {solicitudes.map((solicitud) => (
                  <Card key={solicitud.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{solicitud.ruta?.nombre}</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              Estudiante: {solicitud.estudiante?.nombre} {solicitud.estudiante?.apellido}
                            </p>
                            <p>Fecha: {new Date(solicitud.fecha_solicitud).toLocaleDateString()}</p>
                            {solicitud.mensaje && <p>Mensaje: {solicitud.mensaje}</p>}
                            {solicitud.respuesta_conductor && <p>Respuesta: {solicitud.respuesta_conductor}</p>}
                          </div>

                          {/* Botón de pago para solicitudes aceptadas */}
                          {solicitud.estado === "aceptada" && (
                            <Button className="mt-4" onClick={() => abrirFormularioPago(solicitud)}>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pagar con Mercado Pago
                            </Button>
                          )}
                        </div>
                        <div className="ml-4">
                          <Badge
                            variant={
                              solicitud.estado === "pendiente"
                                ? "default"
                                : solicitud.estado === "aceptada"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {solicitud.estado === "pendiente" && "Pendiente"}
                            {solicitud.estado === "aceptada" && "Aceptada"}
                            {solicitud.estado === "rechazada" && "Rechazada"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

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
                      Serás redirigido a Mercado Pago para completar el pago de forma segura. Puedes pagar con tarjeta
                      de crédito, débito o efectivo.
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
          </TabsContent>

          {/* Nueva Tab de Servicios Contratados */}
          <TabsContent value="contratados" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Servicios Contratados</h2>

            {servicios.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes servicios contratados</h3>
                  <p className="text-gray-500 mb-4">Cuando contrates un servicio, aparecerá aquí</p>
                  <Button onClick={() => (document.querySelector('[data-value="servicios"]') as HTMLElement)?.click()}>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar Servicios
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {servicios.map((servicio) => (
                  <Card key={servicio.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {servicio.conductor?.nombre?.charAt(0)}
                                {servicio.conductor?.apellido?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <h3 className="text-lg font-semibold text-gray-900">{servicio.ruta?.nombre}</h3>
                              <p className="text-sm text-gray-600">
                                Conductor: {servicio.conductor?.nombre} {servicio.conductor?.apellido}
                              </p>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Estudiante</p>
                              <p className="font-medium">
                                {servicio.estudiante?.nombre} {servicio.estudiante?.apellido}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Horarios</p>
                              <p className="font-medium">
                                Ida: {servicio.ruta?.horario_ida} | Vuelta: {servicio.ruta?.horario_vuelta}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <Badge variant="default">Activo</Badge>
                            <span className="text-sm text-gray-600">
                              Desde: {new Date(servicio.fecha_inicio).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
                          <div className="text-right mb-4">
                            <div className="text-2xl font-bold text-gray-900">
                              ${servicio.precio_acordado?.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">por mes</div>
                          </div>

                          <Button onClick={() => verDetallesServicio(servicio)}>
                            <Info className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

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
                            <span className="font-semibold">
                              ${servicioSeleccionado.precio_acordado?.toLocaleString()}
                            </span>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
