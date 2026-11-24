import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LifecycleSteps, STEPS } from "./LifecycleSteps";

describe("LifecycleSteps", () => {
  it("renders every lifecycle step in order", () => {
    render(<LifecycleSteps />);
    const list = screen.getByRole("list", { name: "Delivery lifecycle" });
    const headings = within(list)
      .getAllByRole("heading")
      .map((h) => h.textContent);
    expect(headings).toEqual(STEPS.map((s) => s.title));
  });

  it("marks exactly two human approval gates", () => {
    render(<LifecycleSteps />);
    expect(screen.getAllByText(/^Human gate:/)).toHaveLength(2);
  });
});
