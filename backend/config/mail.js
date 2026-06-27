import nodemailer from "nodemailer";
import dns from "dns";

// Render's network has no outbound IPv6 routing.
// Gmail's SMTP hostname resolves to both A (IPv4) and AAAA (IPv6) records,
// and Node prefers IPv6 when both exist — causing ENETUNREACH on Render.
// Forcing IPv4 first fixes DNS resolution globally for this process.
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password (not your normal Gmail password)
  },
  family: 4, // force IPv4 for this transporter's socket connections too
});

// Optional: verify connection on startup, logs early if SMTP config/creds are wrong
transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP connection failed:", err.message);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

export default transporter;
