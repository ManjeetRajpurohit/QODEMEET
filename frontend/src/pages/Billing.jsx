import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Crown, Receipt, CheckCircle, Loader2 } from "lucide-react";
import { AppContext } from "../context/Appcontext";

const Billing = () => {
  const { backendUrl, navigate, token } = useContext(AppContext);

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const [subscription, setSubscription] = useState({
    subscriptionPlan: "Free",
    subscriptionExpiry: null,
    interviewsUsed: 0,
    remainingInterviews: 1,
    upcomingPlan: null,
    upcomingPlanExpiry: null,
  });

  const plans = [
    {
      name: "Free",
      price: "₹0",
      description: "Perfect for individuals getting started.",
      features: [
        "1 Interview / Month",
        "Basic Code Editor",
        "Video Calling",
        "Community Support",
      ],
    },

    {
      name: "Pro",
      price: "₹9",
      description: "Best for recruiters and interviewers.",
      features: [
        "15 Interviews / Month",
        "Advanced Code Editor",
        "Priority Support",
      ],
    },

    {
      name: "Enterprise",
      price: "₹29",
      description: "Unlimited interviews for power users.",
      features: [
        "Unlimited Interviews",
        "Advanced Code Editor",
        "AI Evaluation",
        "Priority Support",
      ],
    },

    {
      name: "Annual",
      price: "₹99",
      description: "Unlimited interviews for one full year.",
      features: [
        "Unlimited Interviews",
        "AI Evaluation",
        "Analytics",
        "Priority Support",
      ],
    },
  ];

  const fetchBills = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/bill/`);

      if (data.success) {
        setBills(data.bills || []);
      }
    } catch (error) {
      toast.error("Failed to fetch billing history");
    }
  };

  const fetchSubscription = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/subscription`, {
        headers: {
          token,
        },
      });

      if (data.success) {
        setSubscription(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
    fetchSubscription();
  }, []);

  const totalSpent = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,

      handler: async (response) => {
        try {
          const { data } = await axios.post(
            `${backendUrl}/api/bill/verify`,
            response,
            {
              headers: { token },
            },
          );

          if (data.success) {
            toast.success("Subscription Activated Successfully");

            fetchBills();
            fetchSubscription();
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          toast.error(error.message);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleonSubmit = async (planName) => {
    try {
      if (planName === "Free") {
        toast.info("Free plan is already active");
        return;
      }

      const { data } = await axios.post(
        `${backendUrl}/api/bill/razorpay`,
        {
          plan: planName,
        },
        {
          headers: { token },
        },
      );

      if (data.success) {
        initPay(data.order);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>

          <p className="text-slate-400 mt-2">
            Manage your subscription and billing.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-slate-400">Current Plan</h3>

                <p className="text-3xl font-bold mt-3">
                  {subscription.subscriptionPlan}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-slate-400">Plan Expiry</h3>

                <p className="text-lg font-semibold mt-3">
                  {subscription.subscriptionExpiry
                    ? new Date(
                        subscription.subscriptionExpiry,
                      ).toLocaleDateString()
                    : "Never"}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-slate-400">Remaining Interviews</h3>

                <p className="text-3xl font-bold mt-3">
                  {subscription.remainingInterviews}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-slate-400">Upcoming Plan</h3>

                <p className="text-xl font-bold mt-3">
                  {subscription.upcomingPlan || "None"}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-6">
                <Crown size={22} />
                <h2 className="text-2xl font-semibold">Available Plans</h2>
              </div>

              <div className="grid lg:grid-cols-4 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500 transition-all"
                  >
                    <h3 className="text-2xl font-bold">{plan.name}</h3>

                    <p className="text-4xl font-bold mt-4">{plan.price}</p>

                    <p className="text-slate-400 mt-3">{plan.description}</p>

                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle size={16} className="text-green-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleonSubmit(plan.name)}
                      className="w-full mt-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition font-medium"
                    >
                      {subscription.subscriptionPlan === plan.name
                        ? "Current Plan"
                        : "Upgrade Plan"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-slate-400">Total Bills</h3>

                <p className="text-4xl font-bold mt-2">{bills.length}</p>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-slate-400">Total Amount Spent</h3>

                <p className="text-4xl font-bold mt-2">₹{totalSpent}</p>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Receipt size={20} />
                <h2 className="text-xl font-semibold">Billing History</h2>
              </div>

              {bills.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  No billing records found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-4">Order ID</th>

                        <th className="text-left py-4">Payment ID</th>

                        <th className="text-left py-4">Plan</th>

                        <th className="text-left py-4">Amount</th>

                        <th className="text-left py-4">Status</th>

                        <th className="text-left py-4">Date</th>

                        <th className="text-right py-4">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {bills.map((bill) => (
                        <tr
                          key={bill._id}
                          className="border-b border-slate-800"
                        >
                          <td className="py-4">{bill.orderId}</td>

                          <td className="py-4">{bill.paymentId || "-"}</td>

                          <td className="py-4">{bill.plan}</td>

                          <td className="py-4">₹{bill.amount}</td>

                          <td className="py-4">
                            <span
                              className={`font-medium ${
                                bill.status === "paid"
                                  ? "text-green-400"
                                  : bill.status === "failed"
                                    ? "text-red-400"
                                    : "text-yellow-400"
                              }`}
                            >
                              {bill.status}
                            </span>
                          </td>

                          <td className="py-4">
                            {new Date(bill.createdAt).toLocaleDateString()}
                          </td>

                          <td className="py-4 text-right">
                            <button
                              onClick={() => navigate(`/billing/${bill._id}`)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Billing;
