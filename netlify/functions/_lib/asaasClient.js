const BASE_URL = (process.env.ASAAS_API_URL || "").replace(/\/$/, "");
const API_KEY = process.env.ASAAS_API_KEY;

async function asaasRequest(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      access_token: API_KEY,
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.errors?.[0]?.description || `Asaas request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

async function findOrCreateCustomer({ name, email, cpfCnpj }) {
  const existing = await asaasRequest(`/customers?cpfCnpj=${encodeURIComponent(cpfCnpj)}`);
  if (existing.data && existing.data.length > 0) return existing.data[0];

  return asaasRequest("/customers", {
    method: "POST",
    body: JSON.stringify({ name, email, cpfCnpj })
  });
}

async function createPayment({ customerId, billingType, value, dueDate, description, externalReference }) {
  return asaasRequest("/payments", {
    method: "POST",
    body: JSON.stringify({ customer: customerId, billingType, value, dueDate, description, externalReference })
  });
}

async function getPixQrCode(paymentId) {
  return asaasRequest(`/payments/${paymentId}/pixQrCode`);
}

async function getPayment(paymentId) {
  return asaasRequest(`/payments/${paymentId}`);
}

module.exports = { findOrCreateCustomer, createPayment, getPixQrCode, getPayment };
