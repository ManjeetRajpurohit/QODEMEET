import transporter from "../config/mail.js";

const sendReportMail = async (
  candidateEmail,
  candidateName,
  interviewTitle,
  overallScore,
  reportId
) => {
  const reportLink = `${process.env.FRONTEND_URL}/dashboard/reports/${reportId}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: candidateEmail,
    subject: `Your Interview Report is Ready - ${interviewTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
        <h2>Hello ${candidateName},</h2>

        <p>
          Your report for <b>${interviewTitle}</b> is ready.
        </p>

        <div style="
          border:1px solid #ddd;
          border-radius:10px;
          padding:20px;
          margin:20px 0;
        ">
          <p><b>Overall Score:</b> ${overallScore}</p>
        </div>

        <a
          href="${reportLink}"
          style="
            display:inline-block;
            background:#4f46e5;
            color:white;
            padding:12px 20px;
            text-decoration:none;
            border-radius:6px;
          "
        >
          View Full Report
        </a>

        <p style="margin-top:30px;">
          Regards,<br/>
          QodeMeet Team
        </p>
      </div>
    `,
  });
};

export default sendReportMail;
