import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PlayerAvatar from '../components/PlayerAvatar';
import { Fireworks } from 'fireworks-js';
import './styles/ScoreScreen.css';
import type { Player } from '../types/Player';
import RoundCounter from '../components/RoundCounter';

interface ScoreScreenProps {
  session: any;
}

interface WindowSize {
  width: number;
  height: number;
}

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

const ScoreScreen: React.FC<ScoreScreenProps> = ({ session }) => {
  const { t, i18n } = useTranslation();
  // Set i18n language to session.language if different
  React.useEffect(() => {
    if (session.language && i18n.language !== session.language) {
      i18n.changeLanguage(session.language);
    }
  }, [session.language, i18n]);
  const { width } = useWindowSize();
  const players: Player[] = Array.isArray(session.players) ? session.players.map((p: any) => ({
    username: p.username,
    avatarUrl: p.avatarUrl,
    score: p.score,
    selectedAnswer: p.currentAnswer,
    writtenAnswer: p.wrongAnswerSubmitted,
  })) : [];
  const currentRound = session.currentRound || 0;
  const totalRounds = session.totalRounds || 0;

  const [showFireworks, setShowFireworks] = useState(false);
  const fireworksContainerRef = useRef<HTMLDivElement>(null);
  const fireworksInstance = useRef<Fireworks | null>(null);
  const [loading, setLoading] = useState(false);
  // Helper to get playerId from localStorage
  const playerId = localStorage.getItem('playerId');
  const sessionId = session.sessionId;

  // Détection mobile (phone) fiable
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  const hostPlayer = Array.isArray(session.players)
    ? session.players.find((p: any) => p.host === true)
    : null;
  const isHost = hostPlayer && hostPlayer.id === playerId;

  // Sort players by score in descending order
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const rankedPlayers: { [score: number]: typeof players } = {};
  sortedPlayers.forEach(player => {
    if (!rankedPlayers[player.score]) {
      rankedPlayers[player.score] = [];
    }
    rankedPlayers[player.score].push(player);
  });

  const uniqueScores = Object.keys(rankedPlayers).map(Number).sort((a, b) => b - a);

  const getPlayersForRank = (rank: number) => {
    if (uniqueScores[rank - 1] !== undefined) {
      return rankedPlayers[uniqueScores[rank - 1]];
    }
    return [];
  };

  const firstPlacePlayers = getPlayersForRank(1);
  const secondPlacePlayers = getPlayersForRank(2);
  const thirdPlacePlayers = getPlayersForRank(3);

  const otherPlayers = sortedPlayers.slice(firstPlacePlayers.length + secondPlacePlayers.length + thirdPlacePlayers.length);

  const isLastRound = session.currentRound === session.totalRounds;

  useEffect(() => {
    if (currentRound === totalRounds && firstPlacePlayers.length > 0) {
      setShowFireworks(true);
    } else {
      setShowFireworks(false);
    }
  }, [currentRound, totalRounds, firstPlacePlayers]);

  useEffect(() => {
    if (fireworksContainerRef.current) {
      if (showFireworks) {
        if (!fireworksInstance.current) {
          const options = {
            autoresize: true,
            opacity: 0.5,
            acceleration: 1.05,
            friction: 0.97,
            gravity: 1.5,
            particles: 50,
            trace: 3,
            explosion: 5,
            flickering: 50,
            hue: { min: 0, max: 360 },
            delay: { min: 15, max: 30 },
            speed: width <= 767 ? 2 : 4,
            intensity: width <= 767 ? 10 : 25,
            sound: {
              enabled: true,
              files: [
                './assets/explosion0.mp3',
                './assets/explosion1.mp3',
                './assets/explosion2.mp3'
              ],
              volume: { min: 4, max: 8 }
            },
          };
          fireworksInstance.current = new Fireworks(fireworksContainerRef.current, options);
          fireworksInstance.current.start();

          // Stop fireworks after 40 seconds
          const timer = setTimeout(() => {
            if (fireworksInstance.current) {
              fireworksInstance.current.stop();
              fireworksInstance.current = null;
              setShowFireworks(false);
            }
          }, 40000);

          return () => clearTimeout(timer);

        } else {
          fireworksInstance.current.start();
        }
      } else {
        if (fireworksInstance.current) {
          fireworksInstance.current.stop();
          fireworksInstance.current = null;
        }
      }
    }
  }, [showFireworks, width]);

  useEffect(() => {
    return () => {
      if (fireworksInstance.current) {
        fireworksInstance.current.stop();
        fireworksInstance.current = null;
      }
    };
  }, []);

  const getAvatarSize = () => width <= 767 ? "medium" : "large";
  const getMultiplePlayersAvatarSize = () => width <= 767 ? "small" : "medium";

  return (
    <div className="score-screen-container">
      <div
        id="fireworks-container"
        ref={fireworksContainerRef}
        className="fireworks-container"
        style={{ pointerEvents: 'none' }}
      >
        {/* Fireworks will be rendered inside this div by the utility */}
      </div>
      <div className="top-section">
        <div className="top-grid">
          <div className="grid-item"></div>
          <div className="grid-item">
            <h1>{t('Scoreboard')}</h1>
          </div>
          <div className="grid-item">
            <RoundCounter currentRound={currentRound} totalRounds={totalRounds} />
          </div>
        </div>
      </div>

      <div className="podium-container">
        {/* Second Place (toujours visible) */}
        <div className={`podium-spot second-place ${secondPlacePlayers.length > 1 ? 'multiple-players' : ''}`} style={{ opacity: secondPlacePlayers.length === 0 ? 0.3 : 1 }}>
          {secondPlacePlayers.length > 0 ? (
            secondPlacePlayers.length === 1 ? (
              <div className="podium-player single-player">
                <PlayerAvatar
                  pseudo={secondPlacePlayers[0].username}
                  avatar={secondPlacePlayers[0].avatarUrl}
                  size={isMobile ? 'small' : getAvatarSize()}
                  showName={true}
                  showScore={false}
                />
                <span className="podium-score">{secondPlacePlayers[0].score}</span>
              </div>
            ) : (
              <>
                <div className="podium-players-container">
                  {secondPlacePlayers.map((player, idx) => (
                    <PlayerAvatar
                      key={idx}
                      pseudo={player.username}
                      avatar={player.avatarUrl}
                      size={isMobile ? 'small' : getMultiplePlayersAvatarSize()}
                      showName={true}
                      showScore={false}
                    />
                  ))}
                </div>
                <span className="podium-score">{secondPlacePlayers[0].score}</span>
              </>
            )
          ) : <span className="podium-score">-</span>}
        </div>
        {/* First Place (toujours visible) */}
        <div className={`podium-spot first-place`}>
          {firstPlacePlayers.length > 0 ? (
            firstPlacePlayers.length === 1 ? (
              <div className="podium-player single-player">
                <PlayerAvatar
                  pseudo={firstPlacePlayers[0].username}
                  avatar={firstPlacePlayers[0].avatarUrl}
                  size={isMobile ? 'small' : getAvatarSize()}
                  showName={true}
                  showScore={true}
                />
                <span className="podium-score">{firstPlacePlayers[0].score}</span>
              </div>
            ) : (
              <>
                <div className="podium-players-container">
                  {firstPlacePlayers.map((player, idx) => (
                    <PlayerAvatar
                      key={idx}
                      pseudo={player.username}
                      avatar={player.avatarUrl}
                      size={isMobile ? 'small' : getMultiplePlayersAvatarSize()}
                      showName={true}
                      showScore={false}
                    />
                  ))}
                </div>
                <span className="podium-score">{firstPlacePlayers[0].score}</span>
              </>
            )
          ) : <span className="podium-score">-</span>}
        </div>
        {/* Third Place (toujours visible) */}
        <div className={`podium-spot third-place ${thirdPlacePlayers.length > 1 ? 'multiple-players' : ''}`} style={{ opacity: thirdPlacePlayers.length === 0 ? 0.3 : 1 }}>
          {thirdPlacePlayers.length > 0 ? (
            thirdPlacePlayers.length === 1 ? (
              <div className="podium-player single-player">
                <PlayerAvatar
                  pseudo={thirdPlacePlayers[0].username}
                  avatar={thirdPlacePlayers[0].avatarUrl}
                  size={isMobile ? 'small' : getAvatarSize()}
                  showName={true}
                  showScore={false}
                />
                <span className="podium-score">{thirdPlacePlayers[0].score}</span>
              </div>
            ) : (
              <>
                <div className="podium-players-container">
                  {thirdPlacePlayers.map((player, idx) => (
                    <PlayerAvatar
                      key={idx}
                      pseudo={player.username}
                      avatar={player.avatarUrl}
                      size={isMobile ? 'small' : getMultiplePlayersAvatarSize()}
                      showName={true}
                      showScore={false}
                    />
                  ))}
                </div>
                <span className="podium-score">{thirdPlacePlayers[0].score}</span>
              </>
            )
          ) : <span className="podium-score">-</span>}
        </div>
      </div>

      {/* Other Players */}
      {otherPlayers.length > 0 && (
        <div className="other-players-container">
          <h3>{t('Other Players')}</h3>
          <div className="other-players-list">
            {otherPlayers.map((player: Player, index: number) => (
              <div key={index} className="other-player-item">
                <PlayerAvatar
                  pseudo={player.username}
                  avatar={player.avatarUrl}
                  size="small"
                  showName={true}
                  showScore={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="score-next-section">
        {isHost && (
          <button
            className="submit-button"
            onClick={async () => {
              setLoading(true);
              if (isLastRound) {
                await fetch(`http://localhost:8081/api/game/session/${session.sessionId}/reset`, { method: 'POST' });
              } else {
                await fetch(`http://localhost:8081/api/game/session/${session.sessionId}/next`, { method: 'POST' });
              }
              setLoading(false);
            }}
            disabled={loading}
          >
            {loading ? t('loading') : isLastRound ? t('Back to Lobby') : t('Next Round')}
          </button>
        )}
      </div>
    </div>
  );
};

export default ScoreScreen; 