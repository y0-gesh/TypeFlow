/**
 * Splits text into sentences based on punctuation.
 */
export function splitSentences(text: string): string[] {
  // Regex to split on . ! ? but also handle potential abbreviations (basic)
  return text.split(/(?<=[.!?])\s+/).filter(Boolean);
}

/**
 * Groups sentences into chunks of 80-200 characters.
 */
export function createChunks(sentences: string[]): string[] {
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).length < 180) {
      current += (current ? " " : "") + sentence;
    } else {
      if (current) chunks.push(current.trim());
      current = sentence;
    }
  }

  if (current) chunks.push(current.trim());

  return chunks;
}
