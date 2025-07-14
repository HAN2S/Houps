import React, { useState, useEffect } from 'react';
import QuestionDisplay from '../components/QuestionDisplay';
import AnswerChoices from '../components/AnswerChoices';
import './styles/QuizScreen.css';
import type { Player } from '../types/Player';
import RoundCounter from '../components/RoundCounter';

interface QuizScreenAnswersProps {
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

const QuizScreenAnswers: React.FC<QuizScreenAnswersProps> = ({ session }) => {
  const players: Player[] = Array.isArray(session.players) ? session.players.map((p: any) => ({
    username: p.username,
    avatarUrl: p.avatarUrl,
    score: p.score,
    selectedAnswer: p.currentAnswer,
    writtenAnswer: p.wrongAnswerSubmitted,
  })) : [];
  const [question, setQuestion] = useState<Question | null>(session.currentQuestion || session.question || null);
  const [loading, setLoading] = useState(false);
  const [allCategories, setAllCategories] = useState<{ id: number; name: string }[]>([]);

  // Fetch question by currentQuestionId (for consistency with other screens)
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

  const handleNext = async () => {
    setLoading(true);
    await fetch(`http://localhost:8081/api/game/session/${session.sessionId}/reveal-to-score`, { method: 'POST' });
    setLoading(false);
  };

  const currentPlayerId = localStorage.getItem('playerId');
  const isHost = Array.isArray(session.players) && session.players.find((p: any) => p.id === currentPlayerId)?.host === true;

  return (
    <div className="quiz-container">
      <div className="top-section">
        <div className="top-grid">
          <div className="grid-item"></div>
          <div className="grid-item"></div>
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
          selectedAnswer={null}
          onAnswerSelect={() => {}}
          showPlayerAnswers={true}
          fallbackOptions={question ? question.fallbackOptions || [] : []}
          correctAnswer={question ? question.correctAnswer : ''}
          trapAnswer={question ? question.trapAnswer : ''}
        />
        <div className="continue-section">
          {isHost && (
            <button className="submit-button" onClick={handleNext} disabled={loading}>
              {loading ? 'Loading...' : 'Show Leaderboard'}
            </button>
          )}
        </div>
      </div>
      <div className="players-section">
      </div>
    </div>
  );
};

export default QuizScreenAnswers; 