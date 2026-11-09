
import express from "express";

import {
  getSingleBill,
  listAllBills,
  razorpayBill,
  verifyBill,
} from "../controllers/billingController.js";

import userAuth from "../middleware/userAuth.js";
import requireVerified from "../middleware/requireVerified.js";

const billingRouter = express.Router();

// All billing information requires authentication.
billingRouter.get("/", userAuth, listAllBills);
billingRouter.get("/:id", userAuth, getSingleBill);

// Create Razorpay order.
billingRouter.post(
  "/razorpay",
  userAuth,
  requireVerified,
  razorpayBill
);

// Verify Razorpay payment.
billingRouter.post(
  "/verify",
  userAuth,
  requireVerified,
  verifyBill
);

export default billingRouter;
