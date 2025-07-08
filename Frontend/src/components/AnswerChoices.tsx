import React from 'react';
import AnswerChoice from './AnswerChoice';
import './styles/AnswerChoices.css';
import type { Player } from '../types/Player';

interface AnswerChoicesProps {
  session: any;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  showPlayerAnswers?: boolean;
  interactive?: boolean;
  fallbackOptions?: string[];
  correctAnswer?: string;
  trapAnswer?: string;
}

const AnswerChoices: React.FC<AnswerChoicesProps> = ({
  session,
  selectedAnswer,
  onAnswerSelect,
  showPlayerAnswers = false,
  interactive = true,
  fallbackOptions = [],
  correctAnswer,
  trapAnswer,
}) => {
  const choices = Array.isArray(session.finalOptions) ? session.finalOptions : [];
  console.log('Fallback anwsers:', fallbackOptions);
  const players: Player[] = session.players.map((p: any) => ({
    username: p.username,
    avatarUrl: p.avatarUrl,
    score: p.score,
    selectedAnswer: p.currentAnswer,
    writtenAnswer: p.wrongAnswerSubmitted,
  })) ;
  return (
    <div className="answer-choices quiz-answers">
      {choices.map((choice: string, index: number) => (
        <AnswerChoice
          key={index}
          answer={choice}
          onSelect={() => onAnswerSelect(choice)}
          isSelected={selectedAnswer === choice}
          showPlayers={showPlayerAnswers}
          players={players}
          interactive={interactive}
          isCorrect={correctAnswer === choice}
          isFallback={fallbackOptions.includes(choice)}
          trapAnswer={trapAnswer}
        />
      ))}
    </div>
  );
};

export default AnswerChoices; 