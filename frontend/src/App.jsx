import { useState, useEffect, useCallback } from "react";
import GameBoard from "./components/GameBoard";
import FeedbackInput from "./components/FeedbackInput";
import CandidatePanel from "./components/CandidatePanel";
import AlgorithmInfo from "./components/AlgorithmInfo";
import Header from "./components/Header";
import { useWordleGame } from "./hooks/useWordleGame";
import "./App.css";

export default function App() {
  const {
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
  } = useWordleGame();

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <div className="app-layout">
        <Header onReset={resetGame} attempts={attempts} maxAttempts={maxAttempts} />

        <main className="main-content">
          <div className="left-panel">
            <GameBoard
              history={history}
              currentGuess={currentGuess}
              solved={solved}
              loading={loading}
            />

            {!sessionId && !loading && (
              <button className="start-btn" onClick={startGame}>
                <span className="btn-icon">◎</span>
                Start Solving
              </button>
            )}

            {sessionId && !solved && currentGuess && (
              <FeedbackInput
                guess={currentGuess}
                onSubmit={submitFeedback}
                loading={loading}
                attempt={attempts}
                maxAttempts={maxAttempts}
              />
            )}

            {solved && (
              <div className="solved-banner">
                <div className="solved-icon">✦</div>
                <h2>Solved in {attempts} {attempts === 1 ? "guess" : "guesses"}!</h2>
                <p>The word was <strong>{history[history.length - 1]?.guess}</strong></p>
                <button className="start-btn" onClick={resetGame}>
                  Play Again
                </button>
              </div>
            )}

            {error && (
              <div className="error-banner">
                <span>⚠ {error}</span>
              </div>
            )}
          </div>

          <div className="right-panel">
            <AlgorithmInfo info={algorithmInfo} attempt={attempts} />
            <CandidatePanel candidates={candidates} currentGuess={currentGuess} />
          </div>
        </main>
      </div>
    </div>
  );
}
