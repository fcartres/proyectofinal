import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const estudianteId = Number.parseInt(params.id)

    // Verificar tipo de usuario y obtener ID correspondiente
    let query, queryParams

    if (user.tipoUsuario === "padre") {
      // Obtener padre_id
      const padre = db.prepare("SELECT id FROM padres WHERE usuario_id = ?").get(user.userId)

      if (!padre) {
        return NextResponse.json({ error: "Padre no encontrado" }, { status: 404 })
      }

      query = "SELECT * FROM estudiantes WHERE id = ? AND padre_id = ?"
      queryParams = [estudianteId, padre.id]
    } else if (user.tipoUsuario === "conductor") {
      // Los conductores pueden ver estudiantes de sus servicios activos
      const conductor = db.prepare("SELECT id FROM conductores WHERE usuario_id = ?").get(user.userId)

      if (!conductor) {
        return NextResponse.json({ error: "Conductor no encontrado" }, { status: 404 })
      }

      // Verificar si el estudiante está en algún servicio activo del conductor
      query = `
        SELECT e.* FROM estudiantes e
        JOIN servicios s ON e.id = s.estudiante_id
        JOIN rutas r ON s.ruta_id = r.id
        WHERE e.id = ? AND r.conductor_id = ? AND s.estado = 'activo'
      `
      queryParams = [estudianteId, conductor.id]
    } else {
      return NextResponse.json({ error: "Tipo de usuario no válido" }, { status: 403 })
    }

    const estudiante = db.prepare(query).get(...queryParams)

    if (!estudiante) {
      return NextResponse.json({ error: "Estudiante no encontrado o no autorizado" }, { status: 404 })
    }

    return NextResponse.json(estudiante)
  } catch (error) {
    console.error("Error obteniendo estudiante:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.tipoUsuario !== "padre") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const estudianteId = Number.parseInt(params.id)
    const body = await request.json()

    // Obtener padre_id
    const padre = db.prepare("SELECT id FROM padres WHERE usuario_id = ?").get(user.userId)

    if (!padre) {
      return NextResponse.json({ error: "Padre no encontrado" }, { status: 404 })
    }

    // Verificar que el estudiante pertenece al padre
    const estudiante = db
      .prepare("SELECT id FROM estudiantes WHERE id = ? AND padre_id = ?")
      .get(estudianteId, padre.id)

    if (!estudiante) {
      return NextResponse.json({ error: "Estudiante no encontrado o no autorizado" }, { status: 404 })
    }

    const { nombre, apellido, fecha_nacimiento, curso, colegio, direccion_colegio, necesidades_especiales, activo } =
      body

    // Construir query dinámicamente
    const updates: string[] = []
    const queryParams: any[] = []

    if (nombre !== undefined) {
      updates.push("nombre = ?")
      queryParams.push(nombre)
    }
    if (apellido !== undefined) {
      updates.push("apellido = ?")
      queryParams.push(apellido)
    }
    if (fecha_nacimiento !== undefined) {
      updates.push("fecha_nacimiento = ?")
      queryParams.push(fecha_nacimiento)
    }
    if (curso !== undefined) {
      updates.push("curso = ?")
      queryParams.push(curso)
    }
    if (colegio !== undefined) {
      updates.push("colegio = ?")
      queryParams.push(colegio)
    }
    if (direccion_colegio !== undefined) {
      updates.push("direccion_colegio = ?")
      queryParams.push(direccion_colegio)
    }
    if (necesidades_especiales !== undefined) {
      updates.push("necesidades_especiales = ?")
      queryParams.push(necesidades_especiales)
    }
    if (activo !== undefined) {
      updates.push("activo = ?")
      queryParams.push(activo ? 1 : 0)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    queryParams.push(estudianteId)
    const updateQuery = `UPDATE estudiantes SET ${updates.join(", ")} WHERE id = ?`
    db.prepare(updateQuery).run(...queryParams)

    const estudianteActualizado = db.prepare("SELECT * FROM estudiantes WHERE id = ?").get(estudianteId)

    return NextResponse.json({
      message: "Estudiante actualizado exitosamente",
      estudiante: estudianteActualizado,
    })
  } catch (error) {
    console.error("Error actualizando estudiante:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.tipoUsuario !== "padre") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const estudianteId = Number.parseInt(params.id)

    // Obtener padre_id
    const padre = db.prepare("SELECT id FROM padres WHERE usuario_id = ?").get(user.userId)

    if (!padre) {
      return NextResponse.json({ error: "Padre no encontrado" }, { status: 404 })
    }

    // Verificar que el estudiante pertenece al padre
    const estudiante = db
      .prepare("SELECT id FROM estudiantes WHERE id = ? AND padre_id = ?")
      .get(estudianteId, padre.id)

    if (!estudiante) {
      return NextResponse.json({ error: "Estudiante no encontrado o no autorizado" }, { status: 404 })
    }

    // Verificar si hay servicios activos
    const serviciosActivos = db
      .prepare("SELECT COUNT(*) as count FROM servicios WHERE estudiante_id = ? AND estado = ?")
      .get(estudianteId, "activo")

    if (serviciosActivos.count > 0) {
      return NextResponse.json({ error: "No se puede eliminar un estudiante con servicios activos" }, { status: 400 })
    }

    // Soft delete - marcar como inactivo
    db.prepare("UPDATE estudiantes SET activo = 0 WHERE id = ?").run(estudianteId)

    return NextResponse.json({
      message: "Estudiante eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error eliminando estudiante:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
