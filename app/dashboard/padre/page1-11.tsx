"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { MercadoPagoService } from "@/lib/mercadopago"
import { useAuth } from "@/lib/auth-context"

interface Stats {
  estudiantes: number
  conductores: number
  rutas: number
  servicios: number
  solicitudes: number
}

interface Ruta {
  id: string
  nombre: string
  descripcion: string
  conductor: string
  horario: string
  cupo: number
  precio: number
  estado: string
}

interface Estudiante {
  id: string
  nombre: string
  apellido: string
  rut: string
  email: string
  telefono: string
  direccion: string
  curso: string
}

interface Solicitud {
  id: string
  estudiante: string
  ruta: string
  estado: string
}

interface Servicio {
  id: string
  estudiante: string
  ruta: string
  estado: string
  monto: number
}

const DashboardPadrePage = () => {
  const router = useRouter()
  const { logout } = useAuth()

  const [stats, setStats] = useState<Stats | null>(null)
  const [rutas, setRutas] = useState<Ruta[]>([])
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null)
  const [detalleServicioDialog, setDetalleServicioDialog] = useState(false)

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    try {
      const user = JSON.parse(userData)
      if (user.tipo_usuario !== "padre") {
        router.push("/login")
        return
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/login")
      return
    }

    loadData()
  }, [router])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Cargando datos del dashboard...")

      // Cargar estadísticas
      const statsResponse = await apiClient.getDashboardStats()
      if (statsResponse.error) {
        console.error("Error cargando estadísticas:", statsResponse.error)
      } else if (statsResponse.data) {
        setStats(statsResponse.data)
      }

      // Cargar rutas disponibles
      const rutasResponse = await apiClient.getRutas()
      if (rutasResponse.error) {
        console.error("Error cargando rutas:", rutasResponse.error)
      } else if (rutasResponse.data) {
        setRutas(rutasResponse.data)
      }

      // Cargar estudiantes
      const estudiantesResponse = await apiClient.getEstudiantes()
      if (estudiantesResponse.error) {
        console.error("Error cargando estudiantes:", estudiantesResponse.error)
      } else if (estudiantesResponse.data) {
        setEstudiantes(estudiantesResponse.data)
      }

      // Cargar solicitudes
      const solicitudesResponse = await apiClient.getSolicitudes()
      if (solicitudesResponse.error) {
        console.error("Error cargando solicitudes:", solicitudesResponse.error)
      } else if (solicitudesResponse.data) {
        setSolicitudes(solicitudesResponse.data)
      }

      // Cargar servicios activos
      const serviciosResponse = await apiClient.getServicios("activo")
      if (serviciosResponse.error) {
        console.error("Error cargando servicios:", serviciosResponse.error)
      } else if (serviciosResponse.data) {
        setServicios(serviciosResponse.data)
      }
    } catch (error) {
      console.error("Error general cargando datos:", error)
      setError("Error al cargar los datos del dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    loadData()
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const verDetallesServicio = (servicio: any) => {
    setServicioSeleccionado(servicio)
    setDetalleServicioDialog(true)
  }

  const realizarPago = async (servicio: any) => {
    try {
      if (!servicio?.id || !servicio?.monto) {
        setError("No se puede procesar el pago: faltan datos del servicio")
        return
      }

      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        return
      }

      const mercadoPago = MercadoPagoService.getInstance()
      const estudiante = servicio.estudiante || {}

      const paymentData = {
        solicitud_id: servicio.id,
        monto: servicio.monto,
        descripcion: `Pago de servicio de transporte - ${servicio.ruta?.nombre || "Ruta"} - ${estudiante?.nombre || "Estudiante"}`,
        estudiante_nombre: estudiante?.nombre || "Estudiante",
      }

      const preference = await mercadoPago.createPaymentPreference(paymentData)
      if (!preference?.init_point && !preference?.sandbox_init_point) {
        throw new Error("No se pudo obtener la URL de pago")
      }

      mercadoPago.openCheckout(preference)
    } catch (error: any) {
      console.error("Error en el proceso de pago:", error)
      setError(error.message || "Error al procesar el pago. Por favor, intenta nuevamente.")
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-semibold">Dashboard - Padre</h1>
        <Button onClick={handleRetry} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription>
            {error}
            <Button onClick={handleRetry} variant="outline" size="sm" className="ml-2">
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        <Card>
          <CardHeader>
            <CardTitle>Estudiantes</CardTitle>
            <CardDescription>Estudiantes registrados</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[68px]" />
            ) : (
              <div className="text-2xl font-bold">{stats?.estudiantes || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rutas</CardTitle>
            <CardDescription>Rutas disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[68px]" />
            ) : (
              <div className="text-2xl font-bold">{stats?.rutas || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Servicios Activos</CardTitle>
            <CardDescription>Servicios actualmente activos</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[68px]" />
            ) : (
              <div className="text-2xl font-bold">{stats?.servicios || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solicitudes</CardTitle>
            <CardDescription>Total de solicitudes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[68px]" />
            ) : (
              <div className="text-2xl font-bold">{stats?.solicitudes || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="mb-5" />

      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-3">Rutas Disponibles</h2>
        {loading ? (
          <Skeleton className="w-full h-[150px]" />
        ) : rutas.length > 0 ? (
          <Table>
            <TableCaption>Lista de rutas disponibles.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Conductor</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Cupo</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rutas.map((ruta) => (
                <TableRow key={ruta.id}>
                  <TableCell className="font-medium">{ruta.nombre}</TableCell>
                  <TableCell>{ruta.descripcion}</TableCell>
                  <TableCell>{ruta.conductor}</TableCell>
                  <TableCell>{ruta.horario}</TableCell>
                  <TableCell>{ruta.cupo}</TableCell>
                  <TableCell>${ruta.precio}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ruta.estado}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">No hay rutas disponibles en este momento.</div>
        )}
      </div>

      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-3">Mis Estudiantes</h2>
        {loading ? (
          <Skeleton className="w-full h-[150px]" />
        ) : estudiantes.length > 0 ? (
          <Table>
            <TableCaption>Lista de estudiantes registrados.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido</TableHead>
                <TableHead>RUT</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Curso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estudiantes.map((estudiante) => (
                <TableRow key={estudiante.id}>
                  <TableCell className="font-medium">{estudiante.nombre}</TableCell>
                  <TableCell>{estudiante.apellido}</TableCell>
                  <TableCell>{estudiante.rut}</TableCell>
                  <TableCell>{estudiante.email}</TableCell>
                  <TableCell>{estudiante.telefono}</TableCell>
                  <TableCell>{estudiante.curso}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">No tienes estudiantes registrados aún.</div>
        )}
      </div>

      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-3">Solicitudes Pendientes</h2>
        {loading ? (
          <Skeleton className="w-full h-[150px]" />
        ) : solicitudes.length > 0 ? (
          <Table>
            <TableCaption>Lista de solicitudes pendientes.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudes.map((solicitud) => (
                <TableRow key={solicitud.id}>
                  <TableCell className="font-medium">{solicitud.estudiante}</TableCell>
                  <TableCell>{solicitud.ruta}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{solicitud.estado}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">No tienes solicitudes pendientes.</div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Servicios Activos</h2>
        {loading ? (
          <Skeleton className="w-full h-[150px]" />
        ) : servicios.length > 0 ? (
          <Table>
            <TableCaption>Lista de servicios activos.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servicios.map((servicio) => (
                <TableRow key={servicio.id}>
                  <TableCell className="font-medium">{servicio.estudiante}</TableCell>
                  <TableCell>{servicio.ruta}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{servicio.estado}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="secondary" size="sm" onClick={() => verDetallesServicio(servicio)}>
                      Ver Detalles
                    </Button>
                    <Button variant="primary" size="sm" className="ml-2" onClick={() => realizarPago(servicio)}>
                      Pagar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">No tienes servicios activos en este momento.</div>
        )}
      </div>
    </div>
  )
}

export default DashboardPadrePage
