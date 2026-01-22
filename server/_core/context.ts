import { eq } from "drizzle-orm";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { users } from "../../drizzle/schema";
import { getDb } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // Ensure the mock user exists in the database so foreign key constraints pass
  const user: User = {
    id: 1,
    openId: "mock-user",
    name: "Mock User",
    email: "mock@example.com",
    loginMethod: "mock",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date()
  };

  try {
    const dbInstance = await getDb();
    if (dbInstance) {
      const existingUser = await dbInstance.select().from(users).where(eq(users.id, 1)).limit(1);
      if (existingUser.length === 0) {
        await dbInstance.insert(users).values(user);
      }
    }
  } catch (error) {
    console.error("Error ensuring mock user exists:", error);
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
