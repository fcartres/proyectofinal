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
  conductor_usuario_id: number;
  // Agrega aquí cualquier otra columna que selecciones en tu query
}

/**
 * @swagger
 * /servicios:
 *   get:
 *     summary: Obtiene una lista de servicios según el rol del usuario.
 *     description: Retorna una lista de servicios. Si el usuario es un conductor, muestra los servicios asociados a sus rutas. Si es un padre, muestra los servicios asociados a sus estudiantes.
 *     tags:
 *       - Servicios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum:
 *             - activo
 *             - inactivo
 *             - pendiente
 *             - completado
 *             - cancelado
 *         description: Filtra los servicios por su estado.
 *         example: activo
 *     responses:
 *       200:
 *         description: Lista de servicios obtenida exitosamente.
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
 *                   precio_acordado:
 *                     type: number
 *                     format: float
 *                     example: 50000.00
 *                   fecha_inicio:
 *                     type: string
 *                     format: date
 *                     example: "2024-03-01"
 *                   fecha_fin:
 *                     type: string
 *                     format: date
 *                     nullable: true
 *                     example: "2025-03-01"
 *                   estado:
 *                     type: string
 *                     example: "activo"
 *                   notas:
 *                     type: string
 *                     nullable: true
 *                     example: "Notas adicionales del servicio"
 *                   ruta:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: "Ruta Mañana Providencia"
 *                       origen:
 *                         type: string
 *                         example: "Calle Falsa 123"
 *                       destino:
 *                         type: string
 *                         example: "Colegio San Pedro"
 *                       horario_ida:
 *                         type: string
 *                         example: "07:30"
 *                       horario_vuelta:
 *                         type: string
 *                         nullable: true
 *                         example: "16:00"
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
 *                   conductor:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: "Carlos"
 *                       apellido:
 *                         type: string
 *                         example: "López"
 *                       telefono:
 *                         type: string
 *                         example: "+56955667788"
 *                       id: 
 *                         type: integer
 *                         description: ID de usuario del conductor
 *                         example: 102
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
 *     summary: Crea un nuevo servicio.
 *     description: Permite a un conductor o padre crear un nuevo servicio de transporte escolar. Requiere la ruta, padre y estudiante asociados.
 *     tags:
 *       - Servicios
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
 *               - padre_id
 *               - estudiante_id
 *               - precio_acordado
 *               - fecha_inicio
 *             properties:
 *               ruta_id:
 *                 type: integer
 *                 description: ID de la ruta asociada al servicio.
 *                 example: 10
 *               padre_id:
 *                 type: integer
 *                 description: ID del padre que solicita el servicio.
 *                 example: 20
 *               estudiante_id:
 *                 type: integer
 *                 description: ID del estudiante que utilizará el servicio.
 *                 example: 30
 *               precio_acordado:
 *                 type: number
 *                 format: float
 *                 description: Precio acordado para el servicio.
 *                 example: 50000.00
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio del servicio.
 *                 example: "2024-03-01"
 *               notas:
 *                 type: string
 *                 nullable: true
 *                 description: Notas adicionales para el servicio.
 *                 example: "Recoger en la puerta principal"
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Servicio creado exitosamente"
 *                 servicio:
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
 *                     precio_acordado:
 *                       type: number
 *                       format: float
 *                       example: 50000.00
 *                     fecha_inicio:
 *                       type: string
 *                       format: date
 *                       example: "2024-03-01"
 *                     fecha_fin:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       example: "2025-03-01"
 *                     estado:
 *                       type: string
 *                       example: "activo"
 *                     notas:
 *                       type: string
 *                       nullable: true
 *                       example: "Recoger en la puerta principal"
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
 *         description: No autorizado. El usuario no está autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado"
 *       403:
 *         description: Prohibido. La ruta no está autorizada para el conductor o el padre no está autorizado para este padre.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ruta no autorizada"
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
 *   put:
 *     summary: Actualiza un servicio existente.
 *     description: Permite actualizar el estado u otros detalles de un servicio. Solo usuarios con rol 'padre' o 'conductor' pueden actualizar sus servicios respectivos.
 *     tags:
 *       - Servicios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del servicio a actualizar.
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 description: Nuevo estado del servicio (ej. 'activo', 'cancelado').
 *                 enum:
 *                   - activo
 *                   - inactivo
 *                   - pendiente
 *                   - completado
 *                   - cancelado
 *                 example: "activo"
 *               precio_acordado:
 *                 type: number
 *                 format: float
 *                 description: Nuevo precio acordado para el servicio.
 *                 example: 55000.00
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 description: Nueva fecha de fin del servicio.
 *                 example: "2025-06-30"
 *               notas:
 *                 type: string
 *                 description: Notas adicionales para el servicio.
 *                 example: "Servicio reactivado con nuevo acuerdo."
 *     responses:
 *       200:
 *         description: Servicio actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Servicio actualizado exitosamente"
 *                 servicio:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     estado:
 *                       type: string
 *                       example: "activo"
 *       400:
 *         description: Datos de entrada inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Estado de servicio no válido"
 *       401:
 *         description: No autorizado. El usuario no está autenticado o no tiene permisos para actualizar este servicio.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado para actualizar este servicio"
 *       404:
 *         description: Servicio no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Servicio no encontrado"
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
    const zona = searchParams.get("zona")

    let query = `
      SELECT 
        s.*,
        r.nombre as ruta_nombre,
        r.origen,
        r.destino,
        r.horario_ida,
        r.horario_vuelta,
        up.nombre as padre_nombre,
        up.apellido as padre_apellido,
        up.telefono as padre_telefono,
        e.nombre as estudiante_nombre,
        e.apellido as estudiante_apellido,
        e.curso as estudiante_curso,
        uc.nombre as conductor_nombre,
        uc.apellido as conductor_apellido,
        uc.telefono as conductor_telefono,
        uc.id as conductor_usuario_id
      FROM servicios s
      JOIN rutas r ON s.ruta_id = r.id
      JOIN padres p ON s.padre_id = p.id
      JOIN usuarios up ON p.usuario_id = up.id
      JOIN estudiantes e ON s.estudiante_id = e.id
      JOIN conductores c ON r.conductor_id = c.id
      JOIN usuarios uc ON c.usuario_id = uc.id
    `

    const params: (string | number)[] = []
    const conditions: string[] = []

    if (user.tipoUsuario === "conductor") {
      conditions.push(`c.usuario_id = ?`)
      params.push(user.userId)
    } else if (user.tipoUsuario === "padre") {
      conditions.push(`p.usuario_id = ?`)
      params.push(user.userId)
    }

    if (estado) {
      conditions.push(`s.estado = ?`)
      params.push(estado)
    }

    if (zona) {
      conditions.push(`(LOWER(r.origen) LIKE LOWER(?) OR LOWER(r.destino) LIKE LOWER(?))`)
      params.push(`%${zona}%`)
      params.push(`%${zona}%`)
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(` AND `)
    }

    query += ` ORDER BY s.fecha_creacion DESC`

    const servicios = db.prepare(query).all(...params)

    const serviciosFormateadas = servicios.map((row: DbServiceRow) => ({
      id: row.id,
      ruta_id: row.ruta_id,
      padre_id: row.padre_id,
      estudiante_id: row.estudiante_id,
      precio_acordado: row.precio_acordado,
      fecha_inicio: row.fecha_inicio,
      fecha_fin: row.fecha_fin,
      estado: row.estado,
      notas: row.notas,
      ruta: {
        nombre: row.ruta_nombre,
        origen: row.origen,
        destino: row.destino,
        horario_ida: row.horario_ida,
        horario_vuelta: row.horario_vuelta,
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
      conductor: {
        nombre: row.conductor_nombre,
        apellido: row.conductor_apellido,
        telefono: row.conductor_telefono,
        id: row.conductor_usuario_id,
      },
    }))

    return NextResponse.json(serviciosFormateadas)
  } catch (error) {
    console.error("Error obteniendo servicios:", error)
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
    const { ruta_id, padre_id, estudiante_id, precio_acordado, fecha_inicio, notas } = body

    if (!ruta_id || !padre_id || !estudiante_id || !precio_acordado || !fecha_inicio) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    // Verificar autorización según tipo de usuario
    if (user.tipoUsuario === "conductor") {
      // Verificar que la ruta pertenece al conductor
      const ruta = db
        .prepare(`
          SELECT r.id FROM rutas r 
          JOIN conductores c ON r.conductor_id = c.id 
          WHERE r.id = ? AND c.usuario_id = ?
        `)
        .get(ruta_id, user.userId)

      if (!ruta) {
        return NextResponse.json({ error: "Ruta no autorizada" }, { status: 403 })
      }
    } else if (user.tipoUsuario === "padre") {
      // Verificar que el padre puede crear servicios para sus estudiantes
      const padre = db.prepare("SELECT id FROM padres WHERE usuario_id = ?").get(user.userId)
      if (!padre || padre.id !== padre_id) {
        return NextResponse.json({ error: "No autorizado para este padre" }, { status: 403 })
      }
    }

    const insertServicio = db.prepare(`
      INSERT INTO servicios (ruta_id, padre_id, estudiante_id, precio_acordado, fecha_inicio, notas, estado)
      VALUES (?, ?, ?, ?, ?, ?, 'activo')
    `)

    const result = insertServicio.run(ruta_id, padre_id, estudiante_id, precio_acordado, fecha_inicio, notas)
    const nuevoServicio = db.prepare("SELECT * FROM servicios WHERE id = ?").get(result.lastInsertRowid)

    return NextResponse.json(
      {
        message: "Servicio creado exitosamente",
        servicio: nuevoServicio,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creando servicio:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { pathname } = new URL(request.url)
    const segments = pathname.split('/')
    const servicioId = parseInt(segments[segments.length - 1]);

    if (isNaN(servicioId)) {
      return NextResponse.json({ error: "ID de servicio no válido" }, { status: 400 })
    }

    const { estado, precio_acordado, fecha_fin, notas } = await request.json()

    if (!estado && precio_acordado === undefined && !fecha_fin && !notas) {
      return NextResponse.json({ error: "No hay datos para actualizar" }, { status: 400 })
    }

    const servicioExistente = await db.get(`SELECT * FROM servicios WHERE id = ?`, [servicioId])
    if (!servicioExistente) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
    }

    // Autorización: solo el padre o el conductor asociado pueden actualizar el servicio
    if (user.tipoUsuario === "padre" && servicioExistente.padre_id !== user.userId) {
      return NextResponse.json({ error: "No autorizado para actualizar este servicio" }, { status: 403 })
    }

    const rutaAsociada = await db.get(`SELECT conductor_id FROM rutas WHERE id = ?`, [servicioExistente.ruta_id]);
    if (user.tipoUsuario === "conductor" && rutaAsociada.conductor_id !== user.userId) {
        return NextResponse.json({ error: "No autorizado para actualizar este servicio" }, { status: 403 })
    }

    let updateQuery = `UPDATE servicios SET `
    const updateParams: (string | number | null)[] = []
    const updateFields: string[] = []

    if (estado !== undefined) {
      if (!["activo", "inactivo", "pendiente", "completado", "cancelado"].includes(estado)) {
        return NextResponse.json({ error: "Estado de servicio no válido" }, { status: 400 })
      }
      updateFields.push(`estado = ?`)
      updateParams.push(estado)
    }
    if (precio_acordado !== undefined) {
      updateFields.push(`precio_acordado = ?`)
      updateParams.push(precio_acordado)
    }
    if (fecha_fin !== undefined) {
      updateFields.push(`fecha_fin = ?`)
      updateParams.push(fecha_fin)
    }
    if (notas !== undefined) {
      updateFields.push(`notas = ?`)
      updateParams.push(notas)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No hay campos válidos para actualizar" }, { status: 400 })
    }

    updateQuery += updateFields.join(`, `)
    updateQuery += ` WHERE id = ?`
    updateParams.push(servicioId)

    await db.run(updateQuery, updateParams)

    const servicioActualizado = await db.get(`SELECT * FROM servicios WHERE id = ?`, [servicioId])

    return NextResponse.json({ message: "Servicio actualizado exitosamente", servicio: servicioActualizado }, { status: 200 })
  } catch (error) {
    console.error("Error al actualizar servicio:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
