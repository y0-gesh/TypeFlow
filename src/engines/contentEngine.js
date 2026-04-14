import { cleanText } from "@/utils/textCleaner";
import { splitSentences, createChunks } from "@/utils/chunkGenerator";
import { getDifficulty } from "@/utils/difficulty";

/**
 * Content Engineer Agent
 * Responsible for text processing logic.
 */
export const contentEngine = {
  /**
   * Processes raw text into structured chunks with difficulty scores.
   * @param {string} rawText 
   */
  processContent: (rawText) => {
    const cleaned = cleanText(rawText);
    const sentences = splitSentences(cleaned);
    const chunks = createChunks(sentences);

    return chunks.map((text, index) => ({
      id: `chunk-${index}`,
      text,
      difficulty: getDifficulty(text),
    }));
  }
};
