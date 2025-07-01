import React from 'react';

interface TimerContainerProps {
  timeLeft: number;
  totalTime: number;
}

const TimerContainer: React.FC<TimerContainerProps> = ({
  timeLeft,
  totalTime
}) => {
  return (
    <div className="timer-container">
      <div className="timer-circle">
        <div className="timer-background"></div>
        <div
          className="timer-progress"
          style={{
            clipPath: `inset(0 0 ${100 - (timeLeft / totalTime) * 100}% 0)`,
          }}
        ></div>
        <span className="timer-text">
          {timeLeft}s
        </span>
      </div>
    </div>
  );
};

export default TimerContainer; 