import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import { BrowserRouter } from 'react-router-dom';
import QuizScreen from '../pages/QuizScreen';
import { useTranslation } from 'react-i18next';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock the PlayersBar component
jest.mock('../PlayersBar', () => {
  return function MockPlayersBar({ players, showScores, layout }: any) {
    return (
      <div data-testid="players-bar">
        {players.map((player: any) => (
          <div key={player.pseudo} data-testid={`player-${player.pseudo}`}>
            {player.pseudo} - {player.score}
          </div>
        ))}
      </div>
    );
  };
});

describe('QuizScreen', () => {
  const mockQuestion = {
    questionId: 1,
    themeId: 1,
    questionType: 'Text' as const,
    questionText: 'Which country won the FIFA World Cup 2022?',
    correctAnswer: 'Argentina',
    difficulty: 2,
    mediaUrl: '/assets/Color_Palette.png',
  };

  const renderQuizScreen = (props = {}) => {
    return render(
      <BrowserRouter>
        <QuizScreen timer={30} theme="sports" {...props} />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the quiz screen with initial state', () => {
    renderQuizScreen();
    
    // Check if timer is rendered
    expect(screen.getByText('30s')).toBeInTheDocument();
    
    // Check if question is rendered
    expect(screen.getByText(mockQuestion.questionText)).toBeInTheDocument();
    
    // Check if answer input is rendered
    expect(screen.getByPlaceholderText('typeAnswer')).toBeInTheDocument();
    
    // Check if submit button is rendered
    expect(screen.getByText('submit')).toBeInTheDocument();
  });

  it('updates timer correctly', () => {
    renderQuizScreen();
    
    // Initial timer value
    expect(screen.getByText('30s')).toBeInTheDocument();
    
    // Advance timer by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Check if timer updated
    expect(screen.getByText('25s')).toBeInTheDocument();
  });

  it('handles answer submission', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    renderQuizScreen();
    
    // Type an answer
    const input = screen.getByPlaceholderText('typeAnswer');
    fireEvent.change(input, { target: { value: 'Argentina' } });
    
    // Submit the answer
    const submitButton = screen.getByText('submit');
    fireEvent.click(submitButton);
    
    // Check if answer was logged
    expect(consoleSpy).toHaveBeenCalledWith('Submitted answer:', 'Argentina');
    
    // Check if input was cleared
    expect(input).toHaveValue('');
    
    consoleSpy.mockRestore();
  });

  it('shows error when submitting empty answer', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    renderQuizScreen();
    
    // Submit without entering an answer
    const submitButton = screen.getByText('submit');
    fireEvent.click(submitButton);
    
    // Check if error was shown
    expect(alertSpy).toHaveBeenCalledWith('errorAnswer');
    
    alertSpy.mockRestore();
  });

  it('renders players correctly', () => {
    renderQuizScreen();
    
    // Check if PlayersBar is rendered
    expect(screen.getByTestId('players-bar')).toBeInTheDocument();
    
    // Check if some players are rendered
    expect(screen.getByTestId('player-You')).toBeInTheDocument();
    expect(screen.getByTestId('player-Alice')).toBeInTheDocument();
  });

  it('renders theme title correctly', () => {
    renderQuizScreen({ theme: 'sports' });
    expect(screen.getByText('Sports')).toBeInTheDocument();
  });

  it('handles image question type', () => {
    const imageQuestion = {
      ...mockQuestion,
      questionType: 'Image' as const,
    };
    
    renderQuizScreen();
    // Note: In a real test, you would need to mock the image loading
    // and test the error fallback
  });

  it('handles audio question type', () => {
    const audioQuestion = {
      ...mockQuestion,
      questionType: 'Audio' as const,
    };
    
    renderQuizScreen();
    // Note: In a real test, you would need to mock the audio element
    // and test its functionality
  });
}); 