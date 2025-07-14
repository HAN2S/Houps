import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/Home.css';
import './styles/Buttons.css';
import LanguageSelector from '../components/LanguageSelector';

interface RoomRequest {
  creatorPseudo: string;
  creatorAvatar: string;
  themes: string[];
  numQuestions: number;
  timer: number;
  code: string;
}

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [pseudo, setPseudo] = useState<string>('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [currentAvatarIndex, setCurrentAvatarIndex] = useState<number>(0);
  const [roomCode, setRoomCode] = useState<string>('');
  const navigate = useNavigate();

  const avatars = [
    '../assets/avatar1.png',
    '../assets/avatar2.png',
    '../assets/avatar3.png',
    '../assets/avatar4.png',
    '../assets/avatar5.png',
    '../assets/avatar6.png'
  ];

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handlePrevAvatar = () => {
    setCurrentAvatarIndex((prev) => (prev === 0 ? avatars.length - 1 : prev - 1));
    setAvatar(avatars[currentAvatarIndex === 0 ? avatars.length - 1 : currentAvatarIndex - 1]);
  };

  const handleNextAvatar = () => {
    setCurrentAvatarIndex((prev) => (prev === avatars.length - 1 ? 0 : prev + 1));
    setAvatar(avatars[currentAvatarIndex === avatars.length - 1 ? 0 : currentAvatarIndex + 1]);
  };

  const handleCreateRoom = async () => {
    if (!pseudo) {
      alert(t('errorPseudo'));
      return;
    }
    if (!avatar) {
      alert(t('errorAvatar'));
      return;
    }

    // Store username in localStorage
    localStorage.setItem('username', pseudo);

    try {
      const request = {
        hostPlayer: {
          username: pseudo,
          avatarUrl: avatar
        },
        roomSettings: {
          maxPlayers: 4, // Default value
          totalRounds: 10, // Default value
          timePerQuestion: 30, // Default value
          language: i18n.language // Add selected language
        }
      };

      const response = await axios.post('http://localhost:8081/api/rooms', request);
      const { session, playerId } = response.data;
      // Store player ID in localStorage
      localStorage.setItem('playerId', playerId);
      navigate(`/room/${session.sessionId}`);
    } catch (err) {
      console.error('Error creating room:', err);
      alert('Error creating room');
    }
  };

  const handleJoinRoom = async () => {
    if (!pseudo) {
      alert(t('errorPseudo'));
      return;
    }
    if (!avatar) {
      alert(t('errorAvatar'));
      return;
    }
    if (!roomCode) {
      alert(t('errorRoomCode'));
      return;
    }

    // Store username in localStorage
    localStorage.setItem('username', pseudo);

    try {
      const request = {
        username: pseudo,
        avatarUrl: avatar
      };

      const response = await axios.post(`http://localhost:8081/api/rooms/${roomCode}/join`, request);
      const { session, playerId } = response.data;
      // Store player ID in localStorage
      localStorage.setItem('playerId', playerId);
      navigate(`/room/${roomCode}`);
    } catch (err) {
      console.error('Error joining room:', err);
      alert('Error joining room');
    }
  };

  return (
    <div className="home-container">
      
      <h1 className="home-title">GlobalQuizz</h1>
      <div className="home-content">
        {/* Language Flags in Top-Right */}
        <LanguageSelector currentLanguage={i18n.language} onChange={changeLanguage} />

        <div className="play-card">
          <h2 className="play-title">PLAY</h2>
          
          {/* Avatar Carousel */}
          <div className="carousel-container">
            <label className="carousel-label text-center">{t('selectAvatar')}</label>
            <div className="carousel-wrapper">
              <button
                onClick={handlePrevAvatar}
                className="carousel-arrow"
              >
                ←
              </button>
              <img
                src={avatars[currentAvatarIndex]}
                alt={`Avatar ${currentAvatarIndex + 1}`}
                className={`carousel-image ${avatar === avatars[currentAvatarIndex] ? 'selected' : ''}`}
                onClick={() => setAvatar(avatars[currentAvatarIndex])}
                onError={(e) => {
                  console.log(`Failed to load avatar ${currentAvatarIndex + 1}`);
                  (e.target as HTMLImageElement).src = '/assets/default-avatar.png';
                }}
              />
              <button
                onClick={handleNextAvatar}
                className="carousel-arrow"
              >
                →
              </button>
            </div>
          </div>

          {/* Pseudo Input */}
          <div className="input-group">
            <label className="block text-lg mb-2 text-center">{t('enterPseudo')}</label>
            <input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="input-field"
              placeholder={t('enterPseudo')}
            />
          </div>

          {/* Create or Join Room */}
          <div className="button-group">
            <button
              onClick={handleCreateRoom}
              className="button-primary button-full-width"
            >
              {t('createRoom')}
            </button>
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="input-field w-1/2"
                placeholder={t('roomCode')}
              />
              <button
                onClick={handleJoinRoom}
                className="button-secondary"
              >
                {t('joinRoom')}
              </button>
            </div>
          </div>
        </div>  
      </div>
    </div>
  );
};

export default Home;