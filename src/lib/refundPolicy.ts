export type CancellationTier = {
  hoursBeforeCheckIn: number;
  percentage: number;
  label: string;
};

export type EarlyReturnTier = {
  hoursBeforeCheckOut: number;
  percentage: number;
  label: string;
};

export type RefundPolicyPayload = {
  allowRefund: boolean;
  noteText: string;
  tiers: CancellationTier[];
  earlyReturnTiers: EarlyReturnTier[];
};

export const validateTierThresholds = (values: RefundPolicyPayload): string | null => {
  const cancellationHours = values.tiers.map((tier) => Number(tier.hoursBeforeCheckIn));
  const returnHours = values.earlyReturnTiers.map((tier) => Number(tier.hoursBeforeCheckOut));
  const allPercentages = [...values.tiers, ...values.earlyReturnTiers].map((tier) => Number(tier.percentage));

  if ([...cancellationHours, ...returnHours, ...allPercentages].some((value) => !Number.isSafeInteger(value))) {
    return "wholeNumbersRequired";
  }
  if ([...cancellationHours, ...returnHours].some((value) => value < 0)) return "minZero";
  if (allPercentages.some((value) => value < 0 || value > 100)) return "max100";
  if (new Set(cancellationHours).size !== cancellationHours.length) return "duplicateCancellationHours";
  if (new Set(returnHours).size !== returnHours.length) return "duplicateEarlyReturnHours";
  return null;
};
