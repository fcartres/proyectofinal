import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

interface DbSolicitudRow {
  id: number;
  ruta_id: number;
  padre_id: number;
  estudiante_id: number;
  mensaje: string | null;
  estado: string;
  fecha_solicitud: string;
  fecha_respuesta: string | null;
  respuesta_conductor: string | null;
  ruta_nombre: string;
  origen: string;
  destino: string;
  padre_nombre: string;
  padre_apellido: string;
  padre_telefono: string | null;
  estudiante_nombre: string;
  estudiante_apellido: string;
  estudiante_curso: string | null;
}

/**
 * @swagger
 * /solicitudes:
 *   get:
 *     summary: Obtiene una lista de solicitudes de servicio.
 *     description: Retorna una lista de solicitudes de servicio. Si el usuario es un conductor, muestra las solicitudes para sus rutas. Si es un padre, muestra sus propias solicitudes.
 *     tags:
 *       - Solicitudes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum:
 *             - pendiente
 *             - aceptada
 *             - rechazada
 *         description: Filtra las solicitudes por su estado.
 *         example: pendiente
 *     responses:
 *       200:
 *         description: Lista de solicitudes obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   ruta_id:
 *                     type: integer
 *                     example: 10
 *                   padre_id:
 *                     type: integer
 *                     example: 20
 *                   estudiante_id:
 *                     type: integer
 *                     example: 30
 *                   mensaje:
 *                     type: string
 *                     nullable: true
 *                     example: "Necesito el servicio para mi hijo Lucas."
 *                   estado:
 *                     type: string
 *                     example: "pendiente"
 *                   fecha_solicitud:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-03-01T10:00:00Z"
 *                   fecha_respuesta:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                     example: null
 *                   respuesta_conductor:
 *                     type: string
 *                     nullable: true
 *                     example: null
 *                   ruta:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: "Ruta Mañana Providencia"
 *                       origen:
 *                         type: string
 *                         example: "Las Condes"
 *                       destino:
 *                         type: string
 *                         example: "Providencia"
 *                   padre:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: "Ana"
 *                       apellido:
 *                         type: string
 *                         example: "González"
 *                       telefono:
 *                         type: string
 *                         example: "+56911223344"
 *                   estudiante:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: "Lucas"
 *                       apellido:
 *                         type: string
 *                         example: "González"
 *                       curso:
 *                         type: string
 *                         example: "5to Básico"
 *       401:
 *         description: No autorizado. El usuario no está autenticado.
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
 *                   example: "Error interno del servidor"
 *   post:
 *     summary: Crea una nueva solicitud de servicio.
 *     description: Permite a un padre solicitar un servicio de transporte para uno de sus estudiantes en una ruta específica.
 *     tags:
 *       - Solicitudes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ruta_id
 *               - estudiante_id
 *             properties:
 *               ruta_id:
 *                 type: integer
 *                 description: ID de la ruta para la cual se solicita el servicio.
 *                 example: 10
 *               estudiante_id:
 *                 type: integer
 *                 description: ID del estudiante que utilizará el servicio.
 *                 example: 30
 *               mensaje:
 *                 type: string
 *                 nullable: true
 *                 description: Mensaje opcional para el conductor.
 *                 example: "Mi hijo necesita ser recogido en la entrada principal."
 *     responses:
 *       201:
 *         description: Solicitud enviada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Solicitud enviada exitosamente"
 *                 solicitud:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     ruta_id:
 *                       type: integer
 *                       example: 10
 *                     padre_id:
 *                       type: integer
 *                       example: 20
 *                     estudiante_id:
 *                       type: integer
 *                       example: 30
 *                     mensaje:
 *                       type: string
 *                       nullable: true
 *                       example: "Mi hijo necesita ser recogido en la entrada principal."
 *                     estado:
 *                       type: string
 *                       example: "pendiente"
 *                     fecha_solicitud:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-01T10:00:00Z"
 *                     fecha_respuesta:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *                     respuesta_conductor:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *       400:
 *         description: Ruta y estudiante son requeridos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ruta y estudiante son requeridos"
 *       401:
 *         description: No autorizado. El usuario no está autenticado o no es un padre.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado"
 *       404:
 *         description: Padre o estudiante no encontrado o no autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Estudiante no encontrado o no autorizado"
 *       409:
 *         description: Conflicto. Ya existe una solicitud pendiente para esta ruta y estudiante.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ya existe una solicitud pendiente para esta ruta y estudiante"
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

    const { searchParams } = new URL(request.url)
    const estado = searchParams.get("estado")

    let query = `
      SELECT 
        sol.*,
        r.nombre as ruta_nombre,
        r.origen,
        r.destino,
        up.nombre as padre_nombre,
        up.apellido as padre_apellido,
        up.telefono as padre_telefono,
        e.nombre as estudiante_nombre,
        e.apellido as estudiante_apellido,
        e.curso as estudiante_curso
      FROM solicitudes sol
      JOIN rutas r ON sol.ruta_id = r.id
      JOIN padres p ON sol.padre_id = p.id
      JOIN usuarios up ON p.usuario_id = up.id
      JOIN estudiantes e ON sol.estudiante_id = e.id
    `

    const params: any[] = []

    if (user.tipoUsuario === "conductor") {
      // Mostrar solicitudes para rutas del conductor
      query += ` JOIN conductores c ON r.conductor_id = c.id WHERE c.usuario_id = ?`
      params.push(user.userId)
    } else if (user.tipoUsuario === "padre") {
      // Mostrar solicitudes del padre
      query += ` WHERE p.usuario_id = ?`
      params.push(user.userId)
    }

    if (estado) {
      query += ` AND sol.estado = ?`
      params.push(estado)
    }

    query += ` ORDER BY sol.fecha_solicitud DESC`

    const solicitudes = db.prepare(query).all(...params)

    const solicitudesFormateadas = solicitudes.map((row: DbSolicitudRow) => ({
      id: row.id,
      ruta_id: row.ruta_id,
      padre_id: row.padre_id,
      estudiante_id: row.estudiante_id,
      mensaje: row.mensaje,
      estado: row.estado,
      fecha_solicitud: row.fecha_solicitud,
      fecha_respuesta: row.fecha_respuesta,
      respuesta_conductor: row.respuesta_conductor,
      ruta: {
        nombre: row.ruta_nombre,
        origen: row.origen,
        destino: row.destino,
      },
      padre: {
        nombre: row.padre_nombre,
        apellido: row.padre_apellido,
        telefono: row.padre_telefono,
      },
      estudiante: {
        nombre: row.estudiante_nombre,
        apellido: row.estudiante_apellido,
        curso: row.estudiante_curso,
      },
    }))

    return NextResponse.json(solicitudesFormateadas)
  } catch (error) {
    console.error("Error obteniendo solicitudes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.tipoUsuario !== "padre") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { ruta_id, estudiante_id, mensaje } = body

    if (!ruta_id || !estudiante_id) {
      return NextResponse.json({ error: "Ruta y estudiante son requeridos" }, { status: 400 })
    }

    // Obtener padre_id
    const padre = db.prepare("SELECT id FROM padres WHERE usuario_id = ?").get(user.userId)

    if (!padre) {
      return NextResponse.json({ error: "Padre no encontrado" }, { status: 404 })
    }

    const padre_id = padre.id

    // Verificar que el estudiante pertenece al padre
    const estudiante = db
      .prepare("SELECT id FROM estudiantes WHERE id = ? AND padre_id = ?")
      .get(estudiante_id, padre_id)

    if (!estudiante) {
      return NextResponse.json({ error: "Estudiante no encontrado o no autorizado" }, { status: 404 })
    }

    // Verificar que no existe una solicitud pendiente para la misma ruta y estudiante
    const solicitudExistente = db
      .prepare("SELECT id FROM solicitudes WHERE ruta_id = ? AND padre_id = ? AND estudiante_id = ? AND estado = ?")
      .get(ruta_id, padre_id, estudiante_id, "pendiente")

    if (solicitudExistente) {
      return NextResponse.json(
        { error: "Ya existe una solicitud pendiente para esta ruta y estudiante" },
        { status: 409 },
      )
    }

    const insertSolicitud = db.prepare(`
      INSERT INTO solicitudes (ruta_id, padre_id, estudiante_id, mensaje)
      VALUES (?, ?, ?, ?)
    `)

    const result = insertSolicitud.run(ruta_id, padre_id, estudiante_id, mensaje)
    const nuevaSolicitud = db.prepare("SELECT * FROM solicitudes WHERE id = ?").get(result.lastInsertRowid)

    return NextResponse.json(
      {
        message: "Solicitud enviada exitosamente",
        solicitud: nuevaSolicitud,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creando solicitud:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
