export const normalizeSubject = (value) =>
  String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
