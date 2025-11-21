import type { Board, BoardId } from "../domain/types";

export interface BoardRepository {
  saveBoard(board: Board): Promise<BoardId>;
  updateBoard(id: BoardId, board: Board): Promise<void>;
  getBoard(id: BoardId): Promise<Board | null>;
  getAllBoards(): Promise<Record<BoardId, Board>>;
  deleteBoard(id: BoardId): Promise<void>;
}
