export type CancellationTier = {
  hoursBeforeCheckIn: number;
  percentage: number;
  label: string;
};

export const validateCancellationTiers = (
  tiers: CancellationTier[]
): string | null => {
  const hours = tiers.map((tier) => Number(tier.hoursBeforeCheckIn));
  const percentages = tiers.map((tier) => Number(tier.percentage));

  if ([...hours, ...percentages].some((value) => !Number.isSafeInteger(value))) {
    return "wholeNumbersRequired";
  }
  if (hours.some((value) => value < 0)) return "minZero";
  if (percentages.some((value) => value < 0 || value > 100)) return "max100";
  if (new Set(hours).size !== hours.length) return "duplicateCancellationHours";
  return null;
};
