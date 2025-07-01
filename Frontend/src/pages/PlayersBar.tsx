import React from 'react';
import { useTranslation } from 'react-i18next';
import PlayerAvatar from '../components/PlayerAvatar';
import './styles/PlayersBar.css';

interface Player {
  username: string;
  avatarUrl: string;
  score?: number;
}

interface PlayersBarProps {
  players: Player[];
  showScores?: boolean;
  layout?: 'horizontal' | 'vertical';
  currentPlayerIndex?: number;
}

const PlayersBar: React.FC<PlayersBarProps> = ({ players, showScores = false, layout = 'horizontal', currentPlayerIndex = -1 }) => {
  const { t } = useTranslation();

  return (
    <div className={`players-bar-wrapper ${layout === 'vertical' ? 'vertical' : ''}`}>
      <div className={`players-bar ${layout === 'vertical' ? 'vertical' : ''}`}>
        {players.map((player, idx) => (
          <div
            key={idx}
            className={`player-card ${layout === 'vertical' ? 'vertical' : ''} ${
              idx === currentPlayerIndex ? 'current-player' : ''
            }`}
          >
            <PlayerAvatar
              pseudo={player.username}
              avatar={player.avatarUrl}
              size={layout === 'vertical' ? 'large' : 'medium'}
              score={player.score}
              showScore={showScores}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayersBar;