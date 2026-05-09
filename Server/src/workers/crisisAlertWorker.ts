import { PendingCrisisAlert } from "../models/PendingCrisisAlert.js";
import { TrustedContact } from "../models/TrustedContact.js";
import { sendCrisisEmail } from "../services/mailer.js";

export function startCrisisAlertWorker() {
  // run every 60 seconds
  setInterval(async () => {
    try {
      const now = new Date();

      // find pending alerts that are due
      const dueAlerts = await PendingCrisisAlert.find({
        status: "pending",
        sendAt: { $lte: now },
      }).limit(25);

      // process alerts one by one
      for (const alert of dueAlerts) {
        try {
          // prevent duplicate processing
          alert.status = "processing";
          await alert.save();

          // get trusted contacts
          const contacts = await TrustedContact.find({
            userId: alert.userId,
          }).limit(3);

          // if no contacts found
          if (!contacts.length) {
            console.log(
              `[crisisAlertWorker] No contacts found for user ${alert.userId}`
            );

            alert.status = "failed";
            await alert.save();
            continue;
          }

          // send emails
          await Promise.all(
            contacts.map((contact) =>
              sendCrisisEmail(contact.email, {
                userName: alert.userName,
                triggeredAt: alert.triggeredAt,
                timezone: alert.timezone,
                delaySeconds: alert.delaySeconds,
              })
            )
          );

          // mark as sent
          alert.status = "sent";
          await alert.save();

          console.log(
            `[crisisAlertWorker] Sent alert ${alert._id} to ${contacts.length} contact(s)`
          );
        } catch (err) {
          console.error(
            `[crisisAlertWorker] Failed alert ${alert._id}`,
            err
          );

          // mark failed
          alert.status = "failed";
          await alert.save();
        }
      }
    } catch (e) {
      console.error("[crisisAlertWorker]", e);
    }
  }, 60000); // 60 seconds
}