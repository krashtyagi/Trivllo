export const rating = (value: number) => {
  if (value >= 4.5) return "Excellent";
  if (value >= 4) return "Very Good";
  if (value >= 3) return "Good";
  if (value >= 2) return "Fair";
  return "Poor";
};
