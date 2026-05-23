const normalizeSubject = (value) =>
  String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();

const isValidSubject = (value) => normalizeSubject(value).length > 0;

module.exports = {
  normalizeSubject,
  isValidSubject,
};
