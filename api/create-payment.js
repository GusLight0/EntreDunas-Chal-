const { MercadoPagoConfig, Preference } = require("mercadopago");
const { getFirestore } = require("./_lib/firebaseAdmin");
const { calculateTotal } = require("./_lib/pricing");

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

const PAYMENT_TYPE_FILTERS = {
  pix: ["credit_card", "debit_card", "prepaid_card", "ticket", "atm", "digital_wallet"],
  debito: ["credit_card", "bank_transfer", "prepaid_card", "ticket", "atm", "digital_wallet"],
  credito: ["debit_card", "bank_transfer", "prepaid_card", "ticket", "atm", "digital_wallet"]
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

  if (!checkInISO || !checkOutISO || !name || !email || cpfDigits.length !== 11) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  const pricing = calculateTotal({ checkInISO, checkOutISO, discountCode });

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
      name,
      phone: phone || "",
      email,
      cpf: cpfDigits,
      status: "pending",
      paymentId: "",
      paymentMethod: "",
      createdAt: new Date().toISOString()
    });

    const siteUrl = process.env.URL || `https://${req.headers.host}`;

    const preference = await new Preference(client).create({
      body: {
        items: [
          {
            id: reservationRef.id,
            title: "Reserva - Entre Dunas Chalé",
            quantity: 1,
            unit_price: pricing.total,
            currency_id: "BRL"
          }
        ],
        payer: { name, email, identification: { type: "CPF", number: cpfDigits } },
        payment_methods: {
          installments: 3,
          ...(PAYMENT_TYPE_FILTERS[paymentMethod]
            ? { excluded_payment_types: PAYMENT_TYPE_FILTERS[paymentMethod].map((id) => ({ id })) }
            : {})
        },
        external_reference: reservationRef.id,
        notification_url: `${siteUrl}/api/mercadopago-webhook`,
        back_urls: {
          success: `${siteUrl}/pagamento.html?status=success`,
          failure: `${siteUrl}/pagamento.html?status=failure`,
          pending: `${siteUrl}/pagamento.html?status=pending`
        },
        auto_return: "approved"
      }
    });

    return res.status(200).json({
      reservationId: reservationRef.id,
      checkoutUrl: preference.init_point,
      total: pricing.total
    });
  } catch (error) {
    console.error("create-payment error:", error);
    return res.status(500).json({ error: "Falha ao criar pagamento" });
  }
};
