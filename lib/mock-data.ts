// Datos de ejemplo para usar cuando las APIs no están disponibles

export const mockZonas = [
  { id: "1", nombre: "San Pedro" },
  { id: "2", nombre: "Concepción" },
  { id: "3", nombre: "Talcahuano" },
  { id: "4", nombre: "Hualpén" },
  { id: "5", nombre: "Chiguayante" },
]

export const mockColegios = [
  { id: "1", nombre: "Colegio San José", zona_id: "1" },
  { id: "2", nombre: "Colegio Santa María", zona_id: "1" },
  { id: "3", nombre: "Liceo Bicentenario", zona_id: "2" },
  { id: "4", nombre: "Colegio Concepción", zona_id: "2" },
  { id: "5", nombre: "Colegio Salesiano", zona_id: "3" },
  { id: "6", nombre: "Colegio Inmaculada Concepción", zona_id: "4" },
]

export const mockRutas = [
  {
    id: 1,
    nombre: "Ruta San Pedro - Concepción",
    origen: "San Pedro",
    destino: "Concepción",
    horario_ida: "07:30",
    horario_vuelta: "14:30",
    precio_mensual: 45000,
    capacidad_maxima: 15,
    estudiantes_inscritos: 10,
    conductor: {
      nombre: "Juan",
      apellido: "Pérez",
      calificacion_promedio: 4.8,
      anos_experiencia: 5,
      antecedentes_verificados: true,
    },
    vehiculo: {
      marca: "Mercedes",
      modelo: "Sprinter",
      ano: 2020,
      capacidad_maxima: 15,
      patente: "AB-1234",
    },
  },
  {
    id: 2,
    nombre: "Ruta Talcahuano - Concepción",
    origen: "Talcahuano",
    destino: "Concepción",
    horario_ida: "07:15",
    horario_vuelta: "14:15",
    precio_mensual: 40000,
    capacidad_maxima: 12,
    estudiantes_inscritos: 8,
    conductor: {
      nombre: "María",
      apellido: "González",
      calificacion_promedio: 4.9,
      anos_experiencia: 7,
      antecedentes_verificados: true,
    },
    vehiculo: {
      marca: "Hyundai",
      modelo: "H1",
      ano: 2021,
      capacidad_maxima: 12,
      patente: "CD-5678",
    },
  },
  {
    id: 3,
    nombre: "Ruta Hualpén - Concepción",
    origen: "Hualpén",
    destino: "Concepción",
    horario_ida: "07:45",
    horario_vuelta: "14:45",
    precio_mensual: 42000,
    capacidad_maxima: 10,
    estudiantes_inscritos: 10,
    conductor: {
      nombre: "Pedro",
      apellido: "Soto",
      calificacion_promedio: 4.7,
      anos_experiencia: 4,
      antecedentes_verificados: true,
    },
    vehiculo: {
      marca: "Toyota",
      modelo: "Hiace",
      ano: 2019,
      capacidad_maxima: 10,
      patente: "EF-9012",
    },
  },
]

export const mockEstudiantes = [
  {
    id: 1,
    nombre: "Carlos",
    apellido: "Martínez",
    fecha_nacimiento: "2012-05-15",
    curso: "5° Básico",
    colegio: "Colegio San José",
    direccion_colegio: "Av. Principal 123, Concepción",
    necesidades_especiales: "",
  },
  {
    id: 2,
    nombre: "Ana",
    apellido: "Rodríguez",
    fecha_nacimiento: "2014-08-22",
    curso: "3° Básico",
    colegio: "Colegio Santa María",
    direccion_colegio: "Calle Los Pinos 456, Concepción",
    necesidades_especiales: "Alergias alimentarias",
  },
]

export const mockSolicitudes = [
  {
    id: 1,
    ruta_id: 1,
    estudiante_id: 1,
    fecha_solicitud: "2025-05-01",
    estado: "pendiente",
    mensaje: "Me interesa este servicio para mi hijo",
    ruta: {
      nombre: "Ruta San Pedro - Concepción",
      origen: "San Pedro",
      destino: "Concepción",
    },
    estudiante: {
      nombre: "Carlos",
      apellido: "Martínez",
      curso: "5° Básico",
    },
  },
  {
    id: 2,
    ruta_id: 2,
    estudiante_id: 2,
    fecha_solicitud: "2025-05-02",
    estado: "aceptada",
    mensaje: "Necesito transporte para mi hija",
    respuesta_conductor: "Encantado de transportar a su hija. Podemos coordinar los detalles.",
    ruta: {
      nombre: "Ruta Talcahuano - Concepción",
      origen: "Talcahuano",
      destino: "Concepción",
      precio_mensual: 40000,
    },
    estudiante: {
      nombre: "Ana",
      apellido: "Rodríguez",
      curso: "3° Básico",
    },
  },
]

export const mockServicios = [
  {
    id: 1,
    ruta_id: 2,
    estudiante_id: 2,
    precio_acordado: 40000,
    fecha_inicio: "2025-05-10",
    estado: "activo",
    ruta: {
      nombre: "Ruta Talcahuano - Concepción",
      origen: "Talcahuano",
      destino: "Concepción",
      horario_ida: "07:15",
      horario_vuelta: "14:15",
    },
    estudiante: {
      nombre: "Ana",
      apellido: "Rodríguez",
      curso: "3° Básico",
      colegio: "Colegio Santa María",
    },
    conductor: {
      nombre: "María",
      apellido: "González",
      telefono: "+56 9 8765 4321",
    },
  },
]

export const mockStats = {
  estudiantes_registrados: 2,
  servicios_activos: 1,
  solicitudes_pendientes: 1,
  proximo_viaje: "07:15",
}
