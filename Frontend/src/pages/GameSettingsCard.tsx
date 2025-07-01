import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaRegCopy } from 'react-icons/fa';
// import QRCode from 'qrcode.react'; // You'll need a QR code library
// import ThemeCheckboxDropdown from './ThemeCheckboxDropdown'; // Assuming this is staying separate
import './styles/GameSettingsCard.css';
import './styles/Buttons.css'; // Keep button styles

interface GameSettingsCardProps {
  themes: string[];
  setThemes: (themes: string[]) => void;
  numQuestions: number;
  setNumQuestions: (num: number) => void;
  timer: number;
  setTimer: (timer: number) => void;
  roomCode: string;
  error: string;
  handleCreateRoom: () => void;
  isHost: boolean;
  isReady: boolean;
  handleReadyToggle: () => void;
  sessionStatus: string;
  onNumQuestionsChange?: (num: number) => void;
  onTimerChange?: (timer: number) => void;
  // Add state/handlers for new settings from image if needed (e.g., num players, toggles)
}

const GameSettingsCard: React.FC<GameSettingsCardProps> = ({
  themes,
  setThemes,
  numQuestions,
  setNumQuestions,
  timer,
  setTimer,
  roomCode,
  error,
  handleCreateRoom,
  isHost,
  isReady,
  handleReadyToggle,
  sessionStatus,
  onNumQuestionsChange,
  onTimerChange
}) => {
  const { t } = useTranslation();

  // Note: ThemeCheckboxDropdown might need to be integrated or passed theme options
  // For now, assuming it works as is with passed props.

  // Button logic
  const showStartGame = isHost && sessionStatus === 'WAITING_FOR_PLAYERS';
  const showReadyButton = !isHost && sessionStatus === 'WAITING_FOR_PLAYERS';

  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = Number(e.target.value);
    setNumQuestions(newValue);
    if (onNumQuestionsChange) {
      onNumQuestionsChange(newValue);
    }
  };

  const handleTimerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = Number(e.target.value);
    setTimer(newValue);
    if (onTimerChange) {
      onTimerChange(newValue);
    }
  };

  return (
    <div className="game-settings-card"> {/* Reusing 'play-card' style */}
        <div className="game-settings-title-bar">{t('gameSettings')}</div>

      <div className="game-settings-content">
        {error && <p className="error-message">{error}</p>}

        <div className="settings-grid"> {/* Layout settings in a grid */}
          {/* Settings Column */}
          <div className="settings-column">
            {/* Removed Theme Dropdown */}

            <div className="form-group">
              <label className="form-label">{t('numQuestions')} :</label>
              <select
                value={numQuestions}
                onChange={handleNumQuestionsChange}
                className="input-field" // Using input-field style
                disabled={!isHost}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('timer')} :</label>
              <select
                value={timer}
                onChange={handleTimerChange}
                className="input-field" // Using input-field style
                disabled={!isHost}
              >
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
                <option value="60">60</option>
              </select>
            </div>
             {/* Add placeholders for new settings like Num Players, Toggles */}
              <div className="form-group">
                  <label className="form-label">{t('numPlayers')} :</label>
                  <select className="input-field" disabled={!isHost}>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                      <option value="8">8</option>
                  </select>
              </div>
          </div>

          {/* QR Code & Link Column */}
          <div className="qr-link-column">
              {/* QR Code Placeholder */}
              <div className="qr-code-placeholder">
                  {/* <QRCode value={`${window.location.origin}/quiz/${roomCode}`} size={180} level="H" /> */}
                  <div>[QR Code Here]</div> {/* Placeholder */}
              </div>

              {/* Room Code & Copy */}
              <div className="room-code-section">
                  <span className="room-code-label">Code:</span>
                  <span className="room-code-value">{roomCode}</span>
                   <button
                    onClick={() => {
                      navigator.clipboard.writeText(roomCode);
                      alert(t('copyCode')); // Updated translation key
                    }}
                    className="copy-icon-btn"
                    title="Copy code"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#E1EEBC' }} // Style icon
                  >
                    <FaRegCopy size={20} />
                  </button>
              </div>

              {/* Note: "Share Link" button from image is like "Copy Lobby Link" */}
               <button
                  onClick={() => {
                      const link = `${window.location.origin}/room/${roomCode}`;
                      navigator.clipboard.writeText(link);
                      alert(t('copyLink'));
                  }}
                   className="button-secondary py-3 mt-2" // Using a secondary style?
              >
                {t('shareLink')} {/* Add shareLink to i18n */}
              </button>

          </div>
        </div>
         {/* The main Start Game button might be outside the grid, like in the image */}
           {showStartGame && (
             <button
                onClick={handleCreateRoom}
                className="button-primary button-full-width py-3 mt-4"
              >
                {t('startGame')}
              </button>
           )}
           {showReadyButton && (
             <button
                onClick={handleReadyToggle}
                className={`button-primary button-full-width py-3 mt-4 ${isReady ? 'ready' : ''}`}
              >
                {isReady ? t('notReady') : t('ready')}
              </button>
           )}
      </div>
    </div>
  );
};

export default GameSettingsCard; 