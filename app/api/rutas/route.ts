import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

interface DbRutaRow {
  id: number;
  conductor_id: number;
  vehiculo_id: number | null;
  nombre: string;
  origen: string;
  destino: string;
  colegio_destino: string;
  horario_ida: string;
  horario_vuelta: string | null;
  precio_mensual: number;
  capacidad_maxima: number;
  descripcion: string | null;
  dias_servicio: string;
  activa: number | boolean;
  conductor_nombre: string;
  conductor_apellido: string;
  calificacion_promedio: number;
  total_viajes: number;
  anos_experiencia: number;
  antecedentes_verificados: number | boolean;
  vehiculo_marca: string | null;
  vehiculo_modelo: string | null;
  vehiculo_ano: number | null;
  vehiculo_patente: string | null;
  vehiculo_capacidad: number | null;
  estudiantes_inscritos: number;
}

/**
 * @swagger
 * /rutas:
 *   get:
 *     summary: Obtiene una lista de rutas disponibles.
 *     description: Retorna una lista de rutas activas, opcionalmente filtradas por origen, destino o colegio.
 *     tags:
 *       - Rutas
 *     parameters:
 *       - in: query
 *         name: origen
 *         schema:
 *           type: string
 *         description: Filtra las rutas por su punto de origen (búsqueda parcial).
 *         example: "Las Condes"
 *       - in: query
 *         name: destino
 *         schema:
 *           type: string
 *         description: Filtra las rutas por su punto de destino (búsqueda parcial).
 *         example: "Providencia"
 *       - in: query
 *         name: colegio
 *         schema:
 *           type: string
 *         description: Filtra las rutas por el nombre del colegio de destino (búsqueda parcial).
 *         example: "Colegio San Pedro"
 *       - in: query
 *         name: activa
 *         schema:
 *           type: boolean
 *         description: Si es 'true' (por defecto), solo retorna rutas activas. Si es 'false', retorna todas las rutas.
 *         example: true
 *     responses:
 *       200:
 *         description: Lista de rutas obtenida exitosamente.
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
 *                   conductor_id:
 *                     type: integer
 *                     example: 101
 *                   vehiculo_id:
 *                     type: integer
 *                     nullable: true
 *                     example: 1
 *                   nombre:
 *                     type: string
 *                     example: "Ruta Mañana Providencia"
 *                   origen:
 *                     type: string
 *                     example: "Las Condes, Santiago"
 *                   destino:
 *                     type: string
 *                     example: "Providencia, Santiago"
 *                   colegio_destino:
 *                     type: string
 *                     example: "Colegio San Pedro"
 *                   horario_ida:
 *                     type: string
 *                     example: "07:30"
 *                   horario_vuelta:
 *                     type: string
 *                     nullable: true
 *                     example: "16:00"
 *                   precio_mensual:
 *                     type: number
 *                     format: float
 *                     example: 120000.00
 *                   capacidad_maxima:
 *                     type: integer
 *                     example: 15
 *                   descripcion:
 *                     type: string
 *                     nullable: true
 *                     example: "Ruta regular de lunes a viernes."
 *                   dias_servicio:
 *                     type: string
 *                     example: "lunes-viernes"
 *                   activa:
 *                     type: boolean
 *                     example: true
 *                   estudiantes_inscritos:
 *                     type: integer
 *                     example: 10
 *                   conductor:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: "Carlos"
 *                       apellido:
 *                         type: string
 *                         example: "López"
 *                       calificacion_promedio:
 *                         type: number
 *                         format: float
 *                         example: 4.8
 *                       total_viajes:
 *                         type: integer
 *                         example: 150
 *                       anos_experiencia:
 *                         type: integer
 *                         example: 7
 *                       antecedentes_verificados:
 *                         type: boolean
 *                         example: true
 *                   vehiculo:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       marca:
 *                         type: string
 *                         example: "Mercedes-Benz"
 *                       modelo:
 *                         type: string
 *                         example: "Sprinter"
 *                       ano:
 *                         type: integer
 *                         example: 2020
 *                       patente:
 *                         type: string
 *                         example: "ABCD12"
 *                       capacidad_maxima:
 *                         type: integer
 *                         example: 15
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
 *     summary: Crea una nueva ruta de transporte.
 *     description: Permite a un conductor verificado crear una nueva ruta de transporte escolar.
 *     tags:
 *       - Rutas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - origen
 *               - destino
 *               - colegio_destino
 *               - horario_ida
 *               - horario_vuelta
 *               - precio_mensual
 *               - capacidad_maxima
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la ruta.
 *                 example: "Ruta Mañana Providencia"
 *               origen:
 *                 type: string
 *                 description: Punto de origen de la ruta.
 *                 example: "Las Condes, Santiago"
 *               destino:
 *                 type: string
 *                 description: Punto de destino de la ruta.
 *                 example: "Providencia, Santiago"
 *               colegio_destino:
 *                 type: string
 *                 description: Nombre del colegio de destino.
 *                 example: "Colegio San Pedro"
 *               horario_ida:
 *                 type: string
 *                 description: Horario de ida de la ruta (formato HH:MM).
 *                 example: "07:30"
 *               horario_vuelta:
 *                 type: string
 *                 nullable: true
 *                 description: Horario de vuelta de la ruta (formato HH:MM).
 *                 example: "16:00"
 *               precio_mensual:
 *                 type: number
 *                 format: float
 *                 description: Precio mensual del servicio de esta ruta.
 *                 example: 120000.00
 *               capacidad_maxima:
 *                 type: integer
 *                 description: Capacidad máxima de estudiantes para esta ruta.
 *                 example: 15
 *               descripcion:
 *                 type: string
 *                 nullable: true
 *                 description: Descripción detallada de la ruta.
 *                 example: "Recorrido que cubre las principales avenidas de Las Condes y Providencia."
 *               dias_servicio:
 *                 type: string
 *                 nullable: true
 *                 description: Días en que se ofrece el servicio (por defecto 'lunes-viernes').
 *                 example: "lunes-viernes"
 *     responses:
 *       201:
 *         description: Ruta creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ruta creada exitosamente"
 *                 ruta:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     conductor_id:
 *                       type: integer
 *                       example: 101
 *                     vehiculo_id:
 *                       type: integer
 *                       nullable: true
 *                       example: 1
 *                     nombre:
 *                       type: string
 *                       example: "Ruta Tarde Vitacura"
 *                     origen:
 *                       type: string
 *                       example: "Vitacura, Santiago"
 *                     destino:
 *                       type: string
 *                       example: "Colegio San José"
 *                     colegio_destino:
 *                       type: string
 *                       example: "Colegio San José"
 *                     horario_ida:
 *                       type: string
 *                       example: "13:00"
 *                     horario_vuelta:
 *                       type: string
 *                       nullable: true
 *                       example: "17:00"
 *                     precio_mensual:
 *                       type: number
 *                       format: float
 *                       example: 100000.00
 *                     capacidad_maxima:
 *                       type: integer
 *                       example: 10
 *                     descripcion:
 *                       type: string
 *                       nullable: true
 *                       example: "Ruta de tarde para estudiantes de Vitacura."
 *                     dias_servicio:
 *                       type: string
 *                       example: "lunes-viernes"
 *                     activa:
 *                       type: boolean
 *                       example: true
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
 *         description: No autorizado. El usuario no está autenticado o no es un conductor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado"
 *       404:
 *         description: Conductor no encontrado o no verificado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Conductor no encontrado o no verificado"
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
 *     summary: Actualiza una ruta existente.
 *     description: Permite a un conductor actualizar los detalles de una ruta específica, incluyendo su estado de activación. Si la ruta se desactiva, también se desactivarán todos los estudiantes inscritos en ella.
 *     tags:
 *       - Rutas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la ruta a actualizar.
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre de la ruta.
 *                 example: "Ruta Express Mañana Providencia"
 *               origen:
 *                 type: string
 *                 description: Nuevo punto de origen de la ruta.
 *                 example: "Ñuñoa, Santiago"
 *               destino:
 *                 type: string
 *                 description: Nuevo punto de destino de la ruta.
 *                 example: "Colegio San Pedro"
 *               colegio_destino:
 *                 type: string
 *                 description: Nuevo nombre del colegio de destino.
 *                 example: "Colegio San Pedro"
 *               horario_ida:
 *                 type: string
 *                 description: Nuevo horario de ida (formato HH:MM).
 *                 example: "07:00"
 *               horario_vuelta:
 *                 type: string
 *                 nullable: true
 *                 description: Nuevo horario de vuelta (formato HH:MM).
 *                 example: "16:30"
 *               precio_mensual:
 *                 type: number
 *                 format: float
 *                 description: Nuevo precio mensual.
 *                 example: 130000.00
 *               capacidad_maxima:
 *                 type: integer
 *                 description: Nueva capacidad máxima de estudiantes.
 *                 example: 12
 *               descripcion:
 *                 type: string
 *                 nullable: true
 *                 description: Nueva descripción de la ruta.
 *                 example: "Ruta de lunes a viernes con paradas limitadas."
 *               dias_servicio:
 *                 type: string
 *                 nullable: true
 *                 description: Nuevos días de servicio (ej. 'lunes-viernes').
 *                 example: "lunes-viernes"
 *               activa:
 *                 type: boolean
 *                 description: Estado de activación de la ruta. Si es 'false', los estudiantes asociados también se desactivarán.
 *                 example: false
 *     responses:
 *       200:
 *         description: Ruta actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ruta actualizada exitosamente"
 *                 ruta:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     nombre:
 *                       type: string
 *                       example: "Ruta Express Mañana Providencia"
 *                     activa:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: ID de ruta faltante o datos de actualización inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID de ruta o datos de actualización faltantes"
 *       401:
 *         description: No autorizado. El usuario no está autenticado o no es un conductor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado"
 *       403:
 *         description: Prohibido. El conductor no tiene permiso para modificar esta ruta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No tienes permiso para modificar esta ruta"
 *       404:
 *         description: Ruta no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ruta no encontrada"
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
    const { searchParams } = new URL(request.url)
    const origen = searchParams.get("origen") || searchParams.get("zona")
    const destino = searchParams.get("destino")
    const colegio = searchParams.get("colegio")
    const activa = searchParams.get("activa") !== "false"

    let query = `
      SELECT 
        r.*,
        u.nombre as conductor_nombre,
        u.apellido as conductor_apellido,
        c.calificacion_promedio,
        c.total_viajes,
        c.anos_experiencia,
        c.antecedentes_verificados,
        v.marca as vehiculo_marca,
        v.modelo as vehiculo_modelo,
        v.ano as vehiculo_ano,
        v.patente as vehiculo_patente,
        v.capacidad_maxima as vehiculo_capacidad,
        COALESCE(COUNT(s.id), 0) as estudiantes_inscritos
      FROM rutas r
      JOIN conductores c ON r.conductor_id = c.id
      JOIN usuarios u ON c.usuario_id = u.id
      LEFT JOIN vehiculos v ON r.vehiculo_id = v.id
      LEFT JOIN servicios s ON r.id = s.ruta_id AND s.estado = 'activo'
      WHERE r.activa = ?
    `

    const params: any[] = [activa ? 1 : 0]

    if (origen) {
      query += ` AND LOWER(r.origen) LIKE LOWER(?)`
      params.push(`%${origen}%`)
    }

    if (colegio) {
      query += ` AND LOWER(r.colegio_destino) LIKE LOWER(?)`
      params.push(`%${colegio}%`)
    }

    query += ` GROUP BY r.id, u.nombre, u.apellido, c.calificacion_promedio, c.total_viajes, c.anos_experiencia, c.antecedentes_verificados, v.marca, v.modelo, v.ano, v.patente, v.capacidad_maxima`
    query += ` ORDER BY r.fecha_creacion DESC`

    const rutas = db.prepare(query).all(...params)

    const rutasFormateadas = rutas.map((row: DbRutaRow) => ({
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
      conductor: {
        nombre: row.conductor_nombre,
        apellido: row.conductor_apellido,
        calificacion_promedio: Number(row.calificacion_promedio),
        total_viajes: row.total_viajes,
        anos_experiencia: row.anos_experiencia,
        antecedentes_verificados: Boolean(row.antecedentes_verificados),
      },
      vehiculo: row.vehiculo_marca
        ? {
            marca: row.vehiculo_marca,
            modelo: row.vehiculo_modelo,
            ano: row.vehiculo_ano,
            patente: row.vehiculo_patente,
            capacidad_maxima: row.vehiculo_capacidad,
          }
        : null,
    }))

    return NextResponse.json(rutasFormateadas)
  } catch (error) {
    console.error("Error obteniendo rutas:", error)
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
    const {
      nombre,
      origen,
      destino,
      colegio_destino,
      horario_ida,
      horario_vuelta,
      precio_mensual,
      capacidad_maxima,
      descripcion,
      dias_servicio,
      activa = true,
    } = body

    // Validaciones
    if (
      !nombre ||
      !origen ||
      !destino ||
      !colegio_destino ||
      !horario_ida ||
      !horario_vuelta ||
      !precio_mensual ||
      !capacidad_maxima
    ) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    // Obtener conductor_id
    const conductor = db
      .prepare(`
      SELECT c.id, v.id as vehiculo_id 
      FROM conductores c 
      LEFT JOIN vehiculos v ON c.id = v.conductor_id 
      WHERE c.usuario_id = ? AND c.estado = ?
    `)
      .get(user.userId, "verificado")

    if (!conductor) {
      return NextResponse.json({ error: "Conductor no encontrado o no verificado" }, { status: 404 })
    }

    const insertRuta = db.prepare(`
      INSERT INTO rutas (conductor_id, vehiculo_id, nombre, origen, destino, colegio_destino, horario_ida, horario_vuelta, precio_mensual, capacidad_maxima, descripcion, dias_servicio, activa)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = insertRuta.run(
      conductor.id,
      conductor.vehiculo_id,
      nombre,
      origen,
      destino,
      colegio_destino,
      horario_ida,
      horario_vuelta,
      precio_mensual,
      capacidad_maxima,
      descripcion,
      dias_servicio || "lunes-viernes",
      activa ? 1 : 0,
    )

    const nuevaRuta = db.prepare("SELECT * FROM rutas WHERE id = ?").get(result.lastInsertRowid)

    return NextResponse.json(
      {
        message: "Ruta creada exitosamente",
        ruta: nuevaRuta,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creando ruta:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.tipoUsuario !== "conductor") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const rutaId = parseInt(params.id as string)

    const body = await request.json()
    const {
      nombre,
      origen,
      destino,
      colegio_destino,
      horario_ida,
      horario_vuelta,
      precio_mensual,
      capacidad_maxima,
      descripcion,
      dias_servicio,
      activa,
    } = body

    console.log("PUT /api/rutas - Request Body:", body);

    const existingRuta = db.prepare("SELECT * FROM rutas WHERE id = ?").get(rutaId) as DbRutaRow

    if (!existingRuta) {
      return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 })
    }

    console.log("PUT /api/rutas - Existing Ruta activa:", existingRuta.activa);
    console.log("PUT /api/rutas - New activa value:", activa);

    const conductor = db.prepare("SELECT id FROM conductores WHERE usuario_id = ?").get(user.userId)

    if (!conductor || existingRuta.conductor_id !== conductor.id) {
      return NextResponse.json({ error: "No tienes permiso para modificar esta ruta" }, { status: 403 })
    }

    let updateFields = []
    const updateParams = []

    if (nombre !== undefined) {
      updateFields.push("nombre = ?")
      updateParams.push(nombre)
    }
    if (origen !== undefined) {
      updateFields.push("origen = ?")
      updateParams.push(origen)
    }
    if (destino !== undefined) {
      updateFields.push("destino = ?")
      updateParams.push(destino)
    }
    if (colegio_destino !== undefined) {
      updateFields.push("colegio_destino = ?")
      updateParams.push(colegio_destino)
    }
    if (horario_ida !== undefined) {
      updateFields.push("horario_ida = ?")
      updateParams.push(horario_ida)
    }
    if (horario_vuelta !== undefined) {
      updateFields.push("horario_vuelta = ?")
      updateParams.push(horario_vuelta)
    }
    if (precio_mensual !== undefined) {
      updateFields.push("precio_mensual = ?")
      updateParams.push(precio_mensual)
    }
    if (capacidad_maxima !== undefined) {
      updateFields.push("capacidad_maxima = ?")
      updateParams.push(capacidad_maxima)
    }
    if (descripcion !== undefined) {
      updateFields.push("descripcion = ?")
      updateParams.push(descripcion)
    }
    if (dias_servicio !== undefined) {
      updateFields.push("dias_servicio = ?")
      updateParams.push(dias_servicio)
    }
    if (activa !== undefined) {
      updateFields.push("activa = ?")
      updateParams.push(activa ? 1 : 0)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ message: "No hay datos para actualizar" }, { status: 200 })
    }

    // Lógica para desactivar estudiantes si la ruta se desactiva
    if (activa === false && existingRuta.activa === 1) {
      console.log(`Ruta ${rutaId} desactivada. Desactivando estudiantes asociados...`);
      const desactivateStudentsResult = db.prepare(`
        UPDATE estudiantes
        SET activo = 0
        WHERE id IN (
          SELECT e.id
          FROM estudiantes e
          JOIN servicios s ON e.id = s.estudiante_id
          WHERE s.ruta_id = ? AND s.estado = 'activo'
        )
      `).run(rutaId);
      console.log(`Estudiantes asociados a la ruta ${rutaId} desactivados. Cambios:`, desactivateStudentsResult.changes);

      // También actualizamos el estado de los servicios asociados a 'cancelado'
      const cancelServicesResult = db.prepare(`
        UPDATE servicios
        SET estado = 'cancelado'
        WHERE ruta_id = ? AND estado = 'activo'
      `).run(rutaId);
      console.log(`Servicios activos asociados a la ruta ${rutaId} cancelados. Cambios:`, cancelServicesResult.changes);
    }

    const updateQuery = `UPDATE rutas SET ${updateFields.join(", ")} WHERE id = ?`
    const result = db.prepare(updateQuery).run(...updateParams, rutaId)

    if (result.changes === 0) {
      return NextResponse.json({ message: "Ruta no actualizada (posiblemente mismos datos)" }, { status: 200 })
    }

    const updatedRuta = db.prepare("SELECT * FROM rutas WHERE id = ?").get(rutaId)

    return NextResponse.json({ message: "Ruta actualizada exitosamente", ruta: updatedRuta })
  } catch (error) {
    console.error("Error actualizando ruta:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
