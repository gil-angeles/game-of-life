export type CellState = 0 | 1;

export type Board = CellState[][];

export type BoardId = string;

export type FinalStateReason = "STABLE" | "OSCILLATION";

export interface FinalStateResult {
  finalBoard: Board;
  stepsTaken: number;
  reason: FinalStateReason;
}
