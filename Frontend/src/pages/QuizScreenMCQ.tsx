import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PlayersBar from './PlayersBar';
import AnswerChoices from '../components/AnswerChoices';
import QuestionDisplay from '../components/QuestionDisplay';
import TimerContainer from '../components/TimerContainer';
import axios from 'axios';
import './styles/QuizScreen.css';

interface QuizScreenMCQProps {
  session: any;
}

const QuizScreenMCQ: React.FC<QuizScreenMCQProps> = ({ session }) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string>('');
  const currentPlayerId = localStorage.getItem('playerId');
  const players = session.players || [];
  const question = session.currentQuestion || session.question || null;
  const timer = session.timer ?? session.timePerQuestion;
  const hasAnswered = players.find((p: any) => p.id === currentPlayerId)?.hasAnswered;

  const handleAnswerSelect = async (answer: string) => {
    if (hasAnswered) return;
    try {
      await axios.post(`http://localhost:8081/api/game/${session.sessionId}/answer/mcq`, {
        playerId: currentPlayerId,
        answer,
      });
      setError('');
    } catch (err) {
      setError('Error submitting answer');
    }
  };

  const mappedPlayers = players.map((p: any) => ({
    pseudo: p.username,
    avatar: p.avatarUrl,
    score: p.score,
  }));

  return (
    <div className="quiz-container">
      <div className="top-section">
        <div className="top-grid">
          <div className="grid-item"></div>
          <div className="grid-item">
            <TimerContainer timeLeft={timer} totalTime={session.timePerQuestion} />
          </div>
          <div className="grid-item">
            <div className="round-counter">
              {session.currentRound}/{session.totalRounds}
            </div>
          </div>
        </div>
      </div>
      <div className="middle-section">
        {question && (
          <QuestionDisplay
            question={question}
            theme={session.selectedCategory}
            themeLabels={{}}
          />
        )}
        <AnswerChoices
          choices={question?.choices || []}
          onAnswerSelect={handleAnswerSelect}
          selectedAnswer={null}
        />
      </div>
      <div className="players-section">
        <PlayersBar players={mappedPlayers} showScores={true} layout="horizontal" />
      </div>
      {error && <div className="error-container">{error}</div>}
    </div>
  );
};

export default QuizScreenMCQ; 