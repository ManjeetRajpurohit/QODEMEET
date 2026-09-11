import express from "express"
import {AddBill,getSingleBill,listAllBills, razorpayBill,verifyBill} from '../controllers/billingController.js';
import userAuth from "../middleware/userAuth.js";
import requireVerified from "../middleware/requireVerified.js";
const billingRouter=express.Router();

billingRouter.get('/',listAllBills);
billingRouter.get('/:id',getSingleBill);
billingRouter.post('/add',AddBill);
billingRouter.post('/razorpay',userAuth,requireVerified,razorpayBill);
billingRouter.post("/verify", userAuth, verifyBill);
export default billingRouter;
