export interface Usuario {
  id: number
  email: string
  nombre: string
  apellido: string
  telefono?: string
  rut: string
  direccion?: string
  comuna?: string
  tipo_usuario: "padre" | "conductor"
  verificado: boolean
  activo: boolean
  fecha_registro: Date
}

export interface Conductor {
  id: number
  usuario_id: number
  numero_licencia: string
  tipo_licencia: string
  fecha_vencimiento_licencia: Date
  anos_experiencia: number
  antecedentes_verificados: boolean
  calificacion_promedio: number
  total_viajes: number
  estado: "pendiente" | "verificado" | "suspendido" | "rechazado"
  usuario?: Usuario
}

export interface Padre {
  id: number
  usuario_id: number
  numero_estudiantes: number
  contacto_emergencia_nombre?: string
  contacto_emergencia_telefono?: string
  usuario?: Usuario
}

export interface Estudiante {
  id: number
  padre_id: number
  nombre: string
  apellido: string
  fecha_nacimiento: Date
  curso?: string
  colegio: string
  direccion_colegio?: string
  necesidades_especiales?: string
  activo: boolean
}

export interface Vehiculo {
  id: number
  conductor_id: number
  marca: string
  modelo: string
  ano: number
  patente: string
  color?: string
  capacidad_maxima: number
  tipo_vehiculo: string
  activo: boolean
}

export interface Ruta {
  id: number
  conductor_id: number
  vehiculo_id?: number
  nombre: string
  origen: string
  destino: string
  colegio_destino: string
  horario_ida: string
  horario_vuelta: string
  precio_mensual: number
  capacidad_maxima: number
  descripcion?: string
  dias_servicio: string
  activa: boolean
  conductor?: Conductor
  vehiculo?: Vehiculo
  estudiantes_inscritos?: number
}

export interface Servicio {
  id: number
  ruta_id: number
  padre_id: number
  estudiante_id: number
  precio_acordado: number
  fecha_inicio: Date
  fecha_fin?: Date
  estado: "activo" | "pausado" | "finalizado" | "cancelado"
  notas?: string
  ruta?: Ruta
  padre?: Padre
  estudiante?: Estudiante
}

export interface Solicitud {
  id: number
  ruta_id: number
  padre_id: number
  estudiante_id: number
  mensaje?: string
  estado: "pendiente" | "aceptada" | "rechazada" | "cancelada"
  fecha_solicitud: Date
  fecha_respuesta?: Date
  respuesta_conductor?: string
  ruta?: Ruta
  padre?: Padre
  estudiante?: Estudiante
}

export interface Evaluacion {
  id: number
  servicio_id: number
  evaluador_id: number
  evaluado_id: number
  calificacion: number
  comentario?: string
  aspectos_evaluados?: any
  fecha_evaluacion: Date
}

export interface Pago {
  id: number
  servicio_id: number
  monto: number
  mes_correspondiente: Date
  metodo_pago: string
  estado_pago: "pendiente" | "pagado" | "vencido" | "cancelado"
  fecha_vencimiento: Date
  fecha_pago?: Date
  referencia_pago?: string
  notas?: string
}
