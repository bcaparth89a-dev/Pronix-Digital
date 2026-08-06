const SITE_NAME = "Pronix Digital";

function normalizeText(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateAtWordBoundary(value, maxLength) {
  const text = normalizeText(value);
  if (text.length <= maxLength) {
    return text;
  }

  const sliced = text.slice(0, maxLength).trimEnd();
  const lastSpace = sliced.lastIndexOf(" ");
  const truncated = lastSpace > maxLength * 0.6 ? sliced.slice(0, lastSpace) : sliced;
  return `${truncated.trimEnd()}...`;
}

export function createSeoTitle(value, suffix = SITE_NAME) {
  const title = normalizeText(value);
  if (!title) {
    return suffix;
  }

  if (title.toLowerCase().includes(suffix.toLowerCase())) {
    return truncateAtWordBoundary(title, 160);
  }

  return truncateAtWordBoundary(`${title} | ${suffix}`, 160);
}

export function createSeoDescription(primaryValue, fallbackValue = "") {
  const text = normalizeText(primaryValue) || normalizeText(fallbackValue);
  if (!text) {
    return "";
  }

  return truncateAtWordBoundary(text, 160);
}
