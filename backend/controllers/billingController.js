
import billingModel from "../models/billingModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import sendSubscriptionMail from "../utils/sendSubscriptionMail.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Server-controlled plan prices (amounts in INR).
const PLAN_PRICES = {
  Pro: 9,
  Enterprise: 29,
  Annual: 99,
};

const PLAN_DURATION = {
  Pro: 30,
  Enterprise: 30,
  Annual: 365,
};

// ==========================================
// GET ALL BILLS
// ==========================================

const listAllBills = async (req, res) => {
  try {
    const bills = await billingModel
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      bills,
    });
  } catch (error) {
    console.error("List bills error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve billing history",
    });
  }
};

// ==========================================
// GET SINGLE BILL
// ==========================================

const getSingleBill = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bill ID",
      });
    }

    const bill = await billingModel.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    return res.status(200).json({
      success: true,
      bill,
    });
  } catch (error) {
    console.error("Get bill error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve bill",
    });
  }
};

// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

const razorpayBill = async (req, res) => {
  try {
    const { plan } = req.body || {};

    if (!Object.hasOwn(PLAN_PRICES, plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan",
      });
    }

    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      return res.status(503).json({
        success: false,
        message: "Payment service is unavailable",
      });
    }

    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const amount = PLAN_PRICES[plan];

    const receipt = `bill_${crypto.randomUUID()}`;

    const order = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt,
      notes: {
        userId: user._id.toString(),
        plan,
      },
    });

    await billingModel.create({
      userId: user._id,
      orderId: order.id,
      amount,
      currency: "INR",
      plan,
      status: "created",
      receipt,
    });

    return res.status(201).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(
      "Razorpay order creation error:",
      error.response?.data || error.message
    );

    return res.status(502).json({
      success: false,
      message: "Unable to create payment order",
    });
  }
};

// ==========================================
// VERIFY RAZORPAY PAYMENT
// ==========================================

const verifyBill = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body || {};

    // Validate request.
    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !/^[a-f0-9]{128}$/i.test(razorpay_signature)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment verification details",
      });
    }

    // Find an order belonging to the authenticated user.
    const existingBill = await billingModel.findOne({
      orderId: razorpay_order_id,
      userId: req.user._id,
    });

    if (!existingBill) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found",
      });
    }

    // Prevent duplicate payment processing.
    if (existingBill.status === "paid") {
      if (existingBill.paymentId === razorpay_payment_id) {
        return res.status(200).json({
          success: true,
          message: "Payment already verified",
          bill: existingBill,
        });
      }

      return res.status(409).json({
        success: false,
        message: "Order has already been processed",
      });
    }

    if (existingBill.status !== "created") {
      return res.status(400).json({
        success: false,
        message: "Payment order is no longer valid",
      });
    }

    // Verify HMAC signature.
    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    const generatedBuffer = Buffer.from(
      generatedSignature,
      "hex"
    );

    const receivedBuffer = Buffer.from(
      razorpay_signature,
      "hex"
    );

    const signatureValid =
      generatedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(
        generatedBuffer,
        receivedBuffer
      );

    if (!signatureValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Fetch order directly from Razorpay.
    const razorpayOrder =
      await razorpayInstance.orders.fetch(
        razorpay_order_id
      );

    if (
      razorpayOrder.id !== razorpay_order_id ||
      razorpayOrder.amount !== existingBill.amount * 100 ||
      razorpayOrder.currency !== existingBill.currency
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment order details do not match",
      });
    }

    // Verify payment directly with Razorpay.
    const payment =
      await razorpayInstance.payments.fetch(
        razorpay_payment_id
      );

    if (
      payment.order_id !== razorpay_order_id ||
      payment.amount !== razorpayOrder.amount ||
      payment.currency !== razorpayOrder.currency ||
      payment.status !== "captured"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment has not been successfully captured",
      });
    }

    // Atomically mark the order as paid.
    // Prevents two simultaneous requests from activating
    // the same subscription twice.
    const bill = await billingModel.findOneAndUpdate(
      {
        _id: existingBill._id,
        userId: req.user._id,
        status: "created",
      },
      {
        $set: {
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          status: "paid",
          paidAt: new Date(),
        },
      },
      {
        new: true,
      }
    );

    if (!bill) {
      return res.status(409).json({
        success: false,
        message: "Payment order has already been processed",
      });
    }

    // Activate subscription.
    const user = await userModel.findById(bill.userId);

    if (!user) {
      console.error(
        "Paid bill has no associated user:",
        bill._id
      );

      return res.status(500).json({
        success: false,
        message: "Payment received but subscription activation failed. Contact support.",
        paymentReceived: true,
      });
    }

    const now = new Date();

    const durationDays = PLAN_DURATION[bill.plan];

    if (!durationDays) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription duration",
        paymentReceived: true,
      });
    }

    const expiryDate = new Date(
      now.getTime() +
        durationDays * 24 * 60 * 60 * 1000
    );

    const isExpired =
      !user.subscriptionExpiry ||
      user.subscriptionExpiry < now;

    if (
      user.subscriptionPlan === "Free" ||
      isExpired
    ) {
      user.subscriptionPlan = bill.plan;
      user.subscriptionExpiry = expiryDate;
      user.interviewsUsed = 0;
      user.billingCycleStart = now;
      user.upcomingPlan = null;
      user.upcomingPlanExpiry = null;
    } else if (
      user.subscriptionPlan === bill.plan
    ) {
      // Queue renewal of the existing plan.
      user.upcomingPlan = bill.plan;

      user.upcomingPlanExpiry = new Date(
        user.subscriptionExpiry.getTime() +
          durationDays * 24 * 60 * 60 * 1000
      );
    } else {
      // Switch to the newly purchased plan.
      user.subscriptionPlan = bill.plan;
      user.subscriptionExpiry = expiryDate;
      user.interviewsUsed = 0;
      user.billingCycleStart = now;
      user.upcomingPlan = null;
      user.upcomingPlanExpiry = null;
    }

    await user.save();

    // Send confirmation email without blocking payment response.
    sendSubscriptionMail(
      user.email,
      user.name,
      bill.plan,
      bill.amount,
      bill.orderId,
      bill.paymentId,
      bill._id
    ).catch((error) => {
      console.error(
        "Subscription email failed:",
        error
      );
    });

    return res.status(200).json({
      success: true,
      message: "Payment successful",
      bill,
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment. Contact support if money was deducted.",
    });
  }
};

export {
  getSingleBill,
  listAllBills,
  razorpayBill,
  verifyBill,
};
