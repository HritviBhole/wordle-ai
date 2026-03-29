import { useState } from "react";

const COLORS = ["gray", "yellow", "green"];
const COLOR_LABELS = { gray: "Not in word", yellow: "Wrong position", green: "Correct!" };

export default function FeedbackInput({ guess, onSubmit, loading, attempt, maxAttempts }) {
  const [feedback, setFeedback] = useState(Array(5).fill("gray"));

  const cycleTile = (index) => {
    setFeedback((prev) => {
      const next = [...prev];
      const currentIdx = COLORS.indexOf(next[index]);
      next[index] = COLORS[(currentIdx + 1) % COLORS.length];
      return next;
    });
  };

  const handleSubmit = () => {
    onSubmit(feedback);
    setFeedback(Array(5).fill("gray"));
  };

  const allGray = feedback.every((c) => c === "gray");

  return (
    <div className="feedback-section">
      <div className="feedback-title">
        Enter Wordle Feedback — Attempt {attempt}/{maxAttempts}
      </div>

      <div className="feedback-word">
        {guess.split("").map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>

      <div style={{ marginBottom: 12, fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
        Click each tile to cycle: Gray → Yellow → Green
      </div>

      <div className="feedback-tiles">
        {guess.split("").map((letter, i) => (
          <button
            key={i}
            className={`feedback-tile ${feedback[i]}`}
            onClick={() => cycleTile(i)}
            title={COLOR_LABELS[feedback[i]]}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="feedback-legend">
        {Object.entries(COLOR_LABELS).map(([color, label]) => (
          <div key={color} className="legend-item">
            <div className={`legend-dot ${color}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <span className="loading-dots">
            Computing<span>.</span><span>.</span><span>.</span>
          </span>
        ) : (
          <>→ Submit Feedback &amp; Get Next Guess</>
        )}
      </button>
    </div>
  );
}
