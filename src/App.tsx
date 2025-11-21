import { useEffect, useState } from "react";
import BoardGrid from "./components/BoardGrid";
import {
  EXAMPLE_LOOP_1,
  EXAMPLE_LOOP_2,
  EXAMPLE_LOOP_3,
} from "./examples/boards";
import { useBoardManager } from "./hooks/useBoardManager";

function App() {
  const {
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
  } = useBoardManager();

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    if (!boardId) {
      setIsPlaying(false);
      return;
    }

    const timerId = window.setInterval(() => {
      if (!boardId || isBusy) return;
      handleNext();
    }, 700);

    return () => {
      window.clearInterval(timerId);
    };
  }, [isPlaying, boardId, isBusy, handleNext]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col">
      <header className="border-b border-slate-800 px-6 py-4">
        <h1 className="text-2xl font-bold">Game of Life Demo</h1>
        <p className="text-sm text-slate-400 mt-1">
          Frontend implementation with persistent boards.
        </p>
      </header>

      <main className="flex-1 px-6 py-6 flex gap-8 flex-col lg:flex-row">
        <section className="w-full lg:w-1/2 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">1. Upload board</h2>
            <p className="text-xs text-slate-400 mb-2">
              Use 0 and 1 separated by spaces. Each line is a row. Example shows
              3x3 but you can add more rows and columns.
            </p>
            <textarea
              className="w-full h-40 rounded-md bg-slate-950 border border-slate-700 text-sm p-2 font-mono"
              value={boardText}
              onChange={(e) => setBoardText(e.target.value)}
              disabled={isBusy}
            />
            <button
              onClick={async () => {
                setIsPlaying(false);
                await handleUpload();
              }}
              disabled={isBusy}
              className="mt-2 inline-flex items-center px-4 py-2 rounded-md bg-emerald-400 text-slate-900 font-semibold text-sm hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-900 shadow"
            >
              Upload board
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                setBoardText(EXAMPLE_LOOP_1);
              }}
              className="inline-flex items-center ml-2 px-3 py-2 rounded-md bg-slate-700 text-slate-50 font-semibold text-xs hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-800"
            >
              Fill example 1
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                setBoardText(EXAMPLE_LOOP_2);
              }}
              className="inline-flex items-center ml-2 px-3 py-2 rounded-md bg-slate-700 text-slate-50 font-semibold text-xs hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-800"
            >
              Fill example 2
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                setBoardText(EXAMPLE_LOOP_3);
              }}
              className="inline-flex items-center ml-2 px-3 py-2 rounded-md bg-slate-700 text-slate-50 font-semibold text-xs hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-800"
            >
              Fill example 3
            </button>
            {boardId && (
              <p className="mt-1 text-xs text-slate-400">
                Current board: <span className="font-mono">{boardId}</span>
              </p>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">2. Evolve board</h2>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNext}
                  disabled={isBusy || !boardId}
                  className="inline-flex items-center px-4 py-2 rounded-md bg-sky-400 text-slate-900 font-semibold text-sm hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-900 shadow"
                >
                  Next state + 1
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlaying((prev) => !prev)}
                  disabled={!boardId}
                  className="inline-flex items-center px-3 py-2 rounded-md bg-slate-600 text-slate-50 font-semibold text-xs hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-800"
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>
              </div>

              <div className="flex flex-wrap gap-3 items-end">
                <label className="text-xs text-slate-300">
                  Steps to jump
                  <input
                    type="number"
                    className="ml-2 w-20 rounded-md bg-slate-950 border border-slate-700 text-xs px-2 py-1"
                    value={stepsAhead}
                    onChange={(e) => setStepsAhead(Number(e.target.value))}
                    disabled={isBusy}
                    min={0}
                  />
                </label>
                <button
                  onClick={handleStatesAhead}
                  disabled={isBusy || !boardId}
                  className="inline-flex items-center px-3 py-2 rounded-md bg-indigo-400 text-slate-900 font-semibold text-xs hover:bg-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-900 shadow"
                >
                  {stepsAhead === 0
                    ? "Jump 0 steps"
                    : `Jump ${stepsAhead} steps`}
                </button>
              </div>

              <div className="flex flex-wrap gap-3 items-end">
                <label className="text-xs text-slate-300">
                  Max iterations
                  <input
                    type="number"
                    className="ml-2 w-24 rounded-md bg-slate-950 border border-slate-700 text-xs px-2 py-1"
                    value={maxIterations}
                    onChange={(e) => setMaxIterations(Number(e.target.value))}
                    disabled={isBusy}
                    min={1}
                  />
                </label>
                <button
                  onClick={handleFinal}
                  disabled={isBusy || !boardId}
                  className="inline-flex items-center px-3 py-2 rounded-md bg-amber-400 text-slate-900 font-semibold text-xs hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-900 shadow"
                >
                  Get final state
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2 text-xs">
            <p className="text-slate-300">
              <span className="font-semibold">Status:</span> {status}
            </p>
            {error && (
              <p className="text-red-400 mt-1">
                <span className="font-semibold">Error:</span> {error}
              </p>
            )}
          </div>

          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">3. Saved boards</h2>
            {savedBoards.length === 0 ? (
              <p className="text-xs text-slate-400">
                No saved boards yet. Upload a board to add it here.
              </p>
            ) : (
              <ul className="space-y-2 max-h-48 overflow-auto pr-1">
                {savedBoards.map((saved) => {
                  const rows = saved.board.length;
                  const cols = saved.board[0]?.length ?? 0;
                  const isSelected = saved.id === boardId;

                  return (
                    <li
                      key={saved.id}
                      className={`flex items-center justify-between rounded-md border px-2 py-1 text-xs ${
                        isSelected
                          ? "border-emerald-400 bg-slate-800"
                          : "border-slate-700 bg-slate-950"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-mono text-[11px]">
                          {saved.id}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {rows} × {cols}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSelectSavedBoard(saved)}
                          className="px-2 py-1 rounded-md bg-slate-700 text-slate-50 hover:bg-slate-600 text-[10px]"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteSavedBoard(saved.id)}
                          className="px-2 py-1 rounded-md bg-red-500 text-slate-900 hover:bg-red-400 text-[10px]"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="w-full lg:w-1/2">
          <h2 className="text-lg font-semibold mb-3">Current board</h2>
          <BoardGrid board={board} />
        </section>
      </main>
    </div>
  );
}

export default App;
