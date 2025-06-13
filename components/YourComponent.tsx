import { MercadoPagoPayment } from "@/components/mercadopago-payment"

// Inside your component:
const handlePayment = () => {
  return (
    <MercadoPagoPayment
      amount={1000} // Amount in the smallest currency unit
      description="Servicio de transporte escolar"
      externalReference="solicitud_default"
      payer={{
        firstName: "", // Add user data from props or state
        lastName: "", // Add user's last name from props or state
        email: "" // Add user's email from props or state
      }}
      onSuccess={(paymentData) => {
        // Handle successful payment
        console.log('Payment successful:', paymentData)
      }}
      onError={(error) => {
        // Handle payment error
        console.error('Payment error:', error)
      }}
      onPending={(paymentData) => {
        // Handle pending payment
        console.log('Payment pending:', paymentData)
      }}
    />
  )
}