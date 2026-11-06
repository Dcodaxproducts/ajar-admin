import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
describe("damage dispute admin review", () => {
  it("uses the versioned idempotent decision endpoint and never calls payment APIs", () => {
    const service = readFileSync(join(root, "src/services/tickets.ts"), "utf8");
    expect(service).toContain("/decision");
    expect(service).not.toContain("/status");
    expect(service.toLowerCase()).not.toContain("stripe");
  });
  it("provides bounded filtering and removes dispute deletion", () => {
    const list = readFileSync(join(root, "src/components/pages/TicketsList.tsx"), "utf8");
    const service = readFileSync(join(root, "src/services/tickets.ts"), "utf8");
    expect(list).toContain("ticket-status-filter");
    expect(list).not.toContain('actions={["delete"]}');
    expect(service).toContain("Math.min(limit, 50)");
  });
  it("requires USD reason, amount, version, evidence, currency and idempotency", () => {
    const detail = readFileSync(join(root, "src/components/pages/TicketDetails.tsx"), "utf8");
    for (const field of ["decisionReason", "approvedAmount", "expectedVersion", "evidenceReferences", "currency", "idempotencyKey"]) expect(detail).toContain(field);
    expect(detail).toContain('currency: "USD"');
    expect(detail).not.toContain('currency: "SAR"');
    expect(detail).toContain("paymentPendingStory3");
  });
  it("shows sanitized capture-then-refund status without provider identifiers", () => {
    const detail = readFileSync(join(root, "src/components/pages/TicketDetails.tsx"), "utf8");
    const service = readFileSync(join(root, "src/services/tickets.ts"), "utf8");
    expect(service).toContain("/tickets/deposit/");
    expect(service).toContain("/settlement/retry");
    expect(detail).toContain("depositFundingMode");
    expect(detail).toContain("retrySettlement");
    expect(detail).toContain("amountRefunded");
    expect(service).not.toContain("providerPaymentIntentId");
  });
});
