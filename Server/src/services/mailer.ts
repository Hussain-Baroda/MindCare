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

  const host = process.env.SMTP_HOST;

  const port = process.env.SMTP_PORT
    ? Number(process.env.SMTP_PORT)
    : undefined;

  const secure =
    typeof process.env.SMTP_SECURE === "string"
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  console.log("[mailer] Checking environment variables...");

  if (!emailUser || !emailPass) {
    console.error("[mailer] Missing SMTP credentials");

    throw new Error(
      "Missing SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_PASS"
    );
  }

  console.log("[mailer] Email config loaded successfully");

  return {
    emailUser,
    emailPass,
    host,
    port,
    secure,
  };
}

/**
 * Create transporter
 */
function getTransporter() {
  const { emailUser, emailPass, host, port, secure } =
    getMailConfig();

  console.log("[mailer] Creating transporter...");

  if (host) {
    console.log("[mailer] Using custom SMTP host");

    return nodemailer.createTransport({
      host,
      port: port || 587,
      secure,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  console.log("[mailer] Using Gmail service");

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
export function buildCrisisAlertEmailText(
  params: CrisisEmailParams
) {
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
    "- MindCare",
  ].join("\n");
}

/**
 * HTML email
 */
export function buildCrisisAlertEmailHtml(
  params: CrisisEmailParams
) {
  const tz = params.timezone || "local time";

  const when = new Date(params.triggeredAt).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );

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

                <p>- MindCare</p>

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

export function buildCrisisAlertEmailSubject(
  userName: string
) {
  return `MindCare alert: please check in with ${userName}`;
}

/**
 * MAIN EMAIL SENDER
 */
export async function sendCrisisEmail(
  to: string,
  paramsOrSubject: CrisisEmailParams | string,
  maybeText?: string
) {
  try {
    console.log("[mailer] Starting sendCrisisEmail");

    if (!to) {
      throw new Error("Trusted contact email is missing");
    }

    console.log("[mailer] Recipient:", to);

    const transporter = getTransporter();

    const { emailUser } = getMailConfig();

    console.log("[mailer] Verifying SMTP connection...");

    await transporter.verify();

    console.log("[mailer] SMTP verified successfully");

    /**
     * SIMPLE EMAIL
     */
    if (typeof paramsOrSubject === "string") {
      console.log("[mailer] Sending plain text email");

      const info = await transporter.sendMail({
        from: `"MindCare" <${emailUser}>`,
        to,
        subject: paramsOrSubject,
        text: maybeText || "",
      });

      console.log(
        "[mailer] Email sent successfully:",
        info.messageId
      );

      return info;
    }

    /**
     * CRISIS EMAIL
     */
    const params = paramsOrSubject;

    console.log("[mailer] Sending crisis alert email");

    const info = await transporter.sendMail({
      from: `"MindCare" <${emailUser}>`,
      to,
      subject: buildCrisisAlertEmailSubject(
        params.userName
      ),
      text: buildCrisisAlertEmailText(params),
      html: buildCrisisAlertEmailHtml(params),
    });

    console.log(
      "[mailer] Crisis email sent successfully:",
      info.messageId
    );

    return info;

  } catch (error) {
    console.error(
      "[mailer] FAILED TO SEND EMAIL:",
      error
    );

    throw error;
  }
}