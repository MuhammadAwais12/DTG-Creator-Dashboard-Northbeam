export function normalizeCreatorCode(input: string): string {
  if (!input) return "";
  // Matches CR followed by optional spaces, optional dash, optional spaces, and 1+ digits
  const match = input.match(/CR\s*-?\s*(\d+)/i);
  if (!match) {
    return input.trim().toUpperCase();
  }
  const digits = match[1];
  return `CR-${digits}`;
}

export function extractCreatorName(adName: string, fallbackName: string): string {
  if (!adName) return fallbackName;

  // 1. Strip leading CR-### and separators immediately following it (e.g. "CR-100 | ", "CR - 226 - ")
  let cleaned = adName.replace(/^\s*CR\s*-?\s*\d+\s*[|\-]?\s*/i, "").trim();

  // 2. Check if name is in brackets like [Evie Kevish] or [Elle Sneller]
  const bracketMatch = cleaned.match(/\[(.*?)\]/);
  if (bracketMatch && bracketMatch[1].trim()) {
    return bracketMatch[1].trim();
  }

  // 3. Remove any remaining square brackets
  cleaned = cleaned.replace(/[\[\]]/g, "").trim();

  // 4. Split by pipe or dash to separate creator name from dates/tags
  const parts = cleaned.split(/[|\-]/).map((p) => p.trim()).filter(Boolean);

  if (parts.length > 0) {
    const candidate = parts[0];
    // Filter out obvious non-name date tags if candidate is just a month
    const isMonth = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(candidate);
    if (!isMonth && candidate.length > 1) {
      return candidate;
    }
  }

  return fallbackName;
}
