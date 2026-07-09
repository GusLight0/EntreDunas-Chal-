const { MercadoPagoConfig, Payment } = require("mercadopago");
const { getFirestore } = require("./_lib/firebaseAdmin");

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

const STATUS_MAP = {
  approved: "approved",
  pending: "pending",
  in_process: "pending",
  rejected: "rejected",
  cancelled: "cancelled",
  refunded: "refunded",
  charged_back: "refunded"
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const params = event.queryStringParameters || {};
  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    // Mercado Pago também manda notificação só por query string, tudo bem.
  }

  const type = params.type || body.type || body.topic;
  const paymentId = params["data.id"] || body?.data?.id || params.id;

  if (type !== "payment" || !paymentId) {
    return { statusCode: 200, body: "ignored" };
  }

  try {
    const payment = await new Payment(client).get({ id: paymentId });
    const reservationId = payment.external_reference;

    if (!reservationId) {
      return { statusCode: 200, body: "no reference" };
    }

    const db = getFirestore();
    await db.collection("reservations").doc(reservationId).update({
      status: STATUS_MAP[payment.status] || payment.status,
      paymentId: String(payment.id),
      paymentMethod: payment.payment_type_id || "",
      updatedAt: new Date().toISOString()
    });

    return { statusCode: 200, body: "ok" };
  } catch (error) {
    console.error("mercadopago-webhook error:", error);
    // 500 faz o Mercado Pago tentar reenviar essa notificação depois —
    // importante para não perder a atualização de status em caso de falha
    // temporária (ex: Firestore fora do ar por um instante).
    return { statusCode: 500, body: "error" };
  }
};
