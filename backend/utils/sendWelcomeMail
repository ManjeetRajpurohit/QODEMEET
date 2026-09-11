import transporter from "../config/mail.js";

const sendWelcomeMail = async ({ name, email }) => {
  await transporter.sendMail({
    from: `"QodeMeet" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to QodeMeet",
    html: `
      <div style="font-family:Arial,sans-serif;color:#111;max-width:600px;margin:auto;">
        <h1 style="color:#4f46e5;">QodeMeet</h1>

        <h2>Welcome aboard, ${name} 👋</h2>

        <p>
          Your QodeMeet account has been created. You can now sign in
          and start setting up your profile.
        </p>

        <p style="color:#555;">
          Head to your profile page to verify your email - it only
          takes a minute, and you'll need it before you can schedule
          interviews or buy a subscription.
        </p>

        <p style="margin-top:30px;">
          Regards,<br/>
          QodeMeet Team
        </p>
      </div>
    `,
  });
};

export default sendWelcomeMail;
