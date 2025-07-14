import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PlayersBar from './PlayersBar';
import TimerContainer from '../components/TimerContainer';
import RoundCounter from '../components/RoundCounter';
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
  const [allCategories, setAllCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    setTimeLeft(session.timer ?? session.timePerQuestion);
  }, [session.timer, session.timePerQuestion, session.currentRound]);

  useEffect(() => {
    if (timeLeft <= 0 && isMyTurn) {
      handleSelectDifficulty(2); // Medium
    }
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev: number) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, isMyTurn]);

  useEffect(() => {
    // Fetch all categories from your API in the current session language
    fetch('http://localhost:8081/api/questions/categories', {
      headers: { 'Accept-Language': session.language }
    })
      .then(res => res.json())
      .then(data => setAllCategories(data))
      .catch(err => console.error('Failed to fetch categories', err));
  }, [session.language]);

  // Helper to get the name for a given ID
  const getCategoryName = (id: number | string) => {
    const cat = allCategories.find(c => String(c.id) === String(id));
    return cat ? cat.name : id;
  };

  const difficulties = [
    { label: 'difficulty.easy', value: 1 },
    { label: 'difficulty.medium', value: 2 },
    { label: 'difficulty.hard', value: 3 }
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
          <div className="grid-item">
            <RoundCounter currentRound={session.currentRound} totalRounds={session.totalRounds} />
          </div>
        </div>
      </div>

      {/* Middle Section: Player in turn and difficulties */}
      <div className="middle-section">
        <div className="chooser-info">
          {chooser && (
            <>
              <img src={chooser.avatarUrl} alt={chooser.username} className="chooser-avatar" />
              <p>{t('isChoosingDifficultyFor', { username: chooser.username, category: getCategoryName(category) })}</p>
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
              {t(diff.label)}
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