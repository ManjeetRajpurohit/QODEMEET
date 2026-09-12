const SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send";

const transporter = {
  sendMail: async ({ to, subject, html }) => {
    const response = await fetch(SENDGRID_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: process.env.EMAIL_FROM, name: "QodeMeet" },
        subject,
        content: [{ type: "text/html", value: html }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`SendGrid API error (${response.status}): ${errorBody}`);
    }

    return response.status === 202 ? { success: true } : response.json();
  },
};

export default transporter;
