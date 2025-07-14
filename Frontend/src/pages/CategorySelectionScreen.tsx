import React, { useState, useEffect } from 'react';
import PlayersBar from './PlayersBar';
import TimerContainer from '../components/TimerContainer';
import RoundCounter from '../components/RoundCounter';
import './styles/CategorySelection.css';
import { useTranslation } from 'react-i18next';

interface CategorySelectionScreenProps {
  session: any;
}

const CategorySelectionScreen: React.FC<CategorySelectionScreenProps> = ({ session }) => {
  const { t, i18n } = useTranslation();
  const [error, setError] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(session.timer ?? session.timePerQuestion);
  const turnIndex = (session.currentRound - 1) % session.players.length;
  const chooser = session.players[turnIndex];
  const mappedPlayers = session.players;
  const currentPlayerId = localStorage.getItem('playerId');
  const isMyTurn = chooser && chooser.id === currentPlayerId;
  const [allCategories, setAllCategories] = useState<{ id: number; name: string }[]>([]);

  // Set i18n language to session.language if different
  React.useEffect(() => {
    if (session.language && i18n.language !== session.language) {
      i18n.changeLanguage(session.language);
    }
  }, [session.language, i18n]);

  useEffect(() => {
    setTimeLeft(session.timer ?? session.timePerQuestion);
  }, [session.timer, session.timePerQuestion, session.currentRound]);

  useEffect(() => {
    if (timeLeft <= 0 && isMyTurn && session.chosenCategoryIds.length > 0) {
      handleSelectCategory(session.chosenCategoryIds[0]);
    }
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev: number) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, isMyTurn, session.chosenCategoryIds]);

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

  const handleSelectCategory = async (categoryId: string) => {
    if (!isMyTurn) return;
    try {
      // Use your API endpoint for selecting category
      await fetch(`http://localhost:8081/api/game/${session.sessionId}/select-category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: Number(categoryId), playerId: currentPlayerId }),
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
          <div className="grid-item">
            <RoundCounter currentRound={session.currentRound} totalRounds={session.totalRounds} />
          </div>
        </div>
      </div>

      {/* Middle Section: Player in turn and categories */}
      <div className="middle-section">
        <div className="chooser-info">
          {chooser && (
            <>
              <img src={chooser.avatarUrl} alt={chooser.username} className="chooser-avatar" />
              <p>{t('isChoosingCategory', { username: chooser.username })}</p>
            </>
          )}
        </div>
        <div className="categories-list">
          {session.chosenCategoryIds.map((categoryId: string) => (
            <button
              key={categoryId}
              className={`category-button theme-button${isMyTurn ? '' : ' disabled'}`}
              onClick={() => handleSelectCategory(categoryId)}
              disabled={!isMyTurn}
            >
              {getCategoryName(categoryId)}
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