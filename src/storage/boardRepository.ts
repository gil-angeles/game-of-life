import type { BoardRepository } from "./boardRepository.types";
import type { Board, BoardId } from "../domain/types";

const STORAGE_KEY = "game-of-life-boards";
const COUNTER_KEY = "game-of-life-board-counter";

function loadAll(): Record<BoardId, Board> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveAll(data: Record<BoardId, Board>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let inMemory = loadAll();

function initializeCounter(): number {
  const stored = localStorage.getItem(COUNTER_KEY);
  if (stored !== null) {
    const num = Number(stored);
    if (Number.isFinite(num) && num >= 0) {
      return num;
    }
  }

  const max = Object.keys(inMemory).reduce((acc, key) => {
    const parts = key.split("-");
    const num = Number(parts[1]);
    return Number.isFinite(num) && num > acc ? num : acc;
  }, 0);

  localStorage.setItem(COUNTER_KEY, String(max));
  return max;
}

let nextId = initializeCounter();

function getNextId(): BoardId {
  nextId++;
  localStorage.setItem(COUNTER_KEY, String(nextId));
  return `board-${nextId}`;
}

export const localStorageBoardRepository: BoardRepository = {
  async saveBoard(board) {
    const id = getNextId();
    inMemory[id] = board;
    saveAll(inMemory);
    return id;
  },

  async updateBoard(id, board) {
    inMemory[id] = board;
    saveAll(inMemory);
  },

  async getBoard(id) {
    return inMemory[id] ?? null;
  },

  async getAllBoards() {
    return inMemory;
  },

  async deleteBoard(id) {
    delete inMemory[id];
    saveAll(inMemory);
  },
};
