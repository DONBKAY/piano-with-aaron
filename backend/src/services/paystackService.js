const axios = require("axios");

const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

// amount must be in the smallest currency unit (pesewas/cents), e.g. GHS 10 -> 1000
async function initializeTransaction({ email, amount, currency, reference, metadata, channels }) {
  const { data } = await paystack.post("/transaction/initialize", {
    email,
    amount,
    currency,
    reference,
    metadata,
    channels, // e.g. ["mobile_money", "card"] for GHS, ["card"] for USD
    callback_url: `${process.env.CLIENT_URL}/payment/callback`,
  });
  return data.data; // { authorization_url, access_code, reference }
}

async function verifyTransaction(reference) {
  const { data } = await paystack.get(`/transaction/verify/${encodeURIComponent(reference)}`);
  return data.data; // { status, amount, currency, reference, ... }
}

module.exports = { initializeTransaction, verifyTransaction };
