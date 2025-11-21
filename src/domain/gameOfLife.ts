import type { Board } from "./types";

type CellKey = `${number},${number}`;

const ADJACENT_OFFSETS: [number, number][] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function convertRowColumnToCellKey(
  rowIndex: number,
  columnIndex: number
): CellKey {
  return `${rowIndex},${columnIndex}`;
}

function convertCellKeyToRowColumn(cellKey: CellKey): [number, number] {
  return cellKey.split(",").map(Number) as [number, number];
}

function isInsideBoard(
  board: Board,
  rowIndex: number,
  columnIndex: number
): boolean {
  return (
    rowIndex >= 0 &&
    rowIndex < board.length &&
    columnIndex >= 0 &&
    columnIndex < board[0].length
  );
}

function buildNeighborLiveCounts(board: Board): Map<CellKey, number> {
  const neighborLiveCounts = new Map<CellKey, number>();

  const rowCount = board.length;
  const columnCount = board[0].length;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      const cellIsAlive = board[rowIndex][columnIndex] === 1;
      if (!cellIsAlive) continue;

      for (const [rowOffset, columnOffset] of ADJACENT_OFFSETS) {
        const neighborRowIndex = rowIndex + rowOffset;
        const neighborColumnIndex = columnIndex + columnOffset;

        if (!isInsideBoard(board, neighborRowIndex, neighborColumnIndex)) {
          continue;
        }

        const neighborKey = convertRowColumnToCellKey(
          neighborRowIndex,
          neighborColumnIndex
        );
        neighborLiveCounts.set(
          neighborKey,
          (neighborLiveCounts.get(neighborKey) ?? 0) + 1
        );
      }
    }
  }

  return neighborLiveCounts;
}

export function getNextBoard(currentBoard: Board): Board {
  const rowCount = currentBoard.length;
  const columnCount = currentBoard[0].length;

  const neighborLiveCounts = buildNeighborLiveCounts(currentBoard);

  const nextBoard: Board = Array.from({ length: rowCount }, () =>
    Array(columnCount).fill(0)
  );

  for (const [cellKey, liveNeighborCount] of neighborLiveCounts) {
    const [rowIndex, columnIndex] = convertCellKeyToRowColumn(cellKey);
    const cellIsAlive = currentBoard[rowIndex][columnIndex] === 1;

    const cellSurvives =
      cellIsAlive && (liveNeighborCount === 2 || liveNeighborCount === 3);
    const cellBecomesAlive = !cellIsAlive && liveNeighborCount === 3;

    if (cellSurvives || cellBecomesAlive) {
      nextBoard[rowIndex][columnIndex] = 1;
    }
  }

  return nextBoard;
}

export function boardsAreEqual(firstBoard: Board, secondBoard: Board): boolean {
  if (firstBoard.length !== secondBoard.length) return false;
  if (firstBoard[0].length !== secondBoard[0].length) return false;

  const rowCount = firstBoard.length;
  const columnCount = firstBoard[0].length;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      if (
        firstBoard[rowIndex][columnIndex] !== secondBoard[rowIndex][columnIndex]
      ) {
        return false;
      }
    }
  }

  return true;
}

export function serializeBoard(board: Board): string {
  return board.map((rowValues) => rowValues.join("")).join("|");
}
