import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './styles/CreateRoom.css';
import './styles/Buttons.css';
import PlayersBar from './PlayersBar';
import GameSettingsCard from './GameSettingsCard';
import ThemesSelector from './ThemesSelector';

interface RoomRequest {
  creatorPseudo: string;
  creatorAvatar: string;
  themes: string[];
  numQuestions: number;
  timer: number;
  code: string;
}

function generateRoomCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const allQuizThemes = [
  { value: "bentWalad", label: "BENT WALAD" },
  { value: "fourPhotos", label: "4 Photos 1 Mot" },
  { value: "characters", label: "Personnages (Séries/Films)" },
  { value: "combinedStars", label: "Stars Combinées" },
  { value: "songs", label: "Chansons et Chanteurs" },
  { value: "logos", label: "Logos" },
  { value: "geography", label: "Géographie" },
  { value: "history", label: "Histoire" },
];

const CreateRoom: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { pseudo = '', avatar = '' } = location.state || {};
  const [themes, setThemes] = useState<string[]>(allQuizThemes.map(theme => theme.value));
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [timer, setTimer] = useState<number>(30);
  const [roomCode, setRoomCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [players] = useState([
    { pseudo: pseudo, avatar: avatar },
    { pseudo: 'Alice', avatar: '/assets/avatar1.png' },
    { pseudo: 'Bob', avatar: '/assets/avatar2.png' },
    { pseudo: 'Charlie', avatar: '/assets/avatar3.png' },
    { pseudo: 'Diana', avatar: '/assets/avatar4.png' },
    { pseudo: 'KDB', avatar: '/assets/avatar5.png' },
    { pseudo: 'Fakhrialimin', avatar: '/assets/avatar6.png' },
    { pseudo: 'HAN2S', avatar: '/assets/avatar3.png' },
  ]);

  useEffect(() => {
    if (!pseudo || !avatar) {
      navigate('/');
    }
    if (!roomCode) {
      setRoomCode(generateRoomCode());
    }
  }, [pseudo, avatar, navigate, roomCode]);

  const handleCreateRoom = async () => {
    if (themes.length === 0) {
      setError(t('errorThemes'));
      return;
    }
    try {
      /*const response = await axios.post<RoomRequest>('http://localhost:8080/api/rooms', {
        creatorPseudo: pseudo,
        creatorAvatar: avatar,
        themes,
        numQuestions,
        timer,
        code: roomCode,
      });
      const { code } = response.data;*/
      navigate(`/quiz/${roomCode}`);
    } catch (err) {
      setError('Error creating room');
    }
  };

  const handleThemeToggle = (themeValue: string) => {
    const newSelectedThemes = themes.includes(themeValue) ? themes.filter((t) => t !== themeValue) : [...themes, themeValue];
    setThemes(newSelectedThemes);
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
          setThemes={setThemes}
          numQuestions={numQuestions}
          setNumQuestions={setNumQuestions}
          timer={timer}
          setTimer={setTimer}
          roomCode={roomCode}
          error={error}
          handleCreateRoom={handleCreateRoom}
        />

        <div className="create-room-themes-section">
          <h3 className="create-room-themes-title">
            {t('themes')}
          </h3>
          <div className="create-room-themes-selector-container">
          <ThemesSelector
            allThemes={allQuizThemes}
            selectedThemes={themes}
            onThemeToggle={handleThemeToggle}
          />
          </div>
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default CreateRoom;