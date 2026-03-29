import { useEffect, useState } from "react";

function Tile({ letter, color, delay = 0 }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (color && color !== "empty") {
      const t = setTimeout(() => setRevealed(true), delay);
      return () => clearTimeout(t);
    }
  }, [color, delay]);

  return (
    <div
      className={`tile ${color || "empty"} ${revealed && color ? "tile-reveal" : ""}`}
    >
      {letter || ""}
    </div>
  );
}

function HistoryRow({ entry, rowNum }) {
  return (
    <div className="guess-row">
      <span className="guess-number">{rowNum}</span>
      <div className="guess-tiles">
        {entry.guess.split("").map((letter, i) => (
          <Tile
            key={i}
            letter={letter}
            color={entry.feedback[i]}
            delay={i * 80}
          />
        ))}
      </div>
    </div>
  );
}

function CurrentRow({ guess, rowNum }) {
  return (
    <div className="guess-row">
      <span className="guess-number">{rowNum}</span>
      <div className="guess-tiles">
        {guess.split("").map((letter, i) => (
          <Tile key={i} letter={letter} color="current" />
        ))}
      </div>
    </div>
  );
}

function EmptyRow({ rowNum }) {
  return (
    <div className="guess-row">
      <span className="guess-number" style={{ opacity: 0.2 }}>{rowNum}</span>
      <div className="guess-tiles">
        {Array.from({ length: 5 }).map((_, i) => (
          <Tile key={i} color="empty" />
        ))}
      </div>
    </div>
  );
}

export default function GameBoard({ history, currentGuess, solved, loading }) {
  const MAX_ROWS = 6;

  if (!history.length && !currentGuess) {
    // Welcome placeholder
    return (
      <div className="welcome-state">
        <div className="board-placeholder">
          {Array.from({ length: 6 }).map((_, r) => (
            <div key={r} className="placeholder-row">
              {Array.from({ length: 5 }).map((_, c) => (
                <div key={c} className="placeholder-tile" style={{ animationDelay: `${(r * 5 + c) * 50}ms` }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="game-board">
        {history.map((entry, idx) => (
          <HistoryRow key={idx} entry={entry} rowNum={idx + 1} />
        ))}
        {currentGuess && !solved && (
          <CurrentRow
            guess={currentGuess}
            rowNum={history.length + 1}
          />
        )}
        {!solved && Array.from({ length: MAX_ROWS - history.length - (currentGuess ? 1 : 0) }).map((_, i) => (
          <EmptyRow key={i} rowNum={history.length + (currentGuess ? 1 : 0) + i + 1} />
        ))}
      </div>

      {currentGuess && !solved && (
        <div style={{ marginBottom: 24 }}>
          <div className="current-guess-label">Next Guess →</div>
          <div className="current-guess-word">{currentGuess}</div>
          {loading && (
            <div className="loading-overlay">
              <div className="spinner" />
              <span>Computing optimal guess…</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}