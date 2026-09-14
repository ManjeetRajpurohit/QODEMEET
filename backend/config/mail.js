const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const transporter = {
  sendMail: async ({ to, subject, html }) => {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: process.env.EMAIL_FROM, name: "QodeMeet" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Brevo API error (${response.status}): ${errorBody}`);
    }

    return response.json();
  },
};

export default transporter;
