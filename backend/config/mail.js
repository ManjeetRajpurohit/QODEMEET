// test-mail.js
import nodemailer from "nodemailer";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "YOUR_GMAIL@gmail.com",       // paste directly, no env vars, to rule out env var issues
    pass: "your16charapppassword",      // the App Password, no spaces
  },
});

transporter.sendMail({
  from: "YOUR_GMAIL@gmail.com",
  to: "YOUR_GMAIL@gmail.com", // send to yourself
  subject: "Test",
  text: "If you got this, SMTP works.",
}, (err, info) => {
  if (err) {
    console.error("FULL ERROR:", err);
  } else {
    console.log("SUCCESS:", info.response);
  }
});
