/**
 * Game Constants and Configuration
 */

export const ANSWER_COLORS = [
  { id: 0, name: "red", bgClass: "bg-red-500", symbol: "●" },
  { id: 1, name: "blue", bgClass: "bg-blue-500", symbol: "■" },
  { id: 2, name: "yellow", bgClass: "bg-yellow-500", symbol: "▲" },
  { id: 3, name: "green", bgClass: "bg-green-500", symbol: "★" },
] as const;

export const QUESTION_TIME_LIMIT = 15; // seconds
export const POINTS_PER_CORRECT = 500;
export const MAX_SPEED_BONUS = 500;

export type UserRole = "owner" | "player" | "solo";
export type GameStatus = "waiting" | "playing" | "finished";
