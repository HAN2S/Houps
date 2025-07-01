import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PlayersBar from './PlayersBar';
import GameSettingsCard from './GameSettingsCard';
import ThemesSelector from './ThemesSelector';
import axios from 'axios';
import './styles/CreateRoom.css';
import './styles/Buttons.css';

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
  const themes = session.chosenCategories || [];
  const [allCategories, setAllCategories] = useState<string[]>([]);

  useEffect(() => {
    // Fetch all categories from your API
    fetch('http://localhost:8081/api/questions/categories')
      .then(res => res.json())
      .then(data => setAllCategories(data))
      .catch(err => console.error('Failed to fetch categories', err));
  }, []);

  // Convert allCategories to themeList for ThemeSelector
  const themeList = allCategories.map((category: string) => ({
    value: category.toLowerCase().replace(/\s+/g, ''),
    label: category
  }));

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

  const handleThemeToggle = async (themeValue: string) => {
    if (!isHost) {
      setError('Only the host can change settings');
      return;
    }
    const categoryName = themeList.find((theme: { value: string; label: string }) => theme.value === themeValue)?.label;
    if (!categoryName) return;
    const newSelectedThemes = themes.includes(categoryName)
      ? themes.filter((t: string) => t !== categoryName)
      : [...themes, categoryName];
    await updateRoomSettings({
      categories: newSelectedThemes,
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
      categories: themes,
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
      categories: themes,
      maxPlayers: session.maxPlayers,
      totalRounds: numQuestions,
      timePerQuestion: newTimer
    });
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
              selectedThemes={themes.map((category: string) => category.toLowerCase().replace(/\s+/g, ''))}
              onThemeToggle={handleThemeToggle}
              disabled={!isHost}
            />
          </div>
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default Lobby;