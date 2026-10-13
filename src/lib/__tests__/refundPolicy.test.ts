import { describe, expect, it } from "vitest";
import { validateTierThresholds, type RefundPolicyPayload } from "@/lib/refundPolicy";

const policy = (overrides: Partial<RefundPolicyPayload> = {}): RefundPolicyPayload => ({
  allowRefund: true, noteText: "",
  tiers: [{ hoursBeforeCheckIn: 48, percentage: 25, label: "Early" }],
  earlyReturnTiers: [{ hoursBeforeCheckOut: 24, percentage: 10, label: "Return" }],
  ...overrides,
});

describe("refund policy hour validation", () => {
  it("accepts canonical whole-hour tiers", () => expect(validateTierThresholds(policy())).toBeNull());
  it("rejects duplicate cancellation thresholds", () => expect(validateTierThresholds(policy({ tiers: [
    { hoursBeforeCheckIn: 48, percentage: 25, label: "A" },
    { hoursBeforeCheckIn: 48, percentage: 50, label: "B" },
  ] }))).toBe("duplicateCancellationHours"));
  it("rejects fractional thresholds and percentages", () => expect(validateTierThresholds(policy({ tiers: [
    { hoursBeforeCheckIn: 12.5, percentage: 20, label: "A" },
  ] }))).toBe("wholeNumbersRequired"));
});
