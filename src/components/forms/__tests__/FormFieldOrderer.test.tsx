import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import FormFieldOrderer, { reorderFieldIds } from "../FormFieldOrderer";

const fields = [
  { _id: "a", label: "Name", type: "text" },
  { _id: "b", label: "Price", type: "number" },
  { _id: "c", label: "Location", type: "location" },
];
const labels = {
  title: "Mobile field order",
  description: "Arrange fields",
  drag: (label: string) => "Drag " + label,
  moveUp: (label: string) => "Move " + label + " up",
  moveDown: (label: string) => "Move " + label + " down",
  saving: "Saving field order",
  empty: "No fields",
};

describe("FormFieldOrderer", () => {
  it("uses the same stable reorder operation for completed drags", () => {
    expect(reorderFieldIds(["a", "b", "c"], "a", "c")).toEqual(["b", "c", "a"]);
    expect(reorderFieldIds(["a", "b"], "missing", "b")).toEqual(["a", "b"]);
  });

  it("persists one request for a keyboard-accessible move", async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    render(<Harness onPersist={persist} />);
    await userEvent.click(screen.getByRole("button", { name: "Move Name down" }));
    await waitFor(() => expect(persist).toHaveBeenCalledTimes(1));
    expect(persist).toHaveBeenCalledWith(["b", "a", "c"]);
    expect(renderedOrder()).toEqual(["b", "a", "c"]);
  });

  it("rolls optimistic order back and reports an error when saving fails", async () => {
    const persist = vi.fn().mockRejectedValue(new Error("offline"));
    const onError = vi.fn();
    render(<Harness onPersist={persist} onError={onError} />);
    await userEvent.click(screen.getByRole("button", { name: "Move Name down" }));
    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(renderedOrder()).toEqual(["a", "b", "c"]);
  });

  it("provides touch handles, RTL-safe inherited layout, and localized controls", () => {
    const { container } = render(
      <div dir="rtl">
        <Harness onPersist={vi.fn().mockResolvedValue(undefined)} />
      </div>
    );
    const handle = screen.getByRole("button", { name: "Drag Name" });
    expect(handle).toHaveClass("touch-none", "size-11");
    expect(container.querySelector('[dir="rtl"]')).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Move Price up" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Move Price down" })).toBeEnabled();
  });

  it("disables controls and announces progress while one bounded save is active", async () => {
    let finish: (() => void) | undefined;
    const persist = vi.fn(
      () => new Promise<void>((resolve) => {
        finish = resolve;
      })
    );
    render(<Harness onPersist={persist} />);
    await userEvent.click(screen.getByRole("button", { name: "Move Name down" }));
    expect(screen.getByText("Saving field order")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Drag Price" })).toBeDisabled();
    finish?.();
    await waitFor(() => expect(screen.queryByText("Saving field order")).not.toBeInTheDocument());
  });
});

function Harness({
  onPersist,
  onError,
}: {
  onPersist: (ids: string[]) => Promise<void>;
  onError?: () => void;
}) {
  const [ids, setIds] = useState(["a", "b", "c"]);
  return (
    <FormFieldOrderer
      fieldIds={ids}
      fields={fields}
      labels={labels}
      onChange={setIds}
      onPersist={onPersist}
      onError={onError}
    />
  );
}

function renderedOrder() {
  return within(screen.getByRole("list"))
    .getAllByRole("listitem")
    .map((item) => item.getAttribute("data-testid")?.replace("ordered-field-", ""));
}
