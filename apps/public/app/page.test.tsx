import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("Public home page", () => {
  it("renders the expected content", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Reading"
      })
    ).toBeDefined();
    expect(
      screen.getByText("Reading app powered by the shared Material UI kit.")
    ).toBeDefined();
    expect(screen.getByRole("button", { name: "Get Started" })).toBeDefined();
  });
});
