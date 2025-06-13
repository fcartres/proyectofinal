import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { preferenceId: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.tipoUsuario !== "padre") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { preferenceId } = params
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!accessToken) {
      return NextResponse.json({ error: "Configuración de Mercado Pago no encontrada" }, { status: 500 })
    }

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/search?preference_id=${preferenceId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error("Error al consultar el estado del pago")
    }

    const data = await response.json()
    const payment = data.results[0]

    return NextResponse.json({
      status: payment?.status || "pending",
      payment_id: payment?.id,
    })
  } catch (error: any) {
    console.error("Error al verificar estado del pago:", error)
    return NextResponse.json(
      { error: "Error al verificar el estado del pago" },
      { status: 500 }
    )
  }
}