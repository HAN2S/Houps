import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PlayersBar from './PlayersBar';
import GameSettingsCard from './GameSettingsCard';
import ThemesSelector from './ThemesSelector';
import axios from 'axios';
import './styles/CreateRoom.css';
import './styles/Buttons.css';
import i18n from '../utils/i18n';
import LanguageSelector from '../components/LanguageSelector';

interface LobbyProps {
  session: any;
}

const Lobby: React.FC<LobbyProps> = ({ session }) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string>('');
  const currentPlayerId = localStorage.getItem('playerId');
  const players = session.players
  const isHost = players.find((p: any) => p.id === currentPlayerId)?.host || false;
  const isReady = players.find((p: any) => p.id === currentPlayerId)?.ready || false;
  // Use chosenCategoryIds for logic and map to names for display. Fetch categories as {id, name} objects, use IDs for all selection and API calls, and update all relevant logic.
  const themes = session.chosenCategoriesInLang || session.chosenCategories || [];
  // Fetch all categories as objects with id and name
  const [allCategories, setAllCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    // Fetch all categories from your API in the current session language
    fetch('http://localhost:8081/api/questions/categories', {
      headers: { 'Accept-Language': session.language }
    })
      .then(res => res.json())
      .then(data => setAllCategories(data))
      .catch(err => console.error('Failed to fetch categories', err));
  }, [session.language]);

  useEffect(() => {
    if (session.language && i18n.language !== session.language) {
      i18n.changeLanguage(session.language);
    }
  }, [session.language]);

  // Only mark as selected those in session.chosenCategoryIds
  const selectedCategoryIds = session.chosenCategoryIds || [];

  // For ThemesSelector, map to the expected format
  const themeList = allCategories.map((cat) => ({ value: String(cat.id), label: cat.name }));

  // For selected themes, use IDs as strings
  const selectedThemes = selectedCategoryIds.map((id: number) => String(id));

  const numQuestions = session.totalRounds || 10;
  const timer = session.timePerQuestion || 30;
  const sessionStatus = session.status || 'WAITING_FOR_PLAYERS';

  const handleStartGame = async () => {
    if (!isHost) {
      setError('Only the host can start the game');
      return;
    }
    try {
      await axios.post(`http://localhost:8081/api/game/${session.sessionId}/start`);
      setError('');
    } catch (err) {
      setError('Error starting game');
    }
  };

  const handleReadyToggle = async () => {
    if (!currentPlayerId) {
      setError('Player ID not found');
      return;
    }
    try {
      await axios.put(`http://localhost:8081/api/rooms/${session.sessionId}/players/${currentPlayerId}/ready`);
      setError('');
    } catch (err) {
      setError('Error updating ready state');
    }
  };

  const handleThemeToggle = async (themeId: string) => {
    if (!isHost) {
      setError('Only the host can change settings');
      return;
    }
    const id = Number(themeId);
    const newSelectedIds = selectedCategoryIds.includes(id)
      ? selectedCategoryIds.filter((t: number) => t !== id)
      : [...selectedCategoryIds, id];
    await updateRoomSettings({
      categories: newSelectedIds,
      maxPlayers: session.maxPlayers,
      totalRounds: numQuestions,
      timePerQuestion: timer
    });
  };

  const handleNumQuestionsChange = async (newNumQuestions: number) => {
    if (!isHost) {
      setError('Only the host can change settings');
      return;
    }
    await updateRoomSettings({
      categories: selectedCategoryIds,
      maxPlayers: session.maxPlayers,
      totalRounds: newNumQuestions,
      timePerQuestion: timer
    });
  };

  const handleTimerChange = async (newTimer: number) => {
    if (!isHost) {
      setError('Only the host can change settings');
      return;
    }
    await updateRoomSettings({
      categories: selectedCategoryIds,
      maxPlayers: session.maxPlayers,
      totalRounds: numQuestions,
      timePerQuestion: newTimer
    });
  };

  const handleLanguageChange = async (lang: string) => {
    if (!isHost) {
      setError('Only the host can change language');
      return;
    }
    await updateRoomSettings({
      categories: selectedCategoryIds,
      maxPlayers: session.maxPlayers,
      totalRounds: numQuestions,
      timePerQuestion: timer,
      language: lang
    });
    i18n.changeLanguage(lang);
  };

  const updateRoomSettings = async (settings: any) => {
    try {
      await axios.put(`http://localhost:8081/api/rooms/${session.sessionId}/settings`, settings);
      setError('');
    } catch (err) {
      setError('Error updating settings');
    }
  };

  return (
    <div className="create-room-container">
      <div className="create-room-content">
        <div></div>
        <div className="create-room-players-section">
          <h3 className="create-room-players-title">
            {t('Players')}
          </h3>
          <div className="create-room-players-bar-container">
            <PlayersBar players={players} layout="horizontal" />
          </div>
        </div>

        <GameSettingsCard
          themes={themes}
          setThemes={() => {}}
          numQuestions={numQuestions}
          setNumQuestions={() => {}}
          timer={timer}
          setTimer={() => {}}
          roomCode={session.sessionId || ''}
          error={error}
          handleCreateRoom={handleStartGame}
          handleReadyToggle={handleReadyToggle}
          isHost={isHost}
          isReady={isReady}
          sessionStatus={sessionStatus}
          onNumQuestionsChange={handleNumQuestionsChange}
          onTimerChange={handleTimerChange}
        />

        <div className="create-room-themes-section">
          <h3 className="create-room-themes-title">
            {t('themes')}
          </h3>
          <div className="create-room-themes-selector-container">
            <ThemesSelector
              allThemes={themeList}
              selectedThemes={selectedThemes}
              onThemeToggle={handleThemeToggle}
              disabled={!isHost}
            />
          </div>
        </div>
        <LanguageSelector currentLanguage={session.language} onChange={handleLanguageChange} />
        <div></div>
      </div>
    </div>
  );
};

export default Lobby;