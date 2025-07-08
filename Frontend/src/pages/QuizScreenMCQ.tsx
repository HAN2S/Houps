import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PlayersBar from './PlayersBar';
import AnswerChoices from '../components/AnswerChoices';
import QuestionDisplay from '../components/QuestionDisplay';
import TimerContainer from '../components/TimerContainer';
import axios from 'axios';
import './styles/QuizScreen.css';
import RoundCounter from '../components/RoundCounter';

interface QuizScreenMCQProps {
  session: any;
}

const QuizScreenMCQ: React.FC<QuizScreenMCQProps> = ({ session }) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string>('');
  const [question, setQuestion] = useState<any>(null);
  const currentPlayerId = localStorage.getItem('playerId');
  const players = Array.isArray(session.players) ? session.players : [];
  const choices = Array.isArray(session.finalOptions) ? session.finalOptions : [];

  const timer = session.timer ?? session.timePerQuestion;
  const hasAnswered = players.find((p: any) => p.id === currentPlayerId)?.hasAnswered;
  const [timeLeft, setTimeLeft] = useState(session.timePerQuestion);

  // Fetch question by currentQuestionId
  useEffect(() => {
    if (!session.currentQuestionId) return;
    fetch(`http://localhost:8081/api/questions/${session.currentQuestionId}`)
      .then(res => res.json())
      .then(data => setQuestion(data))
      .catch(() => setQuestion(null));
  }, [session.currentQuestionId]);

  useEffect(() => {
    setTimeLeft(session.timePerQuestion);
  }, [session.currentQuestionId]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!hasAnswered) {
        // Auto-submit empty answer if not answered
        handleAnswerSelect('');
        // Notify backend to transition to ANSWERS_REVEAL phase
        fetch(`http://localhost:8081/api/game/session/${session.sessionId}/mcq-answer-timeout`, {
          method: 'POST',
        });
      }
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev: number) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, hasAnswered]);

  const handleAnswerSelect = async (answer: string) => {
    if (hasAnswered) return;
    try {
      if (!currentPlayerId) throw new Error('No playerId found');
      await fetch(
        `http://localhost:8081/api/game/session/${session.sessionId}/answer/mcq?playerId=${encodeURIComponent(currentPlayerId)}&answer=${encodeURIComponent(answer)}`,
        { method: 'POST' }
      );
      setError('');
    } catch (err) {
      setError('Error submitting answer');
    }
  };

  const mappedPlayers = players.map((p: any) => ({
    username: p.username,
    avatarUrl: p.avatarUrl,
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
            <RoundCounter currentRound={session.currentRound} totalRounds={session.totalRounds} />
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
          session={session}
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