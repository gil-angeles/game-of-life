import { describe, it, expect } from "vitest";
import { getNextBoard, boardsAreEqual, serializeBoard } from "./gameOfLife";
import type { Board } from "./types";

describe("Game of Life - getNextBoard", () => {
  it("keeps a 2x2 block still (still life)", () => {
    const block: Board = [
      [1, 1],
      [1, 1],
    ];

    const next = getNextBoard(block);

    expect(boardsAreEqual(next, block)).toBe(true);
  });

  it("evolves a vertical blinker into a horizontal blinker and back", () => {
    const vertical: Board = [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ];

    const horizontal: Board = [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ];

    const first = getNextBoard(vertical);
    const second = getNextBoard(first);

    expect(boardsAreEqual(first, horizontal)).toBe(true);
    expect(boardsAreEqual(second, vertical)).toBe(true);
  });

  it("kills an isolated live cell by underpopulation", () => {
    const board: Board = [
      [1, 0],
      [0, 0],
    ];

    const next = getNextBoard(board);

    expect(next).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });

  it("keeps a live cell with 2 neighbours alive", () => {
    const board: Board = [
      [1, 1, 0],
      [0, 1, 0],
      [0, 0, 0],
    ];

    const next = getNextBoard(board);

    expect(next[1][1]).toBe(1);
  });

  it("keeps a live cell with 3 neighbours alive", () => {
    const board: Board = [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ];

    const next = getNextBoard(board);

    expect(next[1][1]).toBe(1);
  });

  it("kills a live cell with more than 3 neighbours by overpopulation", () => {
    const board: Board = [
      [1, 1, 1],
      [0, 1, 1],
      [0, 0, 0],
    ];

    const next = getNextBoard(board);

    expect(next[1][1]).toBe(0);
  });

  it("brings a dead cell with exactly 3 neighbours to life (reproduction)", () => {
    const board: Board = [
      [1, 1, 0],
      [0, 0, 1],
      [0, 0, 0],
    ];

    const next = getNextBoard(board);

    expect(next[1][1]).toBe(1);
  });

  it("treats cells outside the board as dead (finite grid)", () => {
    const board: Board = [
      [1, 0],
      [0, 0],
    ];

    const next = getNextBoard(board);

    expect(next[0][0]).toBe(0);
  });
});

describe("Game of Life - boardsAreEqual", () => {
  it("returns true for identical boards", () => {
    const a: Board = [
      [1, 0],
      [0, 1],
    ];
    const b: Board = [
      [1, 0],
      [0, 1],
    ];

    expect(boardsAreEqual(a, b)).toBe(true);
  });

  it("returns false when any cell differs", () => {
    const a: Board = [
      [1, 0],
      [0, 1],
    ];
    const b: Board = [
      [1, 0],
      [1, 1],
    ];

    expect(boardsAreEqual(a, b)).toBe(false);
  });

  it("returns false when dimensions differ", () => {
    const a: Board = [[1, 0]];
    const b: Board = [
      [1, 0],
      [0, 1],
    ];

    expect(boardsAreEqual(a, b)).toBe(false);
  });
});

describe("Game of Life - serializeBoard", () => {
  it("serializes a small board into a compact string", () => {
    const board: Board = [
      [1, 0, 1],
      [0, 1, 0],
    ];

    const serialized = serializeBoard(board);

    expect(serialized).toBe("101|010");
  });
});
