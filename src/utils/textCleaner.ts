export function cleanText(text: string): string {
  return text
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
}
