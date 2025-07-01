import React, { useState, useEffect } from 'react';
import PlayersBar from './PlayersBar';
import TimerContainer from '../components/TimerContainer';
import './styles/CategorySelection.css';

interface CategorySelectionScreenProps {
  session: any;
}

const CategorySelectionScreen: React.FC<CategorySelectionScreenProps> = ({ session }) => {
  const [error, setError] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(session.timer ?? session.timePerQuestion);
  const turnIndex = (session.currentRound - 1) % session.players.length;
  const chooser = session.players[turnIndex];
  const mappedPlayers = session.players;
  const currentPlayerId = localStorage.getItem('playerId');
  const isMyTurn = chooser && chooser.id === currentPlayerId;

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

  const handleSelectCategory = async (category: string) => {
    if (!isMyTurn) return;
    try {
      // Use your API endpoint for selecting category
      await fetch(`http://localhost:8081/api/game/${session.sessionId}/select-category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, playerId: currentPlayerId }),
      });
      setError('');
    } catch (err) {
      setError('Error selecting category');
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

      {/* Middle Section: Player in turn and categories */}
      <div className="middle-section">
        <div className="chooser-info">
          {chooser && (
            <>
              <img src={chooser.avatarUrl} alt={chooser.username} className="chooser-avatar" />
              <p>{chooser.username} is choosing</p>
            </>
          )}
        </div>
        <div className="categories-list">
          {session.chosenCategories.map((category: string) => (
            <button
              key={category}
              className={`category-button theme-button${isMyTurn ? '' : ' disabled'}`}
              onClick={() => handleSelectCategory(category)}
              disabled={!isMyTurn}
            >
              {category}
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

export default CategorySelectionScreen; 