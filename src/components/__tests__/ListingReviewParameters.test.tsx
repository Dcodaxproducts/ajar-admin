import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import ListingReviewParameters from "@/components/ListingReviewParameters";

const renderParameters = () => render(
  <NextIntlClientProvider locale="en" messages={{ translation: { listingParameters: "Listing parameters", yes: "Yes", no: "No", viewAttachment: "View attachment" } }}>
    <ListingReviewParameters parameters={[
      { key: "capacity", label: "Capacity", type: "number", value: 0, order: 2, isMultiple: false },
      { key: "dropoff", label: "Drop-off Location", type: "location", value: "place-id", displayValue: "King Fahd Road", order: 1, isMultiple: false },
      { key: "enabled", label: "Enabled", type: "boolean", value: false, order: 3, isMultiple: false },
      { key: "features", label: "Features", type: "select", value: ["GPS", "Air conditioning"], order: 4, isMultiple: true },
    ]} />
  </NextIntlClientProvider>
);

describe("ListingReviewParameters", () => {
  it("renders ordered localized typed values without losing false or zero", () => {
    renderParameters();
    const labels = screen.getAllByText(/Drop-off Location|Capacity|Enabled|Features/);
    expect(labels.map((node) => node.textContent)).toEqual(["Drop-off Location", "Capacity", "Enabled", "Features"]);
    expect(screen.getByText("King Fahd Road")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText("GPS")).toBeInTheDocument();
  });
});
