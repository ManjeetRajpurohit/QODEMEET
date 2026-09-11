import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/Appcontext";
import { toast } from "react-toastify";

const Bill = () => {
  const { billingId } = useParams();

  const { token } = useContext(AppContext);

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBill = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/bill/${billingId}`,
        {
          headers: {
            token,
          },
        }
      );

      if (response.data.success) {
        setBill(response.data.bill);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-white">
        Loading Invoice...
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="p-10 text-center text-red-500">
        Bill not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white p-8">
      <div className="max-w-3xl mx-auto bg-[#111827] rounded-xl border border-gray-800 p-8">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Invoice</h1>

          <span
            className={`px-3 py-1 rounded-full text-sm ${
              bill.status === "paid"
                ? "bg-green-500/20 text-green-400"
                : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            {bill.status}
          </span>
        </div>

        <div className="space-y-4">

          <div className="flex justify-between">
            <span>Order ID</span>
            <span>{bill.orderId}</span>
          </div>

          <div className="flex justify-between">
            <span>Payment ID</span>
            <span>{bill.paymentId}</span>
          </div>

          <div className="flex justify-between">
            <span>Plan</span>
            <span>{bill.plan}</span>
          </div>

          <div className="flex justify-between">
            <span>Amount</span>
            <span>
              ₹{bill.amount?.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Currency</span>
            <span>{bill.currency}</span>
          </div>

          <div className="flex justify-between">
            <span>Receipt</span>
            <span>{bill.receipt}</span>
          </div>

          <div className="flex justify-between">
            <span>Paid At</span>
            <span>
              {new Date(bill.paidAt).toLocaleString()}
            </span>
          </div>
        </div>

        <hr className="my-8 border-gray-700" />

        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            QODEMEET Premium
          </h2>

          <p className="text-gray-400">
            Thank you for your purchase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Bill;