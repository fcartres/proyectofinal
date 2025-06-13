import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Furgón Seguro - Transporte Escolar Seguro y Confiable",
  description:
    "Plataforma que conecta padres con conductores verificados para brindar un servicio de transporte escolar transparente, seguro y con seguimiento en tiempo real.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="min-h-screen">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
