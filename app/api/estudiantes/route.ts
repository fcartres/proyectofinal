import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

/**
 * @swagger
 * /estudiantes:
 *   get:
 *     summary: Obtiene una lista de estudiantes según el rol del usuario.
 *     description: Retorna una lista de estudiantes. Si el usuario es un padre, muestra sus estudiantes registrados. Si es un conductor, muestra los estudiantes asociados a sus servicios activos.
 *     tags:
 *       - Estudiantes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estudiantes obtenida exitosamente.
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
 *                   padre_id:
 *                     type: integer
 *                     example: 101
 *                   nombre:
 *                     type: string
 *                     example: "Lucas"
 *                   apellido:
 *                     type: string
 *                     example: "González"
 *                   fecha_nacimiento:
 *                     type: string
 *                     format: date
 *                     example: "2015-08-20"
 *                   curso:
 *                     type: string
 *                     example: "5to Básico"
 *                   colegio:
 *                     type: string
 *                     example: "Colegio San Pedro"
 *                   direccion_colegio:
 *                     type: string
 *                     nullable: true
 *                     example: "Av. Siempre Viva 742"
 *                   necesidades_especiales:
 *                     type: string
 *                     nullable: true
 *                     example: "Requiere asiento especial"
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
 *         description: Tipo de usuario no válido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tipo de usuario no válido"
 *       404:
 *         description: Padre o Conductor no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Padre no encontrado"
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
 *     summary: Registra un nuevo estudiante para el padre autenticado.
 *     description: Permite a un padre registrar un nuevo estudiante en el sistema.
 *     tags:
 *       - Estudiantes
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
 *               - apellido
 *               - fecha_nacimiento
 *               - colegio
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del estudiante.
 *                 example: "María"
 *               apellido:
 *                 type: string
 *                 description: Apellido del estudiante.
 *                 example: "Pérez"
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 description: Fecha de nacimiento del estudiante.
 *                 example: "2010-05-15"
 *               curso:
 *                 type: string
 *                 nullable: true
 *                 description: Curso o grado del estudiante.
 *                 example: "2do Medio"
 *               colegio:
 *                 type: string
 *                 description: Nombre del colegio al que asiste el estudiante.
 *                 example: "Liceo Moderno"
 *               direccion_colegio:
 *                 type: string
 *                 nullable: true
 *                 description: Dirección del colegio.
 *                 example: "Av. Principal 456"
 *               necesidades_especiales:
 *                 type: string
 *                 nullable: true
 *                 description: Descripción de cualquier necesidad especial del estudiante.
 *                 example: "Alergia al maní"
 *     responses:
 *       201:
 *         description: Estudiante registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Estudiante registrado exitosamente"
 *                 estudiante:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     padre_id:
 *                       type: integer
 *                       example: 101
 *                     nombre:
 *                       type: string
 *                       example: "María"
 *                     apellido:
 *                       type: string
 *                       example: "Pérez"
 *                     fecha_nacimiento:
 *                       type: string
 *                       format: date
 *                       example: "2010-05-15"
 *                     curso:
 *                       type: string
 *                       example: "2do Medio"
 *                     colegio:
 *                       type: string
 *                       example: "Liceo Moderno"
 *                     direccion_colegio:
 *                       type: string
 *                       example: "Av. Principal 456"
 *                     necesidades_especiales:
 *                       type: string
 *                       example: "Alergia al maní"
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
 *         description: Padre no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Padre no encontrado"
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

    let estudiantes = []

    if (user.tipoUsuario === "padre") {
      // Obtener padre_id
      const padre = db.prepare("SELECT id FROM padres WHERE usuario_id = ?").get(user.userId)

      if (!padre) {
        return NextResponse.json({ error: "Padre no encontrado" }, { status: 404 })
      }

      estudiantes = db
        .prepare("SELECT * FROM estudiantes WHERE padre_id = ? AND activo = 1 ORDER BY nombre")
        .all(padre.id)
    } else if (user.tipoUsuario === "conductor") {
      // Los conductores pueden ver estudiantes de sus servicios activos
      const conductor = db.prepare("SELECT id FROM conductores WHERE usuario_id = ?").get(user.userId)

      if (!conductor) {
        return NextResponse.json({ error: "Conductor no encontrado" }, { status: 404 })
      }

      estudiantes = db
        .prepare(`
        SELECT DISTINCT e.* FROM estudiantes e
        JOIN servicios s ON e.id = s.estudiante_id
        JOIN rutas r ON s.ruta_id = r.id
        WHERE r.conductor_id = ? AND s.estado = 'activo' AND e.activo = 1
        ORDER BY e.nombre
      `)
        .all(conductor.id)
    } else {
      return NextResponse.json({ error: "Tipo de usuario no válido" }, { status: 403 })
    }

    return NextResponse.json(estudiantes)
  } catch (error) {
    console.error("Error obteniendo estudiantes:", error)
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
    const { nombre, apellido, fecha_nacimiento, curso, colegio, direccion_colegio, necesidades_especiales } = body

    if (!nombre || !apellido || !fecha_nacimiento || !colegio) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    // Obtener padre_id
    const padre = db.prepare("SELECT id FROM padres WHERE usuario_id = ?").get(user.userId)

    if (!padre) {
      return NextResponse.json({ error: "Padre no encontrado" }, { status: 404 })
    }

    const insertEstudiante = db.prepare(`
      INSERT INTO estudiantes (padre_id, nombre, apellido, fecha_nacimiento, curso, colegio, direccion_colegio, necesidades_especiales, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = insertEstudiante.run(
      padre.id,
      nombre,
      apellido,
      fecha_nacimiento,
      curso || "",
      colegio,
      direccion_colegio || "",
      necesidades_especiales || "",
      true,
    )

    const nuevoEstudiante = db.prepare("SELECT * FROM estudiantes WHERE id = ?").get(result.lastInsertRowid)

    return NextResponse.json(
      {
        message: "Estudiante registrado exitosamente",
        estudiante: nuevoEstudiante,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error registrando estudiante:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

/**
 * @swagger
 * /estudiantes/{id}:
 *   put:
 *     summary: Actualiza la información de un estudiante.
 *     description: Permite a un padre actualizar los detalles de uno de sus estudiantes, incluyendo su estado activo/inactivo.
 *     tags:
 *       - Estudiantes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del estudiante a actualizar.
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
 *                 description: Nombre del estudiante.
 *                 example: "María"
 *               apellido:
 *                 type: string
 *                 description: Apellido del estudiante.
 *                 example: "Pérez"
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 description: Fecha de nacimiento del estudiante.
 *                 example: "2010-05-15"
 *               curso:
 *                 type: string
 *                 nullable: true
 *                 description: Curso o grado del estudiante.
 *                 example: "2do Medio"
 *               colegio:
 *                 type: string
 *                 description: Nombre del colegio al que asiste el estudiante.
 *                 example: "Liceo Moderno"
 *               direccion_colegio:
 *                 type: string
 *                 nullable: true
 *                 description: Dirección del colegio.
 *                 example: "Av. Principal 456"
 *               necesidades_especiales:
 *                 type: string
 *                 nullable: true
 *                 description: Descripción de cualquier necesidad especial del estudiante.
 *                 example: "Alergia al maní"
 *               activo:
 *                 type: boolean
 *                 description: Estado activo del estudiante (true para activo, false para inactivo).
 *                 example: true
 *     responses:
 *       200:s
 *         description: Estudiante actualizado exitosamente.
 *         content: 
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Estudiante actualizado exitosamente"
 *                 estudiante:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     nombre:
 *                       type: string
 *                       example: "María"
 *                     activo:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Datos de entrada inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Campos requeridos faltantes"
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
 *       403:
 *         description: Acceso denegado. El estudiante no pertenece al padre autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Acceso denegado"
 *       404:
 *         description: Estudiante no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Estudiante no encontrado"
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
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.tipoUsuario !== "padre") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const estudianteId = params.id
    const body = await request.json()
    const {
      nombre,
      apellido,
      fecha_nacimiento,
      curso,
      colegio,
      direccion_colegio,
      necesidades_especiales,
      activo,
    } = body

    // Validar que el estudiante existe y pertenece al padre autenticado
    const estudianteExistente = db
      .prepare(`
        SELECT id, padre_id FROM estudiantes
        WHERE id = ? AND padre_id = (SELECT id FROM padres WHERE usuario_id = ?)
      `)
      .get(estudianteId, user.userId)

    if (!estudianteExistente) {
      return NextResponse.json({ error: "Estudiante no encontrado o acceso denegado" }, { status: 404 })
    }

    // Construir la consulta de actualización dinámicamente
    let updateFields = []
    let updateParams = []

    if (nombre !== undefined) { updateFields.push("nombre = ?"); updateParams.push(nombre) }
    if (apellido !== undefined) { updateFields.push("apellido = ?"); updateParams.push(apellido) }
    if (fecha_nacimiento !== undefined) { updateFields.push("fecha_nacimiento = ?"); updateParams.push(fecha_nacimiento) }
    if (curso !== undefined) { updateFields.push("curso = ?"); updateParams.push(curso) }
    if (colegio !== undefined) { updateFields.push("colegio = ?"); updateParams.push(colegio) }
    if (direccion_colegio !== undefined) { updateFields.push("direccion_colegio = ?"); updateParams.push(direccion_colegio) }
    if (necesidades_especiales !== undefined) { updateFields.push("necesidades_especiales = ?"); updateParams.push(necesidades_especiales) }
    if (activo !== undefined) { updateFields.push("activo = ?"); updateParams.push(activo ? 1 : 0) }

    if (updateFields.length === 0) {
      return NextResponse.json({ message: "No hay campos para actualizar" }, { status: 200 })
    }

    const updateRuta = db.prepare(`
      UPDATE estudiantes
      SET ${updateFields.join(", ")}, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    updateRuta.run(...updateParams, estudianteId)

    const estudianteActualizado = db.prepare("SELECT * FROM estudiantes WHERE id = ?").get(estudianteId)

    return NextResponse.json(
      {
        message: "Estudiante actualizado exitosamente",
        estudiante: estudianteActualizado,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error actualizando estudiante:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

/**
 * @swagger
 * /estudiantes/{id}:
 *   delete:
 *     summary: Elimina un estudiante.
 *     description: Permite a un padre eliminar uno de sus estudiantes. Si el estudiante tiene servicios activos, la eliminación no será permitida.
 *     tags:
 *       - Estudiantes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del estudiante a eliminar.
 *         example: 1
 *     responses:
 *       200:
 *         description: Estudiante eliminado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Estudiante eliminado exitosamente"
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
 *       403:
 *         description: Acceso denegado. El estudiante tiene servicios activos o no pertenece al padre autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El estudiante tiene servicios activos y no puede ser eliminado o acceso denegado"
 *       404:
 *         description: Estudiante no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Estudiante no encontrado"
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
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.tipoUsuario !== "padre") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const estudianteId = params.id

    // Verificar que el estudiante existe y pertenece al padre autenticado
    const estudianteExistente = db
      .prepare(`
        SELECT s.id, p.id as padre_id, 
        (SELECT COUNT(*) FROM servicios WHERE estudiante_id = s.id AND estado = 'activo') as servicios_activos
        FROM estudiantes s
        JOIN padres p ON s.padre_id = p.id
        WHERE s.id = ? AND p.usuario_id = ?
      `)
      .get(estudianteId, user.userId)

    if (!estudianteExistente) {
      return NextResponse.json({ error: "Estudiante no encontrado o acceso denegado" }, { status: 404 })
    }

    if (estudianteExistente.servicios_activos > 0) {
      return NextResponse.json(
        { error: "El estudiante tiene servicios activos y no puede ser eliminado" },
        { status: 403 },
      )
    }

    db.prepare("DELETE FROM estudiantes WHERE id = ?").run(estudianteId)

    return NextResponse.json({ message: "Estudiante eliminado exitosamente" }, { status: 200 })
  } catch (error) {
    console.error("Error eliminando estudiante:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
