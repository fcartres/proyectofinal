import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

/**
 * @swagger
 * /vehiculos:
 *   get:
 *     summary: Obtiene todos los vehículos de un conductor.
 *     description: Retorna una lista de todos los vehículos activos registrados por el conductor autenticado.
 *     tags:
 *       - Vehículos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vehículos obtenida exitosamente.
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
 *                   marca:
 *                     type: string
 *                     example: "Mercedes-Benz"
 *                   modelo:
 *                     type: string
 *                     example: "Sprinter"
 *                   ano:
 *                     type: integer
 *                     example: 2020
 *                   patente:
 *                     type: string
 *                     example: "ABCD12"
 *                   color:
 *                     type: string
 *                     example: "Blanco"
 *                   capacidad_maxima:
 *                     type: integer
 *                     example: 15
 *                   tipo_vehiculo:
 *                     type: string
 *                     example: "Furgón Escolar"
 *                   numero_revision_tecnica:
 *                     type: string
 *                     example: "123456789"
 *                   fecha_vencimiento_revision:
 *                     type: string
 *                     format: date
 *                     example: "2024-12-31"
 *                   numero_seguro:
 *                     type: string
 *                     example: "SEG987654"
 *                   fecha_vencimiento_seguro:
 *                     type: string
 *                     format: date
 *                     example: "2025-06-30"
 *                   activo:
 *                     type: boolean
 *                     example: true
 *                   fecha_creacion:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-01-01T10:00:00Z"
 *                   fecha_actualizacion:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-01-01T10:00:00Z"
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
 *         description: Conductor no encontrado.
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
 *   post:
 *     summary: Registra un nuevo vehículo para el conductor autenticado.
 *     description: Permite a un conductor registrar un nuevo vehículo en el sistema, con sus detalles de marca, modelo, capacidad, etc.
 *     tags:
 *       - Vehículos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - marca
 *               - modelo
 *               - ano
 *               - patente
 *               - capacidad_maxima
 *               - tipo_vehiculo
 *             properties:
 *               marca:
 *                 type: string
 *                 description: Marca del vehículo.
 *                 example: "Mercedes-Benz"
 *               modelo:
 *                 type: string
 *                 description: Modelo del vehículo.
 *                 example: "Sprinter"
 *               ano:
 *                 type: integer
 *                 description: Año de fabricación del vehículo.
 *                 example: 2020
 *               patente:
 *                 type: string
 *                 description: Patente única del vehículo.
 *                 example: "ABCD12"
 *               color:
 *                 type: string
 *                 nullable: true
 *                 description: Color del vehículo.
 *                 example: "Blanco"
 *               capacidad_maxima:
 *                 type: integer
 *                 description: Capacidad máxima de pasajeros o estudiantes.
 *                 example: 15
 *               tipo_vehiculo:
 *                 type: string
 *                 description: Tipo de vehículo (e.g., Furgón Escolar).
 *                 example: "Furgón Escolar"
 *               numero_revision_tecnica:
 *                 type: string
 *                 nullable: true
 *                 description: Número de revisión técnica del vehículo.
 *                 example: "123456789"
 *               fecha_vencimiento_revision:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Fecha de vencimiento de la revisión técnica.
 *                 example: "2024-12-31"
 *               numero_seguro:
 *                 type: string
 *                 nullable: true
 *                 description: Número de póliza de seguro del vehículo.
 *                 example: "SEG987654"
 *               fecha_vencimiento_seguro:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Fecha de vencimiento del seguro del vehículo.
 *                 example: "2025-06-30"
 *     responses:
 *       201:
 *         description: Vehículo registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vehículo registrado exitosamente"
 *                 vehiculo:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     conductor_id:
 *                       type: integer
 *                       example: 101
 *                     marca:
 *                       type: string
 *                       example: "Mercedes-Benz"
 *                     modelo:
 *                       type: string
 *                       example: "Sprinter"
 *                     ano:
 *                       type: integer
 *                       example: 2020
 *                     patente:
 *                       type: string
 *                       example: "ABCD12"
 *                     color:
 *                       type: string
 *                       example: "Blanco"
 *                     capacidad_maxima:
 *                       type: integer
 *                       example: 15
 *                     tipo_vehiculo:
 *                       type: string
 *                       example: "Furgón Escolar"
 *                     numero_revision_tecnica:
 *                       type: string
 *                       example: "123456789"
 *                     fecha_vencimiento_revision:
 *                       type: string
 *                       format: date
 *                       example: "2024-12-31"
 *                     numero_seguro:
 *                       type: string
 *                       example: "SEG987654"
 *                     fecha_vencimiento_seguro:
 *                       type: string
 *                       format: date
 *                       example: "2025-06-30"
 *                     activo:
 *                       type: boolean
 *                       example: true
 *                     fecha_creacion:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-01-01T10:00:00Z"
 *                     fecha_actualizacion:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-01-01T10:00:00Z"
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
 *         description: Conductor no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Conductor no encontrado"
 *       409:
 *         description: Conflicto. Ya existe un vehículo con esta patente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ya existe un vehículo con esta patente"
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
    console.log("Usuario obtenido en /api/vehiculos GET:", user);
    if (!user || user.tipoUsuario !== "conductor") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener conductor_id
    const conductor = db.prepare("SELECT id FROM conductores WHERE usuario_id = ?").get(user.userId)

    if (!conductor) {
      return NextResponse.json({ error: "Conductor no encontrado" }, { status: 404 })
    }

    const vehiculos = db
      .prepare("SELECT * FROM vehiculos WHERE conductor_id = ? AND activo = 1 ORDER BY fecha_creacion DESC")
      .all(conductor.id)

    return NextResponse.json(vehiculos)
  } catch (error) {
    console.error("Error obteniendo vehículos:", error)
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
      marca,
      modelo,
      ano,
      patente,
      color,
      capacidad_maxima,
      tipo_vehiculo,
      numero_revision_tecnica,
      fecha_vencimiento_revision,
      numero_seguro,
      fecha_vencimiento_seguro,
    } = body

    if (!marca || !modelo || !ano || !patente || !capacidad_maxima || !tipo_vehiculo) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    // Obtener conductor_id
    const conductor = db.prepare("SELECT id FROM conductores WHERE usuario_id = ?").get(user.userId)

    if (!conductor) {
      return NextResponse.json({ error: "Conductor no encontrado" }, { status: 404 })
    }

    // Verificar que la patente no existe
    const patenteExistente = db.prepare("SELECT id FROM vehiculos WHERE patente = ?").get(patente)

    if (patenteExistente) {
      return NextResponse.json({ error: "Ya existe un vehículo con esta patente" }, { status: 409 })
    }

    const insertVehiculo = db.prepare(`
      INSERT INTO vehiculos (
        conductor_id, marca, modelo, ano, patente, color, capacidad_maxima, tipo_vehiculo,
        numero_revision_tecnica, fecha_vencimiento_revision, numero_seguro, fecha_vencimiento_seguro
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = insertVehiculo.run(
      conductor.id,
      marca,
      modelo,
      ano,
      patente,
      color,
      capacidad_maxima,
      tipo_vehiculo,
      numero_revision_tecnica,
      fecha_vencimiento_revision,
      numero_seguro,
      fecha_vencimiento_seguro,
    )

    const nuevoVehiculo = db.prepare("SELECT * FROM vehiculos WHERE id = ?").get(result.lastInsertRowid)

    return NextResponse.json(
      {
        message: "Vehículo registrado exitosamente",
        vehiculo: nuevoVehiculo,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creando vehículo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
