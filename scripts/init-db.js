const Database = require("better-sqlite3")
const fs = require("fs")
const path = require("path")

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "database.sqlite")

console.log("🚀 Inicializando base de datos SQLite...")

// Eliminar base de datos existente si existe
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath)
  console.log("🗑️  Base de datos existente eliminada")
}

// Crear nueva base de datos
const db = new Database(dbPath)
console.log("📁 Nueva base de datos creada en:", dbPath)

// Habilitar foreign keys
db.pragma("foreign_keys = ON")

// Schema SQL directo
const schema = `
-- Tabla de usuarios base
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    telefono TEXT,
    rut TEXT UNIQUE NOT NULL,
    direccion TEXT,
    comuna TEXT,
    tipo_usuario TEXT NOT NULL CHECK (tipo_usuario IN ('padre', 'conductor')),
    verificado INTEGER DEFAULT 0,
    activo INTEGER DEFAULT 1,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla específica para conductores
CREATE TABLE conductores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    numero_licencia TEXT UNIQUE NOT NULL,
    tipo_licencia TEXT NOT NULL,
    fecha_vencimiento_licencia DATE NOT NULL,
    anos_experiencia INTEGER NOT NULL,
    antecedentes_verificados INTEGER DEFAULT 0,
    fecha_verificacion_antecedentes DATE,
    calificacion_promedio REAL DEFAULT 0.00,
    total_viajes INTEGER DEFAULT 0,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'verificado', 'suspendido', 'rechazado')),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla específica para padres/apoderados
CREATE TABLE padres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    numero_estudiantes INTEGER DEFAULT 1,
    contacto_emergencia_nombre TEXT,
    contacto_emergencia_telefono TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de estudiantes
CREATE TABLE estudiantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    padre_id INTEGER REFERENCES padres(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    curso TEXT,
    colegio TEXT NOT NULL,
    direccion_colegio TEXT,
    necesidades_especiales TEXT,
    activo INTEGER DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de vehículos
CREATE TABLE vehiculos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conductor_id INTEGER REFERENCES conductores(id) ON DELETE CASCADE,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    ano INTEGER NOT NULL,
    patente TEXT UNIQUE NOT NULL,
    color TEXT,
    capacidad_maxima INTEGER NOT NULL,
    tipo_vehiculo TEXT NOT NULL,
    numero_revision_tecnica TEXT,
    fecha_vencimiento_revision DATE,
    numero_seguro TEXT,
    fecha_vencimiento_seguro DATE,
    activo INTEGER DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de rutas
CREATE TABLE rutas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conductor_id INTEGER REFERENCES conductores(id) ON DELETE CASCADE,
    vehiculo_id INTEGER REFERENCES vehiculos(id) ON DELETE SET NULL,
    nombre TEXT NOT NULL,
    origen TEXT NOT NULL,
    destino TEXT NOT NULL,
    colegio_destino TEXT NOT NULL,
    horario_ida TIME NOT NULL,
    horario_vuelta TIME NOT NULL,
    precio_mensual INTEGER NOT NULL,
    capacidad_maxima INTEGER NOT NULL,
    descripcion TEXT,
    dias_servicio TEXT DEFAULT 'lunes-viernes',
    activa INTEGER DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de servicios/contratos
CREATE TABLE servicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ruta_id INTEGER REFERENCES rutas(id) ON DELETE CASCADE,
    padre_id INTEGER REFERENCES padres(id) ON DELETE CASCADE,
    estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
    precio_acordado INTEGER NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'pausado', 'finalizado', 'cancelado')),
    notas TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de solicitudes
CREATE TABLE solicitudes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ruta_id INTEGER REFERENCES rutas(id) ON DELETE CASCADE,
    padre_id INTEGER REFERENCES padres(id) ON DELETE CASCADE,
    estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
    mensaje TEXT,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada', 'cancelada')),
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta DATETIME,
    respuesta_conductor TEXT
);

-- Tabla de evaluaciones
CREATE TABLE evaluaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    servicio_id INTEGER REFERENCES servicios(id) ON DELETE CASCADE,
    evaluador_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    evaluado_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    aspectos_evaluados TEXT,
    fecha_evaluacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pagos
CREATE TABLE pagos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    servicio_id INTEGER REFERENCES servicios(id) ON DELETE CASCADE,
    monto INTEGER NOT NULL,
    mes_correspondiente DATE NOT NULL,
    metodo_pago TEXT NOT NULL,
    estado_pago TEXT DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado', 'vencido', 'cancelado')),
    fecha_vencimiento DATE NOT NULL,
    fecha_pago DATETIME,
    referencia_pago TEXT,
    notas TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de vehículos
CREATE TABLE vehiculos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conductor_id INTEGER REFERENCES conductores(id) ON DELETE CASCADE,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    ano INTEGER NOT NULL,
    patente TEXT UNIQUE NOT NULL,
    color TEXT,
    capacidad_maxima INTEGER NOT NULL,
    tipo_vehiculo TEXT NOT NULL,
    activo INTEGER DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
`

// Dividir el schema en statements individuales
const statements = schema
  .split(";")
  .map((stmt) => stmt.trim())
  .filter((stmt) => stmt.length > 0)

console.log(`📝 Ejecutando ${statements.length} statements...`)

// Ejecutar cada statement
let successCount = 0
statements.forEach((statement, index) => {
  try {
    db.exec(statement)
    successCount++
    if (statement.toLowerCase().includes("create table")) {
      const tableName = statement.match(/create table (\w+)/i)?.[1]
      console.log(`✅ Tabla '${tableName}' creada`)
    }
  } catch (error) {
    console.error(`❌ Error en statement ${index + 1}:`, error.message)
  }
})

// Insertar datos de ejemplo
console.log("📊 Insertando datos de ejemplo...")

try {
  // Usuarios de ejemplo
  db.exec(`
    INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, rut, direccion, comuna, tipo_usuario, verificado) VALUES
    ('carlos.mendoza@email.com', '$2b$10$example_hash_1', 'Carlos', 'Mendoza', '+56987654321', '12345678-9', 'Av. Principal 123', 'Concepción', 'conductor', 1),
    ('maria.gonzalez@email.com', '$2b$10$example_hash_2', 'María', 'González', '+56987654322', '12345678-0', 'Calle Secundaria 456', 'San Pedro de la Paz', 'conductor', 1),
    ('juan.perez@email.com', '$2b$10$example_hash_3', 'Juan', 'Pérez', '+56987654323', '12345678-1', 'Villa Los Aromos 789', 'Concepción', 'padre', 1),
    ('ana.silva@email.com', '$2b$10$example_hash_4', 'Ana', 'Silva', '+56987654324', '12345678-2', 'Lomas Coloradas 321', 'San Pedro de la Paz', 'padre', 1);
  `)

  db.exec(`
    INSERT INTO conductores (usuario_id, numero_licencia, tipo_licencia, fecha_vencimiento_licencia, anos_experiencia, antecedentes_verificados, calificacion_promedio, total_viajes, estado) VALUES
    (1, 'A1-12345678', 'A1', '2026-12-31', 5, 1, 4.8, 1250, 'verificado'),
    (2, 'A1-87654321', 'A1', '2025-08-15', 8, 1, 4.9, 2100, 'verificado');
  `)

  db.exec(`
    INSERT INTO padres (usuario_id, numero_estudiantes, contacto_emergencia_nombre, contacto_emergencia_telefono) VALUES
    (3, 2, 'Carmen Pérez', '+56987654325'),
    (4, 1, 'Roberto Silva', '+56987654326');
  `)

  db.exec(`
    INSERT INTO estudiantes (padre_id, nombre, apellido, fecha_nacimiento, curso, colegio) VALUES
    (1, 'Sofía', 'Pérez', '2010-03-15', '8° Básico', 'Colegio San José'),
    (1, 'Diego', 'Pérez', '2012-07-22', '6° Básico', 'Colegio San José'),
    (2, 'Valentina', 'Silva', '2011-11-08', '7° Básico', 'Colegio Alemán');
  `)

  db.exec(`
    INSERT INTO vehiculos (conductor_id, marca, modelo, ano, patente, color, capacidad_maxima, tipo_vehiculo, activo) VALUES
    (1, 'Toyota', 'Hiace', 2020, 'ABCD-12', 'Blanco', 12, 'Furgón', 1),
    (2, 'Mercedes', 'Sprinter', 2019, 'EFGH-34', 'Azul', 15, 'Furgón', 1);
  `)

  db.exec(`
    INSERT INTO rutas (conductor_id, vehiculo_id, nombre, origen, destino, colegio_destino, horario_ida, horario_vuelta, precio_mensual, capacidad_maxima, descripcion, activa) VALUES
    (1, 1, 'Villa San Pedro - Colegio San José', 'Villa San Pedro', 'Colegio San José', 'Colegio San José', '07:30:00', '17:00:00', 45000, 12, 'Ruta directa con paradas en puntos estratégicos', 1),
    (1, 1, 'Lomas Coloradas - Colegio San José', 'Lomas Coloradas', 'Colegio San José', 'Colegio San José', '07:45:00', '17:00:00', 42000, 12, 'Ruta alternativa para sector Lomas', 1),
    (2, 2, 'Centro - Colegio Alemán', 'Centro Concepción', 'Colegio Alemán', 'Colegio Alemán', '07:15:00', '16:30:00', 50000, 15, 'Ruta premium con aire acondicionado', 1);
  `)

  console.log("✅ Datos de ejemplo insertados")
} catch (error) {
  console.error("❌ Error insertando datos de ejemplo:", error.message)
}

console.log(`\n🎉 Base de datos inicializada: ${successCount}/${statements.length} statements ejecutados`)

// Verificar que las tablas se crearon
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
console.log("📋 Tablas creadas:", tables.map((t) => t.name).join(", "))

// Verificar datos de ejemplo
const usuarios = db.prepare("SELECT COUNT(*) as count FROM usuarios").get()
console.log(`👥 Usuarios de ejemplo: ${usuarios.count}`)

const rutas = db.prepare("SELECT COUNT(*) as count FROM rutas").get()
console.log(`🛣️  Rutas de ejemplo: ${rutas.count}`)

db.close()
console.log("✨ Inicialización completada exitosamente!")
