import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehiculoId = Number.parseInt(params.id)

    const query = `
      SELECT 
        v.*,
        u.nombre as conductor_nombre,
        u.apellido as conductor_apellido
      FROM vehiculos v
      JOIN conductores c ON v.conductor_id = c.id
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE v.id = ?
    `

    const row = db.prepare(query).get(vehiculoId)

    if (!row) {
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 })
    }

    const vehiculo = {
      id: row.id,
      conductor_id: row.conductor_id,
      marca: row.marca,
      modelo: row.modelo,
      ano: row.ano,
      patente: row.patente,
      color: row.color,
      capacidad_maxima: row.capacidad_maxima,
      tipo_vehiculo: row.tipo_vehiculo,
      activa: Boolean(row.activa),
      conductor: {
        nombre: row.conductor_nombre,
        apellido: row.conductor_apellido,
      },
    }

    return NextResponse.json(vehiculo)
  } catch (error) {
    console.error("Error obteniendo vehículo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.tipoUsuario !== "conductor") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const vehiculoId = Number.parseInt(params.id)
    const body = await request.json()

    // Verificar que el vehículo pertenece al conductor
    const vehiculoExistente = db
      .prepare(`
        SELECT v.id FROM vehiculos v 
        JOIN conductores c ON v.conductor_id = c.id 
        WHERE v.id = ? AND c.usuario_id = ?
      `)
      .get(vehiculoId, user.userId)

    if (!vehiculoExistente) {
      return NextResponse.json({ error: "Vehículo no encontrado o no autorizado" }, { status: 404 })
    }

    const { marca, modelo, ano, patente, color, capacidad_maxima, tipo_vehiculo, activa } = body

    const updates: string[] = []
    const paramsArray: any[] = []

    if (marca !== undefined) {
      updates.push("marca = ?")
      paramsArray.push(marca)
    }
    if (modelo !== undefined) {
      updates.push("modelo = ?")
      paramsArray.push(modelo)
    }
    if (ano !== undefined) {
      updates.push("ano = ?")
      paramsArray.push(ano)
    }
    if (patente !== undefined) {
      updates.push("patente = ?")
      paramsArray.push(patente)
    }
    if (color !== undefined) {
      updates.push("color = ?")
      paramsArray.push(color)
    }
    if (capacidad_maxima !== undefined) {
      updates.push("capacidad_maxima = ?")
      paramsArray.push(capacidad_maxima)
    }
    if (tipo_vehiculo !== undefined) {
      updates.push("tipo_vehiculo = ?")
      paramsArray.push(tipo_vehiculo)
    }
    if (activa !== undefined) {
      updates.push("activa = ?")
      paramsArray.push(activa ? 1 : 0)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    updates.push("fecha_actualizacion = CURRENT_TIMESTAMP")
    paramsArray.push(vehiculoId)

    const updateQuery = `UPDATE vehiculos SET ${updates.join(", ")} WHERE id = ?`
    db.prepare(updateQuery).run(...paramsArray)

    const vehiculoActualizado = db.prepare("SELECT * FROM vehiculos WHERE id = ?").get(vehiculoId)

    return NextResponse.json({
      message: "Vehículo actualizado exitosamente",
      vehiculo: vehiculoActualizado,
    })
  } catch (error) {
    console.error("Error actualizando vehículo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.tipoUsuario !== "conductor") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const vehiculoId = Number.parseInt(params.id)

    // Verificar que el vehículo pertenece al conductor
    const vehiculoExistente = db
      .prepare(`
        SELECT v.id FROM vehiculos v 
        JOIN conductores c ON v.conductor_id = c.id 
        WHERE v.id = ? AND c.usuario_id = ?
      `)
      .get(vehiculoId, user.userId)

    if (!vehiculoExistente) {
      return NextResponse.json({ error: "Vehículo no encontrado o no autorizado" }, { status: 404 })
    }

    // Antes de eliminar el vehículo, desvincularlo de cualquier ruta
    db.prepare(`UPDATE rutas SET vehiculo_id = NULL WHERE vehiculo_id = ?`).run(vehiculoId);

    const result = db.prepare("DELETE FROM vehiculos WHERE id = ?").run(vehiculoId)

    if (result.changes === 0) {
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Vehículo eliminado exitosamente" })
  } catch (error) {
    console.error("Error eliminando vehículo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
} 