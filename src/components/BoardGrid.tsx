import type { Board } from "../domain/types";

type BoardGridProps = {
  board: Board | null;
};

function BoardGrid({ board }: BoardGridProps) {
  if (!board) {
    return (
      <div className="text-slate-300 italic">
        No board loaded yet. Upload it to start.
      </div>
    );
  }

  const rows = board.length;
  const cols = board[0].length;

  return (
    <div className="inline-block border border-slate-600 rounded-md bg-slate-900 p-2">
      <div
        className="grid gap-px"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1.5rem))`,
        }}
      >
        {board.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              className={`w-6 h-6 border border-slate-700 ${
                cell === 1 ? "bg-emerald-400" : "bg-slate-800"
              }`}
            />
          ))
        )}
      </div>
      <div className="mt-2 text-xs text-slate-400 text-right">
        {rows} × {cols}
      </div>
    </div>
  );
}

export default BoardGrid;
