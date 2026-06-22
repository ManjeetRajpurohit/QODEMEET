import billingModel from "../models/billingModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import sendSubscriptionMail from "../utils/sendSubscriptionMail.js";
import userModel from "../models/userModel.js";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const listAllBills = async (req, res) => {
  try {
    const bills = await billingModel.find({}).sort({ createdAt: -1 });

    return res.json({
      success: true,
      bills,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleBill = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await billingModel.findById(id);

    if (!bill) {
      return res.json({
        success: false,
        message: "No bill found",
      });
    }

    return res.json({
      success: true,
      bill,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const AddBill = async (req, res) => {
  try {
    const {
      userId,
      orderId,
      paymentId,
      signature,
      amount,
      currency,
      plan,
      status,
      receipt,
      invoiceUrl,
      paidAt,
    } = req.body;

    const existingBill = await billingModel.findOne({ paymentId });

    if (existingBill) {
      return res.json({
        success: false,
        message: "Bill already exists",
      });
    }

    const bill = await billingModel.create({
      userId,
      orderId,
      paymentId,
      signature,
      amount,
      currency,
      plan,
      status,
      receipt,
      invoiceUrl,
      paidAt,
    });

    return res.json({
      success: true,
      bill,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const razorpayBill = async (req, res) => {
  try {
    const { plan } = req.body;

    let amount = 0;

    if (plan === "Pro") amount = 9;
    else if (plan === "Enterprise") amount = 29;
    else if (plan === "Annual") amount = 99;
    else {
      return res.json({
        success: false,
        message: "Invalid plan",
      });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `bill_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    await billingModel.create({
      userId: req.user._id,
      orderId: order.id,
      amount,
      currency: "INR",
      plan,
      status: "created",
      receipt: options.receipt,
    });

    return res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const verifyBill = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      await billingModel.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: "failed" }
      );

      return res.json({
        success: false,
        message: "Invalid signature",
      });
    }

    const bill = await billingModel.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: "paid",
        paidAt: new Date(),
      },
      { new: true }
    );

    if (!bill) {
      return res.json({
        success: false,
        message: "Bill not found",
      });
    }

    const user = await userModel.findById(bill.userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const now = new Date();

    const durationDays =
      bill.plan === "Annual"
        ? 365
        : 30;

    const expiryDate = new Date(
      now.getTime() +
        durationDays * 24 * 60 * 60 * 1000
    );

    const isExpired =
      !user.subscriptionExpiry ||
      user.subscriptionExpiry < now;

    if (user.subscriptionPlan === "Free" || isExpired) {
      user.subscriptionPlan = bill.plan;
      user.subscriptionExpiry = expiryDate;
      user.interviewsUsed = 0;
      user.billingCycleStart = now;
      user.upcomingPlan = null;
      user.upcomingPlanExpiry = null;
    } else if (user.subscriptionPlan === bill.plan) {
      user.upcomingPlan = bill.plan;
      user.upcomingPlanExpiry = expiryDate;
    } else {
      user.subscriptionPlan = bill.plan;
      user.subscriptionExpiry = expiryDate;
      user.interviewsUsed = 0;
      user.billingCycleStart = now;
      user.upcomingPlan = null;
      user.upcomingPlanExpiry = null;
    }

    await user.save();

    await sendSubscriptionMail(
      user.email,
      user.name,
      bill.plan,
      bill.amount,
      bill.orderId,
      bill.paymentId,
      bill._id
    );

    return res.json({
      success: true,
      message: "Payment Successful",
      bill,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export {
  AddBill,
  getSingleBill,
  listAllBills,
  razorpayBill,
  verifyBill,
};
