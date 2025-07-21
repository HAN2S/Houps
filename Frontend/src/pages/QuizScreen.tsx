import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import PlayersBar from './PlayersBar';
import QuestionDisplay from '../components/QuestionDisplay';
import TimerContainer from '../components/TimerContainer';
import RoundCounter from '../components/RoundCounter';
import './styles/QuizScreen.css';

interface Question {
  questionId: number;
  themeId?: number; // Make optional to allow null assignment
  questionType: 'Text' | 'Image' | 'Audio';
  questionText: string;
  correctAnswer: string;
  mediaUrl?: string;
  difficulty: number;
  trapAnswer?: string;
  fallbackOptions?: string[];
}

interface Player {
  pseudo: string;
  avatar: string;
  score: number;
}

interface QuizScreenProps {
  session: any;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ session }) => {
  const { t } = useTranslation();
  const { roomId } = useParams<{ roomId: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(session.timePerQuestion);
  const [answer, setAnswer] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<null | boolean>(null);
  const [showCorrectWarning, setShowCorrectWarning] = useState(false);
  const [allCategories, setAllCategories] = useState<{ id: number; name: string }[]>([]);

  const players = session.players || [];
  const questionId = session.currentQuestionId;
  const currentCategory = session.selectedCategory;
  const timer = session.timePerQuestion;
  const currentRound = session.currentRound;
  const totalRounds = session.totalRounds;

  

  // State to track screen width and player bar layout
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1024);

  // Helper to get playerId from localStorage
  const playerId = localStorage.getItem('playerId');
  const sessionId = session.sessionId;

  const submitWrongAnswer = async (answerToSubmit: string) => {
    if (!playerId || !sessionId) return;
    try {
      await fetch(`http://localhost:8081/api/game/session/${sessionId}/answer/wrong?playerId=${encodeURIComponent(playerId)}&answer=${encodeURIComponent(answerToSubmit)}`, {
        method: 'POST',
      });
    } catch (err) {
      // Optionally handle error
      console.error('Failed to submit wrong answer', err);
    }
  };

  useEffect(() => {
    if (!questionId) {
      setQuestion(null);
      return;
    }
    // Helper to capitalize language code
    function capitalize(str: string) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    const lang = session.language || 'en';
    fetch(`http://localhost:8081/api/questions/${questionId}`)
      .then(res => res.json())
      .then(data => {
        // Map backend response to frontend Question interface
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
  }, [questionId, session.language]);

  useEffect(() => {
    setTimeLeft(timer);
    setAnswer("");
    setHasSubmitted(false);
    setIsCorrect(null);
  }, [timer, questionId]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!hasSubmitted) {
        setHasSubmitted(true);
        setIsCorrect(null); // No answer submitted
        submitWrongAnswer(''); // Empty string for no answer

        // Notify backend that time is up (any client can do this)
        fetch(`http://localhost:8081/api/game/session/${session.sessionId}/wrong-answer-timeout`, {
          method: 'POST',
        });
      }
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev: number) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, hasSubmitted]);

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

  // Effect to update isSmallScreen on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer) {
      alert(t('errorAnswer'));
      return;
    }
    if (hasSubmitted) return;
    if (question && answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
      setShowCorrectWarning(true);
      return;
    } else {
      setShowCorrectWarning(false);
    }
    setHasSubmitted(true);
    await submitWrongAnswer(answer);
    setIsCorrect(false); // Always false for wrong answer phase
    setAnswer('');
  };

  return (
    <div className="quiz-container">
      <div className="top-section">
        <div className="top-grid">
          <div className="grid-item"></div>
          <div className="grid-item">
            <TimerContainer
              timeLeft={timeLeft}
              totalTime={timer}
            />
          </div>
          <div className="grid-item">
            <RoundCounter currentRound={currentRound} totalRounds={totalRounds} />
          </div>
        </div>
      </div>
      {/* Middle Section: Question and Answer */}
      <div className="middle-section">
        {/* Question Area */}
        {question && (
          <QuestionDisplay
            question={question}
            theme={getCategoryName(currentCategory)}
          />
        )}

        {/* Answer Input */}
        {question && (
          <div className="answer-form">
            <form onSubmit={handleSubmit} className="answer-form-container">
              <div className="answer-input-group">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={t('typeAnswer')}
                  className="answer-input"
                  disabled={hasSubmitted || timeLeft <= 0}
                />
                <button
                  type="submit"
                  className="submit-button"
                  disabled={hasSubmitted || timeLeft <= 0}
                >
                  {t('submit')}
                </button>
              </div>
              {showCorrectWarning && (
                <div className="answer-feedback warning">
                  {t('submitWrongAnswerWarning') || 'You found the correct answer! Please submit a wrong one to trick other players.'}
                </div>
              )}

            </form>
          </div>
        )}
      </div>

      {/* Players List */}
      <div className="players-section">
        <PlayersBar players={players} showScores={true} layout="horizontal" />
      </div>
    </div>
  );
};

export default QuizScreen;