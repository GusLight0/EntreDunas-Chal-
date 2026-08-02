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

function parseBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body || {};
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const token = req.headers["asaas-access-token"];
  if (!token || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return res.status(401).send("unauthorized");
  }

  let body;
  try {
    body = parseBody(req);
  } catch {
    return res.status(400).send("invalid json");
  }

  const status = STATUS_MAP[body.event];
  const reservationId = body.payment?.externalReference;

  if (!status || !reservationId) {
    return res.status(200).send("ignored");
  }

  try {
    const db = getFirestore();
    await db.collection("reservations").doc(reservationId).update({
      status,
      paymentId: String(body.payment.id),
      paymentMethod: body.payment.billingType || "",
      updatedAt: new Date().toISOString()
    });

    return res.status(200).send("ok");
  } catch (error) {
    console.error("asaas-webhook error:", error);
    // 500 faz o Asaas tentar reenviar essa notificação depois.
    return res.status(500).send("error");
  }
};
