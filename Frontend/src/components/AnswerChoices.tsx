import React from 'react';
import AnswerChoice from './AnswerChoice';
import './styles/AnswerChoices.css';

interface Player {
  pseudo: string;
  avatar: string;
  score: number;
  selectedAnswer?: string;
  writtenAnswer?: string;
}

interface AnswerChoicesProps {
  choices: string[];
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  players?: Player[];
  showPlayerAnswers?: boolean;
  interactive?: boolean;
}

const AnswerChoices: React.FC<AnswerChoicesProps> = ({
  choices,
  selectedAnswer,
  onAnswerSelect,
  players = [],
  showPlayerAnswers = false,
  interactive = true
}) => {
  return (
    <div className="answer-choices quiz-answers">
      {choices.map((choice, index) => (
        <AnswerChoice
          key={index}
          answer={choice}
          onSelect={() => onAnswerSelect(choice)}
          isSelected={selectedAnswer === choice}
          showPlayers={showPlayerAnswers}
          players={players}
          interactive={interactive}
        />
      ))}
    </div>
  );
};

export default AnswerChoices; 