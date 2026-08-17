import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { settings } from "@/db/schema";

const SETTINGS_ROW_ID = "default";

export const getOnboardingCompleted = async (): Promise<boolean> => {
  const db = getDb();
  if (!db) throw new Error("Database not initialized");

  const rows = await db
    .select({ onboardingCompleted: settings.onboardingCompleted })
    .from(settings)
    .where(eq(settings.id, SETTINGS_ROW_ID))
    .limit(1);

  return rows[0]?.onboardingCompleted ?? false;
};

export const setOnboardingCompleted = async (value: boolean): Promise<void> => {
  const db = getDb();
  if (!db) throw new Error("Database not initialized");

  await db
    .update(settings)
    .set({ onboardingCompleted: value, updatedAt: new Date() })
    .where(eq(settings.id, SETTINGS_ROW_ID));
};
