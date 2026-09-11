import mongoose from "mongoose";

const billingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // Razorpay Order ID
    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    // Razorpay Payment ID
    paymentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Razorpay Signature
    signature: {
      type: String,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    plan: {
      type: String,
      enum: ["Free", "Pro", "Enterprise"],
      required: true,
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },

    receipt: {
      type: String,
      default: "",
    },

    invoiceUrl: {
      type: String,
      default: "",
    },

    paidAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const billingModel = mongoose.model("billing", billingSchema);

export default billingModel;
