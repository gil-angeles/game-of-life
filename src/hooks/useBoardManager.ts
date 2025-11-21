import { useEffect, useState } from "react";
import { boardService } from "../api/boardService";
import type { Board, BoardId } from "../domain/types";

type ActionState = "idle" | "upload" | "next" | "ahead" | "final";

export type SavedBoard = {
  id: BoardId;
  board: Board;
};

function parseBoard(text: string): Board {
  const rows = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) =>
      line.split(/\s+/).map((token) => {
        if (token !== "0" && token !== "1") {
          throw new Error(
            `Invalid cell value "${token}". Only 0 or 1 are allowed.`
          );
        }
        return token === "1" ? 1 : 0;
      })
    );

  if (rows.length === 0) {
    throw new Error("Board must have at least one row.");
  }

  const width = rows[0].length;
  if (!rows.every((row) => row.length === width)) {
    throw new Error("All rows must have the same number of columns.");
  }

  return rows;
}

export function useBoardManager() {
  const [boardText, setBoardText] = useState<string>("0 1 0\n1 1 1\n0 1 0");
  const [board, setBoard] = useState<Board | null>(null);
  const [boardId, setBoardId] = useState<BoardId | null>(null);

  const [stepsAhead, setStepsAhead] = useState<number>(5);
  const [maxIterations, setMaxIterations] = useState<number>(50);

  const [status, setStatus] = useState<string>("Ready");
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<ActionState>("idle");

  const [savedBoards, setSavedBoards] = useState<SavedBoard[]>([]);

  const isBusy = action !== "idle";

  async function refreshSavedBoards() {
    try {
      const boards = await boardService.listBoards();
      setSavedBoards(boards);
    } catch (err) {
      console.error("Failed to load saved boards", err);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const restored = await boardService.getLastBoard();
        if (restored) {
          setBoardId(restored.id);
          setBoard(restored.board);
          setStatus(`Restored board ${restored.id}`);
          setError(null);
        }
        await refreshSavedBoards();
      } catch (err) {
        console.error("Failed to restore last board", err);
      }
    })();
  }, []);

  async function handleUpload() {
    setError(null);
    setStatus("Uploading board…");
    setAction("upload");
    try {
      const parsed = parseBoard(boardText);
      const id = await boardService.uploadBoard(parsed);
      setBoard(parsed);
      setBoardId(id);
      setStatus(`Board uploaded with ID: ${id}`);
      await refreshSavedBoards();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("Failed to upload board");
    } finally {
      setAction("idle");
    }
  }

  async function handleNext() {
    if (!boardId) {
      setError("No board selected.");
      return;
    }
    setError(null);
    setStatus("Computing next state…");
    setAction("next");
    try {
      const next = await boardService.getNextState(boardId);
      setBoard(next);
      setStatus("Advanced to next state.");
      await refreshSavedBoards();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("Failed to compute next state");
    } finally {
      setAction("idle");
    }
  }

  async function handleStatesAhead() {
    if (!boardId) {
      setError("No board selected.");
      return;
    }
    if (stepsAhead < 0) {
      setError("Steps must be greater than or equal to 0.");
      return;
    }
    setError(null);
    setStatus(`Computing ${stepsAhead} states ahead…`);
    setAction("ahead");
    try {
      const states = await boardService.getStatesAhead(boardId, stepsAhead);
      if (states.length > 0) {
        setBoard(states[states.length - 1]);
      }
      setStatus(`Advanced ${stepsAhead} steps ahead.`);
      await refreshSavedBoards();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("Failed to compute future states");
    } finally {
      setAction("idle");
    }
  }

  async function handleFinal() {
    if (!boardId) {
      setError("No board selected.");
      return;
    }
    setError(null);
    setStatus("Searching for final state…");
    setAction("final");
    try {
      const result = await boardService.getFinalState(boardId, maxIterations);
      setBoard(result.finalBoard);
      setStatus(
        `Final state after ${result.stepsTaken} steps (${result.reason}).`
      );
      await refreshSavedBoards();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("Failed to reach final state");
    } finally {
      setAction("idle");
    }
  }

  function handleSelectSavedBoard(savedBoard: SavedBoard) {
    setBoardId(savedBoard.id);
    setBoard(savedBoard.board);
    setStatus(`Loaded board ${savedBoard.id}`);
    setError(null);
    localStorage.setItem("game-of-life-last-board-id", savedBoard.id);
  }

  async function handleDeleteSavedBoard(id: BoardId) {
    try {
      await boardService.deleteBoard(id);
      setStatus(`Deleted board ${id}.`);
      if (boardId === id) {
        setBoardId(null);
        setBoard(null);
      }
      await refreshSavedBoards();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to delete board");
    }
  }

  return {
    boardText,
    board,
    boardId,
    stepsAhead,
    maxIterations,
    status,
    error,
    savedBoards,
    isBusy,

    setBoardText,
    setStepsAhead,
    setMaxIterations,

    handleUpload,
    handleNext,
    handleStatesAhead,
    handleFinal,
    handleSelectSavedBoard,
    handleDeleteSavedBoard,
  };
}
