/**
 * Splits text into sentences based on punctuation.
 * @param {string} text 
 * @returns {string[]}
 */
export function splitSentences(text) {
  // Regex to split on . ! ? but also handle potential abbreviations (basic)
  return text.split(/(?<=[.!?])\s+/);
}

/**
 * Groups sentences into chunks of 80-200 characters.
 * @param {string[]} sentences 
 * @returns {string[]}
 */
export function createChunks(sentences) {
  const chunks = [];
  let current = "";

  for (let sentence of sentences) {
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
