const express = require("express")
const router = express.Router()
const { body, param, validationResult } = require("express-validator")
const { verifyToken, isConductor } = require("../middlewares/auth.middleware")

// Obtener todas las rutas (públicas)
router.get("/", async (req, res) => {
  try {
    const prisma = req.app.locals.prisma
    const { origen, destino, colegio, activa = "true" } = req.query

    const isActiva = activa !== "false"

    // Construir filtros
    const where = {
      activa: isActiva,
    }

    if (origen) {
      where.origen = { contains: origen }
    }

    if (destino) {
      where.destino = { contains: destino }
    }

    if (colegio) {
      where.colegio_destino = { contains: colegio }
    }

    // Obtener rutas con información relacionada
    const rutas = await prisma.ruta.findMany({
      where,
      include: {
        conductor: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
          },
        },
        vehiculo: true,
        servicios: {
          where: {
            estado: "activo",
          },
        },
      },
      orderBy: {
        fecha_creacion: "desc",
      },
    })

    // Formatear respuesta
    const rutasFormateadas = rutas.map((ruta) => ({
      id: ruta.id,
      conductor_id: ruta.conductor_id,
      vehiculo_id: ruta.vehiculo_id,
      nombre: ruta.nombre,
      origen: ruta.origen,
      destino: ruta.destino,
      colegio_destino: ruta.colegio_destino,
      horario_ida: ruta.horario_ida,
      horario_vuelta: ruta.horario_vuelta,
      precio_mensual: ruta.precio_mensual,
      capacidad_maxima: ruta.capacidad_maxima,
      descripcion: ruta.descripcion,
      dias_servicio: ruta.dias_servicio,
      activa: ruta.activa,
      estudiantes_inscritos: ruta.servicios.length,
      conductor: {
        nombre: ruta.conductor.usuario.nombre,
        apellido: ruta.conductor.usuario.apellido,
        calificacion_promedio: ruta.conductor.calificacion_promedio,
        total_viajes: ruta.conductor.total_viajes,
        anos_experiencia: ruta.conductor.anos_experiencia,
        antecedentes_verificados: ruta.conductor.antecedentes_verificados,
      },
      vehiculo: ruta.vehiculo
        ? {
            marca: ruta.vehiculo.marca,
            modelo: ruta.vehiculo.modelo,
            ano: ruta.vehiculo.ano,
            patente: ruta.vehiculo.patente,
            capacidad_maxima: ruta.vehiculo.capacidad_maxima,
          }
        : null,
    }))

    res.json(rutasFormateadas)
  } catch (error) {
    console.error("Error obteniendo rutas:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Obtener una ruta por ID
router.get("/:id", [param("id").isInt().withMessage("ID de ruta inválido")], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const rutaId = Number.parseInt(req.params.id)
    const prisma = req.app.locals.prisma

    const ruta = await prisma.ruta.findUnique({
      where: { id: rutaId },
      include: {
        conductor: {
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
        vehiculo: true,
        servicios: {
          where: {
            estado: "activo",
          },
        },
      },
    })

    if (!ruta) {
      return res.status(404).json({ error: "Ruta no encontrada" })
    }

    // Formatear respuesta
    const rutaFormateada = {
      id: ruta.id,
      conductor_id: ruta.conductor_id,
      vehiculo_id: ruta.vehiculo_id,
      nombre: ruta.nombre,
      origen: ruta.origen,
      destino: ruta.destino,
      colegio_destino: ruta.colegio_destino,
      horario_ida: ruta.horario_ida,
      horario_vuelta: ruta.horario_vuelta,
      precio_mensual: ruta.precio_mensual,
      capacidad_maxima: ruta.capacidad_maxima,
      descripcion: ruta.descripcion,
      dias_servicio: ruta.dias_servicio,
      activa: ruta.activa,
      estudiantes_inscritos: ruta.servicios.length,
      conductor: {
        nombre: ruta.conductor.usuario.nombre,
        apellido: ruta.conductor.usuario.apellido,
        telefono: ruta.conductor.usuario.telefono,
        calificacion_promedio: ruta.conductor.calificacion_promedio,
        total_viajes: ruta.conductor.total_viajes,
        anos_experiencia: ruta.conductor.anos_experiencia,
        antecedentes_verificados: ruta.conductor.antecedentes_verificados,
      },
      vehiculo: ruta.vehiculo
        ? {
            marca: ruta.vehiculo.marca,
            modelo: ruta.vehiculo.modelo,
            ano: ruta.vehiculo.ano,
            patente: ruta.vehiculo.patente,
            color: ruta.vehiculo.color,
            capacidad_maxima: ruta.vehiculo.capacidad_maxima,
          }
        : null,
    }

    res.json(rutaFormateada)
  } catch (error) {
    console.error("Error obteniendo ruta:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Crear una nueva ruta (solo conductores)
router.post(
  "/",
  [
    verifyToken,
    isConductor,
    body("nombre").notEmpty().withMessage("El nombre es requerido"),
    body("origen").notEmpty().withMessage("El origen es requerido"),
    body("destino").notEmpty().withMessage("El destino es requerido"),
    body("colegio_destino").notEmpty().withMessage("El colegio de destino es requerido"),
    body("horario_ida").notEmpty().withMessage("El horario de ida es requerido"),
    body("horario_vuelta").notEmpty().withMessage("El horario de vuelta es requerido"),
    body("precio_mensual").isInt({ min: 1 }).withMessage("El precio mensual debe ser un número positivo"),
    body("capacidad_maxima").isInt({ min: 1 }).withMessage("La capacidad máxima debe ser un número positivo"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const {
        nombre,
        origen,
        destino,
        colegio_destino,
        horario_ida,
        horario_vuelta,
        precio_mensual,
        capacidad_maxima,
        descripcion,
        dias_servicio,
      } = req.body

      const prisma = req.app.locals.prisma

      // Obtener conductor_id
      const conductor = await prisma.conductor.findFirst({
        where: {
          usuario_id: req.user.userId,
          estado: "verificado",
        },
        include: {
          vehiculos: {
            where: {
              activo: true,
            },
            take: 1,
          },
        },
      })

      if (!conductor) {
        return res.status(404).json({ error: "Conductor no encontrado o no verificado" })
      }

      // Crear ruta
      const nuevaRuta = await prisma.ruta.create({
        data: {
          conductor_id: conductor.id,
          vehiculo_id: conductor.vehiculos[0]?.id || null,
          nombre,
          origen,
          destino,
          colegio_destino,
          horario_ida,
          horario_vuelta,
          precio_mensual: Number.parseInt(precio_mensual),
          capacidad_maxima: Number.parseInt(capacidad_maxima),
          descripcion,
          dias_servicio: dias_servicio || "lunes-viernes",
        },
      })

      res.status(201).json({
        message: "Ruta creada exitosamente",
        ruta: nuevaRuta,
      })
    } catch (error) {
      console.error("Error creando ruta:", error)
      res.status(500).json({ error: "Error interno del servidor" })
    }
  },
)

// Actualizar una ruta (solo conductor propietario)
router.put(
  "/:id",
  [verifyToken, isConductor, param("id").isInt().withMessage("ID de ruta inválido")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const rutaId = Number.parseInt(req.params.id)
      const prisma = req.app.locals.prisma

      // Verificar que la ruta pertenece al conductor
      const conductor = await prisma.conductor.findFirst({
        where: {
          usuario_id: req.user.userId,
        },
      })

      if (!conductor) {
        return res.status(404).json({ error: "Conductor no encontrado" })
      }

      const ruta = await prisma.ruta.findFirst({
        where: {
          id: rutaId,
          conductor_id: conductor.id,
        },
      })

      if (!ruta) {
        return res.status(404).json({ error: "Ruta no encontrada o no autorizada" })
      }

      // Campos a actualizar
      const {
        nombre,
        origen,
        destino,
        colegio_destino,
        horario_ida,
        horario_vuelta,
        precio_mensual,
        capacidad_maxima,
        descripcion,
        dias_servicio,
        activa,
      } = req.body

      // Construir objeto de actualización
      const updateData = {}

      if (nombre !== undefined) updateData.nombre = nombre
      if (origen !== undefined) updateData.origen = origen
      if (destino !== undefined) updateData.destino = destino
      if (colegio_destino !== undefined) updateData.colegio_destino = colegio_destino
      if (horario_ida !== undefined) updateData.horario_ida = horario_ida
      if (horario_vuelta !== undefined) updateData.horario_vuelta = horario_vuelta
      if (precio_mensual !== undefined) updateData.precio_mensual = Number.parseInt(precio_mensual)
      if (capacidad_maxima !== undefined) updateData.capacidad_maxima = Number.parseInt(capacidad_maxima)
      if (descripcion !== undefined) updateData.descripcion = descripcion
      if (dias_servicio !== undefined) updateData.dias_servicio = dias_servicio
      if (activa !== undefined) updateData.activa = activa

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No hay campos para actualizar" })
      }

      // Actualizar ruta
      const rutaActualizada = await prisma.ruta.update({
        where: { id: rutaId },
        data: updateData,
      })

      res.json({
        message: "Ruta actualizada exitosamente",
        ruta: rutaActualizada,
      })
    } catch (error) {
      console.error("Error actualizando ruta:", error)
      res.status(500).json({ error: "Error interno del servidor" })
    }
  },
)

// Eliminar una ruta (solo conductor propietario)
router.delete(
  "/:id",
  [verifyToken, isConductor, param("id").isInt().withMessage("ID de ruta inválido")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const rutaId = Number.parseInt(req.params.id)
      const prisma = req.app.locals.prisma

      // Verificar que la ruta pertenece al conductor
      const conductor = await prisma.conductor.findFirst({
        where: {
          usuario_id: req.user.userId,
        },
      })

      if (!conductor) {
        return res.status(404).json({ error: "Conductor no encontrado" })
      }

      const ruta = await prisma.ruta.findFirst({
        where: {
          id: rutaId,
          conductor_id: conductor.id,
        },
        include: {
          servicios: {
            where: {
              estado: "activo",
            },
          },
        },
      })

      if (!ruta) {
        return res.status(404).json({ error: "Ruta no encontrada o no autorizada" })
      }

      // Verificar si hay servicios activos
      if (ruta.servicios.length > 0) {
        return res.status(400).json({ error: "No se puede eliminar una ruta con servicios activos" })
      }

      // Eliminar ruta
      await prisma.ruta.delete({
        where: { id: rutaId },
      })

      res.json({
        message: "Ruta eliminada exitosamente",
      })
    } catch (error) {
      console.error("Error eliminando ruta:", error)
      res.status(500).json({ error: "Error interno del servidor" })
    }
  },
)

module.exports = router
