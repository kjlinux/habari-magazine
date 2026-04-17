import webpush from "web-push";
import { ENV } from "./env";

let initialized = false;

function init() {
  if (initialized || !ENV.vapidPublicKey || !ENV.vapidPrivateKey) return;
  webpush.setVapidDetails(
    `mailto:${ENV.vapidEmail}`,
    ENV.vapidPublicKey,
    ENV.vapidPrivateKey
  );
  initialized = true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  icon?: string;
};

export type PushSubscriptionData = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload
): Promise<boolean> {
  if (!ENV.vapidPublicKey || !ENV.vapidPrivateKey) return false;
  init();
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    );
    return true;
  } catch (err: any) {
    if (err?.statusCode === 410 || err?.statusCode === 404) {
      return false; // subscription expired — caller should delete it
    }
    console.error("[WebPush] Error sending push:", err);
    return false;
  }
}

export async function sendBulkPush(
  subscriptions: (PushSubscriptionData & { id: number })[],
  payload: PushPayload
): Promise<number[]> {
  const expired: number[] = [];
  await Promise.all(
    subscriptions.map(async (sub) => {
      const ok = await sendPushNotification(sub, payload);
      if (!ok) expired.push(sub.id);
    })
  );
  return expired;
}

export function getVapidPublicKey(): string {
  return ENV.vapidPublicKey;
}
