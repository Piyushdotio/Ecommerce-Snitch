import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "../config/config.js";

const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async ({
  amount,
  currency = "INR",
  receipt,
  notes,
}) => {
  if (!amount || amount <= 0) {
    throw new Error("Order amount must be greater than 0");
  }

  const safeReceipt = receipt ? String(receipt).slice(0, 40) : undefined;
  const options = {
    amount: Math.round(amount * 100),
    currency,
    receipt: safeReceipt,
    notes,
  };

  return razorpay.orders.create(options);
};

export const verifyRazorpayPayment = ({
  orderId,
  paymentId,
  signature,
}) => {
  const expectedSignature = crypto
    .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expectedSignature === signature;
};
