import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

/**
 * @swagger
 * /pagos/process_payment:
 *   post:
 *     summary: Procesa el resultado de un pago de Mercado Pago.
 *     description: Este endpoint es llamado por Mercado Pago para procesar el resultado final de un pago (éxito, fracaso, pendiente).
 *     tags:
 *       - Pagos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payment_id:
 *                 type: string
 *                 description: ID del pago de Mercado Pago.
 *               status:
 *                 type: string
 *                 description: Estado del pago (approved, pending, rejected).
 *               external_reference:
 *                 type: string
 *                 description: Referencia externa del pago (solicitud_id_user_userId).
 *     responses:
 *       200:
 *         description: Pago procesado exitosamente.
 *       500:
 *         description: Error interno del servidor.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { payment_id, status, external_reference } = body

    console.log(`Procesando pago final: ID ${payment_id}, Estado: ${status}, Ref: ${external_reference}`)

    // Extraer solicitud_id y user_id de external_reference
    const parts = external_reference.split('_')
    const solicitudId = parseInt(parts[1])
    const userId = parseInt(parts[3])

    if (status === 'approved') {
      // Actualizar el estado del servicio a 'activo' y registrar el pago
      db.prepare("UPDATE servicios SET estado = ? WHERE id = ?").run('activo', solicitudId)
      
      const insertPago = db.prepare(`
        INSERT INTO pagos (servicio_id, monto, mes_correspondiente, metodo_pago, estado_pago, fecha_vencimiento, fecha_pago, referencia_pago, notas)
        SELECT ?, precio_acordado, STRFTIME('%Y-%m', 'now'), 'Mercado Pago', 'pagado', DATE('now', '+1 month', '-1 day'), DATE('now'), ?, 'Pago automático por Mercado Pago'
        FROM servicios WHERE id = ?
      `)
      insertPago.run(solicitudId, payment_id, solicitudId)

      console.log(`Servicio ${solicitudId} activado y pago registrado.`)
    } else if (status === 'rejected') {
      // Opcional: Actualizar el estado del servicio a 'cancelado' o similar, o simplemente loggear
      console.log(`Pago rechazado para solicitud ${solicitudId}. No se activa el servicio.`)
    }

    return NextResponse.json({ status: "ok" }, { status: 200 })
  } catch (error) {
    console.error("Error procesando el pago:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
} 