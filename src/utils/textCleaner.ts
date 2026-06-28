export function cleanText(text: string): string {
  if (!text) return "";

  return text
    // 1. Remove carriage returns
    .replace(/\r/g, "")
    // 2. Standardize curly double quotes
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    // 3. Standardize curly single quotes / apostrophes
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035`]/g, "'")
    // 4. Standardize dashes (em-dash, en-dash) to standard hyphens
    .replace(/[\u2013\u2014]/g, "-")
    // 5. Remove control characters & non-printable unicode characters (keep tabs, newlines)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    // 6. Normalize multiple consecutive spaces or tabs to a single space
    .replace(/[ \t]+/g, " ")
    // 7. Limit consecutive newlines to at most 2 (double newline for paragraph splits)
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}
