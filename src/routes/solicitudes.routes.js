const express = require("express")
const router = express.Router()
const { body, param, validationResult } = require("express-validator")
const { verifyToken, isConductor, isPadre } = require("../middlewares/auth.middleware")

// Obtener solicitudes (filtradas por tipo de usuario)
router.get("/", [verifyToken], async (req, res) => {
  try {
    const prisma = req.app.locals.prisma
    const { estado } = req.query

    const where = {}

    // Filtrar por estado si se proporciona
    if (estado) {
      where.estado = estado
    }

    // Filtrar por tipo de usuario
    if (req.user.tipoUsuario === "conductor") {
      // Obtener conductor_id
      const conductor = await prisma.conductor.findFirst({
        where: { usuario_id: req.user.userId },
      })

      if (!conductor) {
        return res.status(404).json({ error: "Conductor no encontrado" })
      }

      // Filtrar solicitudes para rutas del conductor
      where.ruta = {
        conductor_id: conductor.id,
      }
    } else if (req.user.tipoUsuario === "padre") {
      // Obtener padre_id
      const padre = await prisma.padre.findFirst({
        where: { usuario_id: req.user.userId },
      })

      if (!padre) {
        return res.status(404).json({ error: "Padre no encontrado" })
      }

      // Filtrar solicitudes del padre
      where.padre_id = padre.id
    }

    // Obtener solicitudes con información relacionada
    const solicitudes = await prisma.solicitud.findMany({
      where,
      include: {
        ruta: {
          select: {
            nombre: true,
            origen: true,
            destino: true,
          },
        },
        padre: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
                telefono: true,
              },
            },
          },
        },
        estudiante: {
          select: {
            nombre: true,
            apellido: true,
            curso: true,
          },
        },
      },
      orderBy: {
        fecha_solicitud: "desc",
      },
    })

    // Formatear respuesta
    const solicitudesFormateadas = solicitudes.map((sol) => ({
      id: sol.id,
      ruta_id: sol.ruta_id,
      padre_id: sol.padre_id,
      estudiante_id: sol.estudiante_id,
      mensaje: sol.mensaje,
      estado: sol.estado,
      fecha_solicitud: sol.fecha_solicitud,
      fecha_respuesta: sol.fecha_respuesta,
      respuesta_conductor: sol.respuesta_conductor,
      ruta: {
        nombre: sol.ruta.nombre,
        origen: sol.ruta.origen,
        destino: sol.ruta.destino,
      },
      padre: {
        nombre: sol.padre.usuario.nombre,
        apellido: sol.padre.usuario.apellido,
        telefono: sol.padre.usuario.telefono,
      },
      estudiante: {
        nombre: sol.estudiante.nombre,
        apellido: sol.estudiante.apellido,
        curso: sol.estudiante.curso,
      },
    }))

    res.json(solicitudesFormateadas)
  } catch (error) {
    console.error("Error obteniendo solicitudes:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Crear una nueva solicitud (solo padres)
router.post(
  "/",
  [
    verifyToken,
    isPadre,
    body("ruta_id").isInt().withMessage("ID de ruta inválido"),
    body("estudiante_id").isInt().withMessage("ID de estudiante inválido"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { ruta_id, estudiante_id, mensaje } = req.body
      const prisma = req.app.locals.prisma

      // Obtener padre_id
      const padre = await prisma.padre.findFirst({
        where: { usuario_id: req.user.userId },
      })

      if (!padre) {
        return res.status(404).json({ error: "Padre no encontrado" })
      }

      // Verificar que el estudiante pertenece al padre
      const estudiante = await prisma.estudiante.findFirst({
        where: {
          id: estudiante_id,
          padre_id: padre.id,
        },
      })

      if (!estudiante) {
        return res.status(404).json({ error: "Estudiante no encontrado o no autorizado" })
      }

      // Verificar que no existe una solicitud pendiente para la misma ruta y estudiante
      const solicitudExistente = await prisma.solicitud.findFirst({
        where: {
          ruta_id: ruta_id,
          padre_id: padre.id,
          estudiante_id: estudiante_id,
          estado: "pendiente",
        },
      })

      if (solicitudExistente) {
        return res.status(409).json({ error: "Ya existe una solicitud pendiente para esta ruta y estudiante" })
      }

      // Crear solicitud
      const nuevaSolicitud = await prisma.solicitud.create({
        data: {
          ruta_id: ruta_id,
          padre_id: padre.id,
          estudiante_id: estudiante_id,
          mensaje: mensaje,
        },
      })

      res.status(201).json({
        message: "Solicitud enviada exitosamente",
        solicitud: nuevaSolicitud,
      })
    } catch (error) {
      console.error("Error creando solicitud:", error)
      res.status(500).json({ error: "Error interno del servidor" })
    }
  },
)

// Responder a una solicitud (solo conductores)
router.put(
  "/:id",
  [
    verifyToken,
    isConductor,
    param("id").isInt().withMessage("ID de solicitud inválido"),
    body("estado").isIn(["aceptada", "rechazada"]).withMessage("Estado inválido"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const solicitudId = Number.parseInt(req.params.id)
      const { estado, respuesta_conductor } = req.body
      const prisma = req.app.locals.prisma

      // Obtener conductor_id
      const conductor = await prisma.conductor.findFirst({
        where: { usuario_id: req.user.userId },
      })

      if (!conductor) {
        return res.status(404).json({ error: "Conductor no encontrado" })
      }

      try {
        // Usar transacción para garantizar consistencia
        const solicitudActualizada = await prisma.$transaction(async (tx) => {
          // Verificar que la solicitud pertenece a una ruta del conductor
          const solicitud = await tx.solicitud.findFirst({
            where: {
              id: solicitudId,
              estado: "pendiente",
              ruta: {
                conductor_id: conductor.id,
              },
            },
            include: {
              ruta: true,
            },
          })

          if (!solicitud) {
            throw new Error("Solicitud no encontrada o no autorizada")
          }

          // Si se acepta, verificar capacidad y crear servicio
          if (estado === "aceptada") {
            // Contar estudiantes inscritos
            const estudiantesInscritos = await tx.servicio.count({
              where: {
                ruta_id: solicitud.ruta_id,
                estado: "activo",
              },
            })

            if (estudiantesInscritos >= solicitud.ruta.capacidad_maxima) {
              throw new Error("No hay cupos disponibles en esta ruta")
            }

            // Crear servicio activo
            await tx.servicio.create({
              data: {
                ruta_id: solicitud.ruta_id,
                padre_id: solicitud.padre_id,
                estudiante_id: solicitud.estudiante_id,
                precio_acordado: solicitud.ruta.precio_mensual,
                fecha_inicio: new Date(),
                estado: "activo",
              },
            })
          }

          // Actualizar solicitud
          return await tx.solicitud.update({
            where: { id: solicitudId },
            data: {
              estado: estado,
              respuesta_conductor: respuesta_conductor,
              fecha_respuesta: new Date(),
            },
          })
        })

        res.json({
          message: `Solicitud ${estado} exitosamente`,
          solicitud: solicitudActualizada,
        })
      } catch (error) {
        if (error.message === "Solicitud no encontrada o no autorizada") {
          return res.status(404).json({ error: error.message })
        }
        if (error.message === "No hay cupos disponibles en esta ruta") {
          return res.status(400).json({ error: error.message })
        }
        throw error
      }
    } catch (error) {
      console.error("Error actualizando solicitud:", error)
      res.status(500).json({ error: "Error interno del servidor" })
    }
  },
)

module.exports = router
