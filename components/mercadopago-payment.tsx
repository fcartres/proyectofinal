"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CreditCard, AlertCircle } from "lucide-react"
import { mercadoPagoBrick } from "@/lib/mercadopago-brick"

interface MercadoPagoPaymentProps {
  amount: number
  description: string
  externalReference: string
  payer: {
    firstName: string
    lastName: string
    email: string
  }
  onSuccess: (paymentData: any) => void
  onError: (error: any) => void
  onPending: (paymentData: any) => void
}

export function MercadoPagoPayment({
  amount,
  description,
  externalReference,
  payer,
  onSuccess,
  onError,
  onPending,
}: MercadoPagoPaymentProps) {
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current && containerRef.current) {
      initializePaymentBrick()
      initialized.current = true
    }

    return () => {
      mercadoPagoBrick.unmount()
    }
  }, [])

  const initializePaymentBrick = async () => {
    try {
      setLoading(true)
      setError("")

      await mercadoPagoBrick.renderPaymentBrick("paymentBrick_container", {
        amount,
        payer,
        callbacks: {
          onReady: () => {
            setLoading(false)
          },
          onSubmit: async ({ selectedPaymentMethod, formData }: any) => {
            setProcessing(true)

            try {
              // Agregar información adicional al formData
              const paymentData = {
                ...formData,
                description,
                external_reference: externalReference,
                transaction_amount: amount,
              }

              const response = await fetch("/api/pagos/process_payment", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify(paymentData),
              })

              const result = await response.json()

              if (!response.ok) {
                throw new Error(result.error || "Error al procesar el pago")
              }

              // Manejar diferentes estados de pago
              switch (result.status) {
                case "approved":
                  onSuccess(result)
                  break
                case "pending":
                case "in_process":
                  onPending(result)
                  break
                case "rejected":
                  throw new Error("El pago fue rechazado")
                default:
                  throw new Error("Estado de pago desconocido")
              }
            } catch (error) {
              console.error("Error procesando pago:", error)
              const errorMessage = error instanceof Error ? error.message : "Error al procesar el pago"
              setError(errorMessage)
              onError(error)
            } finally {
              setProcessing(false)
            }
          },
          onError: (error: any) => {
            console.error("Error en Payment Brick:", error)
            setError("Error en el formulario de pago")
            onError(error)
          },
        },
      })
    } catch (error) {
      console.error("Error inicializando Payment Brick:", error)
      setError("Error al cargar el formulario de pago")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando formulario de pago...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Realizar Pago
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-blue-50 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">Detalles del Pago</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <p>{description}</p>
            <p className="font-bold">Monto: ${amount.toLocaleString()} CLP</p>
          </div>
        </div>

        <div
          id="paymentBrick_container"
          ref={containerRef}
          className={processing ? "opacity-50 pointer-events-none" : ""}
        />

        {processing && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-md text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
            <p className="text-yellow-800">Procesando pago...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
