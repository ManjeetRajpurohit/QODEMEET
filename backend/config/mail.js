import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Without these, a blocked/slow SMTP connection has no real ceiling
  // and can hang for minutes before Node's default OS-level timeout
  // kicks in - and since the route awaits the mail send, the whole
  // request (and the user's browser) just sits there waiting.
  connectionTimeout: 10000, // max time to establish the connection
  greetingTimeout: 10000,   // max time to wait for the SMTP greeting
  socketTimeout: 15000,     // max time for the socket to stay idle
});

export default transporter;
