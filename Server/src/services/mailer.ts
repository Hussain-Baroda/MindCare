import nodemailer from "nodemailer";

export type CrisisEmailParams = {
  userName: string;
  triggeredAt: Date | string | number;
  timezone?: string;
  delaySeconds: number;
};

/**
 * Read email config safely
 */
function getMailConfig() {
  const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.error("[mailer] Missing EMAIL_USER/EMAIL_PASS in .env");
  }

  return {
    emailUser,
    emailPass,
  };
}

/**
 * Create transporter ONLY when needed
 */
function getTransporter() {
  const { emailUser, emailPass } = getMailConfig();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
}

/**
 * Plain text email
 */
export function buildCrisisAlertEmailText(params: CrisisEmailParams) {
  const tz = params.timezone || "local time";
  const when = new Date(params.triggeredAt).toLocaleString();

  return [
    "MindCare Crisis Alert",
    "",
    "Hi,",
    "",
    "This is an automated message from MindCare.",
    "",
    `${params.userName} listed you as a trusted contact.`,
    `MindCare detected a possible crisis risk at ${when} (${tz}).`,
    "",
    `This alert was sent after a ${params.delaySeconds}-second safety delay to allow cancellation.`,
    "",
    "What you can do now:",
    `1) Call or message ${params.userName} and check in.`,
    "2) If you believe they may be in immediate danger, contact local emergency services.",
    "",
    "Important:",
    "- MindCare is not an emergency service.",
    "- This alert can be a false alarm.",
    "",
    "— MindCare",
  ].join("\n");
}

/**
 * HTML email
 */
export function buildCrisisAlertEmailHtml(params: CrisisEmailParams) {
  const tz = params.timezone || "local time";

  const when = new Date(params.triggeredAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const safeName = params.userName
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background:#f4f6f9; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table width="600" style="background:#fff; border-radius:10px; margin-top:20px;">
            <tr>
              <td style="background:#ff4d4d; color:white; text-align:center; padding:20px;">
                <h2 style="margin:0;">MindCare Crisis Alert</h2>
              </td>
            </tr>

            <tr>
              <td style="padding:20px; color:#333;">
                <p>Hi,</p>

                <p>
                  <strong>${safeName}</strong> listed you as a trusted contact.
                </p>

                <p>
                  Possible crisis detected at:
                  <strong>${when}</strong> (${tz})
                </p>

                <p>
                  This alert was sent after
                  <strong>${params.delaySeconds}s</strong>
                  to allow cancellation.
                </p>

                <p><strong>What you can do:</strong></p>

                <ul>
                  <li>Call or message ${safeName}</li>
                  <li>Contact emergency services if needed</li>
                </ul>

                <p style="font-size:13px; color:#777;">
                  MindCare is not an emergency service.
                </p>

                <p>— MindCare</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

export function buildCrisisAlertEmailSubject(userName: string) {
  return `MindCare alert: please check in with ${userName}`;
}

/**
 * Main email sender
 */
export async function sendCrisisEmail(
  to: string,
  paramsOrSubject: CrisisEmailParams | string,
  maybeText?: string
) {
  try {
    const transporter = getTransporter();
    const { emailUser } = getMailConfig();

    // verify smtp
    await transporter.verify();

    console.log("[mailer] SMTP READY");
    console.log("[mailer] Sending email to:", to);

    // old style
    if (typeof paramsOrSubject === "string") {
      const info = await transporter.sendMail({
        from: `"MindCare" <${emailUser}>`,
        to,
        subject: paramsOrSubject,
        text: maybeText || "",
      });

      console.log("[mailer] Email sent:", info.messageId);
      return;
    }

    // new style
    const params = paramsOrSubject;

    const info = await transporter.sendMail({
      from: `"MindCare" <${emailUser}>`,
      to,
      subject: buildCrisisAlertEmailSubject(params.userName),
      text: buildCrisisAlertEmailText(params),
      html: buildCrisisAlertEmailHtml(params),
    });

    console.log("[mailer] Email sent:", info.messageId);
  } catch (err) {
    console.error("[mailer] Failed to send email:", err);
  }
}