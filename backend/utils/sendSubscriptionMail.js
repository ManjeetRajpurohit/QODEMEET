import transporter from "../config/mail.js";

const sendSubscriptionMail = async (
  email,
  name,
  plan,
  amount,
  orderId,
  paymentId,
  billId
) => {
  const billLink =
    `${process.env.FRONTEND_URL}/billing/${billId}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Payment Successful - ${plan} Plan`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;">
        
        <h1 style="color:#4f46e5;">
          QodeMeet
        </h1>

        <h2>
          Subscription Activated Successfully 🎉
        </h2>

        <p>
          Hello <b>${name}</b>,
        </p>

        <p>
          Thank you for purchasing the
          <b>${plan}</b> plan.
        </p>

        <div style="
          border:1px solid #e5e7eb;
          border-radius:12px;
          padding:20px;
          margin:20px 0;
        ">
          <p><b>Plan:</b> ${plan}</p>
          <p><b>Amount:</b> ₹${amount}</p>
          <p><b>Order ID:</b> ${orderId}</p>
          <p><b>Payment ID:</b> ${paymentId}</p>
          <p><b>Status:</b> Paid</p>
        </div>

        <a
          href="${billLink}"
          style="
            display:inline-block;
            background:#4f46e5;
            color:white;
            padding:12px 24px;
            text-decoration:none;
            border-radius:8px;
          "
        >
          View Invoice
        </a>

        <p style="margin-top:30px;">
          Thank you for choosing QodeMeet.
        </p>

        <p>
          Regards,<br/>
          QodeMeet Team
        </p>

      </div>
    `,
  });
};

export default sendSubscriptionMail;