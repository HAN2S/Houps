import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import PlayersBar from './PlayersBar';
import QuestionDisplay from '../components/QuestionDisplay';
import TimerContainer from '../components/TimerContainer';
import './styles/QuizScreen.css';

interface Question {
  questionId: number;
  themeId: number;
  questionType: 'Text' | 'Image' | 'Audio';
  questionText: string;
  correctAnswer: string;
  mediaUrl?: string;
  difficulty: number;
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

  const players = session.players || [];
  const questionId = session.currentQuestionId;
  const currentCategory = session.selectedCategory;
  const timer = session.timePerQuestion;
  const currentRound = session.currentRound;
  const totalRounds = session.totalRounds;

  

  // State to track screen width and player bar layout
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1024);

  useEffect(() => {
    if (!questionId) {
      setQuestion(null);
      return;
    }
    console.log('players: ', players);
    fetch(`http://localhost:8081/api/questions/${questionId}`)
      .then(res => res.json())
      .then(data => setQuestion(data))
      .catch(() => setQuestion(null));
  }, [questionId]);

  useEffect(() => {
    setTimeLeft(timer);
  }, [timer, questionId]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev: number) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Effect to update isSmallScreen on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer) {
      alert(t('errorAnswer'));
      return;
    }
    setAnswer('');
    // You can add your answer submission logic here
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
            <div className="round-counter">
              {currentRound}/{totalRounds}
            </div>
          </div>
        </div>
      </div>
      {/* Middle Section: Question and Answer */}
      <div className="middle-section">
        {/* Question Area */}
        {question && (
          <QuestionDisplay
            question={question}
            theme={currentCategory}
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
                />
                <button
                  type="submit"
                  className="submit-button"
                >
                  {t('submit')}
                </button>
              </div>
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