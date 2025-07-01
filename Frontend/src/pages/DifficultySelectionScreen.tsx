import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PlayersBar from './PlayersBar';
import TimerContainer from '../components/TimerContainer';
import './styles/CreateRoom.css';
import './styles/Buttons.css';
import './styles/DifficultySelection.css';

interface DifficultySelectionScreenProps {
  session: any;
}

const DifficultySelectionScreen: React.FC<DifficultySelectionScreenProps> = ({ session }) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(session.timer ?? session.timePerQuestion);
  const turnIndex = (session.currentRound - 1) % session.players.length;
  const chooser = session.players[turnIndex];
  const mappedPlayers = session.players;
  const currentPlayerId = localStorage.getItem('playerId');
  const isMyTurn = chooser && chooser.id === currentPlayerId;
  const category = session.selectedCategory;

  useEffect(() => {
    setTimeLeft(session.timer ?? session.timePerQuestion);
  }, [session.timer, session.timePerQuestion, session.currentRound]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev: number) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const difficulties = [
    { label: 'Easy', value: 1 },
    { label: 'Medium', value: 2 },
    { label: 'Hard', value: 3 }
  ];

  const handleSelectDifficulty = async (difficulty: number) => {
    if (!isMyTurn) return;
    try {
      await fetch(`http://localhost:8081/api/game/${session.sessionId}/select-difficulty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty, category, playerId: currentPlayerId }),
      });
      setError('');
    } catch (err) {
      setError('Error selecting difficulty');
    }
  };

  return (
    <div className="quiz-container">
      {/* Top Section: Timer */}
      <div className="top-section">
        <div className="top-grid">
          <div className="grid-item"></div>
          <div className="grid-item">
            <TimerContainer timeLeft={timeLeft} totalTime={session.timePerQuestion} />
          </div>
          <div className="grid-item"></div>
        </div>
      </div>

      {/* Middle Section: Player in turn and difficulties */}
      <div className="middle-section">
        <div className="chooser-info">
          {chooser && (
            <>
              <img src={chooser.avatarUrl} alt={chooser.username} className="chooser-avatar" />
              <p>{chooser.username} is choosing a difficulty for {category}...</p>
            </>
          )}
        </div>
        <div className="difficulties-list">
          {difficulties.map((diff) => (
            <button
              key={diff.value}
              className="difficulty-button"
              onClick={() => handleSelectDifficulty(diff.value)}
              disabled={!isMyTurn}
            >
              {diff.label}
            </button>
          ))}
        </div>
      </div>

      {/* Players Bar at the bottom */}
      <div className="players-section">
        <PlayersBar players={mappedPlayers} currentPlayerIndex={turnIndex} layout="horizontal" />
      </div>
      {error && <div className="error-container">{error}</div>}
    </div>
  );
};

export default DifficultySelectionScreen; 