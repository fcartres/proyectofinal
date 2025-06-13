"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, MapPin, Star, Users, CheckCircle, Sparkles, Zap, Heart } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">Furgón Seguro</span>
            </div>
            <div className="flex space-x-3">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                >
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="btn-gradient-primary hover:scale-105 transition-all duration-300">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-6">
              <Sparkles className="h-4 w-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-700">Transporte escolar del futuro</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gray-900">Transporte Escolar</span>
            <br />
            <span className="text-gradient">Seguro y Confiable</span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Conectamos padres con conductores verificados para brindar un servicio de transporte escolar
            <span className="font-semibold text-purple-600"> transparente, seguro</span> y con
            <span className="font-semibold text-cyan-600"> seguimiento en tiempo real</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register?type=padre">
              <Button
                size="lg"
                className="btn-gradient-primary text-lg px-8 py-4 rounded-xl shadow-purple hover:scale-105 transition-all duration-300"
              >
                <Users className="h-5 w-5 mr-2" />
                Soy Padre/Apoderado
              </Button>
            </Link>
            <Link href="/register?type=conductor">
              <Button
                size="lg"
                className="btn-gradient-secondary text-lg px-8 py-4 rounded-xl shadow-cyan hover:scale-105 transition-all duration-300"
              >
                <Shield className="h-5 w-5 mr-2" />
                Soy Conductor
              </Button>
            </Link>
          </div>

          {/* Indicadores de confianza */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">500+</div>
              <div className="text-sm text-gray-600">Estudiantes Felices</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-600 mb-1">50+</div>
              <div className="text-sm text-gray-600">Conductores Verificados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-1">25+</div>
              <div className="text-sm text-gray-600">Colegios Conectados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 mb-1">4.8★</div>
              <div className="text-sm text-gray-600">Calificación Promedio</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Por qué elegir Furgón Seguro?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tecnología de vanguardia para la seguridad de tus hijos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-hover gradient-card border-0 overflow-hidden group">
              <CardHeader className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-4 text-gray-900">Conductores Verificados</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Todos nuestros conductores pasan por un riguroso proceso de verificación de antecedentes y
                  evaluaciones continuas de seguridad.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover gradient-card border-0 overflow-hidden group">
              <CardHeader className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-4 text-gray-900">Seguimiento en Tiempo Real</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Monitorea la ubicación del transporte en tiempo real y recibe notificaciones automáticas de llegada y
                  salida.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover gradient-card border-0 overflow-hidden group">
              <CardHeader className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-4 text-gray-900">Sistema de Evaluaciones</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Califica y lee reseñas detalladas de otros padres para tomar la mejor decisión para tus hijos.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Un proceso simple y seguro en pocos pasos</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Para Padres */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full opacity-20"></div>
              <Card className="gradient-card border-0 p-8 relative z-10">
                <h3 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  Para Padres
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Regístrate y busca servicios</h4>
                      <p className="text-gray-600">
                        Encuentra rutas cerca de tu ubicación o colegio con filtros inteligentes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Revisa perfiles de conductores</h4>
                      <p className="text-gray-600">
                        Ve antecedentes verificados, evaluaciones reales y detalles del vehículo
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Contrata y paga en línea</h4>
                      <p className="text-gray-600">Proceso 100% seguro y transparente con Mercado Pago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Monitorea en tiempo real</h4>
                      <p className="text-gray-600">Recibe notificaciones push y sigue la ruta en vivo</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Para Conductores */}
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-200 to-cyan-300 rounded-full opacity-20"></div>
              <Card className="gradient-card border-0 p-8 relative z-10">
                <h3 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  Para Conductores
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Verifica tu perfil</h4>
                      <p className="text-gray-600">Sube documentos y pasa nuestro proceso de validación premium</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Crea tus rutas</h4>
                      <p className="text-gray-600">
                        Define horarios flexibles, paradas estratégicas y capacidad óptima
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Recibe solicitudes</h4>
                      <p className="text-gray-600">
                        Acepta estudiantes y gestiona tu servicio con herramientas inteligentes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Recibe pagos seguros</h4>
                      <p className="text-gray-600">Cobros automáticos, transparentes y sin complicaciones</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 via-purple-700 to-cyan-600 text-white relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Números que nos respaldan</h2>
            <p className="text-xl text-purple-100">La confianza de miles de familias chilenas</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                <div className="text-5xl font-bold mb-3 text-gradient-to-r from-yellow-300 to-orange-300">500+</div>
                <div className="text-purple-100 font-medium">Estudiantes Transportados</div>
                <div className="text-sm text-purple-200 mt-2">Cada día con seguridad</div>
              </div>
            </div>
            <div className="group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                <div className="text-5xl font-bold mb-3 text-gradient-to-r from-green-300 to-emerald-300">50+</div>
                <div className="text-purple-100 font-medium">Conductores Verificados</div>
                <div className="text-sm text-purple-200 mt-2">100% confiables</div>
              </div>
            </div>
            <div className="group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                <div className="text-5xl font-bold mb-3 text-gradient-to-r from-blue-300 to-cyan-300">25+</div>
                <div className="text-purple-100 font-medium">Colegios Conectados</div>
                <div className="text-sm text-purple-200 mt-2">En toda la región</div>
              </div>
            </div>
            <div className="group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                <div className="text-5xl font-bold mb-3 flex items-center justify-center">
                  <span className="text-gradient-to-r from-yellow-300 to-orange-300">4.8</span>
                  <Star className="h-8 w-8 text-yellow-300 ml-2" />
                </div>
                <div className="text-purple-100 font-medium">Calificación Promedio</div>
                <div className="text-sm text-purple-200 mt-2">De padres satisfechos</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gradient">Furgón Seguro</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Transformando el transporte escolar en Chile con tecnología de vanguardia y un enfoque centrado en la
                seguridad.
              </p>
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-sm text-gray-400">Hecho con amor en Concepción</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-6 text-lg">Empresa</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Sobre Nosotros</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Contacto</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Carreras</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Blog</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-6 text-lg">Soporte</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Centro de Ayuda</li>
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Términos de Servicio</li>
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Política de Privacidad</li>
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Seguridad</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-6 text-lg">Contacto</h3>
              <div className="space-y-4 text-gray-400">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold">@</span>
                  </div>
                  <span>contacto@furgonseguro.cl</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold">📞</span>
                  </div>
                  <span>+56 9 7654 3210</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold">📍</span>
                  </div>
                  <span>Concepción, Chile</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2025 Furgón Seguro. Todos los derechos reservados.
              <span className="text-purple-400 ml-2">Construido con 💜 para las familias chilenas</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
