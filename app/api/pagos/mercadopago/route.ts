import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.tipoUsuario !== "padre") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { solicitud_id, monto, descripcion, estudiante_nombre } = body

    if (!solicitud_id || !monto || !descripcion) {
      return NextResponse.json({ error: "Datos requeridos faltantes" }, { status: 400 })
    }

    // Obtener datos completos del usuario para el pagador
    const fullUser = db.prepare("SELECT nombre, apellido, email FROM usuarios WHERE id = ?").get(user.userId);
    if (!fullUser) {
      return NextResponse.json({ error: "Datos de usuario no encontrados" }, { status: 500 });
    }

    // Configuración de Mercado Pago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: "Configuración de Mercado Pago no encontrada" }, { status: 500 })
    }

    const isProductionEnv = process.env.NODE_ENV === "production";
    const mercadoPagoBaseUrl = isProductionEnv 
      ? "https://api.mercadopago.com/checkout/preferences" 
      : "https://api.mercadopago.com/checkout/preferences"; // Aquí deberíamos usar el endpoint de sandbox

    // Crear preferencia de pago en Mercado Pago
    const preference = {
      items: [
        {
          title: descripcion,
          quantity: 1,
          unit_price: monto,
          currency_id: "CLP",
        },
      ],
      payer: {
        name: (fullUser as any).nombre,
        surname: (fullUser as any).apellido,
        email: (fullUser as any).email,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/dashboard/padre?payment=success`,
        failure: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/dashboard/padre?payment=failure`,
        pending: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/dashboard/padre?payment=pending`,
      },
      // auto_return: "approved", // Comentado para pruebas locales
      external_reference: `solicitud_${solicitud_id}_user_${user.userId}`,
      notification_url: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/pagos/mercadopago/webhook`,
      statement_descriptor: "FURGON SEGURO",
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
    }

    console.log("Preferencias de Mercado Pago a enviar:", preference)

    // Llamada a la API de Mercado Pago
    const response = await fetch(mercadoPagoBaseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Error de Mercado Pago:", errorData)
      return NextResponse.json({ error: "Error al crear la preferencia de pago" }, { status: 500 })
    }

    const preferenceData = await response.json()

    return NextResponse.json({
      preference_id: preferenceData.id,
      init_point: preferenceData.init_point,
      sandbox_init_point: preferenceData.sandbox_init_point,
    })
  } catch (error) {
    console.error("Error creando preferencia de Mercado Pago:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const preferenceId = searchParams.get("preference_id");

    if (!preferenceId) {
      return NextResponse.json({ error: "ID de preferencia faltante" }, { status: 400 });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "Configuración de Mercado Pago no encontrada" }, { status: 500 });
    }

    // Llamada a la API de Mercado Pago para obtener el estado del pago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=solicitud_${preferenceId}_user_${user.userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error al obtener estado de pago de Mercado Pago:", errorData);
      return NextResponse.json({ error: "Error al verificar el estado del pago" }, { status: 500 });
    }

    const paymentData = await response.json();

    if (paymentData.results && paymentData.results.length > 0) {
      const payment = paymentData.results[0];
      return NextResponse.json({ status: payment.status });
    } else {
      return NextResponse.json({ status: "not_found" });
    }
  } catch (error) {
    console.error("Error obteniendo estado de pago de Mercado Pago:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 