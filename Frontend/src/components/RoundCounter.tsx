import React from 'react';

interface RoundCounterProps {
  currentRound: number;
  totalRounds: number;
}

const RoundCounter: React.FC<RoundCounterProps> = ({
  currentRound,
  totalRounds
}) => {
  return (
    <div className="round-counter">
      {currentRound}/{totalRounds}
    </div>
  );
};

export default RoundCounter; 