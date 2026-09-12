// Render blocks/can't route outbound SMTP (port 465/587) reliably from
// its network. Prod logs show the DNS-order + family:4 fix DID stop the
// IPv6 misrouting (ENETUNREACH went away), but connecting to the
// correct IPv4 address for smtp.gmail.com now just times out instead -
// that's a network-level block, not fixable from the SMTP client side.
// Sending over Resend's HTTPS API (port 443) sidesteps the problem
// entirely.
//
// Setup needed on your end:
//   1. Sign up at https://resend.com (free tier covers this easily).
//   2. Create an API key, set RESEND_API_KEY in Render's env vars.
//   3. Set EMAIL_FROM in Render's env vars - either "onboarding@resend.dev"
//      (works immediately, but until you verify your own domain with
//      Resend it can only deliver to the email address you signed up
//      with) or an address on a domain you've verified with Resend.

const RESEND_API_URL = "https://api.resend.com/emails";

const transporter = {
  sendMail: async ({ to, subject, html }) => {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `QodeMeet <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Resend API error (${response.status}): ${errorBody}`);
    }

    return response.json();
  },
};

export default transporter;
