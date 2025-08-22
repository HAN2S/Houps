import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaUser, 
  FaGamepad, 
  FaUsers, 
  FaSignInAlt,
  FaPlus,
  FaHome
} from 'react-icons/fa';
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
      <div className="home-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      <LanguageSelector currentLanguage={i18n.language} onChange={changeLanguage} />

      <div className="home-content">
        {/* Language Flags in Top-Right */}

        <div className="home-header">
          <div className="logo-container">
            <FaGamepad className="logo-icon" />
            <h1 className="home-title">HOUPS</h1>
          </div>
          <p className="home-subtitle">{t('welcomeMessage') || 'Test your knowledge with friends!'}</p>
        </div>

        <div className="play-card">
          <div className="card-header">
            <FaUsers className="card-icon" />
            <h2 className="play-title">{t('play') || 'PLAY'}</h2>
          </div>
          
          {/* Avatar Carousel */}
          <div className="carousel-container">
            <label className="carousel-label">
              <FaUser className="label-icon" />
              {t('selectAvatar')}
            </label>
            <div className="carousel-wrapper">
              <button
                onClick={handlePrevAvatar}
                className="carousel-arrow"
                aria-label="Previous avatar"
              >
                <FaChevronLeft />
              </button>
              <div className="avatar-container">
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
                {avatar === avatars[currentAvatarIndex] && (
                  <div className="avatar-selected-indicator">
                    <FaUser />
                  </div>
                )}
              </div>
              <button
                onClick={handleNextAvatar}
                className="carousel-arrow"
                aria-label="Next avatar"
              >
                <FaChevronRight />
              </button>
            </div>
            <div className="avatar-indicators">
              {avatars.map((_, index) => (
                <div
                  key={index}
                  className={`indicator ${currentAvatarIndex === index ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentAvatarIndex(index);
                    setAvatar(avatars[index]);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Pseudo Input */}
          <div className="input-group">
            <label className="input-label">
              <FaUser className="input-icon" />
              {t('enterPseudo')}
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                className="input-field"
                placeholder={t('enterPseudo')}
                maxLength={14}
              />
            </div>
          </div>

          {/* Create or Join Room */}
          <div className="button-group">
            <button
              onClick={handleCreateRoom}
              className="button-primary button-full-width"
              disabled={!pseudo || !avatar}
            >
              <FaPlus className="button-icon" />
              {t('createRoom')}
            </button>
            
            <div className="join-section">
              <div className="divider">
                <span>{t('or') || 'OR'}</span>
              </div>
              
              <div className="join-input-group">
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toLowerCase())}
                    className="input-field room-code-input"
                    placeholder={t('roomCode')}
                  />
                </div>
                <button
                  onClick={handleJoinRoom}
                  className="button-secondary"
                  disabled={!pseudo || !avatar || !roomCode}
                >
                  <FaSignInAlt className="button-icon" />
                  {t('joinRoom')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;