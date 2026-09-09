/**
 * Utility to count words accurately separated by whitespace.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

/**
 * Splits text into sentences based on punctuation (. ! ?).
 * Employs negative lookbehinds to prevent splitting on common abbreviations.
 */
export function splitSentences(text: string): string[] {
  if (!text) return [];

  // Sentence boundary detector ignoring common abbreviation dots
  const sentenceBoundaryRegex = /(?<!\b(?:Mr|Dr|Ms|Mrs|Sr|Jr|Gen|Col|Prof|vs|e\.g|i\.e|a\.m|p\.m|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.)(?<=[.!?])\s+/g;
  return text.split(sentenceBoundaryRegex).map((s) => s.trim()).filter(Boolean);
}

/**
 * Splits a single long sentence exceeding maxWords into phrase-level subchunks.
 */
function splitLongSentenceWords(sentence: string, minWords = 50, maxWords = 100): string[] {
  const totalWords = countWords(sentence);
  if (totalWords <= maxWords) return [sentence];

  // Split on phrase boundaries: comma, semicolon, colon, em-dash, dash
  const phrases = sentence.split(/(?<=[,;:—])\s+/).map((p) => p.trim()).filter(Boolean);
  const result: string[] = [];
  let current = "";

  for (const phrase of phrases) {
    const phraseWords = countWords(phrase);
    if (phraseWords > maxWords) {
      // Single phrase exceeds maxWords, split strictly by words
      const words = phrase.split(/\s+/).filter(Boolean);
      let sub = current ? current.split(/\s+/).filter(Boolean) : [];
      for (const w of words) {
        sub.push(w);
        if (sub.length >= minWords && sub.length <= maxWords) {
          result.push(sub.join(" "));
          sub = [];
        } else if (sub.length > maxWords) {
          result.push(sub.slice(0, maxWords).join(" "));
          sub = sub.slice(maxWords);
        }
      }
      current = sub.join(" ");
    } else {
      const combined = current ? `${current} ${phrase}` : phrase;
      const combinedWords = countWords(combined);
      if (combinedWords >= minWords) {
        result.push(combined);
        current = "";
      } else {
        current = combined;
      }
    }
  }

  if (current) {
    if (result.length > 0 && countWords(result[result.length - 1]) + countWords(current) <= maxWords) {
      result[result.length - 1] += " " + current;
    } else {
      result.push(current);
    }
  }

  return result;
}

/**
 * Splits a paragraph exceeding 100 words at sentence boundaries.
 * Accumulates sentences until at least 50 words are reached ("cover till the period after the 50 words").
 */
function splitLargeParagraph(paragraph: string, minWords = 50, maxWords = 100): string[] {
  const sentences = splitSentences(paragraph);
  const chunks: string[] = [];
  let currentSentences: string[] = [];
  let currentWords = 0;

  for (const sentence of sentences) {
    const sWords = countWords(sentence);

    // If a single sentence exceeds maxWords on its own
    if (sWords > maxWords) {
      if (currentSentences.length > 0) {
        chunks.push(currentSentences.join(" "));
        currentSentences = [];
        currentWords = 0;
      }
      const subChunks = splitLongSentenceWords(sentence, minWords, maxWords);
      chunks.push(...subChunks);
      continue;
    }

    currentSentences.push(sentence);
    currentWords += sWords;

    // Once word count reaches/exceeds 50 words, complete chunk at this sentence boundary
    if (currentWords >= minWords) {
      chunks.push(currentSentences.join(" "));
      currentSentences = [];
      currentWords = 0;
    }
  }

  if (currentSentences.length > 0) {
    const remainder = currentSentences.join(" ");
    const remWords = countWords(remainder);

    // Merge remainder with previous chunk if it fits within maxWords
    if (chunks.length > 0 && countWords(chunks[chunks.length - 1]) + remWords <= maxWords) {
      chunks[chunks.length - 1] += " " + remainder;
    } else {
      chunks.push(remainder);
    }
  }

  return chunks;
}

/**
 * Generates balanced chunks between 50 and 100 words.
 * - Does NOT break a full paragraph unless the paragraph is > 100 words.
 * - For paragraphs > 100 words: breaks at sentence boundaries ("covers till the period after 50 words").
 * - Combines short paragraphs into cohesive chunks within the 50-100 word target.
 */
export function createBalancedChunks(rawText: string, minWords = 50, maxWords = 100): string[] {
  if (!rawText) return [];

  // Normalize line endings
  const normalized = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return [];

  // Split into paragraphs by double-newline
  const rawParagraphs = normalized.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
  if (rawParagraphs.length === 0) return [];

  const chunks: string[] = [];
  let pendingChunk = "";
  let pendingWords = 0;

  for (const para of rawParagraphs) {
    const pWords = countWords(para);
    if (pWords === 0) continue;

    if (pWords > maxWords) {
      // Flush pending chunk before processing large paragraph
      if (pendingChunk) {
        chunks.push(pendingChunk);
        pendingChunk = "";
        pendingWords = 0;
      }

      const paraChunks = splitLargeParagraph(para, minWords, maxWords);

      // Check if last chunk of the split paragraph is small (< minWords)
      if (paraChunks.length > 0) {
        const lastChunk = paraChunks[paraChunks.length - 1];
        const lastWords = countWords(lastChunk);

        if (lastWords < minWords && paraChunks.length > 1) {
          for (let i = 0; i < paraChunks.length - 1; i++) {
            chunks.push(paraChunks[i]);
          }
          pendingChunk = lastChunk;
          pendingWords = lastWords;
        } else {
          chunks.push(...paraChunks);
        }
      }
    } else {
      // Paragraph is <= 100 words: Do NOT break it!
      if (pendingWords + pWords <= maxWords) {
        // Can accumulate intact paragraph
        pendingChunk = pendingChunk ? `${pendingChunk}\n\n${para}` : para;
        pendingWords += pWords;
      } else {
        // Adding would exceed 100 words: flush current pending chunk
        if (pendingChunk) {
          chunks.push(pendingChunk);
        }
        pendingChunk = para;
        pendingWords = pWords;
      }
    }
  }

  if (pendingChunk) {
    // If pendingChunk is small and can merge with preceding chunk within maxWords
    if (chunks.length > 0 && countWords(chunks[chunks.length - 1]) + pendingWords <= maxWords) {
      chunks[chunks.length - 1] += "\n\n" + pendingChunk;
    } else {
      chunks.push(pendingChunk);
    }
  }

  return chunks;
}

/**
 * Legacy wrapper: creates chunks from an array of sentences or paragraphs.
 * Ensures consistent 50-100 word balancing across all callers.
 */
export function createChunks(sentences: string[]): string[] {
  if (!sentences || sentences.length === 0) return [];
  return createBalancedChunks(sentences.join(" "));
}
