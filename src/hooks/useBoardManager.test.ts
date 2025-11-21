import { describe, it, expect, vi, beforeEach, type Mocked } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useBoardManager } from "./useBoardManager";
import { boardService } from "../api/boardService";
import type { Board } from "../domain/types";

vi.mock("../api/boardService", () => {
  return {
    boardService: {
      uploadBoard: vi.fn(),
      getNextState: vi.fn(),
      getStatesAhead: vi.fn(),
      getFinalState: vi.fn(),
      listBoards: vi.fn(),
      getLastBoard: vi.fn(),
      deleteBoard: vi.fn(),
    },
  };
});

const mockedBoardService = boardService as Mocked<typeof boardService>;

const SAMPLE_BOARD: Board = [
  [0, 1, 0],
  [1, 1, 1],
  [0, 1, 0],
];

const NEXT_BOARD: Board = [
  [1, 1],
  [1, 1],
];

const STATES_AHEAD: Board[] = [
  [
    [1, 0],
    [0, 1],
  ],
  [
    [0, 1],
    [1, 0],
  ],
];

const FINAL_BOARD: Board = [
  [0, 0],
  [0, 0],
];

describe("useBoardManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    mockedBoardService.listBoards.mockResolvedValue([]);
    mockedBoardService.getLastBoard.mockResolvedValue(null);
  });

  it("restores last board on mount", async () => {
    mockedBoardService.getLastBoard.mockResolvedValue({
      id: "board-99",
      board: SAMPLE_BOARD,
    });

    const { result } = renderHook(() => useBoardManager());

    await waitFor(() => {
      expect(result.current.boardId).toBe("board-99");
    });

    expect(result.current.board).toEqual(SAMPLE_BOARD);
    expect(result.current.status).toContain("Restored board board-99");
  });

  it("uploads a board successfully", async () => {
    mockedBoardService.uploadBoard.mockResolvedValue("board-1");
    mockedBoardService.listBoards.mockResolvedValue([
      { id: "board-1", board: SAMPLE_BOARD },
    ]);

    const { result } = renderHook(() => useBoardManager());

    await act(async () => {
      await result.current.handleUpload();
    });

    expect(mockedBoardService.uploadBoard).toHaveBeenCalled();
    expect(result.current.boardId).toBe("board-1");
    expect(result.current.board).toEqual(SAMPLE_BOARD);
    expect(result.current.savedBoards.length).toBe(1);
  });

  it("advances to the next state", async () => {
    mockedBoardService.getNextState.mockResolvedValue(NEXT_BOARD);

    const { result } = renderHook(() => useBoardManager());

    act(() => {
      result.current.handleSelectSavedBoard({
        id: "board-1",
        board: SAMPLE_BOARD,
      });
    });

    await act(async () => {
      await result.current.handleNext();
    });

    expect(mockedBoardService.getNextState).toHaveBeenCalledWith("board-1");
    expect(result.current.board).toEqual(NEXT_BOARD);
  });

  it("gets states ahead", async () => {
    mockedBoardService.getStatesAhead.mockResolvedValue(STATES_AHEAD);

    const { result } = renderHook(() => useBoardManager());

    act(() => {
      result.current.handleSelectSavedBoard({
        id: "board-2",
        board: SAMPLE_BOARD,
      });
      result.current.setStepsAhead(2);
    });

    await act(async () => {
      await result.current.handleStatesAhead();
    });

    expect(mockedBoardService.getStatesAhead).toHaveBeenCalledWith(
      "board-2",
      2
    );
    expect(result.current.board).toEqual(STATES_AHEAD[STATES_AHEAD.length - 1]);
  });

  it("computes final state", async () => {
    mockedBoardService.getFinalState.mockResolvedValue({
      finalBoard: FINAL_BOARD,
      stepsTaken: 3,
      reason: "STABLE",
    });

    const { result } = renderHook(() => useBoardManager());

    act(() => {
      result.current.handleSelectSavedBoard({
        id: "board-x",
        board: SAMPLE_BOARD,
      });
      result.current.setMaxIterations(10);
    });

    await act(async () => {
      await result.current.handleFinal();
    });

    expect(mockedBoardService.getFinalState).toHaveBeenCalledWith(
      "board-x",
      10
    );
    expect(result.current.board).toEqual(FINAL_BOARD);
    expect(result.current.status).toContain("Final state after");
  });

  it("selecting a saved board updates state and localStorage", () => {
    const { result } = renderHook(() => useBoardManager());

    act(() => {
      result.current.handleSelectSavedBoard({
        id: "board-5",
        board: SAMPLE_BOARD,
      });
    });

    expect(result.current.boardId).toBe("board-5");
    expect(result.current.board).toEqual(SAMPLE_BOARD);
    expect(localStorage.getItem("game-of-life-last-board-id")).toBe("board-5");
  });

  it("deletes a board", async () => {
    mockedBoardService.deleteBoard.mockResolvedValue();

    const { result } = renderHook(() => useBoardManager());

    act(() => {
      result.current.handleSelectSavedBoard({
        id: "board-7",
        board: SAMPLE_BOARD,
      });
    });

    await act(async () => {
      await result.current.handleDeleteSavedBoard("board-7");
    });

    expect(mockedBoardService.deleteBoard).toHaveBeenCalledWith("board-7");
    expect(result.current.boardId).toBe(null);
    expect(result.current.board).toBe(null);
  });

  it("errors if next state is requested without a selected board", async () => {
    const { result } = renderHook(() => useBoardManager());

    await act(async () => {
      await result.current.handleNext();
    });

    expect(result.current.error).toBe("No board selected.");
  });
});
