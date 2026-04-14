export function cleanText(text) {
  return text
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
}
