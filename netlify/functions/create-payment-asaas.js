const { getFirestore } = require("./_lib/firebaseAdmin");
const { calculateTotal } = require("./_lib/pricing");
const { findOrCreateCustomer, createPayment } = require("./_lib/asaasClient");

const BILLING_TYPE = {
  pix: "PIX"
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "JSON inválido" }) };
  }

  const { checkInISO, checkOutISO, guests, discountCode, name, phone, email, cpf, paymentMethod } = payload;
  const cpfDigits = (cpf || "").replace(/\D/g, "");
  const billingType = BILLING_TYPE[paymentMethod];

  if (!checkInISO || !checkOutISO || !name || !email || cpfDigits.length !== 11 || !billingType) {
    return { statusCode: 400, body: JSON.stringify({ error: "Dados incompletos" }) };
  }

  const pricing = calculateTotal({ checkInISO, checkOutISO, discountCode });

  if (pricing.nights < 1) {
    return { statusCode: 400, body: JSON.stringify({ error: "Datas inválidas" }) };
  }

  try {
    const db = getFirestore();
    const reservationRef = await db.collection("reservations").add({
      house: "Entre Dunas Chalé",
      checkInISO,
      checkOutISO,
      nights: pricing.nights,
      guests: guests || 1,
      rate: pricing.rate,
      cleaning: pricing.cleaning,
      discount: pricing.discount,
      discountCode: pricing.discountCode,
      total: pricing.total,
      name,
      phone: phone || "",
      email,
      cpf: cpfDigits,
      status: "pending",
      paymentId: "",
      paymentMethod: "",
      paymentProvider: "asaas",
      createdAt: new Date().toISOString()
    });

    const customer = await findOrCreateCustomer({ name, email, cpfCnpj: cpfDigits });

    const todayISO = new Date().toISOString().slice(0, 10);
    const payment = await createPayment({
      customerId: customer.id,
      billingType,
      value: pricing.total,
      dueDate: todayISO,
      description: "Reserva - Entre Dunas Chalé",
      externalReference: reservationRef.id
    });

    await reservationRef.update({ paymentId: String(payment.id) });

    return {
      statusCode: 200,
      body: JSON.stringify({
        reservationId: reservationRef.id,
        checkoutUrl: payment.invoiceUrl,
        total: pricing.total
      })
    };
  } catch (error) {
    console.error("create-payment-asaas error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Falha ao criar pagamento" }) };
  }
};
