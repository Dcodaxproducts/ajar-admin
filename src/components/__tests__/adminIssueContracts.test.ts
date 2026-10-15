import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("Ajar admin issue contracts", () => {
  it("passes listing status through the service, hook and table", () => {
    const service = read("../../services/rentalListings.ts");
    const hook = read("../../hooks/useRentalListings.ts");
    const page = read("../pages/RentalListings.tsx");
    expect(service).toContain("params.set(\"status\", status)");
    expect(hook).toContain("search, status");
    expect(page).toContain("approvalStatus");
  });
  it("requires an audited damage-dispute reason", () => {
    const service = read("../../services/tickets.ts");
    const page = read("../pages/TicketDetails.tsx");
    expect(service).toContain("adminNote: string");
    expect(page).toContain("resolutionReasonRequirements");
    expect(page).toContain("adminNote: normalizedAdminNote");
    expect(page).toContain("normalizedAdminNote.length >= 3");
    expect(page).toContain("maxLength={1000}");
  });
  it("waits for the active zone list refresh before closing the create dialog", () => {
    const hook = read("../../hooks/useZones.ts");
    expect(hook).toContain("onSuccess: async () =>");
    expect(hook).toContain("await queryClient.invalidateQueries({ queryKey: [\"zones\"]");
  });
  it("handles a missing refund policy as an empty editable state", () => {
    const service = read("../../services/refundManagement.ts");
    expect(service).toContain("error.response?.status === 404");
    expect(service).toContain("data: null");
  });
  it("uses canonical hour-based refund tiers", () => {
    const form = read("../forms/RefundPoliciesForm.tsx");
    expect(form).toContain("hoursBeforeCheckIn");
    expect(form).not.toContain("daysBeforeCheckIn");
    expect(form).toContain("validateTierThresholds");
  });
  it("unwraps field mutation envelopes and invalidates every field list cache", () => {
    const hook = read("../../hooks/useFields.ts");
    expect(hook).toContain("onSuccess: ({ data }: FieldResponse)");
    expect(hook).toContain("queryKey: [\"fields\"]");
    expect(hook).toContain("queryKey: [\"fields-list\"]");
    expect(hook).toContain("queryKey: [\"choice-fields-list\"]");
  });
  it("searches fields across server-side pagination with an isolated query cache", () => {
    const service = read("../../services/field.ts");
    const hook = read("../../hooks/useFields.ts");
    const page = read("../pages/Fields.tsx");
    expect(service).toContain("params: { page, limit, search }");
    expect(hook).toContain('queryKey: ["fields", page, limit, search]');
    expect(page).toContain("useGetFields({ page, limit, search })");
    expect(page).toContain("setPage(1)");
  });
  it("keeps English and Arabic translation keys in parity", () => {
    const en = JSON.parse(read("../../messages/en.json"));
    const ar = JSON.parse(read("../../messages/ar.json"));
    const flatten = (value: Record<string, unknown>, prefix = ""): string[] =>
      Object.entries(value).flatMap(([key, item]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        return item && typeof item === "object" && !Array.isArray(item)
          ? flatten(item as Record<string, unknown>, path)
          : [path];
      });
    expect(flatten(ar).sort()).toEqual(flatten(en).sort());
  });
});
