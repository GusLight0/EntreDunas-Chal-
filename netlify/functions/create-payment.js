const { MercadoPagoConfig, Preference } = require("mercadopago");
const { getFirestore } = require("./_lib/firebaseAdmin");
const { calculateTotal } = require("./_lib/pricing");

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

const PAYMENT_TYPE_FILTERS = {
  pix: ["credit_card", "debit_card", "prepaid_card", "ticket", "atm", "digital_wallet"],
  debito: ["credit_card", "bank_transfer", "prepaid_card", "ticket", "atm", "digital_wallet"],
  credito: ["debit_card", "bank_transfer", "prepaid_card", "ticket", "atm", "digital_wallet"]
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

  const { checkInISO, checkOutISO, guests, discountCode, name, phone, email, paymentMethod } = payload;

  if (!checkInISO || !checkOutISO || !name || !email) {
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
      status: "pending",
      paymentId: "",
      paymentMethod: "",
      createdAt: new Date().toISOString()
    });

    const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || "https://www.casabarreirinhas.com.br";

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
        payer: { name, email },
        payment_methods: {
          installments: 3,
          ...(PAYMENT_TYPE_FILTERS[paymentMethod]
            ? { excluded_payment_types: PAYMENT_TYPE_FILTERS[paymentMethod].map((id) => ({ id })) }
            : {})
        },
        external_reference: reservationRef.id,
        notification_url: `${siteUrl}/.netlify/functions/mercadopago-webhook`,
        back_urls: {
          success: `${siteUrl}/pagamento.html?status=success`,
          failure: `${siteUrl}/pagamento.html?status=failure`,
          pending: `${siteUrl}/pagamento.html?status=pending`
        },
        auto_return: "approved"
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        reservationId: reservationRef.id,
        checkoutUrl: preference.init_point,
        total: pricing.total
      })
    };
  } catch (error) {
    console.error("create-payment error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Falha ao criar pagamento" }) };
  }
};
