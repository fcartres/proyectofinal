import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { hashPassword, generateToken } from "@/lib/auth"

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario (Padre o Conductor).
 *     description: Permite a un nuevo usuario crear una cuenta en la aplicación Furgón Seguro. Dependiendo del tipo de usuario, se requieren campos adicionales.
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
 *               - nombre
 *               - apellido
 *               - rut
 *               - tipo_usuario
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
 *               nombre:
 *                 type: string
 *                 description: Nombre del usuario.
 *                 example: Juan
 *               apellido:
 *                 type: string
 *                 description: Apellido del usuario.
 *                 example: Pérez
 *               telefono:
 *                 type: string
 *                 nullable: true
 *                 description: Número de teléfono del usuario (opcional).
 *                 example: +56912345678
 *               rut:
 *                 type: string
 *                 description: RUT del usuario (identificador único en Chile).
 *                 example: 12345678-9
 *               direccion:
 *                 type: string
 *                 nullable: true
 *                 description: Dirección del usuario (opcional).
 *                 example: Calle Falsa 123
 *               comuna:
 *                 type: string
 *                 nullable: true
 *                 description: Comuna de residencia del usuario (opcional).
 *                 example: Santiago
 *               tipo_usuario:
 *                 type: string
 *                 enum:
 *                   - padre
 *                   - conductor
 *                 description: Tipo de rol del usuario.
 *                 example: conductor
 *               # Campos específicos para conductor
 *               numero_licencia:
 *                 type: string
 *                 description: Número de licencia de conducir (requerido si tipo_usuario es 'conductor').
 *                 example: 123456789
 *               tipo_licencia:
 *                 type: string
 *                 description: Tipo de licencia de conducir (requerido si tipo_usuario es 'conductor').
 *                 example: A1
 *               fecha_vencimiento_licencia:
 *                 type: string
 *                 format: date
 *                 description: Fecha de vencimiento de la licencia (requerido si tipo_usuario es 'conductor').
 *                 example: 2025-12-31
 *               anos_experiencia:
 *                 type: integer
 *                 description: Años de experiencia como conductor (requerido si tipo_usuario es 'conductor').
 *                 example: 5
 *               # Campos específicos para padre
 *               numero_estudiantes:
 *                 type: integer
 *                 nullable: true
 *                 description: Número de estudiantes asociados al padre (opcional, por defecto 1).
 *                 example: 2
 *               contacto_emergencia_nombre:
 *                 type: string
 *                 nullable: true
 *                 description: Nombre del contacto de emergencia (opcional).
 *                 example: Maria Perez
 *               contacto_emergencia_telefono:
 *                 type: string
 *                 nullable: true
 *                 description: Teléfono del contacto de emergencia (opcional).
 *                 example: +56998765432
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario registrado exitosamente"
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
 *                 token:
 *                   type: string
 *                   description: Token de autenticación JWT.
 *       400:
 *         description: Campos requeridos faltantes o tipo de usuario inválido o campos de conductor faltantes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Campos requeridos faltantes"
 *       409:
 *         description: Email o RUT ya registrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email o RUT ya registrado"
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
    const body = await request.json()
    const {
      email,
      password,
      nombre,
      apellido,
      telefono,
      rut,
      direccion,
      comuna,
      tipo_usuario,
      // Campos específicos para conductor
      numero_licencia,
      tipo_licencia,
      fecha_vencimiento_licencia,
      anos_experiencia,
      // Campos específicos para padre
      numero_estudiantes,
      contacto_emergencia_nombre,
      contacto_emergencia_telefono,
    } = body

    // Validaciones básicas
    if (!email || !password || !nombre || !apellido || !rut || !tipo_usuario) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    if (!["padre", "conductor"].includes(tipo_usuario)) {
      return NextResponse.json({ error: "Tipo de usuario inválido" }, { status: 400 })
    }

    try {
      const result = db.transaction(() => {
        // Verificar si el email o RUT ya existen
        const existingUser = db.prepare("SELECT id FROM usuarios WHERE email = ? OR rut = ?").get(email, rut)

        if (existingUser) {
          throw new Error("Email o RUT ya registrado")
        }

        // Crear usuario
        const hashedPassword = hashPassword(password)
        const insertUser = db.prepare(`
          INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, rut, direccion, comuna, tipo_usuario)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)

        const userResult = insertUser.run(
          email,
          hashedPassword,
          nombre,
          apellido,
          telefono || null,
          rut,
          direccion || null,
          comuna || null,
          tipo_usuario,
        )
        const userId = userResult.lastInsertRowid

        // Crear registro específico según tipo de usuario
        if (tipo_usuario === "conductor") {
          if (!numero_licencia || !tipo_licencia || !fecha_vencimiento_licencia || !anos_experiencia) {
            throw new Error("Campos de conductor requeridos faltantes")
          }

          const insertConductor = db.prepare(`
            INSERT INTO conductores (usuario_id, numero_licencia, tipo_licencia, fecha_vencimiento_licencia, anos_experiencia)
            VALUES (?, ?, ?, ?, ?)
          `)
          insertConductor.run(userId, numero_licencia, tipo_licencia, fecha_vencimiento_licencia, anos_experiencia)
        } else if (tipo_usuario === "padre") {
          const insertPadre = db.prepare(`
            INSERT INTO padres (usuario_id, numero_estudiantes, contacto_emergencia_nombre, contacto_emergencia_telefono)
            VALUES (?, ?, ?, ?)
          `)
          insertPadre.run(
            userId,
            numero_estudiantes || 1,
            contacto_emergencia_nombre || null,
            contacto_emergencia_telefono || null,
          )
        }

        // Obtener el usuario creado
        const usuario = db
          .prepare("SELECT id, email, nombre, apellido, tipo_usuario FROM usuarios WHERE id = ?")
          .get(userId)

        return usuario
      })()

      // Generar token
      const token = generateToken({
        userId: result.id,
        email: result.email,
        tipoUsuario: result.tipo_usuario,
      })

      return NextResponse.json(
        {
          message: "Usuario registrado exitosamente",
          user: result,
          token,
        },
        { status: 201 },
      )
    } catch (error: any) {
      if (error.message === "Email o RUT ya registrado") {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
      if (error.message === "Campos de conductor requeridos faltantes") {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      throw error
    }
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
