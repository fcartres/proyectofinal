import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

/**
 * @swagger
 * /conductor/rutas:
 *   get:
 *     summary: Obtiene las rutas asociadas al conductor autenticado.
 *     description: Retorna una lista de todas las rutas de transporte escolar que el conductor autenticado tiene asignadas o ha creado.
 *     tags:
 *       - Rutas de Conductor
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de rutas obtenidas exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID de la ruta.
 *                   nombre:
 *                     type: string
 *                     description: Nombre de la ruta.
 *                   origen:
 *                     type: string
 *                     description: Punto de origen de la ruta.
 *                   destino:
 *                     type: string
 *                     description: Punto de destino de la ruta.
 *                   horario_ida:
 *                     type: string
 *                     description: Horario de ida (ej. "07:30").
 *                   horario_vuelta:
 *                     type: string
 *                     description: Horario de vuelta (ej. "17:00").
 *                   precio_mensual:
 *                     type: integer
 *                     description: Precio mensual de la ruta.
 *                   capacidad_maxima:
 *                     type: integer
 *                     description: Capacidad máxima de estudiantes.
 *                   activa:
 *                     type: boolean
 *                     description: Si la ruta está activa.
 *       401:
 *         description: No autorizado, el usuario no está autenticado o no es un conductor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener las rutas del conductor."
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.tipoUsuario !== "conductor") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener conductor_id
    const conductor = db.prepare("SELECT id FROM conductores WHERE usuario_id = ?").get(user.userId)

    if (!conductor) {
      return NextResponse.json({ error: "Conductor no encontrado" }, { status: 404 })
    }

    console.log("Conductor ID en /api/conductor/rutas:", conductor.id, "para el usuario:", user.userId);

    // Obtener rutas del conductor con información de estudiantes inscritos y vehículo
    const rutas = db
      .prepare(`
        SELECT 
          r.*,
          v.marca as vehiculo_marca,
          v.modelo as vehiculo_modelo,
          v.ano as vehiculo_ano,
          v.patente as vehiculo_patente,
          v.color as vehiculo_color,
          v.capacidad_maxima as vehiculo_capacidad_maxima,
          v.tipo_vehiculo as vehiculo_tipo_vehiculo,
          COALESCE(COUNT(s.id), 0) as estudiantes_inscritos
        FROM rutas r
        LEFT JOIN vehiculos v ON r.vehiculo_id = v.id
        LEFT JOIN servicios s ON r.id = s.ruta_id AND s.estado = 'activo'
        WHERE r.conductor_id = ?
        GROUP BY r.id
        ORDER BY r.fecha_creacion DESC
      `)
      .all(conductor.id)

    console.log("Rutas crudas obtenidas del DB:", rutas);

    const rutasFormateadas = rutas.map((row: any) => {
      console.log("Procesando fila de ruta:", row);
      return ({
        id: row.id,
        conductor_id: row.conductor_id,
        vehiculo_id: row.vehiculo_id,
        nombre: row.nombre,
        origen: row.origen,
        destino: row.destino,
        colegio_destino: row.colegio_destino,
        horario_ida: row.horario_ida,
        horario_vuelta: row.horario_vuelta,
        precio_mensual: row.precio_mensual,
        capacidad_maxima: row.capacidad_maxima,
        descripcion: row.descripcion,
        dias_servicio: row.dias_servicio,
        activa: Boolean(row.activa),
        estudiantes_inscritos: Number(row.estudiantes_inscritos),
        vehiculo: row.vehiculo_marca
          ? {
              marca: row.vehiculo_marca,
              modelo: row.vehiculo_modelo,
              ano: row.vehiculo_ano,
              patente: row.vehiculo_patente,
              color: row.vehiculo_color,
              capacidad_maxima: row.vehiculo_capacidad_maxima,
              tipo_vehiculo: row.vehiculo_tipo_vehiculo,
              activa: Boolean(row.vehiculo_activa),
            }
          : null,
      })
    })

    return NextResponse.json(rutasFormateadas)
  } catch (error) {
    console.error("Error obteniendo rutas del conductor:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
