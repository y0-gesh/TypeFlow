import { cleanText } from "@/utils/textCleaner";
import { splitSentences, createChunks } from "@/utils/chunkGenerator";
import { getDifficulty } from "@/utils/difficulty";

export interface Chunk {
  id: string;
  text: string;
  difficulty: number;
}

export interface ProcessedLesson {
  content: string;
  difficulty: number;
  sequence_number: number;
}

export interface ProcessedChapter {
  title: string;
  sequence_number: number;
  lessons: ProcessedLesson[];
}

/**
 * Content Engineer Agent
 * Responsible for text processing, structural segmenting, and chunking logic.
 */
export const contentEngine = {
  /**
   * Processes flat text into a simple list of chunks. (For quick play / backward compatibility)
   */
  processContent: (rawText: string): Chunk[] => {
    const cleaned = cleanText(rawText);
    const sentences = splitSentences(cleaned);
    const chunks = createChunks(sentences);

    return chunks.map((text, index) => ({
      id: `chunk-${index}`,
      text,
      difficulty: getDifficulty(text),
    }));
  },

  /**
   * Structural Segmenter
   * Processes large documents into structured Chapters and Lesson Chunks.
   */
  processDocument: (rawText: string): ProcessedChapter[] => {
    const cleanedText = cleanText(rawText);
    if (!cleanedText) return [];

    // Find headings like "Chapter 1", "CHAPTER II", "PART A", or Markdown "# Title", "## Title"
    // Regex matches starts of lines containing these patterns, allowing optional indentation spaces.
    const headingRegex = /(?:^|\n)[ \t]*(?:(?:(?:Chapter|CHAPTER|PART|Part)\s+(\d+|[IXVLDM]+)(?:\s*[:-]\s*|\s+))|(#+\s+))([^\n]+)/gi;

    let match;
    const headings: { index: number; title: string }[] = [];

    // Find all matches
    while ((match = headingRegex.exec(cleanedText)) !== null) {
      headings.push({
        index: match.index,
        title: match[3].trim()
      });
    }

    const chapters: ProcessedChapter[] = [];

    if (headings.length > 0) {
      // Heading patterns detected - segment structurally
      for (let i = 0; i < headings.length; i++) {
        const start = headings[i].index;
        const end = i < headings.length - 1 ? headings[i + 1].index : cleanedText.length;
        
        // Extract raw content inside this chapter section (excluding heading match)
        const rawChapterContent = cleanedText.substring(start, end).replace(headingRegex, "").trim();
        
        if (rawChapterContent) {
          chapters.push(
            createProcessedChapter(headings[i].title, rawChapterContent, chapters.length + 1)
          );
        }
      }
    }

    // Fallback: No headings detected, or parser returned empty chapters.
    // Segment text into roughly equal blocks of ~12,000 chars ending at sentence boundary.
    if (chapters.length === 0) {
      const chapterSize = 12000;
      let idx = 0;
      let sequence = 1;

      while (idx < cleanedText.length) {
        let end = idx + chapterSize;
        if (end >= cleanedText.length) {
          end = cleanedText.length;
        } else {
          // Adjust boundary to split at paragraph or sentence finish (instead of cutting mid-word)
          const searchRange = cleanedText.substring(end - 2000, Math.min(end + 2000, cleanedText.length));
          const splitOffset = searchRange.lastIndexOf("\n\n");
          if (splitOffset !== -1) {
            end = (end - 2000) + splitOffset + 2;
          } else {
            const sentenceOffset = searchRange.lastIndexOf(". ");
            if (sentenceOffset !== -1) {
              end = (end - 2000) + sentenceOffset + 2;
            }
          }
        }

        const rawChapterContent = cleanedText.substring(idx, end).trim();
        if (rawChapterContent) {
          chapters.push(
            createProcessedChapter(`Chapter ${sequence}`, rawChapterContent, sequence)
          );
          sequence++;
        }
        idx = end;
      }
    }

    return chapters;
  }
};

/**
 * Groups raw chapter content into paragraphs, splits sentences, chunks, and formats chapter lessons.
 */
function createProcessedChapter(title: string, rawContent: string, sequenceNumber: number): ProcessedChapter {
  // Split content into paragraphs by double-newline
  const paragraphs = rawContent.split(/\n\s*\n+/).filter(Boolean);
  const sentences: string[] = [];

  for (const para of paragraphs) {
    const paraSentences = splitSentences(para);
    sentences.push(...paraSentences);
  }

  const chunks = createChunks(sentences);

  const lessons = chunks.map((chunkText, idx) => ({
    content: chunkText,
    difficulty: getDifficulty(chunkText),
    sequence_number: idx + 1
  }));

  return {
    title,
    sequence_number: sequenceNumber,
    lessons
  };
}
