/**
 * Splits text into sentences based on punctuation.
 * Employs negative lookbehinds to prevent splitting on common abbreviations.
 */
export function splitSentences(text: string): string[] {
  if (!text) return [];

  // Sentence boundary detector ignoring common abbreviation dots
  const sentenceBoundaryRegex = /(?<!\b(?:Mr|Dr|Ms|Mrs|Sr|Jr|Gen|Col|Prof|vs|e\.g|i\.e|a\.m|p\.m|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.)(?<=[.!?])\s+/g;
  return text.split(sentenceBoundaryRegex).filter(Boolean);
}

/**
 * Groups sentences into chunks of 80-200 characters (targeting ~150).
 * Keeps sentences intact unless a single sentence exceeds the maximum limits.
 */
export function createChunks(sentences: string[]): string[] {
  const chunks: string[] = [];
  let current = "";

  for (let sentence of sentences) {
    sentence = sentence.trim();
    if (!sentence) continue;

    // If a single sentence exceeds 180 chars, split it at phrase boundaries
    if (sentence.length > 180) {
      if (current) {
        chunks.push(current.trim());
        current = "";
      }
      
      const subChunks = splitLongSentence(sentence);
      chunks.push(...subChunks);
      continue;
    }

    if ((current + (current ? " " : "") + sentence).length <= 180) {
      current += (current ? " " : "") + sentence;
    } else {
      if (current) {
        chunks.push(current.trim());
      }
      current = sentence;
    }
  }

  if (current) {
    chunks.push(current.trim());
  }

  return postProcessChunks(chunks);
}

/**
 * Splits a single long sentence into phrase-level subchunks.
 */
function splitLongSentence(sentence: string): string[] {
  const subChunks: string[] = [];
  // Split on clause punctuation (comma, semicolon, colon, dash)
  const parts = sentence.split(/(?<=[,;:—])\s+/);
  let current = "";

  for (const part of parts) {
    if ((current + (current ? " " : "") + part).length <= 180) {
      current += (current ? " " : "") + part;
    } else {
      if (current) {
        subChunks.push(current.trim());
      }
      
      // If a single part is still > 180, split it word-by-word
      if (part.length > 180) {
        const words = part.split(/\s+/);
        let wordChunk = "";
        for (const word of words) {
          if ((wordChunk + (wordChunk ? " " : "") + word).length <= 180) {
            wordChunk += (wordChunk ? " " : "") + word;
          } else {
            if (wordChunk) subChunks.push(wordChunk.trim());
            wordChunk = word;
          }
        }
        current = wordChunk;
      } else {
        current = part;
      }
    }
  }

  if (current) {
    subChunks.push(current.trim());
  }

  return subChunks;
}

/**
 * Optimizes small trailing chunks by merging them if they fit under the length limit.
 */
function postProcessChunks(chunks: string[]): string[] {
  const processed: string[] = [];
  let current = "";

  for (const chunk of chunks) {
    if (!current) {
      current = chunk;
      continue;
    }

    if ((current + " " + chunk).length <= 180) {
      current += " " + chunk;
    } else {
      processed.push(current);
      current = chunk;
    }
  }

  if (current) {
    processed.push(current);
  }

  return processed;
}
