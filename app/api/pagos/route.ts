import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

// Definir una interfaz para las filas de servicio obtenidas de la base de datos
interface DbServiceRow {
  id: number;
  ruta_id: number;
  padre_id: number;
  estudiante_id: number;
  precio_acordado: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  notas: string;
  ruta_nombre: string;
  origen: string;
  destino: string;
  horario_ida: string;
  horario_vuelta: string;
  padre_nombre: string;
  padre_apellido: string;
  padre_telefono: string;
  estudiante_nombre: string;
  estudiante_apellido: string;
  estudiante_curso: string;
  conductor_nombre: string;
  conductor_apellido: string;
  conductor_telefono: string;
  // Agrega aquí cualquier otra columna que selecciones en tu query
}

/**
 * @swagger
 * /pagos:
 *   get:
 *     summary: Obtiene una lista de pagos según el rol del usuario.
 *     description: Retorna una lista de pagos. Si el usuario es un conductor, muestra los pagos de los servicios de sus rutas. Si es un padre, muestra los pagos asociados a sus servicios.
 *     tags:
 *       - Pagos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum:
 *             - pendiente
 *             - pagado
 *             - atrasado
 *             - anulado
 *         description: Filtra los pagos por su estado.
 *         example: pendiente
 *       - in: query
 *         name: servicio_id
 *         schema:
 *           type: integer
 *         description: Filtra los pagos por el ID del servicio asociado.
 *         example: 123
 *     responses:
 *       200:
 *         description: Lista de pagos obtenida exitosamente.
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
 *                   monto:
 *                     type: number
 *                     format: float
 *                     example: 50000.00
 *                   mes_correspondiente:
 *                     type: string
 *                     example: "2024-03"
 *                   metodo_pago:
 *                     type: string
 *                     example: "Transferencia"
 *                   estado_pago:
 *                     type: string
 *                     example: "pendiente"
 *                   fecha_vencimiento:
 *                     type: string
 *                     format: date
 *                     example: "2024-03-05"
 *                   fecha_pago:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                     example: null
 *                   referencia_pago:
 *                     type: string
 *                     nullable: true
 *                     example: null
 *                   notas:
 *                     type: string
 *                     nullable: true
 *                     example: "Primer pago del servicio"
 *                   ruta:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       nombre:
 *                         type: string
 *                         example: "Ruta Mañana Providencia"
 *                   padre:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: "Ana"
 *                       apellido:
 *                         type: string
 *                         example: "González"
 *                   estudiante:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: "Lucas"
 *                       apellido:
 *                         type: string
 *                         example: "González"
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
 *     summary: Registra un nuevo pago para un servicio.
 *     description: Permite a un conductor registrar un pago recibido por un servicio. El conductor debe estar autorizado para el servicio.
 *     tags:
 *       - Pagos
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
 *               - monto
 *               - mes_correspondiente
 *               - metodo_pago
 *               - fecha_vencimiento
 *             properties:
 *               servicio_id:
 *                 type: integer
 *                 description: ID del servicio al que corresponde el pago.
 *                 example: 10
 *               monto:
 *                 type: number
 *                 format: float
 *                 description: Monto del pago.
 *                 example: 50000.00
 *               mes_correspondiente:
 *                 type: string
 *                 description: Mes al que corresponde el pago (formato YYYY-MM).
 *                 example: "2024-03"
 *               metodo_pago:
 *                 type: string
 *                 description: Método de pago utilizado (e.g., Transferencia, Efectivo).
 *                 example: "Transferencia"
 *               fecha_vencimiento:
 *                 type: string
 *                 format: date
 *                 description: Fecha de vencimiento del pago.
 *                 example: "2024-03-05"
 *               notas:
 *                 type: string
 *                 nullable: true
 *                 description: Notas adicionales sobre el pago.
 *                 example: "Pago realizado el 01/03/2024"
 *     responses:
 *       201:
 *         description: Pago registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pago registrado exitosamente"
 *                 pago:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     servicio_id:
 *                       type: integer
 *                       example: 10
 *                     monto:
 *                       type: number
 *                       format: float
 *                       example: 50000.00
 *                     mes_correspondiente:
 *                       type: string
 *                       example: "2024-03"
 *                     metodo_pago:
 *                       type: string
 *                       example: "Transferencia"
 *                     estado_pago:
 *                       type: string
 *                       example: "pendiente"
 *                     fecha_vencimiento:
 *                       type: string
 *                       format: date
 *                       example: "2024-03-05"
 *                     fecha_pago:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *                     referencia_pago:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     notas:
 *                       type: string
 *                       nullable: true
 *                       example: "Pago realizado el 01/03/2024"
 *                     fecha_creacion:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-01T10:00:00Z"
 *                     fecha_actualizacion:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-01T10:00:00Z"
 *       400:
 *         description: Campos requeridos faltantes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Campos requeridos faltantes"
 *       401:
 *         description: No autorizado. El usuario no es un conductor o no está autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado"
 *       404:
 *         description: Servicio no encontrado o no autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Servicio no encontrado o no autorizado"
 *       409:
 *         description: Conflicto. Ya existe un pago para el mismo mes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ya existe un pago para este mes"
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
    const servicioId = searchParams.get("servicio_id")

    let query = `
      SELECT 
        p.*,
        s.ruta_id,
        r.nombre as ruta_nombre,
        up.nombre as padre_nombre,
        up.apellido as padre_apellido,
        e.nombre as estudiante_nombre,
        e.apellido as estudiante_apellido
      FROM pagos p
      JOIN servicios s ON p.servicio_id = s.id
      JOIN rutas r ON s.ruta_id = r.id
      JOIN padres pa ON s.padre_id = pa.id
      JOIN usuarios up ON pa.usuario_id = up.id
      JOIN estudiantes e ON s.estudiante_id = e.id
    `

    const params: any[] = []

    if (user.tipoUsuario === "conductor") {
      query += ` JOIN conductores c ON r.conductor_id = c.id WHERE c.usuario_id = ?`
      params.push(user.userId)
    } else if (user.tipoUsuario === "padre") {
      query += ` WHERE pa.usuario_id = ?`
      params.push(user.userId)
    }

    if (estado) {
      query += ` AND p.estado_pago = ?`
      params.push(estado)
    }

    if (servicioId) {
      query += ` AND p.servicio_id = ?`
      params.push(servicioId)
    }

    query += ` ORDER BY p.fecha_vencimiento DESC`

    const pagos = db.prepare(query).all(...params)

    const pagosFormateados = pagos.map((row: {
      id: number;
      servicio_id: number;
      monto: number;
      mes_correspondiente: string;
      metodo_pago: string;
      estado_pago: string;
      fecha_vencimiento: string;
      fecha_pago: string | null;
      referencia_pago: string | null;
      notas: string | null;
      ruta_id: number;
      ruta_nombre: string;
      padre_nombre: string;
      padre_apellido: string;
      estudiante_nombre: string;
      estudiante_apellido: string;
    }) => ({
      id: row.id,
      servicio_id: row.servicio_id,
      monto: row.monto,
      mes_correspondiente: row.mes_correspondiente,
      metodo_pago: row.metodo_pago,
      estado_pago: row.estado_pago,
      fecha_vencimiento: row.fecha_vencimiento,
      fecha_pago: row.fecha_pago,
      referencia_pago: row.referencia_pago,
      notas: row.notas,
      ruta: {
        id: row.ruta_id,
        nombre: row.ruta_nombre,
      },
      padre: {
        nombre: row.padre_nombre,
        apellido: row.padre_apellido,
      },
      estudiante: {
        nombre: row.estudiante_nombre,
        apellido: row.estudiante_apellido,
      },
    }))

    return NextResponse.json(pagosFormateados)
  } catch (error) {
    console.error("Error obteniendo pagos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.tipoUsuario !== "conductor") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { servicio_id, monto, mes_correspondiente, metodo_pago, fecha_vencimiento, notas } = body

    if (!servicio_id || !monto || !mes_correspondiente || !metodo_pago || !fecha_vencimiento) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    // Verificar que el servicio pertenece a una ruta del conductor
    const servicio = db
      .prepare(`
        SELECT s.id FROM servicios s
        JOIN rutas r ON s.ruta_id = r.id
        JOIN conductores c ON r.conductor_id = c.id
        WHERE s.id = ? AND c.usuario_id = ?
      `)
      .get(servicio_id, user.userId)

    if (!servicio) {
      return NextResponse.json({ error: "Servicio no encontrado o no autorizado" }, { status: 404 })
    }

    // Verificar que no existe un pago para el mismo mes
    const pagoExistente = db
      .prepare("SELECT id FROM pagos WHERE servicio_id = ? AND mes_correspondiente = ?")
      .get(servicio_id, mes_correspondiente)

    if (pagoExistente) {
      return NextResponse.json({ error: "Ya existe un pago para este mes" }, { status: 409 })
    }

    const insertPago = db.prepare(`
      INSERT INTO pagos (servicio_id, monto, mes_correspondiente, metodo_pago, fecha_vencimiento, notas)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    const result = insertPago.run(servicio_id, monto, mes_correspondiente, metodo_pago, fecha_vencimiento, notas)
    const nuevoPago = db.prepare("SELECT * FROM pagos WHERE id = ?").get(result.lastInsertRowid)

    return NextResponse.json(
      {
        message: "Pago registrado exitosamente",
        pago: nuevoPago,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creando pago:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
