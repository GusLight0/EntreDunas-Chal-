const { getFirestore } = require("./_lib/firebaseAdmin");

const STATUS_MAP = {
  PAYMENT_CONFIRMED: "approved",
  PAYMENT_RECEIVED: "approved",
  PAYMENT_DELETED: "cancelled",
  PAYMENT_REFUNDED: "refunded",
  PAYMENT_PARTIALLY_REFUNDED: "refunded",
  PAYMENT_CHARGEBACK_REQUESTED: "refunded",
  PAYMENT_CHARGEBACK_DISPUTE: "refunded",
  PAYMENT_REPROVED_BY_RISK_ANALYSIS: "rejected",
  PAYMENT_CREDIT_CARD_CAPTURE_REFUSED: "rejected"
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const token = event.headers["asaas-access-token"];
  if (!token || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return { statusCode: 401, body: "unauthorized" };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: "invalid json" };
  }

  const status = STATUS_MAP[body.event];
  const reservationId = body.payment?.externalReference;

  if (!status || !reservationId) {
    return { statusCode: 200, body: "ignored" };
  }

  try {
    const db = getFirestore();
    await db.collection("reservations").doc(reservationId).update({
      status,
      paymentId: String(body.payment.id),
      paymentMethod: body.payment.billingType || "",
      updatedAt: new Date().toISOString()
    });

    return { statusCode: 200, body: "ok" };
  } catch (error) {
    console.error("asaas-webhook error:", error);
    // 500 faz o Asaas tentar reenviar essa notificação depois.
    return { statusCode: 500, body: "error" };
  }
};
