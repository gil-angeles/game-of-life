import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { act } from "react";
import App from "./App";

describe("App", () => {
  it("renders main sections", async () => {
    await act(async () => {
      render(<App />);
    });

    expect(
      screen.getByRole("heading", { name: /game of life demo/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /upload board/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /evolve board/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /current board/i })
    ).toBeInTheDocument();
  });

  it("shows the textarea for board input", async () => {
    await act(async () => {
      render(<App />);
    });

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
  });

  it("has the main action buttons", async () => {
    await act(async () => {
      render(<App />);
    });

    expect(
      screen.getByRole("button", { name: /upload board/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /next state \+ 1/i })
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
  });
});
