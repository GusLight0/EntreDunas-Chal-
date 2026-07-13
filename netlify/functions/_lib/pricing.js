// Fonte da verdade do preço no servidor. Precisa ficar em sincronia manual
// com o CONFIG de assets/js/app.js — o valor cobrado de verdade é sempre
// recalculado aqui, nunca confiamos no total que vem do navegador.
const CONFIG = {
  baseRate: 480,
  cleaningFee: 0,
  longStayDiscountPercent: 0,
  longStayDiscountNights: 7,
  // Cada código vale um número fixo em R$ (ex: 40) ou um objeto { percent: 5 } para 5% de desconto.
  discountCodes: {},
  // Repassa a taxa do Asaas pro cartão de crédito (2,99% + R$0,49) pra quem escolhe essa forma de pagamento.
  cardSurchargePercent: 0.0299,
  cardSurchargeFixed: 0.49
};

function diffDays(startISO, endISO) {
  const start = new Date(`${startISO}T00:00:00`);
  const end = new Date(`${endISO}T00:00:00`);
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

function resolveCodeDiscount(code, subtotal) {
  const entry = CONFIG.discountCodes[code];
  if (!entry) return 0;
  if (typeof entry === "number") return entry;
  return Math.round(subtotal * (entry.percent / 100));
}

function calculateCardFee(baseTotal) {
  return Math.round((baseTotal * CONFIG.cardSurchargePercent + CONFIG.cardSurchargeFixed) * 100) / 100;
}

function calculateTotal({ checkInISO, checkOutISO, discountCode, paymentMethod }) {
  const nights = Math.max(0, diffDays(checkInISO, checkOutISO));
  const subtotal = nights * CONFIG.baseRate;
  const code = String(discountCode || "").trim().toUpperCase();

  const automaticDiscount = nights >= CONFIG.longStayDiscountNights
    ? Math.round(subtotal * CONFIG.longStayDiscountPercent)
    : 0;
  const codeDiscount = resolveCodeDiscount(code, subtotal);
  const discount = Math.min(Math.max(automaticDiscount, codeDiscount), subtotal + CONFIG.cleaningFee);
  const appliedCode = discount > 0 && codeDiscount === discount ? code : "";

  const baseTotal = Math.max(0, subtotal + CONFIG.cleaningFee - discount);
  const cardFee = paymentMethod === "credito" ? calculateCardFee(baseTotal) : 0;
  const total = Math.round((baseTotal + cardFee) * 100) / 100;

  return {
    nights,
    subtotal,
    discount,
    discountCode: appliedCode,
    cleaning: CONFIG.cleaningFee,
    rate: CONFIG.baseRate,
    baseTotal,
    cardFee,
    total
  };
}

module.exports = { CONFIG, calculateTotal };
