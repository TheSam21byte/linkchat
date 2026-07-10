export function truncateText(value = "", maxLength = 30) {
  const characters = Array.from(value);

  if (characters.length <= maxLength) return value;

  return `${characters.slice(0, maxLength - 1).join("").trimEnd()}…`;
}
