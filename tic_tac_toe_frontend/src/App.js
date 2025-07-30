import React, { useState, useEffect } from 'react';
import './App.css';

// Utility: Returns the winner ('X' | 'O'), or 'Tie', or null
// PUBLIC_INTERFACE
function calculateWinner(squares) {
  /** Checks board for a winner or tie. Returns 'X', 'O', 'Tie', or null */
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6], // diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  if (squares.every(Boolean)) return 'Tie';
  return null;
}

// PUBLIC_INTERFACE
function getAIMove(squares) {
  /** Very simple AI: choose random empty square */
  const empty = squares
    .map((val, idx) => (val ? null : idx))
    .filter((x) => x !== null);
  if (empty.length === 0) return null;
  // Try center, then corners, then random as fallback for better human feel
  const order = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  for (let i of order) {
    if (empty.includes(i)) return i;
  }
  return empty[Math.floor(Math.random() * empty.length)];
}

// PUBLIC_INTERFACE
const MODES = {
  TWO: '2 Player',
  AI: 'Play vs AI',
};

const PLAYER_LABELS = {
  X: 'Player X',
  O: 'Player O',
  AI: 'Computer',
};

/**
 * PUBLIC_INTERFACE
 * Square UI component for the board
 */
function Square({ value, onClick, disabled, highlight }) {
  return (
    <button
      className={`ttt-square${highlight ? ' highlight' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={value ? `Square: ${value}` : 'Empty square'}
    >
      {value}
    </button>
  );
}

/**
 * PUBLIC_INTERFACE
 * GameBoard displays the grid and handles user move clicks.
 */
function GameBoard({
  squares,
  onSquareClick,
  disabled,
  winLine
}) {
  return (
    <div className="ttt-board">
      {squares.map((val, idx) => (
        <Square
          key={idx}
          value={val}
          disabled={disabled || !!val}
          highlight={winLine && winLine.includes(idx)}
          onClick={() => onSquareClick(idx)}
        />
      ))}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * ModeSelector lets user choose game mode.
 */
function ModeSelector({ currentMode, onChange }) {
  return (
    <div className="ttt-mode-selector">
      {Object.entries(MODES).map(([key, label]) => (
        <button
          key={key}
          className={`ttt-mode-btn${currentMode === key ? ' selected' : ''}`}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * StatusBar displays game status and winner/tie messages.
 */
function StatusBar({ status, winner, current, mode, aiThinking }) {
  let msg;
  if (winner === 'Tie') {
    msg = "It's a tie!";
  } else if (winner) {
    msg = `${PLAYER_LABELS[winner]} wins!`;
  } else if (aiThinking) {
    msg = "Computer is thinking...";
  } else {
    msg =
      mode === 'AI' && current === 'O'
        ? "Computer's turn"
        : `Turn: ${PLAYER_LABELS[current]}`;
  }
  return <div className="ttt-status-bar">{msg}</div>;
}

/**
 * PUBLIC_INTERFACE
 * RestartBar for reset/replay controls
 */
function RestartBar({ onRestart }) {
  return (
    <div className="ttt-restart-bar">
      <button className="ttt-restart-btn" onClick={onRestart}>
        Restart Game
      </button>
    </div>
  );
}

// PUBLIC_INTERFACE
function winningLine(squares) {
  /** Returns the winning line as array if exists, else null */
  const combos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let line of combos) {
    const [a, b, c] = line;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return line;
    }
  }
  return null;
}

/**
 * PUBLIC_INTERFACE
 * The main App entry point for Tic Tac Toe.
 * Provides a modern, centered, minimal UI with both 2P and AI modes.
 */
function App() {
  // Game state variables
  const [mode, setMode] = useState('TWO');
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXisNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);

  // Handle theme for this app (fixed as light mode per requirements)
  useEffect(() => {
    // Set colors for modern/minimal theme using provided palette
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.setProperty('--ttt-primary', '#1976d2');
    document.documentElement.style.setProperty('--ttt-secondary', '#424242');
    document.documentElement.style.setProperty('--ttt-accent', '#ffeb3b');
    document.documentElement.style.setProperty('--ttt-bg', '#fff');
    document.documentElement.style.setProperty('--ttt-board-bg', '#f7f9fa');
    document.documentElement.style.setProperty('--ttt-square-bg', '#fff');
    document.documentElement.style.setProperty('--ttt-shadow', '0 3px 16px 0 rgba(25,118,210,0.06)');
    document.documentElement.style.setProperty('--ttt-highlight', '#ffeb3b33');
  }, []);

  // Calculate winner and update state reactively
  useEffect(() => {
    const result = calculateWinner(squares);
    setWinner(result);
  }, [squares]);

  // AI effect
  useEffect(() => {
    if (
      mode === 'AI' &&
      !winner &&
      !xIsNext // If it's O's (AI's) turn
    ) {
      setAiThinking(true);
      const timeout = setTimeout(() => {
        const move = getAIMove(squares);
        if (move !== null) {
          handleMove(move);
        }
        setAiThinking(false);
      }, 500 + Math.random()*300); // slight delay for realism
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line
  }, [mode, xIsNext, winner, squares]);

  // PUBLIC_INTERFACE
  function resetGame() {
    /** Reset all game state for new round */
    setSquares(Array(9).fill(null));
    setXisNext(true);
    setWinner(null);
    setAiThinking(false);
  }

  // PUBLIC_INTERFACE
  function handleMove(idx) {
    /** Handles a move for the current player unless invalid */
    if (squares[idx] || winner || (mode === 'AI' && !xIsNext)) return;
    const nextSquares = squares.slice();
    nextSquares[idx] = xIsNext ? 'X' : 'O';
    setSquares(nextSquares);
    setXisNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function handleModeChange(newMode) {
    /** Switch mode and reset game if changing mode */
    if (mode !== newMode) {
      setMode(newMode);
      setTimeout(() => resetGame(), 0);
    }
  }

  const current = xIsNext ? 'X' : 'O';
  const winLineArr = winningLine(squares);

  return (
    <div className="ttt-outer-app">
      <div className="ttt-main-container">
        {/* Status and reset bar above */}
        <StatusBar
          status={winner}
          winner={winner}
          current={current}
          mode={mode}
          aiThinking={aiThinking}
        />
        <RestartBar onRestart={resetGame} />

        {/* The game board */}
        <GameBoard
          squares={squares}
          onSquareClick={handleMove}
          disabled={!!winner || aiThinking}
          winLine={winLineArr}
        />

        {/* Mode controls below board */}
        <div className="ttt-controls-below">
          <ModeSelector currentMode={mode} onChange={handleModeChange} />
        </div>

        {/* Credits at bottom */}
        <footer className="ttt-footer">
          <span>
            Modern Tic Tac Toe &middot; <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">React</a>
          </span>
        </footer>
      </div>
    </div>
  );
}

export default App;
