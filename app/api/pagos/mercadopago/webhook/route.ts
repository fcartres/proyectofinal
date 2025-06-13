import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verificar que es una notificación de pago
    if (body.type !== "payment") {
      return NextResponse.json({ status: "ignored" })
    }

    const paymentId = body.data.id
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!accessToken) {
      console.error("Access token de Mercado Pago no configurado")
      return NextResponse.json({ error: "Configuración faltante" }, { status: 500 })
    }

    // Obtener información del pago desde Mercado Pago
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!paymentResponse.ok) {
      console.error("Error al obtener información del pago")
      return NextResponse.json({ error: "Error al verificar pago" }, { status: 500 })
    }

    const paymentData = await paymentResponse.json()

    // Extraer información de la referencia externa
    const externalReference = paymentData.external_reference
    if (!externalReference) {
      console.error("Referencia externa no encontrada")
      return NextResponse.json({ error: "Referencia no encontrada" }, { status: 400 })
    }

    // Parsear la referencia: "solicitud_{id}_user_{userId}"
    const referenceMatch = externalReference.match(/solicitud_(\d+)_user_(\d+)/)
    if (!referenceMatch) {
      console.error("Formato de referencia inválido:", externalReference)
      return NextResponse.json({ error: "Formato de referencia inválido" }, { status: 400 })
    }

    const solicitudId = Number.parseInt(referenceMatch[1])
    const userId = Number.parseInt(referenceMatch[2])

    // Procesar según el estado del pago
    if (paymentData.status === "approved") {
      // Pago aprobado - crear servicio activo
      const transaction = db.transaction(() => {
        // Obtener información de la solicitud
        const solicitud = db
          .prepare(`
          SELECT s.*, r.precio_mensual 
          FROM solicitudes s 
          JOIN rutas r ON s.ruta_id = r.id 
          WHERE s.id = ?
        `)
          .get(solicitudId)

        if (!solicitud) {
          throw new Error("Solicitud no encontrada")
        }

        // Crear servicio activo
        const insertServicio = db.prepare(`
          INSERT INTO servicios (ruta_id, padre_id, estudiante_id, precio_acordado, fecha_inicio, estado)
          VALUES (?, ?, ?, ?, DATE('now'), 'activo')
        `)

        const servicioResult = insertServicio.run(
          solicitud.ruta_id,
          solicitud.padre_id,
          solicitud.estudiante_id,
          solicitud.precio_mensual,
        )

        // Registrar el pago
        const insertPago = db.prepare(`
          INSERT INTO pagos (
            servicio_id, monto, mes_correspondiente, metodo_pago, 
            estado_pago, fecha_vencimiento, fecha_pago, referencia_pago
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)

        const fechaActual = new Date()
        const mesCorrespondiente = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1)
        const fechaVencimiento = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 5)

        insertPago.run(
          servicioResult.lastInsertRowid,
          paymentData.transaction_amount,
          mesCorrespondiente.toISOString().split("T")[0],
          "mercadopago",
          "pagado",
          fechaVencimiento.toISOString().split("T")[0],
          new Date().toISOString(),
          paymentData.id.toString(),
        )

        // Actualizar estado de la solicitud
        db.prepare(`
          UPDATE solicitudes 
          SET estado = 'pagada', fecha_respuesta = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).run(solicitudId)

        return servicioResult.lastInsertRowid
      })

      try {
        const servicioId = transaction()
        console.log(`Pago aprobado y servicio creado: ${servicioId}`)
      } catch (error) {
        console.error("Error en transacción:", error)
        return NextResponse.json({ error: "Error al procesar pago" }, { status: 500 })
      }
    } else if (paymentData.status === "rejected") {
      // Pago rechazado - mantener solicitud como aceptada
      console.log(`Pago rechazado para solicitud ${solicitudId}`)
    } else if (paymentData.status === "pending") {
      // Pago pendiente - registrar como pendiente
      console.log(`Pago pendiente para solicitud ${solicitudId}`)
    }

    return NextResponse.json({ status: "processed" })
  } catch (error) {
    console.error("Error procesando webhook de Mercado Pago:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
