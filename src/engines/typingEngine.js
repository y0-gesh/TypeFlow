/**
 * Typing Engine Agent
 * Responsible for core typing logic.
 */
export const typingEngine = {
  /**
   * Compares expected text with actual user input.
   * @param {string} expected 
   * @param {string} actual 
   */
  compareInput: (expected, actual) => {
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
   * @param {number} charsTyped 
   * @param {number} timeInSeconds 
   */
  calculateWPM: (charsTyped, timeInSeconds) => {
    if (timeInSeconds === 0) return 0;
    const words = charsTyped / 5;
    const minutes = timeInSeconds / 60;
    return Math.round(words / minutes);
  },

  /**
   * Calculates accuracy percentage.
   * @param {number} correct 
   * @param {number} total 
   */
  calculateAccuracy: (correct, total) => {
    if (total === 0) return 100;
    return Math.round((correct / total) * 100);
  }
};
