import type { BoardService } from "./boardService.types";
import type { Board, BoardId, FinalStateResult } from "../domain/types";
import { localStorageBoardRepository } from "../storage/boardRepository";
import { BoardSchema } from "../domain/validators";
import {
  getNextBoard,
  boardsAreEqual,
  serializeBoard,
} from "../domain/gameOfLife";

const LAST_BOARD_ID_KEY = "game-of-life-last-board-id";

async function validateBoard(board: Board): Promise<Board> {
  return BoardSchema.parse(board);
}

export const boardService: BoardService = {
  async uploadBoard(board) {
    const validBoard = await validateBoard(board);
    const id = await localStorageBoardRepository.saveBoard(validBoard);

    localStorage.setItem(LAST_BOARD_ID_KEY, id);

    return id;
  },

  async getNextState(id: BoardId) {
    const board = await localStorageBoardRepository.getBoard(id);
    if (!board) {
      throw new Error(`Board not found: ${id}`);
    }

    const next = getNextBoard(board);
    await localStorageBoardRepository.updateBoard(id, next);

    localStorage.setItem(LAST_BOARD_ID_KEY, id);

    return next;
  },

  async getStatesAhead(id: BoardId, steps: number) {
    if (steps < 0) {
      throw new Error("Steps must be a non-negative number");
    }

    const startBoard = await localStorageBoardRepository.getBoard(id);
    if (!startBoard) {
      throw new Error(`Board not found: ${id}`);
    }

    const states: Board[] = [];
    let current = startBoard;

    for (let i = 0; i < steps; i++) {
      const next = getNextBoard(current);
      states.push(next);
      current = next;
    }

    if (steps > 0) {
      await localStorageBoardRepository.updateBoard(id, current);
      localStorage.setItem(LAST_BOARD_ID_KEY, id);
    }

    return states;
  },

  async getFinalState(
    id: BoardId,
    maxIterations: number
  ): Promise<FinalStateResult> {
    if (maxIterations <= 0) {
      throw new Error("maxIterations must be greater than 0");
    }

    const startBoard = await localStorageBoardRepository.getBoard(id);
    if (!startBoard) {
      throw new Error(`Board not found: ${id}`);
    }

    let current = startBoard;
    const seen = new Set<string>();
    seen.add(serializeBoard(current));

    for (let step = 1; step <= maxIterations; step++) {
      const next = getNextBoard(current);

      if (boardsAreEqual(current, next)) {
        await localStorageBoardRepository.updateBoard(id, next);
        localStorage.setItem(LAST_BOARD_ID_KEY, id);

        return {
          finalBoard: next,
          stepsTaken: step,
          reason: "STABLE",
        };
      }

      const serialized = serializeBoard(next);

      if (seen.has(serialized)) {
        await localStorageBoardRepository.updateBoard(id, next);
        localStorage.setItem(LAST_BOARD_ID_KEY, id);

        return {
          finalBoard: next,
          stepsTaken: step,
          reason: "OSCILLATION",
        };
      }

      seen.add(serialized);
      current = next;
    }

    throw new Error(
      `Board did not reach a final state within ${maxIterations} iteration${maxIterations === 1 ? "" : "s"}.`
    );
  },

  async getLastBoard() {
    const lastId = localStorage.getItem(LAST_BOARD_ID_KEY);
    if (!lastId) return null;

    const board = await localStorageBoardRepository.getBoard(lastId);
    if (!board) return null;

    return { id: lastId, board };
  },

  async listBoards() {
    const allBoards = await localStorageBoardRepository.getAllBoards();
    return Object.entries(allBoards).map(([id, board]) => ({
      id: id as BoardId,
      board,
    }));
  },

  async deleteBoard(id: BoardId) {
    await localStorageBoardRepository.deleteBoard(id);

    const lastId = localStorage.getItem(LAST_BOARD_ID_KEY);
    if (lastId === id) {
      localStorage.removeItem(LAST_BOARD_ID_KEY);
    }
  },
};
