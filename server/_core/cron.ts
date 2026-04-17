import cron from "node-cron";
import { sendEventReminders } from "./notificationService";

export function startCronJobs() {
  // Every day at 8:00 AM — send event reminders for events in 3 days
  cron.schedule("0 8 * * *", async () => {
    try {
      await sendEventReminders();
    } catch (err) {
      console.error("[Cron] Event reminders failed:", err);
    }
  });
}
