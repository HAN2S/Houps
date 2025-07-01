import React from 'react';
import { useTranslation } from 'react-i18next';

interface Question {
  questionId: number;
  themeId: number;
  questionType: 'Text' | 'Image' | 'Audio';
  questionText: string;
  correctAnswer: string;
  mediaUrl?: string;
  difficulty: number;
}

interface QuestionDisplayProps {
  question: Question;
  theme?: string;
  themeLabels?: { [key: string]: string };
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  theme,
  themeLabels = {}
}) => {
  const { t } = useTranslation();

  return (
    <div className="question-area">
      {theme && (
        <h3 className="theme-title">
          {themeLabels[theme] || theme}
        </h3>
      )}
      <h2 className="question-text">{question.questionText}</h2>
      {question.questionType === 'Image' && question.mediaUrl && (
        <img
          src={question.mediaUrl}
          alt="Question"
          className="question-image"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/Color_Palette.png';
          }}
        />
      )}
      {question.questionType === 'Audio' && question.mediaUrl && (
        <audio controls className="question-audio">
          <source src={question.mediaUrl} type="audio/mpeg" />
          {t('audioNotSupported')}
        </audio>
      )}
    </div>
  );
};

export default QuestionDisplay; 