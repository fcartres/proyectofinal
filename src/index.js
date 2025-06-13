require("dotenv").config()
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const { PrismaClient } = require("@prisma/client")

// Importar rutas
const authRoutes = require("./routes/auth.routes")
const rutasRoutes = require("./routes/rutas.routes")
const solicitudesRoutes = require("./routes/solicitudes.routes")
const serviciosRoutes = require("./routes/servicios.routes")
const estudiantesRoutes = require("./routes/estudiantes.routes")
const vehiculosRoutes = require("./routes/vehiculos.routes")
const pagosRoutes = require("./routes/pagos.routes")
const evaluacionesRoutes = require("./routes/evaluaciones.routes")
const dashboardRoutes = require("./routes/dashboard.routes")
const conductorRoutes = require("./routes/conductor.routes")

// Inicializar Express
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

// Inicializar Prisma
const prisma = new PrismaClient()
app.locals.prisma = prisma

// Rutas
app.use("/api/auth", authRoutes)
app.use("/api/rutas", rutasRoutes)
app.use("/api/solicitudes", solicitudesRoutes)
app.use("/api/servicios", serviciosRoutes)
app.use("/api/estudiantes", estudiantesRoutes)
app.use("/api/vehiculos", vehiculosRoutes)
app.use("/api/pagos", pagosRoutes)
app.use("/api/evaluaciones", evaluacionesRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/conductor", conductorRoutes)

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API de Furgón Seguro funcionando correctamente" })
})

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: "Error interno del servidor",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})

// Manejo de cierre de la aplicación
process.on("SIGINT", async () => {
  await prisma.$disconnect()
  console.log("Conexión a la base de datos cerrada")
  process.exit(0)
})
