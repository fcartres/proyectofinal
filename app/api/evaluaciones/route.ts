import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

interface DbEvaluacionRow {
  id: number;
  servicio_id: number;
  evaluador_id: number;
  evaluado_id: number;
  calificacion: number;
  comentario: string | null;
  aspectos_evaluados: string | null; // Almacenado como JSON string
  fecha_evaluacion: string;
  evaluador_nombre: string;
  evaluador_apellido: string;
  evaluado_nombre: string;
  evaluado_apellido: string;
  ruta_id: number;
  ruta_nombre: string;
}

/**
 * @swagger
 * /evaluaciones:
 *   get:
 *     summary: Obtiene una lista de evaluaciones.
 *     description: Retorna una lista de evaluaciones, filtradas opcionalmente por ID de servicio o ID de usuario evaluado. Muestra evaluaciones donde el usuario autenticado es el evaluador o el evaluado.
 *     tags:
 *       - Evaluaciones
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: servicio_id
 *         schema:
 *           type: integer
 *         description: Filtra las evaluaciones por el ID del servicio.
 *         example: 123
 *       - in: query
 *         name: evaluado_id
 *         schema:
 *           type: integer
 *         description: Filtra las evaluaciones por el ID del usuario evaluado.
 *         example: 456
 *     responses:
 *       200:
 *         description: Lista de evaluaciones obtenida exitosamente.
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
 *                   servicio_id:
 *                     type: integer
 *                     example: 10
 *                   evaluador_id:
 *                     type: integer
 *                     example: 20
 *                   evaluado_id:
 *                     type: integer
 *                     example: 30
 *                   calificacion:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 5
 *                     example: 5
 *                   comentario:
 *                     type: string
 *                     nullable: true
 *                     example: "Excelente conductor, muy puntual."
 *                   aspectos_evaluados:
 *                     type: array
 *                     items:
 *                       type: string
 *                     nullable: true
 *                     example: ["Puntualidad", "Seguridad", "Amabilidad"]
 *                   fecha_evaluacion:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-03-15T10:00:00Z"
 *                   evaluador:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: "Ana"
 *                       apellido:
 *                         type: string
 *                         example: "González"
 *                   evaluado:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: "Carlos"
 *                       apellido:
 *                         type: string
 *                         example: "López"
 *                   ruta:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       nombre:
 *                         type: string
 *                         example: "Ruta Mañana Providencia"
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
 *     summary: Crea una nueva evaluación.
 *     description: Permite a un padre o conductor enviar una evaluación sobre un servicio. Se valida que el usuario esté autorizado para evaluar ese servicio y que no lo haya evaluado previamente.
 *     tags:
 *       - Evaluaciones
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - servicio_id
 *               - evaluado_id
 *               - calificacion
 *             properties:
 *               servicio_id:
 *                 type: integer
 *                 description: ID del servicio que se está evaluando.
 *                 example: 10
 *               evaluado_id:
 *                 type: integer
 *                 description: ID del usuario (conductor o padre) que está siendo evaluado.
 *                 example: 30
 *               calificacion:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Calificación otorgada (de 1 a 5).
 *                 example: 5
 *               comentario:
 *                 type: string
 *                 nullable: true
 *                 description: Comentario opcional sobre la evaluación.
 *                 example: "Excelente servicio, muy atento y seguro."
 *               aspectos_evaluados:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *                 description: Lista de aspectos específicos evaluados (e.g., Puntualidad, Conducción).
 *                 example: ["Puntualidad", "Comunicación"]
 *     responses:
 *       201:
 *         description: Evaluación enviada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Evaluación enviada exitosamente"
 *                 evaluacion:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     servicio_id:
 *                       type: integer
 *                       example: 10
 *                     evaluador_id:
 *                       type: integer
 *                       example: 20
 *                     evaluado_id:
 *                       type: integer
 *                       example: 30
 *                     calificacion:
 *                       type: integer
 *                       example: 5
 *                     comentario:
 *                       type: string
 *                       nullable: true
 *                       example: "Excelente servicio, muy atento y seguro."
 *                     aspectos_evaluados:
 *                       type: array
 *                       items:
 *                         type: string
 *                       nullable: true
 *                       example: ["Puntualidad", "Comunicación"]
 *                     fecha_evaluacion:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-15T10:00:00Z"
 *       400:
 *         description: Campos requeridos faltantes o calificación inválida.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Campos requeridos faltantes"
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
 *       404:
 *         description: Servicio no encontrado o no autorizado para evaluar.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Servicio no encontrado o no autorizado para evaluar"
 *       409:
 *         description: Conflicto. Ya has evaluado este servicio.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ya has evaluado este servicio"
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
    const servicioId = searchParams.get("servicio_id")
    const evaluadoId = searchParams.get("evaluado_id")

    let query = `
      SELECT 
        e.*,
        ue.nombre as evaluador_nombre,
        ue.apellido as evaluador_apellido,
        uv.nombre as evaluado_nombre,
        uv.apellido as evaluado_apellido,
        s.ruta_id,
        r.nombre as ruta_nombre
      FROM evaluaciones e
      JOIN usuarios ue ON e.evaluador_id = ue.id
      JOIN usuarios uv ON e.evaluado_id = uv.id
      JOIN servicios s ON e.servicio_id = s.id
      JOIN rutas r ON s.ruta_id = r.id
      WHERE 1=1
    `

    const params: any[] = []

    if (servicioId) {
      query += ` AND e.servicio_id = ?`
      params.push(servicioId)
    }

    if (evaluadoId) {
      query += ` AND e.evaluado_id = ?`
      params.push(evaluadoId)
    }

    // Filtrar por usuario según su tipo
    if (user.tipoUsuario === "conductor") {
      query += ` AND (e.evaluador_id = ? OR e.evaluado_id = ?)`
      params.push(user.userId, user.userId)
    } else if (user.tipoUsuario === "padre") {
      query += ` AND (e.evaluador_id = ? OR e.evaluado_id = ?)`
      params.push(user.userId, user.userId)
    }

    query += ` ORDER BY e.fecha_evaluacion DESC`

    const evaluaciones = db.prepare(query).all(...params)

    const evaluacionesFormateadas = evaluaciones.map((row: DbEvaluacionRow) => ({
      id: row.id,
      servicio_id: row.servicio_id,
      evaluador_id: row.evaluador_id,
      evaluado_id: row.evaluado_id,
      calificacion: row.calificacion,
      comentario: row.comentario,
      aspectos_evaluados: row.aspectos_evaluados ? JSON.parse(row.aspectos_evaluados) : null,
      fecha_evaluacion: row.fecha_evaluacion,
      evaluador: {
        nombre: row.evaluador_nombre,
        apellido: row.evaluador_apellido,
      },
      evaluado: {
        nombre: row.evaluado_nombre,
        apellido: row.evaluado_apellido,
      },
      ruta: {
        id: row.ruta_id,
        nombre: row.ruta_nombre,
      },
    }))

    return NextResponse.json(evaluacionesFormateadas)
  } catch (error) {
    console.error("Error obteniendo evaluaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { servicio_id, evaluado_id, calificacion, comentario, aspectos_evaluados } = body

    if (!servicio_id || !evaluado_id || !calificacion) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    if (calificacion < 1 || calificacion > 5) {
      return NextResponse.json({ error: "Calificación debe estar entre 1 y 5" }, { status: 400 })
    }

    // Verificar que el usuario puede evaluar este servicio
    let verificacionQuery = ""
    if (user.tipoUsuario === "padre") {
      verificacionQuery = `
        SELECT s.id FROM servicios s
        JOIN padres p ON s.padre_id = p.id
        WHERE s.id = ? AND p.usuario_id = ? AND s.estado = 'activo'
      `
    } else if (user.tipoUsuario === "conductor") {
      verificacionQuery = `
        SELECT s.id FROM servicios s
        JOIN rutas r ON s.ruta_id = r.id
        JOIN conductores c ON r.conductor_id = c.id
        WHERE s.id = ? AND c.usuario_id = ? AND s.estado = 'activo'
      `
    }

    const servicio = db.prepare(verificacionQuery).get(servicio_id, user.userId)

    if (!servicio) {
      return NextResponse.json({ error: "Servicio no encontrado o no autorizado para evaluar" }, { status: 404 })
    }

    // Verificar que no haya evaluado antes
    const evaluacionExistente = db
      .prepare("SELECT id FROM evaluaciones WHERE servicio_id = ? AND evaluador_id = ?")
      .get(servicio_id, user.userId)

    if (evaluacionExistente) {
      return NextResponse.json({ error: "Ya has evaluado este servicio" }, { status: 409 })
    }

    const insertEvaluacion = db.prepare(`
      INSERT INTO evaluaciones (servicio_id, evaluador_id, evaluado_id, calificacion, comentario, aspectos_evaluados)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    const result = insertEvaluacion.run(
      servicio_id,
      user.userId,
      evaluado_id,
      calificacion,
      comentario,
      aspectos_evaluados ? JSON.stringify(aspectos_evaluados) : null,
    )

    const nuevaEvaluacion = db.prepare("SELECT * FROM evaluaciones WHERE id = ?").get(result.lastInsertRowid)

    // 1. Recalcular la calificación promedio para el conductor evaluado
    const promedioQuery = db.prepare(`
      SELECT AVG(calificacion) as promedio
      FROM evaluaciones
      WHERE evaluado_id = ?
    `)
    const { promedio } = promedioQuery.get(evaluado_id)

    console.log(`Calculando promedio: ${promedio} para evaluado_id: ${evaluado_id}`)

    // 2. Actualizar el campo calificacion_promedio en la tabla conductores
    db.prepare(`
      UPDATE conductores
      SET calificacion_promedio = ?
      WHERE usuario_id = ?
    `).run(promedio, evaluado_id)

    return NextResponse.json(
      {
        message: "Evaluación enviada exitosamente",
        evaluacion: nuevaEvaluacion,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creando evaluación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
