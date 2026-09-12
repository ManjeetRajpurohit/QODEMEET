import nodemailer from "nodemailer";
import dns from "dns";

const dnsPromises = dns.promises;

const resolveSmtpHost = async () => {
  try {
    const addresses = await dnsPromises.resolve4("smtp.gmail.com");
    return addresses[0];
  } catch (error) {
    console.error(
      "Failed to resolve smtp.gmail.com A record, falling back to hostname:",
      error.message,
    );
    return "smtp.gmail.com";
  }
};

// Render's outbound network doesn't reliably route IPv6. Neither
// dns.setDefaultResultOrder("ipv4first") nor nodemailer's `family: 4`
// option stopped connections from picking Gmail's AAAA record (see
// "ENETUNREACH 2607:..." in prod logs). Resolving the A record
// ourselves and connecting to that literal IPv4 address removes IPv6
// from the picture entirely. `tls.servername` keeps SNI/cert
// validation pointed at the real hostname despite connecting by IP.
const buildTransporter = async () => {
  const host = await resolveSmtpHost();

  return nodemailer.createTransport({
    host,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      servername: "smtp.gmail.com",
    },
  });
};

// Verify once at boot so startup logs still tell you quickly if
// creds/network are broken.
buildTransporter()
  .then((t) =>
    t.verify((err) => {
      if (err) {
        console.error("SMTP connection failed:", err.message);
      } else {
        console.log("SMTP server is ready to send emails");
      }
    }),
  )
  .catch((err) => console.error("SMTP setup failed:", err.message));

// sendOtpMail.js / sendWelcomeMail.js / etc. import this and call
// .sendMail(...) directly - keep that exact shape, but resolve a
// fresh transporter (and fresh IPv4 address) per send so we're never
// stuck on a stale/rotated Gmail IP.
const transporter = {
  sendMail: async (options) => {
    const realTransporter = await buildTransporter();
    return realTransporter.sendMail(options);
  },
};

export default transporter;
