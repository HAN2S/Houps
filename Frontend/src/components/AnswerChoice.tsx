import React from 'react';
import PlayerAvatar from './PlayerAvatar';
import type { Player } from '../types/Player';

interface AnswerChoiceProps {
  answer: string;
  onSelect: () => void;
  isSelected: boolean;
  showPlayers?: boolean;
  players?: Player[];
  interactive?: boolean;
  isCorrect?: boolean;
  isFallback?: boolean;
}

const AnswerChoice: React.FC<AnswerChoiceProps> = ({
  answer,
  onSelect,
  isSelected,
  showPlayers = false,
  players = [],
  interactive = true,
  isCorrect = false,
  isFallback = false
}) => {
  const playersWithSelectedAnswer = players.filter(player => player.selectedAnswer === answer);
  const playersWithWrittenAnswer = players.filter(player => player.writtenAnswer === answer);

  const content = (
    <div className="answer-main">
      <div className="answer-text">{answer}</div>
      {showPlayers && (
        <>
          <div className="player-avatars">
            {playersWithSelectedAnswer.map((player, index) => (
              <PlayerAvatar
                key={index}
                pseudo={player.username}
                avatar={player.avatarUrl}
                size="small"
              />
            ))}
          </div>
          {playersWithWrittenAnswer.length > 0 && (
            <div className="answer-players">
              Answer of: {playersWithWrittenAnswer.map(p => p.username).join(', ')}
            </div>
          )}
        </>
      )}
      {isCorrect && (
        <div className="answer-players">Correct Answer</div>
      )}
      {isFallback && playersWithWrittenAnswer.length === 0 && (
        <div className="answer-players">Our answer</div>
      )}
    </div>
  );

  if (interactive) {
    return (
      <button
        className={`answer-choice ${isSelected ? 'selected' : ''}`}
        onClick={onSelect}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`answer-choice ${isSelected ? 'selected' : ''}`}>
      {content}
    </div>
  );
};

export default AnswerChoice; 