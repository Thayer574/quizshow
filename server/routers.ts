import { eq } from "drizzle-orm";
import { users, rooms } from "../drizzle/schema";
import { getDb } from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createRoom,
  getRoomByCode,
  getRoomById,
  addPlayerToRoom,
  getRoomMembers,
  addQuestion,
  getRoomQuestions,
  getUserQuestions,
  createGameSession,
  recordPlayerAnswer,
} from "./db";
import { TRPCError } from "@trpc/server";

// Helper to generate random room code
function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    updateName: protectedProcedure
      .input(z.object({ name: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        // Use the mock user from context
        const targetUser = ctx.user;
        if (!targetUser) throw new TRPCError({ code: "UNAUTHORIZED" });

        await dbInstance
          .update(users)
          .set({ name: input.name, updatedAt: new Date() })
          .where(eq(users.id, targetUser.id));
        return { success: true };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Room Management
  room: router({
    create: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const code = generateRoomCode();
      await createRoom(ctx.user.id, code);
      const room = await getRoomByCode(code);
      if (!room) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return room;
    }),

    getByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const room = await getRoomByCode(input.code);
        if (!room) throw new TRPCError({ code: "NOT_FOUND" });
        return room;
      }),

    join: protectedProcedure
      .input(z.object({ code: z.string(), playerName: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const room = await getRoomByCode(input.code);
        if (!room) throw new TRPCError({ code: "NOT_FOUND" });

        await addPlayerToRoom(room.id, ctx.user.id, input.playerName);
        return room;
      }),

    getMembers: protectedProcedure
      .input(z.object({ roomId: z.number() }))
      .query(async ({ input }) => {
        return await getRoomMembers(input.roomId);
      }),

    getDetails: publicProcedure
      .input(z.object({ roomId: z.number() }))
      .query(async ({ input }) => {
        const room = await getRoomById(input.roomId);
        if (!room) throw new TRPCError({ code: "NOT_FOUND" });
        return room;
      }),

    advanceQuestion: protectedProcedure
      .input(z.object({ roomId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const room = await getRoomById(input.roomId);
        if (!room) throw new TRPCError({ code: "NOT_FOUND" });
        if (room.ownerId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

        const dbInstance = await getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await dbInstance
          .update(rooms)
          .set({ 
            currentQuestionIndex: room.currentQuestionIndex + 1,
            updatedAt: new Date() 
          })
          .where(eq(rooms.id, input.roomId));

        return { success: true };
      }),
  }),

  // Question Management
  question: router({
    add: protectedProcedure
      .input(
        z.object({
          questionText: z.string().min(1),
          correctAnswer: z.string().min(1),
          wrongAnswer1: z.string().min(1),
          wrongAnswer2: z.string().min(1),
          wrongAnswer3: z.string().min(1),
          roomId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        await addQuestion(
          ctx.user.id,
          input.questionText,
          input.correctAnswer,
          input.wrongAnswer1,
          input.wrongAnswer2,
          input.wrongAnswer3,
          input.roomId
        );
        return { success: true };
      }),

    getRoomQuestions: protectedProcedure
      .input(z.object({ roomId: z.number() }))
      .query(async ({ input }) => {
        return await getRoomQuestions(input.roomId);
      }),

    getUserQuestions: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return await getUserQuestions(ctx.user.id);
    }),
  }),

  // Game Management
  game: router({
    startSession: protectedProcedure
      .input(z.object({ roomId: z.number().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const dbInstance = await getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // If it's a room game, reset question index and update status
        if (input.roomId) {
          await dbInstance
            .update(rooms)
            .set({ 
              currentQuestionIndex: 0,
              status: "playing",
              updatedAt: new Date() 
            })
            .where(eq(rooms.id, input.roomId));
        }

        const result = await createGameSession(input.roomId, ctx.user.id);
        return { success: true };
      }),

    recordAnswer: protectedProcedure
      .input(
        z.object({
          gameSessionId: z.number(),
          questionId: z.number(),
          selectedAnswer: z.string(),
          isCorrect: z.boolean(),
          pointsEarned: z.number(),
          timeToAnswer: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        await recordPlayerAnswer(
          input.gameSessionId,
          input.questionId,
          input.selectedAnswer,
          input.isCorrect,
          input.pointsEarned,
          input.timeToAnswer
        );
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
