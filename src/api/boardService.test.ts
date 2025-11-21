import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Board } from "../domain/types";

let boardService: any;

beforeEach(async () => {
  localStorage.clear();
  await vi.resetModules();
  const mod = await import("./boardService");
  boardService = mod.boardService;
});

describe("boardService", () => {
  it("uploads a board and sets last board id", async () => {
    const block: Board = [
      [1, 1],
      [1, 1],
    ];

    const id = await boardService.uploadBoard(block);

    expect(typeof id).toBe("string");
    const last = localStorage.getItem("game-of-life-last-board-id");
    expect(last).toBe(id);

    const lastBoard = await boardService.getLastBoard();
    expect(lastBoard).not.toBeNull();
    expect(lastBoard.id).toBe(id);
    expect(lastBoard.board).toEqual(block);
  });

  it("getNextState evolves the board and updates storage", async () => {
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

    const id = await boardService.uploadBoard(vertical);

    const next = await boardService.getNextState(id);

    expect(next).toEqual(horizontal);

    const last = localStorage.getItem("game-of-life-last-board-id");
    expect(last).toBe(id);
  });

  it("getStatesAhead throws on negative steps and returns no-op for 0 steps", async () => {
    const block: Board = [
      [1, 1],
      [1, 1],
    ];

    const id = await boardService.uploadBoard(block);

    await expect(boardService.getStatesAhead(id, -1)).rejects.toThrow();

    const states = await boardService.getStatesAhead(id, 0);
    expect(states).toEqual([]);
    // last board should not change
    const last = localStorage.getItem("game-of-life-last-board-id");
    expect(last).toBe(id);
  });

  it("getStatesAhead advances state and updates storage when steps > 0", async () => {
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

    const id = await boardService.uploadBoard(vertical);

    const states = await boardService.getStatesAhead(id, 1);
    expect(states).toHaveLength(1);
    expect(states[0]).toEqual(horizontal);

    const last = localStorage.getItem("game-of-life-last-board-id");
    expect(last).toBe(id);
  });

  it("getFinalState validates maxIterations and detects STABLE and OSCILLATION", async () => {
    const block: Board = [
      [1, 1],
      [1, 1],
    ];

    const idBlock = await boardService.uploadBoard(block);
    const stable = await boardService.getFinalState(idBlock, 10);
    expect(stable.reason).toBe("STABLE");
    expect(stable.stepsTaken).toBe(1);

    const vertical: Board = [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ];

    const idBlinker = await boardService.uploadBoard(vertical);
    const oscillation = await boardService.getFinalState(idBlinker, 10);
    expect(oscillation.reason).toBe("OSCILLATION");
    expect(oscillation.stepsTaken).toBeGreaterThanOrEqual(2);

    await expect(boardService.getFinalState(idBlinker, 1)).rejects.toThrow(
      /did not reach a final state within 1 iteration/iu
    );

    await expect(boardService.getFinalState(idBlinker, 0)).rejects.toThrow();
  });

  it("listBoards and deleteBoard work and delete clears last id when appropriate", async () => {
    const a: Board = [
      [1, 0],
      [0, 1],
    ];
    const b: Board = [
      [0, 1],
      [1, 0],
    ];

    const boardIdA = await boardService.uploadBoard(a);
    const boardIdB = await boardService.uploadBoard(b);

    const list = await boardService.listBoards();
    const ids = list.map((x: any) => x.id);
    expect(ids).toEqual(expect.arrayContaining([boardIdA, boardIdB]));

    // delete B (which was the last uploaded)
    await boardService.deleteBoard(boardIdB);
    const last = localStorage.getItem("game-of-life-last-board-id");
    // since last was idB, it should be removed
    expect(last).not.toBe(boardIdB);

    // deleting a non-last id should not throw
    await boardService.deleteBoard(boardIdA);
    const listAfter = await boardService.listBoards();
    expect(listAfter.length).toBe(0);
  });
});
