import React from 'react';
import './styles/PlayerAvatar.css';

interface PlayerAvatarProps {
  pseudo: string;
  avatar: string;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  score?: number;
  showScore?: boolean;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  pseudo,
  avatar,
  size = 'medium',
  showName = true,
  score,
  showScore = false
}) => {
  // Ensure pseudo is a string and handle undefined values
  const displayName = pseudo || 'Unknown Player';
  
  return (
    <div className={`player-avatar-container ${size}`}>
      <div className="avatar-score-container">
        <img
          src={avatar || '/assets/avatar1.png'}
          alt={displayName}
          className="player-avatar"
          title={displayName}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/avatar1.png';
          }}
        />
        {showScore && typeof score === 'number' && (
          <span className="player-score">
            {score}
          </span>
        )}
      </div>
      {showName && (
        <span className="player-avatar-name">
          {(size === 'small' || size === 'medium') && displayName.length > 8 ? (
            <>
              {displayName.substring(0, 8)}<br />{displayName.substring(8)}
            </>
          ) : (
            displayName
          )}
        </span>
      )}
    </div>
  );
};

export default PlayerAvatar; 