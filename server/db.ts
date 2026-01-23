import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from "@neondatabase/serverless";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

// This is required for neon-http to work in Node environments
neonConfig.fetchConnectionCache = true;

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      _db = drizzle(sql);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const existingUser = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    
    if (existingUser.length > 0) {
      const updateSet: Record<string, unknown> = {};
      
      if (user.name !== undefined) updateSet.name = user.name ?? null;
      if (user.email !== undefined) updateSet.email = user.email ?? null;
      if (user.loginMethod !== undefined) updateSet.loginMethod = user.loginMethod ?? null;
      if (user.lastSignedIn !== undefined) updateSet.lastSignedIn = user.lastSignedIn;
      if (user.role !== undefined) {
        updateSet.role = user.role;
      } else if (user.openId === ENV.ownerOpenId) {
        updateSet.role = 'admin';
      }
      
      if (Object.keys(updateSet).length === 0) {
        updateSet.lastSignedIn = new Date();
      }
      updateSet.updatedAt = new Date();
      
      await db.update(users).set(updateSet).where(eq(users.openId, user.openId));
    } else {
      const values: InsertUser = {
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        lastSignedIn: user.lastSignedIn ?? new Date(),
        role: user.role ?? (user.openId === ENV.ownerOpenId ? 'admin' : 'user'),
      };
      
      await db.insert(users).values(values);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

import { rooms, roomMembers, questions, gameSessions, playerAnswers } from "../drizzle/schema";

export async function createRoom(ownerId: number, code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(rooms).values({
    code,
    ownerId,
    status: "waiting",
  }).returning();
  
  return result[0];
}

export async function getRoomByCode(code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(rooms).where(eq(rooms.code, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getRoomById(roomId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function addPlayerToRoom(roomId: number, userId: number, playerName?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (playerName) {
    await db.update(users).set({ name: playerName }).where(eq(users.id, userId));
  }

  return await db.insert(roomMembers).values({
    roomId,
    userId,
  }).returning();
}

export async function getRoomMembers(roomId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select({
      id: roomMembers.id,
      userId: roomMembers.userId,
      name: users.name,
      joinedAt: roomMembers.joinedAt,
    })
    .from(roomMembers)
    .innerJoin(users, eq(roomMembers.userId, users.id))
    .where(eq(roomMembers.roomId, roomId));
}

export async function addQuestion(
  createdBy: number,
  questionText: string,
  correctAnswer: string,
  wrongAnswer1: string,
  wrongAnswer2: string,
  wrongAnswer3: string,
  roomId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(questions).values({
    createdBy,
    roomId,
    questionText,
    correctAnswer,
    wrongAnswer1,
    wrongAnswer2,
    wrongAnswer3,
  }).returning();
}

export async function getRoomQuestions(roomId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(questions).where(eq(questions.roomId, roomId));
}

export async function getUserQuestions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(questions).where(eq(questions.createdBy, userId));
}

export async function createGameSession(roomId?: number, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(gameSessions).values({
    roomId,
    userId,
  }).returning();
}

export async function recordPlayerAnswer(
  gameSessionId: number,
  questionId: number,
  selectedAnswer: string,
  isCorrect: boolean,
  pointsEarned: number,
  timeToAnswer: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(playerAnswers).values({
    gameSessionId,
    questionId,
    selectedAnswer,
    isCorrect: isCorrect ? 1 : 0,
    pointsEarned,
    timeToAnswer,
  }).returning();
}

export async function getGameLeaderboard(roomId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select({
      userId: gameSessions.userId,
      userName: users.name,
      finalScore: gameSessions.finalScore,
    })
    .from(gameSessions)
    .innerJoin(users, eq(gameSessions.userId, users.id))
    .where(eq(gameSessions.roomId, roomId));
}
