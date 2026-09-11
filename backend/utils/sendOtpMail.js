import transporter from "../config/mail.js";

const sendOtpMail = async ({ name, email, otp }) => {
  await transporter.sendMail({
    from: `"QodeMeet" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your QodeMeet account",
    html: `
      <div style="font-family: Arial, sans-serif; color:#111; max-width:480px;">
        <h2>Hi ${name},</h2>

        <p>Use the code below to verify your email and activate your QodeMeet account:</p>

        <div style="font-size:32px; font-weight:bold; letter-spacing:6px; background:#f4f4f7; border-radius:8px; padding:16px; text-align:center; margin:20px 0;">
          ${otp}
        </div>

        <p style="color:#555;">This code expires in 10 minutes. If you didn't create a QodeMeet account, you can ignore this email.</p>
      </div>
    `,
  });
};

export default sendOtpMail;
