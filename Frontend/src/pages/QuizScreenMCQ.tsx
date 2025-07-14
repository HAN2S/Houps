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

interface Question {
  questionId: number;
  themeId?: number;
  questionType: 'Text' | 'Image' | 'Audio';
  questionText: string;
  correctAnswer: string;
  mediaUrl?: string;
  difficulty: number;
  trapAnswer?: string;
  fallbackOptions?: string[];
}

const QuizScreenMCQ: React.FC<QuizScreenMCQProps> = ({ session }) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string>('');
  const [question, setQuestion] = useState<Question | null>(null);
  const currentPlayerId = localStorage.getItem('playerId');
  const players = Array.isArray(session.players) ? session.players : [];
  const choices = Array.isArray(session.finalOptions) ? session.finalOptions : [];

  const timer = session.timer ?? session.timePerQuestion;
  const hasAnswered = players.find((p: any) => p.id === currentPlayerId)?.hasAnswered;
  const [timeLeft, setTimeLeft] = useState(session.timePerQuestion);
  const [allCategories, setAllCategories] = useState<{ id: number; name: string }[]>([]);

  // Fetch question by currentQuestionId
  useEffect(() => {
    if (!session.currentQuestionId) return;
    function capitalize(str: string) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    const lang = session.language || 'en';
    fetch(`http://localhost:8081/api/questions/${session.currentQuestionId}`)
      .then(res => res.json())
      .then(data => {
        const questionText = data[`questionText${capitalize(lang)}`] || data.questionTextEn;
        const correctAnswer = data[`correctAnswer${capitalize(lang)}`] || data.correctAnswerEn;
        const trapAnswer = data[`trapAnswer${capitalize(lang)}`] || data.trapAnswerEn;
        const fallbackOptions = (data.fallbackOptions || []).map((opt: any) =>
          opt[`fallback${capitalize(lang)}`] || opt.fallbackEn
        );
        setQuestion({
          questionId: data.id,
          themeId: undefined,
          questionType: data.imageUrl ? 'Image' : 'Text',
          questionText,
          correctAnswer,
          mediaUrl: data.imageUrl,
          difficulty: data.difficulty,
          trapAnswer,
          fallbackOptions,
        });
      })
      .catch(() => setQuestion(null));
  }, [session.currentQuestionId, session.language]);

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

  useEffect(() => {
    fetch('http://localhost:8081/api/questions/categories', {
      headers: { 'Accept-Language': session.language }
    })
      .then(res => res.json())
      .then(data => setAllCategories(data))
      .catch(err => console.error('Failed to fetch categories', err));
  }, [session.language]);

  const getCategoryName = (id: number | string) => {
    const cat = allCategories.find(c => String(c.id) === String(id));
    return cat ? cat.name : String(id);
  };

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
            theme={getCategoryName(session.selectedCategory)}
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