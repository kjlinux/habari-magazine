/**
 * Seed script: create or update the admin account.
 * Run with: npx tsx server/seed-admin.ts
 */
import { config } from "dotenv";
config({ path: new URL("../.env", import.meta.url).pathname });

import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "contact@sixiemesens.agency";
const ADMIN_PASSWORD = "Bxv645q8%s";
const ADMIN_NAME = "Admin Habari";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const db = drizzle(dbUrl);
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // Check if user exists
  const existing = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);

  if (existing.length > 0) {
    // Update existing user to admin + update password
    await db.update(users).set({
      role: "admin",
      passwordHash,
      name: ADMIN_NAME,
    }).where(eq(users.email, ADMIN_EMAIL));
    console.log(`✅ Updated existing user ${ADMIN_EMAIL} → role: admin, password reset`);
  } else {
    // Create new admin user
    const openId = crypto.randomUUID();
    await db.insert(users).values({
      openId,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      passwordHash,
      loginMethod: "email",
      role: "admin",
      subscriptionTier: "enterprise",
      lastSignedIn: new Date(),
    });
    console.log(`✅ Created admin account: ${ADMIN_EMAIL}`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
