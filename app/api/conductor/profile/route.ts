import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

/**
 * @swagger
 * /conductor/profile:
 *   get:
 *     summary: Obtiene el perfil del conductor autenticado.
 *     description: Retorna los datos completos del perfil del conductor, incluyendo información de usuario y conductor.
 *     tags:
 *       - Conductores
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del conductor obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 usuario_id:
 *                   type: integer
 *                   example: 101
 *                 numero_licencia:
 *                   type: string
 *                   example: "123456789"
 *                 tipo_licencia:
 *                   type: string
 *                   example: "A1"
 *                 fecha_vencimiento_licencia:
 *                   type: string
 *                   format: date
 *                   example: "2025-12-31"
 *                 anos_experiencia:
 *                   type: integer
 *                   example: 5
 *                 calificacion_promedio:
 *                   type: number
 *                   format: float
 *                   example: 4.8
 *                 total_viajes:
 *                   type: integer
 *                   example: 150
 *                 antecedentes_verificados:
 *                   type: boolean
 *                   example: true
 *                 estado:
 *                   type: string
 *                   example: "verificado"
 *                 fecha_creacion:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-01-01T10:00:00Z"
 *                 fecha_actualizacion:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-01-01T10:00:00Z"
 *                 nombre:
 *                   type: string
 *                   example: "Carlos"
 *                 apellido:
 *                   type: string
 *                   example: "López"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "carlos.lopez@example.com"
 *                 telefono:
 *                   type: string
 *                   nullable: true
 *                   example: "+56955667788"
 *                 verificado:
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
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.tipoUsuario !== "conductor") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener datos completos del conductor
    const conductor = db
      .prepare(`
        SELECT 
          c.*,
          u.nombre,
          u.apellido,
          u.email,
          u.telefono,
          u.verificado,
          c.calificacion_promedio
        FROM conductores c
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.usuario_id = ?
      `)
      .get(user.userId)

    if (!conductor) {
      return NextResponse.json({ error: "Conductor no encontrado" }, { status: 404 })
    }

    return NextResponse.json(conductor)
  } catch (error) {
    console.error("Error obteniendo perfil del conductor:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
