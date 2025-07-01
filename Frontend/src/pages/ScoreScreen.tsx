import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PlayerAvatar from '../components/PlayerAvatar';
import { Fireworks } from 'fireworks-js';
import './styles/ScoreScreen.css';

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
  const { t } = useTranslation();
  const { width } = useWindowSize();
  const players = (session.players || []).map((p: any) => ({
    pseudo: p.username,
    avatar: p.avatarUrl,
    score: p.score,
  }));
  const currentRound = session.currentRound || 0;
  const totalRounds = session.totalRounds || 0;

  const [showFireworks, setShowFireworks] = useState(false);
  const fireworksContainerRef = useRef<HTMLDivElement>(null);
  const fireworksInstance = useRef<Fireworks | null>(null);

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
      <div id="fireworks-container" ref={fireworksContainerRef} className="fireworks-container" style={{ pointerEvents: showFireworks ? 'none' : 'auto' }}>
        {/* Fireworks will be rendered inside this div by the utility */}
      </div>
      <h1>{t('Scoreboard')}</h1>

      <div className="podium-container">
        {/* Second Place */}
        {secondPlacePlayers.length > 0 && (
          <div className={`podium-spot second-place ${secondPlacePlayers.length > 1 ? 'multiple-players' : ''}`}>
            {secondPlacePlayers.length === 1 ? (
              <div className="podium-player single-player">
                <PlayerAvatar
                  pseudo={secondPlacePlayers[0].pseudo}
                  avatar={secondPlacePlayers[0].avatar}
                  size={getAvatarSize()}
                  showName={true}
                  showScore={false}
                />
              </div>
            ) : (
              <div className="podium-players-container">
                {secondPlacePlayers.map((player: any, index: number) => (
                  <div key={index} className="podium-player">
                    <PlayerAvatar
                      pseudo={player.pseudo}
                      avatar={player.avatar}
                      size={getMultiplePlayersAvatarSize()}
                      showName={true}
                      showScore={false}
                    />
                  </div>
                ))}
              </div>
            )}
            <span className="podium-score">{secondPlacePlayers[0].score}</span>
          </div>
        )}

        {/* First Place */}
        {firstPlacePlayers.length > 0 && (
          <div className={`podium-spot first-place ${firstPlacePlayers.length > 1 ? 'multiple-players' : ''}`}>
            {firstPlacePlayers.length === 1 ? (
              <div className="podium-player single-player">
                <PlayerAvatar
                  pseudo={firstPlacePlayers[0].pseudo}
                  avatar={firstPlacePlayers[0].avatar}
                  size={getAvatarSize()}
                  showName={true}
                  showScore={false}
                />
              </div>
            ) : (
              <div className="podium-players-container">
                {firstPlacePlayers.map((player: any, index: number) => (
                  <div key={index} className="podium-player">
                    <PlayerAvatar
                      pseudo={player.pseudo}
                      avatar={player.avatar}
                      size={getMultiplePlayersAvatarSize()}
                      showName={true}
                      showScore={false}
                    />
                  </div>
                ))}
              </div>
            )}
            <span className="podium-score">{firstPlacePlayers[0].score}</span>
          </div>
        )}

        {/* Third Place */}
        {thirdPlacePlayers.length > 0 && (
          <div className={`podium-spot third-place ${thirdPlacePlayers.length > 1 ? 'multiple-players' : ''}`}>
            {thirdPlacePlayers.length === 1 ? (
              <div className="podium-player single-player">
                <PlayerAvatar
                  pseudo={thirdPlacePlayers[0].pseudo}
                  avatar={thirdPlacePlayers[0].avatar}
                  size={getAvatarSize()}
                  showName={true}
                  showScore={false}
                />
              </div>
            ) : (
              <div className="podium-players-container">
                {thirdPlacePlayers.map((player: any, index: number) => (
                  <div key={index} className="podium-player">
                    <PlayerAvatar
                      pseudo={player.pseudo}
                      avatar={player.avatar}
                      size={getMultiplePlayersAvatarSize()}
                      showName={true}
                      showScore={false}
                    />
                  </div>
                ))}
              </div>
            )}
            <span className="podium-score">{thirdPlacePlayers[0].score}</span>
          </div>
        )}
      </div>

      {/* Other Players */}
      {otherPlayers.length > 0 && (
        <div className="other-players-container">
          <h3>{t('Other Players')}</h3>
          <div className="other-players-list">
            {otherPlayers.map((player: any, index: number) => (
              <div key={index} className="other-player-item">
                <PlayerAvatar
                  pseudo={player.pseudo}
                  avatar={player.avatar}
                  size="small"
                  showName={true}
                  showScore={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreScreen; 