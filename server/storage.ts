import fs from "fs";
import path from "path";
import { ENV } from "./_core/env";

// UPLOADS_PATH env var lets the server admin set an absolute path.
// Fallback: public/uploads relative to cwd (works in dev and most prod setups).
const UPLOADS_DIR = process.env.UPLOADS_PATH
  ? path.resolve(process.env.UPLOADS_PATH)
  : path.resolve(process.cwd(), "public", "uploads");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  const filePath = path.join(UPLOADS_DIR, key);
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, data as Buffer);
  const baseUrl = ENV.appUrl.replace(/\/+$/, "");
  const url = `${baseUrl}/uploads/${key}`;
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  const baseUrl = ENV.appUrl.replace(/\/+$/, "");
  return { key, url: `${baseUrl}/uploads/${key}` };
}
