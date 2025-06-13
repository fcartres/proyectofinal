import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

/**
 * @swagger
 * /pagos/mercadopago/webhook:
 *   post:
 *     summary: Recibe notificaciones de webhook de Mercado Pago.
 *     description: Este endpoint es llamado por Mercado Pago para notificar sobre cambios en el estado de los pagos.
 *     tags:
 *       - Pagos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID de la notificación de Mercado Pago.
 *               topic:
 *                 type: string
 *                 description: Tipo de evento (ej. payment).
 *               resource:
 *                 type: string
 *                 description: URL del recurso de Mercado Pago.
 *     responses:
 *       200:
 *         description: Notificación recibida exitosamente.
 *       500:
 *         description: Error interno del servidor.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Mercado Pago Webhook recibido:", body)

    if (body.topic === "payment") {
      const paymentId = body.id
      console.log(`Procesando pago con ID: ${paymentId}`)

      // En un entorno real, aquí se verificaría el pago con la API de MP
      // y se actualizaría el estado del servicio en la base de datos.

      // Por ahora, solo se registra.
      const insertLog = db.prepare("INSERT INTO payment_webhooks (payment_id, payload) VALUES (?, ?)")
      insertLog.run(paymentId, JSON.stringify(body))
    }

    return NextResponse.json({ status: "ok" }, { status: 200 })
  } catch (error) {
    console.error("Error en el webhook de Mercado Pago:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
} 