const express = require("express")
const router = express.Router()
const { body, validationResult } = require("express-validator")
const authService = require("../services/auth.service")

// Ruta de registro
router.post(
  "/register",
  [
    // Validaciones
    body("email")
      .isEmail()
      .withMessage("Email inválido"),
    body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("nombre").notEmpty().withMessage("El nombre es requerido"),
    body("apellido").notEmpty().withMessage("El apellido es requerido"),
    body("rut").notEmpty().withMessage("El RUT es requerido"),
    body("tipo_usuario").isIn(["padre", "conductor"]).withMessage("Tipo de usuario inválido"),
  ],
  async (req, res) => {
    try {
      // Verificar errores de validación
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

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
      } = req.body

      const prisma = req.app.locals.prisma

      // Verificar si el email o RUT ya existen
      const existingUser = await prisma.usuario.findFirst({
        where: {
          OR: [{ email }, { rut }],
        },
      })

      if (existingUser) {
        return res.status(409).json({ error: "Email o RUT ya registrado" })
      }

      // Crear usuario
      const hashedPassword = authService.hashPassword(password)

      const usuario = await prisma.$transaction(async (tx) => {
        // Crear usuario base
        const newUser = await tx.usuario.create({
          data: {
            email,
            password_hash: hashedPassword,
            nombre,
            apellido,
            telefono,
            rut,
            direccion,
            comuna,
            tipo_usuario,
          },
        })

        // Crear registro específico según tipo de usuario
        if (tipo_usuario === "conductor") {
          if (!numero_licencia || !tipo_licencia || !fecha_vencimiento_licencia || !anos_experiencia) {
            throw new Error("Campos de conductor requeridos faltantes")
          }

          await tx.conductor.create({
            data: {
              usuario_id: newUser.id,
              numero_licencia,
              tipo_licencia,
              fecha_vencimiento_licencia: new Date(fecha_vencimiento_licencia),
              anos_experiencia: Number.parseInt(anos_experiencia),
            },
          })
        } else if (tipo_usuario === "padre") {
          await tx.padre.create({
            data: {
              usuario_id: newUser.id,
              numero_estudiantes: numero_estudiantes || 1,
              contacto_emergencia_nombre,
              contacto_emergencia_telefono,
            },
          })
        }

        return newUser
      })

      // Generar token
      const token = authService.generateToken({
        userId: usuario.id,
        email: usuario.email,
        tipoUsuario: usuario.tipo_usuario,
      })

      res.status(201).json({
        message: "Usuario registrado exitosamente",
        user: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          tipo_usuario: usuario.tipo_usuario,
        },
        token,
      })
    } catch (error) {
      console.error("Error en registro:", error)
      if (error.message === "Campos de conductor requeridos faltantes") {
        return res.status(400).json({ error: error.message })
      }
      res.status(500).json({ error: "Error interno del servidor" })
    }
  },
)

// Ruta de login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("La contraseña es requerida"),
  ],
  async (req, res) => {
    try {
      // Verificar errores de validación
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { email, password } = req.body
      const prisma = req.app.locals.prisma

      // Buscar usuario
      const usuario = await prisma.usuario.findUnique({
        where: { email },
      })

      if (!usuario) {
        return res.status(401).json({ error: "Credenciales inválidas" })
      }

      if (!usuario.activo) {
        return res.status(401).json({ error: "Cuenta desactivada" })
      }

      // Verificar contraseña
      if (!authService.comparePassword(password, usuario.password_hash)) {
        return res.status(401).json({ error: "Credenciales inválidas" })
      }

      // Generar token
      const token = authService.generateToken({
        userId: usuario.id,
        email: usuario.email,
        tipoUsuario: usuario.tipo_usuario,
      })

      // Remover password_hash de la respuesta
      const { password_hash, ...userResponse } = usuario

      res.json({
        message: "Login exitoso",
        user: userResponse,
        token,
      })
    } catch (error) {
      console.error("Error en login:", error)
      res.status(500).json({ error: "Error interno del servidor" })
    }
  },
)

module.exports = router
