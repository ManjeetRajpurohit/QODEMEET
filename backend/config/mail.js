import nodemailer from "nodemailer";

const gmailTransport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4,
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
