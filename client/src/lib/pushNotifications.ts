const SW_PATH = "/sw.js";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register(SW_PATH);
  } catch {
    return null;
  }
}

export async function getPushPermissionState(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  return Notification.permission;
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  return Notification.requestPermission();
}

export async function subscribeToPush(
  vapidPublicKey: string,
  onSubscribe: (sub: { endpoint: string; p256dh: string; auth: string }) => Promise<void>
): Promise<boolean> {
  try {
    const reg = await registerServiceWorker();
    if (!reg) return false;

    const permission = await requestPushPermission();
    if (permission !== "granted") return false;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
    });

    const key = sub.getKey("p256dh");
    const auth = sub.getKey("auth");
    if (!key || !auth) return false;

    const toBase64 = (buf: ArrayBuffer) => {
      const bytes = new Uint8Array(buf);
      let str = "";
      for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
      return btoa(str);
    };
    await onSubscribe({
      endpoint: sub.endpoint,
      p256dh: toBase64(key),
      auth: toBase64(auth),
    });
    return true;
  } catch {
    return false;
  }
}

export async function unsubscribeFromPush(
  onUnsubscribe: (endpoint: string) => Promise<void>
): Promise<boolean> {
  try {
    if (!("serviceWorker" in navigator)) return false;
    const reg = await navigator.serviceWorker.getRegistration(SW_PATH);
    if (!reg) return false;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return true;
    await onUnsubscribe(sub.endpoint);
    await sub.unsubscribe();
    return true;
  } catch {
    return false;
  }
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  try {
    if (!("serviceWorker" in navigator)) return null;
    const reg = await navigator.serviceWorker.getRegistration(SW_PATH);
    if (!reg) return null;
    return reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}
