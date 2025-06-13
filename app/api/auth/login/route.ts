import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { comparePassword, generateToken } from "@/lib/auth"

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión de un usuario.
 *     description: Permite a un usuario autenticarse con su correo electrónico y contraseña para obtener un token JWT.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario.
 *                 example: usuario@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario.
 *                 example: ContrasenaSegura123
 *     responses:
 *       200:
 *         description: Login exitoso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login exitoso"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     apellido:
 *                       type: string
 *                     tipo_usuario:
 *                       type: string
 *                     verificado:
 *                       type: boolean
 *                     activo:
 *                       type: boolean
 *                 token:
 *                   type: string
 *                   description: Token de autenticación JWT.
 *       400:
 *         description: Email y contraseña son requeridos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email y contraseña son requeridos"
 *       401:
 *         description: Credenciales inválidas o cuenta desactivada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Credenciales inválidas"
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
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Buscar usuario
    const usuario = db
      .prepare(
        "SELECT id, email, password_hash, nombre, apellido, tipo_usuario, verificado, activo FROM usuarios WHERE email = ?",
      )
      .get(email)

    if (!usuario) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    if (!usuario.activo) {
      return NextResponse.json({ error: "Cuenta desactivada" }, { status: 401 })
    }

    // Verificar contraseña
    if (!comparePassword(password, usuario.password_hash)) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Generar token
    const token = generateToken({
      userId: usuario.id,
      email: usuario.email,
      tipoUsuario: usuario.tipo_usuario,
    })

    // Remover password_hash de la respuesta
    const { password_hash, ...userResponse } = usuario

    return NextResponse.json({
      message: "Login exitoso",
      user: userResponse,
      token,
    })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
