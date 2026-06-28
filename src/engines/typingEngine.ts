export interface ComparisonResult {
  correct: number;
  incorrect: number;
  total: number;
}

/**
 * Typing Engine Agent
 * Responsible for core typing logic.
 */
export const typingEngine = {
  /**
   * Compares expected text with actual user input.
   */
  compareInput: (expected: string, actual: string): ComparisonResult => {
    let correct = 0;
    const length = Math.min(expected.length, actual.length);

    for (let i = 0; i < length; i++) {
      if (actual[i] === expected[i]) {
        correct++;
      }
    }

    return {
      correct,
      incorrect: actual.length - correct,
      total: actual.length
    };
  },

  /**
   * Calculates Words Per Minute.
   * Standard formula: (chars / 5) / (time in minutes)
   */
  calculateWPM: (charsTyped: number, timeInSeconds: number): number => {
    if (timeInSeconds === 0) return 0;
    const words = charsTyped / 5;
    const minutes = timeInSeconds / 60;
    return Math.round(words / minutes);
  },

  /**
   * Calculates accuracy percentage.
   */
  calculateAccuracy: (correct: number, total: number): number => {
    if (total === 0) return 100;
    return Math.round((correct / total) * 100);
  }
};
