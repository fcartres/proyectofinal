import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

/**
 * @swagger
 * /conductor/verificar:
 *   post:
 *     summary: Marca al conductor autenticado como verificado.
 *     description: Este endpoint permite a un conductor marcar su perfil como verificado, actualizando su estado en la base de datos.
 *     tags:
 *       - Conductores
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conductor verificado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Conductor verificado exitosamente"
 *                 success:
 *                   type: boolean
 *                   example: true
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
 */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.tipoUsuario !== "conductor") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener conductor_id
    const conductor = db.prepare("SELECT id FROM conductores WHERE usuario_id = ?").get(user.userId)

    if (!conductor) {
      return NextResponse.json({ error: "Conductor no encontrado" }, { status: 404 })
    }

    // Verificar automáticamente al conductor
    db.prepare(`
      UPDATE conductores 
      SET estado = 'verificado', 
          antecedentes_verificados = 1,
          fecha_verificacion_antecedentes = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(conductor.id)

    return NextResponse.json({
      message: "Conductor verificado exitosamente",
      success: true,
    })
  } catch (error) {
    console.error("Error verificando conductor:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
