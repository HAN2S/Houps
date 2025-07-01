import React from 'react';
import QuestionDisplay from '../components/QuestionDisplay';
import AnswerChoices from '../components/AnswerChoices';
import PlayersBar from './PlayersBar';
import './styles/QuizScreen.css';

interface QuizScreenAnswersProps {
  session: any;
}

const QuizScreenAnswers: React.FC<QuizScreenAnswersProps> = ({ session }) => {
  const players = session.players || [];
  const question = session.currentQuestion || session.question || null;

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
          <div className="grid-item"></div>
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
          selectedAnswer={null}
          onAnswerSelect={() => {}}
          players={players}
          showPlayerAnswers={true}
        />
      </div>
      <div className="players-section">
        <PlayersBar players={mappedPlayers} showScores={true} layout="horizontal" />
      </div>
    </div>
  );
};

export default QuizScreenAnswers; 