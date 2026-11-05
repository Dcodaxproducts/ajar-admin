import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import ListingReviewParameters from "@/components/ListingReviewParameters";
import type { ListingParameter } from "@/types";

const messages = { translation: {
  listingParameters: "Listing parameters", yes: "Yes", no: "No",
  viewAttachment: "View attachment", notProvided: "Not provided", invalidValue: "Invalid value",
} };
const parameter = (fieldId: string, label: string, type: string, value: unknown, order: number, extra: Partial<ListingParameter> = {}): ListingParameter => ({
  fieldId, key: fieldId, label, type, value, submitted: true, configured: true,
  order, isMultiple: Array.isArray(value), ...extra,
});
const renderParameters = (parameters: ListingParameter[]) => render(
  <NextIntlClientProvider locale="en" messages={messages}>
    <ListingReviewParameters parameters={parameters} />
  </NextIntlClientProvider>
);

describe("ListingReviewParameters", () => {
  it("renders all supported types in canonical order including Drop-off Location", () => {
    renderParameters([
      parameter("number", "Capacity", "number", 0, 2),
      parameter("drop", "Drop-off Location", "location", { lat: 25, lng: 51 }, 1, { displayValue: "Doha Airport" }),
      parameter("boolean", "Enabled", "boolean", false, 3),
      parameter("select", "Fuel", "select", "Electric", 4),
      parameter("multi", "Features", "multiselect", ["GPS", "Seat"], 5),
      parameter("date", "Available date", "date", "2026-12-01", 6),
      parameter("text", "Notes", "text", "Clean", 7),
      parameter("location", "Coordinates", "location", { lat: 1, lng: 2 }, 8),
      parameter("file", "Proof", "file", ["/uploads/proof.pdf"], 9),
      parameter("image", "Photo", "image", ["https://example.com/photo.webp"], 10),
    ]);
    const labels = screen.getAllByText(/Drop-off Location|Capacity|Enabled|Fuel|Features|Available date|Notes|Coordinates|Proof|Photo/);
    expect(labels.map((node) => node.textContent)).toEqual([
      "Drop-off Location", "Capacity", "Enabled", "Fuel", "Features",
      "Available date", "Notes", "Coordinates", "Proof", "Photo",
    ]);
    expect(screen.getByText("Doha Airport")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText('{"lat":1,"lng":2}')).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View attachment/ })).toHaveAttribute("href", expect.stringContaining("/uploads/proof.pdf"));
    expect(screen.getByRole("img", { name: "Photo" })).toBeInTheDocument();
  });

  it("shows explicit missing values and keeps unknown or malformed fields visible", () => {
    renderParameters([
      parameter("missing", "Optional note", "text", null, 1, { submitted: false }),
      parameter("deleted", "Deleted template field", "unknown", { unexpected: true }, 2, { configured: false }),
      parameter("bad-file", "Malformed attachment", "file", ["javascript:alert(1)"], 3),
    ]);
    expect(screen.getByText("Not provided")).toBeInTheDocument();
    expect(screen.getByText('{"unexpected":true}')).toBeInTheDocument();
    expect(screen.getByText("Invalid value")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Malformed attachment/ })).not.toBeInTheDocument();
  });

  it("uses localized labels and values supplied by the API with fallback-safe text", () => {
    renderParameters([
      parameter("fuel", "نوع الوقود", "select", "كهربائي", 1),
      parameter("fallback", "Fallback label", "text", "Fallback value", 2),
    ]);
    expect(screen.getByText("نوع الوقود")).toBeInTheDocument();
    expect(screen.getByText("كهربائي")).toBeInTheDocument();
    expect(screen.getByText("Fallback value")).toBeInTheDocument();
  });
});
