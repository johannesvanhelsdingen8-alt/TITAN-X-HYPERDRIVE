import { db } from './index.ts';
import { users, tuningProfiles, voiceSessions } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string, photoUrl?: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
        photoUrl: photoUrl || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || null,
          photoUrl: photoUrl || null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Database getOrCreateUser query failed:", error);
    throw new Error("Failed to synchronize user profile.", { cause: error });
  }
}

export async function getUserTuningProfiles(userInternalId: number) {
  try {
    return await db.select()
      .from(tuningProfiles)
      .where(eq(tuningProfiles.userId, userInternalId))
      .orderBy(desc(tuningProfiles.createdAt));
  } catch (error) {
    console.error("Database getUserTuningProfiles query failed:", error);
    throw new Error("Failed to load user tuning profiles.", { cause: error });
  }
}

export async function createTuningProfile(profileData: {
  userId: number;
  title: string;
  socId: string;
  zramGb: number;
  cpuGovernor: string;
  gpuGovernor: string;
  driver: string;
  tcpCongestion: string;
  isFavorite?: boolean;
  notes?: string;
  stateSnapshot?: unknown;
}) {
  try {
    const result = await db.insert(tuningProfiles)
      .values({
        userId: profileData.userId,
        title: profileData.title,
        socId: profileData.socId,
        zramGb: profileData.zramGb,
        cpuGovernor: profileData.cpuGovernor,
        gpuGovernor: profileData.gpuGovernor,
        driver: profileData.driver,
        tcpCongestion: profileData.tcpCongestion,
        isFavorite: profileData.isFavorite ?? false,
        notes: profileData.notes ?? null,
        stateSnapshot: profileData.stateSnapshot ?? null,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database createTuningProfile query failed:", error);
    throw new Error("Failed to save tuning profile.", { cause: error });
  }
}

export async function deleteTuningProfile(profileId: number, userInternalId: number) {
  try {
    const result = await db.delete(tuningProfiles)
      .where(eq(tuningProfiles.id, profileId))
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database deleteTuningProfile query failed:", error);
    throw new Error("Failed to delete tuning profile.", { cause: error });
  }
}

export async function getVoiceSessions(userInternalId: number) {
  try {
    return await db.select()
      .from(voiceSessions)
      .where(eq(voiceSessions.userId, userInternalId))
      .orderBy(desc(voiceSessions.createdAt));
  } catch (error) {
    console.error("Database getVoiceSessions query failed:", error);
    throw new Error("Failed to load voice sessions.", { cause: error });
  }
}

export async function recordVoiceSession(sessionData: {
  userId: number;
  title: string;
  transcriptSummary?: string;
  messagesCount: number;
  audioTurns?: unknown;
}) {
  try {
    const result = await db.insert(voiceSessions)
      .values({
        userId: sessionData.userId,
        title: sessionData.title,
        transcriptSummary: sessionData.transcriptSummary ?? null,
        messagesCount: sessionData.messagesCount,
        audioTurns: sessionData.audioTurns ?? null,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database recordVoiceSession query failed:", error);
    throw new Error("Failed to log voice session.", { cause: error });
  }
}
