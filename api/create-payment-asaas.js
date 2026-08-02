const { getFirestore } = require("./_lib/firebaseAdmin");
const { calculateTotal } = require("./_lib/pricing");
const { findOrCreateCustomer, createPayment } = require("./_lib/asaasClient");

const BILLING_TYPE = {
  pix: "PIX",
  credito: "CREDIT_CARD"
};

function parseBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body || {};
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let payload;
  try {
    payload = parseBody(req);
  } catch {
    return res.status(400).json({ error: "JSON inválido" });
  }

  const { checkInISO, checkOutISO, guests, discountCode, name, phone, email, cpf, paymentMethod } = payload;
  const cpfDigits = (cpf || "").replace(/\D/g, "");
  const billingType = BILLING_TYPE[paymentMethod];

  if (!checkInISO || !checkOutISO || !name || !email || cpfDigits.length !== 11 || !billingType) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  const pricing = calculateTotal({ checkInISO, checkOutISO, discountCode, paymentMethod });

  if (pricing.nights < 1) {
    return res.status(400).json({ error: "Datas inválidas" });
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
      cardFee: pricing.cardFee,
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

    const siteUrl = process.env.URL || `https://${req.headers.host}`;
    const todayISO = new Date().toISOString().slice(0, 10);
    const payment = await createPayment({
      customerId: customer.id,
      billingType,
      value: pricing.total,
      dueDate: todayISO,
      description: "Reserva - Entre Dunas Chalé",
      externalReference: reservationRef.id,
      callback: {
        successUrl: `${siteUrl}/pagamento.html?status=success&total=${pricing.total}`,
        autoRedirect: true
      }
    });

    await reservationRef.update({ paymentId: String(payment.id) });

    return res.status(200).json({
      reservationId: reservationRef.id,
      checkoutUrl: payment.invoiceUrl,
      total: pricing.total
    });
  } catch (error) {
    console.error("create-payment-asaas error:", error);
    return res.status(500).json({ error: "Falha ao criar pagamento" });
  }
};
