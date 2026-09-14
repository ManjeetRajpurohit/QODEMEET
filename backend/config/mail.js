import nodemailer from "nodemailer";

const gmailTransport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  family: 4,
  connectionTimeout: 15000,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const transporter = {
  sendMail: async ({ to, subject, html }) => {
    return gmailTransport.sendMail({
      from: `"QodeMeet" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
  },
};

export default transporter;
