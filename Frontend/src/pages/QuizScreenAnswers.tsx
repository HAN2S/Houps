import React, { useState, useEffect } from 'react';
import QuestionDisplay from '../components/QuestionDisplay';
import AnswerChoices from '../components/AnswerChoices';
import './styles/QuizScreen.css';
import type { Player } from '../types/Player';
import RoundCounter from '../components/RoundCounter';

interface QuizScreenAnswersProps {
  session: any;
}

const QuizScreenAnswers: React.FC<QuizScreenAnswersProps> = ({ session }) => {
  const players: Player[] = Array.isArray(session.players) ? session.players.map((p: any) => ({
    username: p.username,
    avatarUrl: p.avatarUrl,
    score: p.score,
    selectedAnswer: p.currentAnswer,
    writtenAnswer: p.wrongAnswerSubmitted,
  })) : [];
  const [question, setQuestion] = useState<any>(session.currentQuestion || session.question || null);
  const [loading, setLoading] = useState(false);

  // Fetch question by currentQuestionId (for consistency with other screens)
  useEffect(() => {
    if (!session.currentQuestionId) return;
    fetch(`http://localhost:8081/api/questions/${session.currentQuestionId}`)
      .then(res => res.json())
      .then(data => setQuestion(data))
      .catch(() => setQuestion(null));
  }, [session.currentQuestionId]);

  const handleNext = async () => {
    setLoading(true);
    await fetch(`http://localhost:8081/api/game/session/${session.sessionId}/reveal-to-score`, { method: 'POST' });
    setLoading(false);
  };

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
            theme={session.selectedCategory}
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
        />
        <div className="continue-section">
          <button className="submit-button" onClick={handleNext} disabled={loading}>
            {loading ? 'Loading...' : 'Show Leaderboard'}
          </button>
        </div>
      </div>
      <div className="players-section">
      </div>
    </div>
  );
};

export default QuizScreenAnswers; 