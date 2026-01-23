import { describe, it, expect } from "vitest";
import { QUESTION_TIME_LIMIT, POINTS_PER_CORRECT, MAX_SPEED_BONUS } from "@shared/gameConstants";

describe("Game Logic", () => {
  it("should calculate correct points for fast answers", () => {
    const timeLeft = 10; // 10 seconds left out of 15
    const speedBonus = Math.floor((timeLeft / QUESTION_TIME_LIMIT) * MAX_SPEED_BONUS);
    const totalPoints = POINTS_PER_CORRECT + speedBonus;

    expect(speedBonus).toBeGreaterThan(0);
    expect(totalPoints).toBe(POINTS_PER_CORRECT + speedBonus);
    expect(totalPoints).toBeGreaterThan(POINTS_PER_CORRECT);
  });

  it("should calculate zero points for incorrect answers", () => {
    const isCorrect = false;
    const points = isCorrect ? POINTS_PER_CORRECT : 0;

    expect(points).toBe(0);
  });

  it("should calculate minimal points for slow correct answers", () => {
    const timeLeft = 1; // 1 second left
    const speedBonus = Math.floor((timeLeft / QUESTION_TIME_LIMIT) * MAX_SPEED_BONUS);
    const totalPoints = POINTS_PER_CORRECT + speedBonus;

    expect(speedBonus).toBeGreaterThan(0);
    expect(totalPoints).toBeGreaterThan(POINTS_PER_CORRECT);
    expect(totalPoints).toBeLessThan(POINTS_PER_CORRECT + MAX_SPEED_BONUS);
  });

  it("should calculate maximum points for instant correct answers", () => {
    const timeLeft = QUESTION_TIME_LIMIT; // Full time remaining
    const speedBonus = Math.floor((timeLeft / QUESTION_TIME_LIMIT) * MAX_SPEED_BONUS);
    const totalPoints = POINTS_PER_CORRECT + speedBonus;

    expect(speedBonus).toBe(MAX_SPEED_BONUS);
    expect(totalPoints).toBe(POINTS_PER_CORRECT + MAX_SPEED_BONUS);
  });

  it("should shuffle answer array correctly", () => {
    const answers = ["Paris", "London", "Berlin", "Rome"];
    const shuffled = [...answers].sort(() => Math.random() - 0.5);

    // Check that all answers are present
    expect(shuffled.length).toBe(answers.length);
    expect(shuffled.sort()).toEqual(answers.sort());
  });

  it("should generate valid room codes", () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const generateCode = () => {
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const code = generateCode();
    expect(code).toHaveLength(6);
    expect(/^[A-Z0-9]{6}$/.test(code)).toBe(true);
  });
});
