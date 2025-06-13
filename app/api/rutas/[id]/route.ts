import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rutaId = Number.parseInt(params.id)

    const query = `
      SELECT 
        r.*,
        u.nombre as conductor_nombre,
        u.apellido as conductor_apellido,
        u.telefono as conductor_telefono,
        c.calificacion_promedio,
        c.total_viajes,
        c.anos_experiencia,
        c.antecedentes_verificados,
        v.marca as vehiculo_marca,
        v.modelo as vehiculo_modelo,
        v.ano as vehiculo_ano,
        v.patente as vehiculo_patente,
        v.color as vehiculo_color,
        v.capacidad_maxima as vehiculo_capacidad,
        COALESCE(COUNT(s.id), 0) as estudiantes_inscritos
      FROM rutas r
      JOIN conductores c ON r.conductor_id = c.id
      JOIN usuarios u ON c.usuario_id = u.id
      LEFT JOIN vehiculos v ON r.vehiculo_id = v.id
      LEFT JOIN servicios s ON r.id = s.ruta_id AND s.estado = 'activo'
      WHERE r.id = ?
      GROUP BY r.id, u.nombre, u.apellido, u.telefono, c.calificacion_promedio, c.total_viajes, c.anos_experiencia, c.antecedentes_verificados, v.marca, v.modelo, v.ano, v.patente, v.color, v.capacidad_maxima
    `

    const row = db.prepare(query).get(rutaId)

    if (!row) {
      return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 })
    }

    const ruta = {
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
        telefono: row.conductor_telefono,
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
            color: row.vehiculo_color,
            capacidad_maxima: row.vehiculo_capacidad,
          }
        : null,
    }

    return NextResponse.json(ruta)
  } catch (error) {
    console.error("Error obteniendo ruta:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.tipoUsuario !== "conductor") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const rutaId = Number.parseInt(params.id)
    const body = await request.json()

    // Verificar que la ruta pertenece al conductor
    const ruta = db
      .prepare(`
        SELECT r.id FROM rutas r 
        JOIN conductores c ON r.conductor_id = c.id 
        WHERE r.id = ? AND c.usuario_id = ?
      `)
      .get(rutaId, user.userId)

    if (!ruta) {
      return NextResponse.json({ error: "Ruta no encontrada o no autorizada" }, { status: 404 })
    }

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

    // Construir query dinámicamente solo con campos que se van a actualizar
    const updates: string[] = []
    const paramsArray: any[] = []

    if (nombre !== undefined) {
      updates.push("nombre = ?")
      paramsArray.push(nombre)
    }
    if (origen !== undefined) {
      updates.push("origen = ?")
      paramsArray.push(origen)
    }
    if (destino !== undefined) {
      updates.push("destino = ?")
      paramsArray.push(destino)
    }
    if (colegio_destino !== undefined) {
      updates.push("colegio_destino = ?")
      paramsArray.push(colegio_destino)
    }
    if (horario_ida !== undefined) {
      updates.push("horario_ida = ?")
      paramsArray.push(horario_ida)
    }
    if (horario_vuelta !== undefined) {
      updates.push("horario_vuelta = ?")
      paramsArray.push(horario_vuelta)
    }
    if (precio_mensual !== undefined) {
      updates.push("precio_mensual = ?")
      paramsArray.push(precio_mensual)
    }
    if (capacidad_maxima !== undefined) {
      updates.push("capacidad_maxima = ?")
      paramsArray.push(capacidad_maxima)
    }
    if (descripcion !== undefined) {
      updates.push("descripcion = ?")
      paramsArray.push(descripcion)
    }
    if (dias_servicio !== undefined) {
      updates.push("dias_servicio = ?")
      paramsArray.push(dias_servicio)
    }
    if (activa !== undefined) {
      updates.push("activa = ?")
      paramsArray.push(activa ? 1 : 0)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    updates.push("fecha_actualizacion = CURRENT_TIMESTAMP")
    paramsArray.push(rutaId)

    const updateQuery = `UPDATE rutas SET ${updates.join(", ")} WHERE id = ?`
    db.prepare(updateQuery).run(...paramsArray)

    const rutaActualizada = db.prepare("SELECT * FROM rutas WHERE id = ?").get(rutaId)

    return NextResponse.json({
      message: "Ruta actualizada exitosamente",
      ruta: rutaActualizada,
    })
  } catch (error) {
    console.error("Error actualizando ruta:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.tipoUsuario !== "conductor") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const rutaId = Number.parseInt(params.id)

    // Verificar que la ruta pertenece al conductor
    const ruta = db
      .prepare(`
        SELECT r.id FROM rutas r 
        JOIN conductores c ON r.conductor_id = c.id 
        WHERE r.id = ? AND c.usuario_id = ?
      `)
      .get(rutaId, user.userId)

    if (!ruta) {
      return NextResponse.json({ error: "Ruta no encontrada o no autorizada" }, { status: 404 })
    }

    // Verificar si hay servicios activos
    const serviciosActivos = db
      .prepare("SELECT COUNT(*) as count FROM servicios WHERE ruta_id = ? AND estado = ?")
      .get(rutaId, "activo")

    if (serviciosActivos.count > 0) {
      return NextResponse.json({ error: "No se puede eliminar una ruta con servicios activos" }, { status: 400 })
    }

    db.prepare("DELETE FROM rutas WHERE id = ?").run(rutaId)

    return NextResponse.json({
      message: "Ruta eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error eliminando ruta:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
