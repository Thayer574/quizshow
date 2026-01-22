import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const statusEnum = pgEnum("status", ["waiting", "playing", "finished"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  ownerId: integer("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: statusEnum("status").default("waiting").notNull(),
  currentQuestionIndex: integer("currentQuestionIndex").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;

export const roomMembers = pgTable("roomMembers", {
  id: serial("id").primaryKey(),
  roomId: integer("roomId").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type RoomMember = typeof roomMembers.$inferSelect;
export type InsertRoomMember = typeof roomMembers.$inferInsert;

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  createdBy: integer("createdBy").notNull().references(() => users.id, { onDelete: "cascade" }),
  roomId: integer("roomId").references(() => rooms.id, { onDelete: "cascade" }),
  questionText: text("questionText").notNull(),
  correctAnswer: varchar("correctAnswer", { length: 255 }).notNull(),
  wrongAnswer1: varchar("wrongAnswer1", { length: 255 }).notNull(),
  wrongAnswer2: varchar("wrongAnswer2", { length: 255 }).notNull(),
  wrongAnswer3: varchar("wrongAnswer3", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

export const gameSessions = pgTable("gameSessions", {
  id: serial("id").primaryKey(),
  roomId: integer("roomId").references(() => rooms.id, { onDelete: "cascade" }),
  userId: integer("userId").references(() => users.id, { onDelete: "cascade" }),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
  finalScore: integer("finalScore").default(0).notNull(),
});

export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = typeof gameSessions.$inferInsert;

export const playerAnswers = pgTable("playerAnswers", {
  id: serial("id").primaryKey(),
  gameSessionId: integer("gameSessionId").notNull().references(() => gameSessions.id, { onDelete: "cascade" }),
  questionId: integer("questionId").notNull().references(() => questions.id, { onDelete: "cascade" }),
  selectedAnswer: varchar("selectedAnswer", { length: 255 }).notNull(),
  isCorrect: integer("isCorrect").default(0).notNull(),
  pointsEarned: integer("pointsEarned").default(0).notNull(),
  timeToAnswer: integer("timeToAnswer").default(0).notNull(),
  answeredAt: timestamp("answeredAt").defaultNow().notNull(),
});

export type PlayerAnswer = typeof playerAnswers.$inferSelect;
export type InsertPlayerAnswer = typeof playerAnswers.$inferInsert;
