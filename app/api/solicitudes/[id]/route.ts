import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.tipoUsuario !== "conductor") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const solicitudId = Number.parseInt(params.id)
    const body = await request.json()
    const { estado, respuesta_conductor } = body

    if (!estado || !["aceptada", "rechazada"].includes(estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
    }

    const transaction = db.transaction(() => {
      // Verificar que la solicitud pertenece a una ruta del conductor
      const solicitud = db
        .prepare(`
          SELECT sol.*, r.capacidad_maxima, COALESCE(COUNT(s.id), 0) as estudiantes_inscritos
          FROM solicitudes sol
          JOIN rutas r ON sol.ruta_id = r.id
          JOIN conductores c ON r.conductor_id = c.id
          LEFT JOIN servicios s ON r.id = s.ruta_id AND s.estado = 'activo'
          WHERE sol.id = ? AND c.usuario_id = ? AND sol.estado = 'pendiente'
          GROUP BY sol.id, r.capacidad_maxima
        `)
        .get(solicitudId, user.userId)

      if (!solicitud) {
        throw new Error("Solicitud no encontrada o no autorizada")
      }

      // Si se acepta, verificar capacidad
      if (estado === "aceptada") {
        const estudiantesInscritos = Number(solicitud.estudiantes_inscritos)
        if (estudiantesInscritos >= solicitud.capacidad_maxima) {
          throw new Error("No hay cupos disponibles en esta ruta")
        }

        // Obtener precio de la ruta
        const ruta = db.prepare("SELECT precio_mensual FROM rutas WHERE id = ?").get(solicitud.ruta_id)

        // Crear servicio activo
        db.prepare(`
          INSERT INTO servicios (ruta_id, padre_id, estudiante_id, precio_acordado, fecha_inicio, estado)
          VALUES (?, ?, ?, ?, DATE('now'), 'activo')
        `).run(solicitud.ruta_id, solicitud.padre_id, solicitud.estudiante_id, ruta.precio_mensual)
      }

      // Actualizar solicitud
      db.prepare(`
        UPDATE solicitudes SET 
          estado = ?,
          respuesta_conductor = ?,
          fecha_respuesta = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(estado, respuesta_conductor, solicitudId)

      return db.prepare("SELECT * FROM solicitudes WHERE id = ?").get(solicitudId)
    })

    try {
      const solicitudActualizada = transaction()

      return NextResponse.json({
        message: `Solicitud ${estado} exitosamente`,
        solicitud: solicitudActualizada,
      })
    } catch (error) {
      if (error.message === "Solicitud no encontrada o no autorizada") {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message === "No hay cupos disponibles en esta ruta") {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      throw error
    }
  } catch (error) {
    console.error("Error actualizando solicitud:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
