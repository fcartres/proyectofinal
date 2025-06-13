"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, User, Car, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { register } = useAuth()
  const userType = searchParams.get("type") || "padre"
  const [selectedType, setSelectedType] = useState(userType)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Estados del formulario
  const [formData, setFormData] = useState({
    // Campos básicos
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellido: "",
    telefono: "",
    rut: "",
    direccion: "",
    comuna: "",
    // Campos conductor
    numero_licencia: "",
    tipo_licencia: "",
    fecha_vencimiento_licencia: "",
    anos_experiencia: "",
    // Campos padre
    numero_estudiantes: 1,
    contacto_emergencia_nombre: "",
    contacto_emergencia_telefono: "",
  })

  const formatRut = (value: string) => {
    // Eliminar caracteres no numéricos excepto 'k' o 'K'
    let cleanRut = value.replace(/[^0-9kK]/g, "").toUpperCase();

    if (cleanRut.length > 1) {
      // Separar el dígito verificador
      let dv = cleanRut.slice(-1);
      let rut = cleanRut.slice(0, -1);

      // Formatear el RUT con puntos
      rut = rut.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");

      return `${rut}-${dv}`;
    }
    return cleanRut;
  };

  const validateRut = (rut: string): boolean => {
    if (!rut || rut.trim().length < 3) return false;

    const cleanRut = rut.replace(/[^0-9kK]/g, "").toUpperCase();
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);

    if (body.length < 1) return false;

    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i], 10) * multiplier;
      multiplier++;
      if (multiplier > 7) multiplier = 2;
    }

    const calculatedDv = 11 - (sum % 11);

    if (calculatedDv === 11) return dv === "0";
    if (calculatedDv === 10) return dv === "K";
    return dv === calculatedDv.toString();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validaciones de RUT
    if (formData.rut && !validateRut(formData.rut)) {
      setError("El RUT ingresado no es válido.")
      setLoading(false)
      return;
    }

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    // Validaciones específicas por tipo
    if (selectedType === "conductor") {
      if (
        !formData.numero_licencia ||
        !formData.tipo_licencia ||
        !formData.fecha_vencimiento_licencia ||
        !formData.anos_experiencia
      ) {
        setError("Todos los campos de conductor son requeridos")
        setLoading(false)
        return
      }
    }

    const userData = {
      ...formData,
      tipo_usuario: selectedType,
    }

    const result = await register(userData)

    if (result.success) {
      router.push(`/dashboard/${selectedType}`)
    } else {
      setError(result.error || "Error al registrar usuario")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Furgón Seguro</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Crear Cuenta</h1>
          <p className="text-gray-600 mt-2">Únete a nuestra comunidad de transporte seguro</p>
        </div>

        {/* User Type Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            variant={selectedType === "padre" ? "default" : "outline"}
            onClick={() => setSelectedType("padre")}
            className="h-20 flex flex-col items-center space-y-2"
            disabled={loading}
          >
            <User className="h-6 w-6" />
            <span>Padre/Apoderado</span>
          </Button>
          <Button
            variant={selectedType === "conductor" ? "default" : "outline"}
            onClick={() => setSelectedType("conductor")}
            className="h-20 flex flex-col items-center space-y-2"
            disabled={loading}
          >
            <Car className="h-6 w-6" />
            <span>Conductor</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{selectedType === "padre" ? "Registro de Padre/Apoderado" : "Registro de Conductor"}</CardTitle>
            <CardDescription>
              {selectedType === "padre"
                ? "Completa tus datos para buscar servicios de transporte"
                : "Completa tus datos para ofrecer servicios de transporte"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    placeholder="Juan"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    placeholder="Pérez"
                    value={formData.apellido}
                    onChange={(e) => handleInputChange("apellido", e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  placeholder="+56 9 1234 5678"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="rut">RUT</Label>
                <Input
                  id="rut"
                  placeholder="Ej: 12.345.678-9"
                  value={formData.rut}
                  onChange={(e) => handleInputChange("rut", formatRut(e.target.value))}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  placeholder="Av. Principal 123"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange("direccion", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="comuna">Comuna</Label>
                <Select onValueChange={(value) => handleInputChange("comuna", value)} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu comuna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concepcion">Concepción</SelectItem>
                    <SelectItem value="talcahuano">Talcahuano</SelectItem>
                    <SelectItem value="san-pedro">San Pedro de la Paz</SelectItem>
                    <SelectItem value="hualpen">Hualpén</SelectItem>
                    <SelectItem value="chiguayante">Chiguayante</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedType === "conductor" && (
                <>
                  <div>
                    <Label htmlFor="licencia">Número de Licencia</Label>
                    <Input
                      id="licencia"
                      placeholder="A1-12345678"
                      value={formData.numero_licencia}
                      onChange={(e) => handleInputChange("numero_licencia", e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tipo_licencia">Tipo de Licencia</Label>
                    <Select onValueChange={(value) => handleInputChange("tipo_licencia", value)} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A1">A1</SelectItem>
                        <SelectItem value="A2">A2</SelectItem>
                        <SelectItem value="A3">A3</SelectItem>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="A5">A5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fecha_vencimiento">Fecha Vencimiento Licencia</Label>
                    <Input
                      id="fecha_vencimiento"
                      type="date"
                      value={formData.fecha_vencimiento_licencia}
                      onChange={(e) => handleInputChange("fecha_vencimiento_licencia", e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="experiencia">Años de Experiencia</Label>
                    <Select
                      onValueChange={(value) => handleInputChange("anos_experiencia", Number.parseInt(value))}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu experiencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 año</SelectItem>
                        <SelectItem value="2">2 años</SelectItem>
                        <SelectItem value="3">3 años</SelectItem>
                        <SelectItem value="4">4 años</SelectItem>
                        <SelectItem value="5">5 años</SelectItem>
                        <SelectItem value="6">6-10 años</SelectItem>
                        <SelectItem value="10">Más de 10 años</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {selectedType === "padre" && (
                <>
                  <div>
                    <Label htmlFor="estudiantes">Número de Estudiantes</Label>
                    <Select
                      onValueChange={(value) => handleInputChange("numero_estudiantes", Number.parseInt(value))}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="¿Cuántos hijos transportarás?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 estudiante</SelectItem>
                        <SelectItem value="2">2 estudiantes</SelectItem>
                        <SelectItem value="3">3 estudiantes</SelectItem>
                        <SelectItem value="4">4 o más estudiantes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="contacto_emergencia">Contacto de Emergencia</Label>
                    <Input
                      id="contacto_emergencia"
                      placeholder="Nombre del contacto"
                      value={formData.contacto_emergencia_nombre}
                      onChange={(e) => handleInputChange("contacto_emergencia_nombre", e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefono_emergencia">Teléfono de Emergencia</Label>
                    <Input
                      id="telefono_emergencia"
                      placeholder="+56 9 8765 4321"
                      value={formData.contacto_emergencia_telefono}
                      onChange={(e) => handleInputChange("contacto_emergencia_telefono", e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : selectedType === "padre" ? (
                  "Registrarse como Padre"
                ) : (
                  "Registrarse como Conductor"
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Inicia sesión aquí
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
