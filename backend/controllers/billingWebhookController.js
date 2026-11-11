
import crypto from "crypto";
import mongoose from "mongoose";

import billingModel from "../models/billingModel.js";
import userModel from "../models/userModel.js";
import applySubscription from "../utils/applySubscription.js";
import sendSubscriptionMail from "../utils/sendSubscriptionMail.js";

const verifyWebhookSignature = (rawBody, signature, secret) => {
  if (
    !Buffer.isBuffer(rawBody) ||
    typeof signature !== "string" ||
    !/^[a-f0-9]{128}$/i.test(signature) ||
    typeof secret !== "string" ||
    !secret
  ) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest();

  const received = Buffer.from(signature, "hex");

  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received)
  );
};

const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured");

      return res.status(503).json({
        success: false,
        message: "Webhook service is unavailable",
      });
    }

    const signature = req.get("x-razorpay-signature");

    if (
      !verifyWebhookSignature(
        req.body,
        signature,
        webhookSecret
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    let event;

    try {
      event = JSON.parse(req.body.toString("utf8"));
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook payload",
      });
    }

    // Other verified Razorpay events do not activate subscriptions.
    if (event.event !== "payment.captured") {
      return res.status(200).json({
        success: true,
        message: "Event acknowledged",
      });
    }

    const payment = event.payload?.payment?.entity;

    if (
      !payment ||
      typeof payment.id !== "string" ||
      typeof payment.order_id !== "string" ||
      payment.status !== "captured" ||
      !Number.isSafeInteger(payment.amount) ||
      payment.amount <= 0 ||
      typeof payment.currency !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid captured payment data",
      });
    }

    const existingBill = await billingModel.findOne({
      orderId: payment.order_id,
    });

    if (!existingBill) {
      console.error(
        "Razorpay webhook received for unknown order:",
        payment.order_id
      );

      return res.status(200).json({
        success: true,
        message: "Unknown order acknowledged",
      });
    }

    // Database amounts are stored in rupees; Razorpay sends paise.
    if (
      payment.amount !== existingBill.amount * 100 ||
      payment.currency !== existingBill.currency
    ) {
      console.error(
        "Razorpay webhook payment mismatch:",
        payment.order_id
      );

      return res.status(400).json({
        success: false,
        message: "Payment details do not match the stored order",
      });
    }

    // A previously processed payment must never activate twice.
    if (existingBill.status === "paid") {
      return res.status(200).json({
        success: true,
        message:
          existingBill.paymentId === payment.id
            ? "Payment already processed"
            : "Order already processed",
      });
    }

    if (existingBill.status !== "created") {
      return res.status(200).json({
        success: true,
        message: "Order is no longer eligible for activation",
      });
    }

    const session = await mongoose.startSession();
    let processedBill = null;

    try {
      await session.withTransaction(async () => {
        // Reset this variable because MongoDB may retry a transaction.
        processedBill = null;

        const bill = await billingModel.findOneAndUpdate(
          {
            _id: existingBill._id,
            orderId: payment.order_id,
            status: "created",
          },
          {
            $set: {
              paymentId: payment.id,
              status: "paid",
              paidAt: new Date(),
            },
          },
          {
            new: true,
            session,
          }
        );

        // Frontend verification or another webhook may have won the race.
        if (!bill) {
          return;
        }

        const user = await userModel
          .findById(bill.userId)
          .session(session);

        if (!user) {
          throw new Error(
            "Paid bill has no associated user"
          );
        }

        // Both frontend verification and webhook use identical plan rules.
        applySubscription(user, bill);

        await user.save({ session });

        processedBill = bill;
      });
    } finally {
      await session.endSession();
    }

    if (!processedBill) {
      // Another payment path may have completed the same order.
      const latestBill = await billingModel.findById(
        existingBill._id
      );

      return res.status(200).json({
        success: true,
        message:
          latestBill?.status === "paid"
            ? "Payment already processed"
            : "Order acknowledged",
      });
    }

    // Send confirmation only when this webhook actually processed the bill.
    // A duplicate webhook must not send another confirmation.
    const user = await userModel.findById(
      processedBill.userId
    );

    if (user) {
      try {
        await sendSubscriptionMail(
          user.email,
          user.name,
          processedBill.plan,
          processedBill.amount,
          processedBill.orderId,
          processedBill.paymentId,
          processedBill._id
        );
      } catch (emailError) {
        // Email failure must not undo an already-confirmed payment.
        console.error(
          "Webhook subscription email failed:",
          emailError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error) {
    console.error(
      "Razorpay webhook processing error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

export default razorpayWebhook;
