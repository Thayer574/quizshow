import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user for testing
const mockUser = {
  id: 1,
  openId: "test-user",
  email: "test@example.com",
  name: "Test User",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const mockUser2 = {
  id: 2,
  openId: "test-user-2",
  email: "test2@example.com",
  name: "Test User 2",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createMockContext(user: typeof mockUser): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Room Management", () => {
  let createdRoomCode: string;

  it("should create a room with a unique code", async () => {
    const ctx = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const room = await caller.room.create();

    expect(room).toBeDefined();
    expect(room.code).toBeDefined();
    expect(room.code).toHaveLength(6);
    expect(room.ownerId).toBe(mockUser.id);
    expect(room.status).toBe("waiting");

    createdRoomCode = room.code;
  });

  it("should retrieve a room by code", async () => {
    const ctx = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    const room = await caller.room.getByCode({ code: createdRoomCode });

    expect(room).toBeDefined();
    expect(room.code).toBe(createdRoomCode);
    expect(room.ownerId).toBe(mockUser.id);
  });

  it("should allow a player to join a room", async () => {
    const ctx = createMockContext(mockUser2);
    const caller = appRouter.createCaller(ctx);

    const room = await caller.room.join({ code: createdRoomCode });

    expect(room).toBeDefined();
    expect(room.code).toBe(createdRoomCode);
  });

  it("should return room members", async () => {
    const ctx = createMockContext(mockUser);
    const caller = appRouter.createCaller(ctx);

    // Get the room to get its ID
    const room = await caller.room.getByCode({ code: createdRoomCode });
    const members = await caller.room.getMembers({ roomId: room.id });

    expect(members).toBeDefined();
    expect(Array.isArray(members)).toBe(true);
    expect(members.length).toBeGreaterThan(0);
    expect(members.some((m) => m.userId === mockUser2.id)).toBe(true);
  });

  it("should throw error when joining non-existent room", async () => {
    const ctx = createMockContext(mockUser2);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.room.join({ code: "INVALID" });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("NOT_FOUND");
    }
  });
});
