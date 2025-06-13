import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const { estado } = await request.json()

    if (!id || !estado) {
      return NextResponse.json({ error: "ID de servicio y estado requeridos" }, { status: 400 })
    }

    // Verificar si el usuario es un padre y el servicio le pertenece
    if (user.tipoUsuario === "padre") {
      const servicioExistente = db.prepare(`SELECT padre_id FROM servicios WHERE id = ?`).get(id)
      if (!servicioExistente) {
        return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
      }
      const padre = db.prepare(`SELECT id FROM padres WHERE usuario_id = ?`).get(user.userId)
      if (!padre || padre.id !== servicioExistente.padre_id) {
        return NextResponse.json({ error: "No autorizado para este servicio" }, { status: 403 })
      }
    } else if (user.tipoUsuario === "conductor") {
      // Si es un conductor, verificar que la ruta del servicio le pertenece
      const servicioExistente = db.prepare(`SELECT r.conductor_id FROM servicios s JOIN rutas r ON s.ruta_id = r.id WHERE s.id = ?`).get(id);
      if (!servicioExistente) {
          return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
      }
      const conductor = db.prepare(`SELECT id FROM conductores WHERE usuario_id = ?`).get(user.userId);
      if (!conductor || conductor.id !== servicioExistente.conductor_id) {
          return NextResponse.json({ error: "No autorizado para este servicio" }, { status: 403 });
      }
    }


    const updateServicio = db.prepare(`
      UPDATE servicios
      SET estado = ?, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    const result = updateServicio.run(estado, id)

    if (result.changes === 0) {
      return NextResponse.json({ error: "Servicio no encontrado o sin cambios" }, { status: 404 })
    }

    return NextResponse.json({ message: "Servicio actualizado exitosamente", id, nuevoEstado: estado })
  } catch (error) {
    console.error("Error actualizando servicio:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
} 