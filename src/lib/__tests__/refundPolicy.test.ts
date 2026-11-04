import { describe, expect, it } from "vitest";
import {
  validateCancellationTiers,
  type CancellationTier,
} from "@/lib/refundPolicy";

const tier = (overrides: Partial<CancellationTier> = {}): CancellationTier => ({
  hoursBeforeCheckIn: 48,
  percentage: 25,
  label: "Early",
  ...overrides,
});

describe("cancellation tier hour validation", () => {
  it("accepts canonical whole-hour tiers", () => {
    expect(validateCancellationTiers([tier()])).toBeNull();
  });

  it("rejects duplicate hour thresholds", () => {
    expect(validateCancellationTiers([tier(), tier({ percentage: 50 })])).toBe(
      "duplicateCancellationHours"
    );
  });

  it("rejects fractional thresholds and percentages", () => {
    expect(validateCancellationTiers([tier({ hoursBeforeCheckIn: 12.5 })])).toBe(
      "wholeNumbersRequired"
    );
    expect(validateCancellationTiers([tier({ percentage: 12.5 })])).toBe(
      "wholeNumbersRequired"
    );
  });

  it("rejects negative hours and percentages outside 0-100", () => {
    expect(validateCancellationTiers([tier({ hoursBeforeCheckIn: -1 })])).toBe("minZero");
    expect(validateCancellationTiers([tier({ percentage: 101 })])).toBe("max100");
  });
});
