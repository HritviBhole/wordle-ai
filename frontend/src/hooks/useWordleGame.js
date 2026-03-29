import { useState, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useWordleGame() {
  const [sessionId, setSessionId] = useState(null);
  const [currentGuess, setCurrentGuess] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 4;
  const [candidates, setCandidates] = useState([]);
  const [history, setHistory] = useState([]);
  const [algorithmInfo, setAlgorithmInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [solved, setSolved] = useState(false);
  const [error, setError] = useState(null);

  const startGame = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/start_game`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to start game");
      const data = await res.json();

      setSessionId(data.session_id);
      setCurrentGuess(data.first_guess);
      setAttempts(1);
      setCandidates([]);
      setHistory([]);
      setSolved(false);
      setAlgorithmInfo({
        technique: "Shannon Entropy Maximization",
        entropy: data.entropy_score,
        candidatesBefore: data.candidate_count,
        candidatesAfter: data.candidate_count,
        bitsGained: null,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitFeedback = useCallback(async (feedback) => {
    if (!sessionId || !currentGuess) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/next_guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          guess: currentGuess,
          feedback,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "API error");
      }

      const data = await res.json();

      // Add to history
      setHistory((prev) => [
        ...prev,
        { guess: currentGuess, feedback, attempt: attempts },
      ]);

      if (data.solved) {
        setSolved(true);
        setAttempts(data.attempt);
        setCandidates([data.next_guess]);
      } else {
        setCurrentGuess(data.next_guess);
        setAttempts(data.attempt);
        setCandidates(data.top_candidates || []);
        setAlgorithmInfo({
          technique: "Shannon Entropy Maximization",
          entropy: data.entropy_score,
          candidatesBefore: data.algorithm_info?.candidates_before,
          candidatesAfter: data.candidates_remaining,
          bitsGained: data.algorithm_info?.bits_gained,
        });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId, currentGuess, attempts]);

  const resetGame = useCallback(async () => {
    if (sessionId) {
      try {
        await fetch(`${API_BASE}/reset_game/${sessionId}`, { method: "POST" });
      } catch (_) {}
    }
    setSessionId(null);
    setCurrentGuess(null);
    setAttempts(0);
    setCandidates([]);
    setHistory([]);
    setAlgorithmInfo(null);
    setSolved(false);
    setError(null);
  }, [sessionId]);

  return {
    sessionId,
    currentGuess,
    attempts,
    maxAttempts,
    candidates,
    history,
    algorithmInfo,
    loading,
    solved,
    error,
    startGame,
    submitFeedback,
    resetGame,
  };
}
