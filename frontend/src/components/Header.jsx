export default function Header({ onReset, attempts, maxAttempts }) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          Wordle<span>.</span>AI
        </div>
        <span className="header-tag">Entropy Solver</span>
      </div>
      <div className="header-right">
        {attempts > 0 && (
          <div className="attempt-counter">
            {Array.from({ length: maxAttempts }).map((_, i) => (
              <div
                key={i}
                className={`attempt-pip ${
                  i < attempts ? (i === maxAttempts - 1 ? "used last" : "used") : ""
                }`}
              />
            ))}
          </div>
        )}
        <button className="reset-btn" onClick={onReset}>
          ↺ Reset
        </button>
      </div>
    </header>
  );
}
