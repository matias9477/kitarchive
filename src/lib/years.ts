/** First 4-digit year in a season label: "2011/12" → 2011, "Centenary" → null. */
export const deriveStartYear = (label: string): number | null => {
  const match = /\d{4}/.exec(label);
  return match ? Number(match[0]) : null;
};
