import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';

// Users table authenticated via Firebase Auth (UID is the unique identifier)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User tuning profiles saved in PostgreSQL Cloud SQL
export const tuningProfiles = pgTable('tuning_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  title: text('title').notNull(),
  socId: text('soc_id').notNull(),
  zramGb: integer('zram_gb').notNull().default(8),
  cpuGovernor: text('cpu_governor').notNull().default('performance'),
  gpuGovernor: text('gpu_governor').notNull().default('performance'),
  driver: text('driver').notNull().default('mesa_turnip'),
  tcpCongestion: text('tcp_congestion').notNull().default('bbr'),
  isFavorite: boolean('is_favorite').default(false).notNull(),
  notes: text('notes'),
  stateSnapshot: jsonb('state_snapshot'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Live voice & telemetry conversation log sessions with Titan voice assistant
export const voiceSessions = pgTable('voice_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  title: text('title').notNull(),
  transcriptSummary: text('transcript_summary'),
  messagesCount: integer('messages_count').default(0).notNull(),
  audioTurns: jsonb('audio_turns'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  tuningProfiles: many(tuningProfiles),
  voiceSessions: many(voiceSessions),
}));

export const tuningProfilesRelations = relations(tuningProfiles, ({ one }) => ({
  user: one(users, {
    fields: [tuningProfiles.userId],
    references: [users.id],
  }),
}));

export const voiceSessionsRelations = relations(voiceSessions, ({ one }) => ({
  user: one(users, {
    fields: [voiceSessions.userId],
    references: [users.id],
  }),
}));
