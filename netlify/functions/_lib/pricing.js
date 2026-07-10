// Fonte da verdade do preço no servidor. Precisa ficar em sincronia manual
// com o CONFIG de assets/js/app.js — o valor cobrado de verdade é sempre
// recalculado aqui, nunca confiamos no total que vem do navegador.
const CONFIG = {
  baseRate: 480,
  cleaningFee: 0,
  longStayDiscountPercent: 0,
  longStayDiscountNights: 7,
  discountCodes: {
    BEMVINDO10: 40,
    LENCOIS15: 60,
    TESTEREAL479: 479
  }
};

function diffDays(startISO, endISO) {
  const start = new Date(`${startISO}T00:00:00`);
  const end = new Date(`${endISO}T00:00:00`);
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

function calculateTotal({ checkInISO, checkOutISO, discountCode }) {
  const nights = Math.max(0, diffDays(checkInISO, checkOutISO));
  const subtotal = nights * CONFIG.baseRate;
  const code = String(discountCode || "").trim().toUpperCase();

  const automaticDiscount = nights >= CONFIG.longStayDiscountNights
    ? Math.round(subtotal * CONFIG.longStayDiscountPercent)
    : 0;
  const codeDiscount = CONFIG.discountCodes[code] || 0;
  const discount = Math.min(Math.max(automaticDiscount, codeDiscount), subtotal + CONFIG.cleaningFee);
  const appliedCode = discount > 0 && codeDiscount === discount ? code : "";

  const total = Math.max(0, subtotal + CONFIG.cleaningFee - discount);

  return {
    nights,
    subtotal,
    discount,
    discountCode: appliedCode,
    cleaning: CONFIG.cleaningFee,
    rate: CONFIG.baseRate,
    total
  };
}

module.exports = { CONFIG, calculateTotal };
