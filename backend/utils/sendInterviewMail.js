import transporter from "../config/mail.js";

const sendInterviewStartedMail = async (
  candidateEmail,
  candidateName,
  interviewTitle,
  interviewId
) => {
  const joinLink =
  `${process.env.FRONTEND_URL}/interview/${interviewId}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: candidateEmail,
    subject: `Interview Started - ${interviewTitle}`,
    html: `
      <div style="font-family: Arial;">
        <h2>Hello ${candidateName}</h2>

        <p>
          Your interview <b>${interviewTitle}</b> has started.
        </p>

        <p>Please join immediately.</p>

        <a
          href="${joinLink}"
          style="
            background:#4f46e5;
            color:white;
            padding:12px 20px;
            text-decoration:none;
            border-radius:6px;
          "
        >
          Join Interview
        </a>

        <p style="margin-top:20px">
          Regards,<br/>
          QodeMeet Team
        </p>
      </div>
    `,
  });
};

const sendInterviewScheduledMail = async (
  candidateEmail,
  candidateName,
  title,
  interviewerName,
  date,
  time,
  duration,
  language
) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: candidateEmail,
    subject: `Interview Scheduled - ${title}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
        <h2>Hello ${candidateName},</h2>

        <p>Your interview has been successfully scheduled.</p>

        <div style="
          border:1px solid #ddd;
          border-radius:10px;
          padding:20px;
          margin:20px 0;
        ">
          <h3>${title}</h3>

          <p><b>Interviewer:</b> ${interviewerName}</p>
          <p><b>Date:</b> ${new Date(date).toLocaleDateString()}</p>
          <p><b>Time:</b> ${time}</p>
          <p><b>Duration:</b> ${duration} Minutes</p>
          <p><b>Language:</b> ${language}</p>
        </div>

        <p>
          You will receive another email when the interviewer starts the interview.
        </p>

        <p>
          Regards,<br/>
          QodeMeet Team
        </p>
      </div>
    `,
  });
};

export {sendInterviewStartedMail,sendInterviewScheduledMail};