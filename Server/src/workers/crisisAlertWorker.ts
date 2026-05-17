import { PendingCrisisAlert } from "../models/PendingCrisisAlert.js";
import { TrustedContact } from "../models/TrustedContact.js";
import { sendCrisisEmail } from "../services/mailer.js";

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 60 * 1000;

let isProcessing = false;

export async function processDueCrisisAlerts() {

  // console.log("[crisisAlertWorker] Worker running...");

  if (isProcessing) {
    console.log("[crisisAlertWorker] Already processing");
    return;
  }

  isProcessing = true;

  try {

    const now = new Date();

    // console.log(
    //   "[crisisAlertWorker] Current time:",
    //   now.toISOString()
    // );

    const dueAlerts = await PendingCrisisAlert.find({
      status: "pending",
      sendAt: { $lte: now },
    })
      .sort({ createdAt: 1 })
      .limit(25);

    // console.log(
    //   `[crisisAlertWorker] Found ${dueAlerts.length} due alerts`
    // );

    for (const alert of dueAlerts) {

      console.log(
        `[crisisAlertWorker] Processing alert ${alert._id}`
      );

      try {

        alert.status = "processing";
        alert.attempts = (alert.attempts || 0) + 1;
        alert.lastError = "";

        await alert.save();

        const contacts = await TrustedContact.find({
          userId: alert.userId,
        }).limit(3);

        console.log(
          "[crisisAlertWorker] Contacts found:",
          contacts
        );

        if (!contacts.length) {

          alert.status = "failed";
          alert.lastError = "No trusted contacts found";

          await alert.save();

          console.error(
            `[crisisAlertWorker] No contacts found for user ${alert.userId}`
          );

          continue;
        }

        console.log(
          `[crisisAlertWorker] Sending alert ${alert._id} to ${contacts.length} contact(s)`
        );

        for (const contact of contacts) {

          try {

            console.log(
              `[crisisAlertWorker] Sending email to ${contact.email}`
            );

            const result = await sendCrisisEmail(
              contact.email,
              {
                userName: alert.userName,
                triggeredAt: alert.triggeredAt,
                timezone: alert.timezone,
                delaySeconds: alert.delaySeconds,
              }
            );

            console.log(
              "[crisisAlertWorker] Email result:",
              result
            );

            console.log(
              `[crisisAlertWorker] Email sent successfully to ${contact.email}`
            );

          } catch (err) {

            console.error(
              `[crisisAlertWorker] Failed sending to ${contact.email}`,
              err
            );

            throw err;
          }
        }

        alert.status = "sent";
        alert.sentAt = new Date();
        alert.lastError = "";

        await alert.save();

        console.log(
          `[crisisAlertWorker] Alert ${alert._id} completed successfully`
        );

      } catch (err) {

        const message =
          err instanceof Error
            ? err.message
            : String(err);

        console.error(
          `[crisisAlertWorker] Failed alert ${alert._id}`,
          err
        );

        if ((alert.attempts || 0) < MAX_ATTEMPTS) {

          alert.status = "pending";

          alert.sendAt = new Date(
            Date.now() + RETRY_DELAY_MS
          );

        } else {

          alert.status = "failed";
        }

        alert.lastError = message.slice(0, 500);

        await alert.save();
      }
    }

  } catch (e) {

    console.error(
      "[crisisAlertWorker] Fatal worker error:",
      e
    );

  } finally {

    isProcessing = false;
  }
}

export function startCrisisAlertWorker() {

  console.log(
    "[crisisAlertWorker] Starting worker..."
  );

  processDueCrisisAlerts().catch((err) =>
    console.error(
      "[crisisAlertWorker] Startup processing failed",
      err
    )
  );

  setInterval(() => {

    processDueCrisisAlerts().catch((err) =>
      console.error(
        "[crisisAlertWorker] Interval processing failed",
        err
      )
    );

  }, 60000);
}