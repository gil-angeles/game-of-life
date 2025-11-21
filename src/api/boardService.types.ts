import type { Board, BoardId, FinalStateResult } from "../domain/types";

export interface BoardService {
  uploadBoard(board: Board): Promise<BoardId>;
  getNextState(id: BoardId): Promise<Board>;
  getStatesAhead(id: BoardId, steps: number): Promise<Board[]>;
  getFinalState(id: BoardId, maxIterations: number): Promise<FinalStateResult>;
  getLastBoard(): Promise<{ id: BoardId; board: Board } | null>;
  listBoards(): Promise<Array<{ id: BoardId; board: Board }>>;
  deleteBoard(id: BoardId): Promise<void>;
}
