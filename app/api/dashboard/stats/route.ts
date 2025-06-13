import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Obtiene estadísticas del dashboard para el usuario autenticado.
 *     description: Retorna estadísticas relevantes para el dashboard, que varían si el usuario es un conductor o un padre.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rutas_activas:
 *                   type: integer
 *                   description: Número de rutas activas (para conductor).
 *                   example: 5
 *                 estudiantes_activos:
 *                   type: integer
 *                   description: Número de estudiantes activos en servicios (para conductor/padre).
 *                   example: 15
 *                 solicitudes_pendientes:
 *                   type: integer
 *                   description: Número de solicitudes de servicio pendientes (para conductor/padre).
 *                   example: 3
 *                 ingresos_mensuales:
 *                   type: number
 *                   description: Total de ingresos mensuales (para conductor).
 *                   example: 450000
 *                 calificacion_promedio:
 *                   type: number
 *                   format: float
 *                   description: Calificación promedio del conductor.
 *                   example: 4.8
 *                 estudiantes_registrados:
 *                   type: integer
 *                   description: Número de estudiantes registrados (para padre).
 *                   example: 2
 *                 servicios_activos:
 *                   type: integer
 *                   description: Número de servicios activos (para padre).
 *                   example: 1
 *                 gasto_mensual:
 *                   type: number
 *                   description: Total de gasto mensual (para padre).
 *                   example: 90000
 *                 proximo_viaje:
 *                   type: string
 *                   nullable: true
 *                   description: Horario del próximo viaje (para padre).
 *                   example: "07:30"
 *       401:
 *         description: No autorizado, el usuario no está autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado"
 *       404:
 *         description: Conductor o Padre no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Conductor no encontrado"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    let stats = {}

    if (user.tipoUsuario === "conductor") {
      // Estadísticas para conductor
      const conductor = db.prepare("SELECT id FROM conductores WHERE usuario_id = ?").get(user.userId)

      if (!conductor) {
        return NextResponse.json({ error: "Conductor no encontrado" }, { status: 404 })
      }

      // Rutas activas
      const rutasActivas = db
        .prepare("SELECT COUNT(*) as count FROM rutas WHERE conductor_id = ? AND activa = 1")
        .get(conductor.id)

      // Estudiantes activos
      const estudiantesActivos = db
        .prepare(`
          SELECT COUNT(*) as count FROM servicios s
          JOIN rutas r ON s.ruta_id = r.id
          WHERE r.conductor_id = ? AND s.estado = 'activo'
        `)
        .get(conductor.id)

      // Solicitudes pendientes
      const solicitudesPendientes = db
        .prepare(`
          SELECT COUNT(*) as count FROM solicitudes sol
          JOIN rutas r ON sol.ruta_id = r.id
          WHERE r.conductor_id = ? AND sol.estado = 'pendiente'
        `)
        .get(conductor.id)

      // Ingresos mensuales
      const ingresosMensuales = db
        .prepare(`
          SELECT COALESCE(SUM(p.monto), 0) as total FROM pagos p
          JOIN servicios s ON p.servicio_id = s.id
          JOIN rutas r ON s.ruta_id = r.id
          WHERE r.conductor_id = ? AND p.estado_pago = 'pagado'
          AND strftime('%Y-%m', p.fecha_pago) = strftime('%Y-%m', 'now')
        `)
        .get(conductor.id)

      // Calificación promedio
      const calificacionData = db
        .prepare("SELECT calificacion_promedio FROM conductores WHERE id = ?")
        .get(conductor.id)

      stats = {
        rutas_activas: rutasActivas?.count || 0,
        estudiantes_activos: estudiantesActivos?.count || 0,
        solicitudes_pendientes: solicitudesPendientes?.count || 0,
        ingresos_mensuales: ingresosMensuales?.total || 0,
        calificacion_promedio: calificacionData?.calificacion_promedio || 0,
      }
    } else if (user.tipoUsuario === "padre") {
      // Estadísticas para padre
      const padre = db.prepare("SELECT id FROM padres WHERE usuario_id = ?").get(user.userId)

      if (!padre) {
        return NextResponse.json({ error: "Padre no encontrado" }, { status: 404 })
      }

      // Estudiantes registrados
      const estudiantesRegistrados = db
        .prepare("SELECT COUNT(*) as count FROM estudiantes WHERE padre_id = ? AND activo = 1")
        .get(padre.id)

      // Servicios activos
      const serviciosActivos = db
        .prepare("SELECT COUNT(*) as count FROM servicios WHERE padre_id = ? AND estado = 'activo'")
        .get(padre.id)

      // Solicitudes pendientes
      const solicitudesPendientes = db
        .prepare("SELECT COUNT(*) as count FROM solicitudes WHERE padre_id = ? AND estado = 'pendiente'")
        .get(padre.id)

      // Gasto mensual
      const gastoMensual = db
        .prepare(`
          SELECT COALESCE(SUM(p.monto), 0) as total FROM pagos p
          JOIN servicios s ON p.servicio_id = s.id
          WHERE s.padre_id = ? AND p.estado_pago = 'pagado'
          AND strftime('%Y-%m', p.fecha_pago) = strftime('%Y-%m', 'now')
        `)
        .get(padre.id)

      // Próximo viaje
      const proximoViaje = db
        .prepare(`
          SELECT r.horario_ida FROM servicios s
          JOIN rutas r ON s.ruta_id = r.id
          WHERE s.padre_id = ? AND s.estado = 'activo'
          ORDER BY r.horario_ida ASC
          LIMIT 1
        `)
        .get(padre.id)

      stats = {
        estudiantes_registrados: estudiantesRegistrados?.count || 0,
        servicios_activos: serviciosActivos?.count || 0,
        solicitudes_pendientes: solicitudesPendientes?.count || 0,
        gasto_mensual: gastoMensual?.total || 0,
        proximo_viaje: proximoViaje?.horario_ida || null,
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
