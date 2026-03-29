export default function CandidatePanel({ candidates, currentGuess }) {
  if (!candidates.length) {
    return (
      <div className="candidates-panel">
        <div className="panel-title">Candidate Words</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Remaining candidates will appear here after the first guess.
        </div>
      </div>
    );
  }

  return (
    <div className="candidates-panel">
      <div className="panel-title">Candidate Words</div>
      <div className="candidates-count">{candidates.length}</div>
      <div className="candidates-subtitle">possible words remaining</div>
      <div className="candidates-grid">
        {candidates.map((word, i) => (
          <span
            key={word}
            className={`candidate-word ${word === currentGuess ? "top-pick" : ""}`}
          >
            {word}
          </span>
        ))}
      </div>
      {candidates.length > 10 && (
        <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 10 }}>
          Showing top {Math.min(candidates.length, 10)} candidates
        </div>
      )}
    </div>
  );
}
