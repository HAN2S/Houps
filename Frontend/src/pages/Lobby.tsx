import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUsers, FaPlay, FaCog, FaCheck, FaInfo, FaGamepad, FaClock, FaTrophy } from 'react-icons/fa';
import PlayersBar from './PlayersBar';
import GameSettingsCard from './GameSettingsCard';
import ThemesSelector from './ThemesSelector';
import axios from 'axios';
import '../styles/shared.css';
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

  const updateRoomSettings = async (settings: any) => {
    try {
      await axios.put(`http://localhost:8081/api/rooms/${session.sessionId}/settings`, settings);
      setError('');
    } catch (err) {
      setError('Error updating room settings');
    }
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  if (!session) {
    return (
      <div className="shared-background">
        <div className="shared-background-animation">
          <div className="shared-floating-shapes">
            <div className="shared-shape shared-shape-1"></div>
            <div className="shared-shape shared-shape-2"></div>
            <div className="shared-shape shared-shape-3"></div>
          </div>
        </div>
        <div className="shared-content">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-background">
      <div className="shared-background-animation">
        <div className="shared-floating-shapes">
          <div className="shared-shape shared-shape-1"></div>
          <div className="shared-shape shared-shape-2"></div>
          <div className="shared-shape shared-shape-3"></div>
        </div>
      </div>
      
      <div className="shared-content">
        {/* Language Flags in Top-Right */}
        <LanguageSelector currentLanguage={i18n.language} onChange={changeLanguage} />

        <div className="shared-header">
          <div className="shared-logo-container">
            <FaGamepad className="shared-logo-icon" />
            <h1 className="shared-title">HOUPS</h1>
          </div>
          <p className="shared-subtitle">{t('lobbySubtitle') || 'Waiting for players to join...'}</p>
        </div>

        <div className="shared-grid">
          <div className="shared-main">
            {/* Players Bar */}
            <div className="shared-card">
              <div className="shared-card-header">
                <FaUsers className="shared-card-icon" />
                <h2 className="shared-card-title">{t('players') || 'PLAYERS'}</h2>
              </div>
              <PlayersBar players={players} />
            </div>

            {/* Game Settings */}
            <div className="shared-card">
              <div className="shared-card-header">
                <FaCog className="shared-card-icon" />
                <h2 className="shared-card-title">{t('gameSettings') || 'GAME SETTINGS'}</h2>
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
                handleCreateRoom={() => {}}
                handleReadyToggle={() => {}}
                isHost={isHost}
                isReady={isReady}
                sessionStatus={sessionStatus}
                onNumQuestionsChange={handleNumQuestionsChange}
                onTimerChange={handleTimerChange}
              />
            </div>

            {/* Themes Selector */}
            <div className="shared-card">
              <div className="shared-card-header">
                <FaCog className="shared-card-icon" />
                <h2 className="shared-card-title">{t('themes') || 'THEMES'}</h2>
              </div>
              <ThemesSelector
                allThemes={themeList}
                selectedThemes={selectedThemes}
                onThemeToggle={handleThemeToggle}
                disabled={!isHost}
              />
            </div>
          </div>

          <div className="shared-sidebar">
            {/* Room Details */}
            <div className="shared-card">
              <div className="shared-card-header">
                <FaInfo className="shared-card-icon" />
                <h2 className="shared-card-title">{t('roomInfo') || 'ROOM INFO'}</h2>
              </div>
              
              <div className="room-details">
                <div className="room-detail-item">
                  <FaGamepad className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">{t('roomCode') || 'Room Code'}</span>
                    <span className="detail-value">{session.sessionId}</span>
                  </div>
                </div>
                
                <div className="room-detail-item">
                  <FaUsers className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">{t('players') || 'Players'}</span>
                    <span className="detail-value">{players.length}/{session.maxPlayers}</span>
                  </div>
                </div>
                
                <div className="room-detail-item">
                  <FaCheck className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">{t('readyPlayers') || 'Ready'}</span>
                    <span className="detail-value">{players.filter((p: any) => p.ready).length}</span>
                  </div>
                </div>
                
                <div className="room-detail-item">
                  <FaClock className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">{t('status') || 'Status'}</span>
                    <span className="detail-value">{sessionStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Player Actions */}
            {!isHost && (
            <div className="shared-card">
              <div className="shared-card-header">
                <FaCheck className="shared-card-icon" />
                <h2 className="shared-card-title">{t('yourStatus') || 'YOUR STATUS'}</h2>
              </div>
              
              <div className="shared-button-group">
                
                  <button
                    onClick={handleReadyToggle}
                    className={`shared-button-secondary ${isReady ? 'ready' : ''}`}
                  >
                    <FaCheck className="shared-button-icon" />
                    {isReady ? t('notReady') || 'NOT READY' : t('ready') || 'READY'}
                  </button>
               
              </div>
            </div>
             )}
            {/* Host Actions */}
            {isHost && (
              <div className="shared-card">
                <div className="shared-card-header">
                  <FaPlay className="shared-card-icon" />
                  <h2 className="shared-card-title">{t('hostActions') || 'HOST ACTIONS'}</h2>
                </div>
                
                <div className="shared-button-group">
                  <button
                    onClick={handleStartGame}
                    className="shared-button-primary shared-button-full-width"
                    disabled={!players.every((p: any) => p.ready)}
                  >
                    <FaPlay className="shared-button-icon" />
                    {t('startGame') || 'START GAME'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;