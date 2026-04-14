export function getDifficulty(text) {
  const lengthScore = text.length / 100;
  const punctuationScore = (text.match(/[.,!?;:]/g) || []).length;
  const capsScore = (text.match(/[A-Z]/g) || []).length;

  return Math.min(
    5,
    Math.max(1, Math.ceil(lengthScore + punctuationScore * 0.5 + capsScore * 0.3))
  );
}
