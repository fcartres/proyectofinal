const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed...")

  // Limpiar datos existentes
  await prisma.pago.deleteMany({})
  await prisma.evaluacion.deleteMany({})
  await prisma.servicio.deleteMany({})
  await prisma.solicitud.deleteMany({})
  await prisma.estudiante.deleteMany({})
  await prisma.ruta.deleteMany({})
  await prisma.vehiculo.deleteMany({})
  await prisma.conductor.deleteMany({})
  await prisma.padre.deleteMany({})
  await prisma.usuario.deleteMany({})

  console.log("✅ Base de datos limpiada")

  // Crear usuarios
  const hashPassword = (password) => bcrypt.hashSync(password, 10)

  const usuarios = await Promise.all([
    prisma.usuario.create({
      data: {
        email: "carlos.mendoza@email.com",
        password_hash: hashPassword("password123"),
        nombre: "Carlos",
        apellido: "Mendoza",
        telefono: "+56987654321",
        rut: "12345678-9",
        direccion: "Av. Principal 123",
        comuna: "Concepción",
        tipo_usuario: "conductor",
        verificado: true,
      },
    }),
    prisma.usuario.create({
      data: {
        email: "maria.gonzalez@email.com",
        password_hash: hashPassword("password123"),
        nombre: "María",
        apellido: "González",
        telefono: "+56987654322",
        rut: "12345678-0",
        direccion: "Calle Secundaria 456",
        comuna: "San Pedro de la Paz",
        tipo_usuario: "conductor",
        verificado: true,
      },
    }),
    prisma.usuario.create({
      data: {
        email: "juan.perez@email.com",
        password_hash: hashPassword("password123"),
        nombre: "Juan",
        apellido: "Pérez",
        telefono: "+56987654323",
        rut: "12345678-1",
        direccion: "Villa Los Aromos 789",
        comuna: "Concepción",
        tipo_usuario: "padre",
        verificado: true,
      },
    }),
    prisma.usuario.create({
      data: {
        email: "ana.silva@email.com",
        password_hash: hashPassword("password123"),
        nombre: "Ana",
        apellido: "Silva",
        telefono: "+56987654324",
        rut: "12345678-2",
        direccion: "Lomas Coloradas 321",
        comuna: "San Pedro de la Paz",
        tipo_usuario: "padre",
        verificado: true,
      },
    }),
  ])

  console.log(`✅ Creados ${usuarios.length} usuarios`)

  // Crear conductores
  const conductores = await Promise.all([
    prisma.conductor.create({
      data: {
        usuario_id: usuarios[0].id,
        numero_licencia: "A1-12345678",
        tipo_licencia: "A1",
        fecha_vencimiento_licencia: new Date("2026-12-31"),
        anos_experiencia: 5,
        antecedentes_verificados: true,
        calificacion_promedio: 4.8,
        total_viajes: 1250,
        estado: "verificado",
      },
    }),
    prisma.conductor.create({
      data: {
        usuario_id: usuarios[1].id,
        numero_licencia: "A1-87654321",
        tipo_licencia: "A1",
        fecha_vencimiento_licencia: new Date("2025-08-15"),
        anos_experiencia: 8,
        antecedentes_verificados: true,
        calificacion_promedio: 4.9,
        total_viajes: 2100,
        estado: "verificado",
      },
    }),
  ])

  console.log(`✅ Creados ${conductores.length} conductores`)

  // Crear padres
  const padres = await Promise.all([
    prisma.padre.create({
      data: {
        usuario_id: usuarios[2].id,
        numero_estudiantes: 2,
        contacto_emergencia_nombre: "Carmen Pérez",
        contacto_emergencia_telefono: "+56987654325",
      },
    }),
    prisma.padre.create({
      data: {
        usuario_id: usuarios[3].id,
        numero_estudiantes: 1,
        contacto_emergencia_nombre: "Roberto Silva",
        contacto_emergencia_telefono: "+56987654326",
      },
    }),
  ])

  console.log(`✅ Creados ${padres.length} padres`)

  // Crear estudiantes
  const estudiantes = await Promise.all([
    prisma.estudiante.create({
      data: {
        padre_id: padres[0].id,
        nombre: "Sofía",
        apellido: "Pérez",
        fecha_nacimiento: new Date("2010-03-15"),
        curso: "8° Básico",
        colegio: "Colegio San José",
      },
    }),
    prisma.estudiante.create({
      data: {
        padre_id: padres[0].id,
        nombre: "Diego",
        apellido: "Pérez",
        fecha_nacimiento: new Date("2012-07-22"),
        curso: "6° Básico",
        colegio: "Colegio San José",
      },
    }),
    prisma.estudiante.create({
      data: {
        padre_id: padres[1].id,
        nombre: "Valentina",
        apellido: "Silva",
        fecha_nacimiento: new Date("2011-11-08"),
        curso: "7° Básico",
        colegio: "Colegio Alemán",
      },
    }),
  ])

  console.log(`✅ Creados ${estudiantes.length} estudiantes`)

  // Crear vehículos
  const vehiculos = await Promise.all([
    prisma.vehiculo.create({
      data: {
        conductor_id: conductores[0].id,
        marca: "Toyota",
        modelo: "Hiace",
        ano: 2020,
        patente: "ABCD-12",
        color: "Blanco",
        capacidad_maxima: 12,
        tipo_vehiculo: "Furgón",
      },
    }),
    prisma.vehiculo.create({
      data: {
        conductor_id: conductores[1].id,
        marca: "Mercedes",
        modelo: "Sprinter",
        ano: 2019,
        patente: "EFGH-34",
        color: "Azul",
        capacidad_maxima: 15,
        tipo_vehiculo: "Furgón",
      },
    }),
  ])

  console.log(`✅ Creados ${vehiculos.length} vehículos`)

  // Crear rutas
  const rutas = await Promise.all([
    prisma.ruta.create({
      data: {
        conductor_id: conductores[0].id,
        vehiculo_id: vehiculos[0].id,
        nombre: "Villa San Pedro - Colegio San José",
        origen: "Villa San Pedro",
        destino: "Colegio San José",
        colegio_destino: "Colegio San José",
        horario_ida: "07:30:00",
        horario_vuelta: "17:00:00",
        precio_mensual: 45000,
        capacidad_maxima: 12,
        descripcion: "Ruta directa con paradas en puntos estratégicos",
      },
    }),
    prisma.ruta.create({
      data: {
        conductor_id: conductores[0].id,
        vehiculo_id: vehiculos[0].id,
        nombre: "Lomas Coloradas - Colegio San José",
        origen: "Lomas Coloradas",
        destino: "Colegio San José",
        colegio_destino: "Colegio San José",
        horario_ida: "07:45:00",
        horario_vuelta: "17:00:00",
        precio_mensual: 42000,
        capacidad_maxima: 12,
        descripcion: "Ruta alternativa para sector Lomas",
      },
    }),
    prisma.ruta.create({
      data: {
        conductor_id: conductores[1].id,
        vehiculo_id: vehiculos[1].id,
        nombre: "Centro - Colegio Alemán",
        origen: "Centro Concepción",
        destino: "Colegio Alemán",
        colegio_destino: "Colegio Alemán",
        horario_ida: "07:15:00",
        horario_vuelta: "16:30:00",
        precio_mensual: 50000,
        capacidad_maxima: 15,
        descripcion: "Ruta premium con aire acondicionado",
      },
    }),
  ])

  console.log(`✅ Creadas ${rutas.length} rutas`)

  console.log("✅ Seed completado exitosamente")
}

main()
  .catch((e) => {
    console.error("Error en seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
