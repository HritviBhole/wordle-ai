export default function AlgorithmInfo({ info, attempt }) {
  const maxEntropy = 8.5;
  const entropyPct = info ? Math.min((info.entropy / maxEntropy) * 100, 100) : 0;

  return (
    <div className="algo-panel">
      <div className="panel-title">Algorithm Metrics</div>

      {!info ? (
        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7 }}>
          Start a game to see real-time entropy scoring and NLP metrics.
        </div>
      ) : (
        <>
          <div className="algo-stat">
            <span className="algo-stat-label">Entropy Score</span>
            <span className="algo-stat-value">{info.entropy?.toFixed(3)} bits</span>
          </div>

          {info.bitsGained !== null && info.bitsGained !== undefined && (
            <div className="algo-stat">
              <span className="algo-stat-label">Information Gained</span>
              <span className="algo-stat-value green-val">+{info.bitsGained} bits</span>
            </div>
          )}

          {info.candidatesBefore && (
            <div className="algo-stat">
              <span className="algo-stat-label">Candidates Before</span>
              <span className="algo-stat-value yellow-val">{info.candidatesBefore}</span>
            </div>
          )}

          {info.candidatesAfter !== undefined && (
            <div className="algo-stat">
              <span className="algo-stat-label">Candidates After</span>
              <span className="algo-stat-value green-val">{info.candidatesAfter}</span>
            </div>
          )}

          <div className="entropy-bar-wrap">
            <div className="entropy-bar-label">
              <span>Entropy Level</span>
              <span>{entropyPct.toFixed(0)}%</span>
            </div>
            <div className="entropy-bar">
              <div
                className="entropy-fill"
                style={{ width: `${entropyPct}%` }}
              />
            </div>
          </div>

          <div className="technique-tag">
            ◈ {info.technique || "Shannon Entropy"}
          </div>
        </>
      )}

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.8, letterSpacing: "0.02em" }}>
          <strong style={{ color: "var(--text-dim)", display: "block", marginBottom: 4 }}>
            HOW IT WORKS
          </strong>
          Scores each candidate word by Shannon entropy:
          <code style={{ display: "block", margin: "6px 0", padding: "6px 8px", background: "var(--surface-2)", borderRadius: 2, fontSize: 10, color: "var(--accent)" }}>
            H = -Σ p(x) · log₂(p(x))
          </code>
          The guess that maximizes H splits the candidate pool most evenly, gaining maximum information per attempt.
        </div>
      </div>
    </div>
  );
}
