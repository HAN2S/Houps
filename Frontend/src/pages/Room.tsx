import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Lobby from './Lobby';
import CategorySelectionScreen from './CategorySelectionScreen';
import DifficultySelectionScreen from './DifficultySelectionScreen';
import QuizScreen from './QuizScreen';
import QuizScreenMCQ from './QuizScreenMCQ';
import QuizScreenAnswers from './QuizScreenAnswers';
import ScoreScreen from './ScoreScreen';
import { useRoomWebSocket } from '../hooks/useRoomWebSocket';
import axios from 'axios';

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [session, setSession] = useState<any | null>(null);

  // Memoize the roomId to prevent unnecessary WebSocket reconnections
  const memoizedRoomId = useMemo(() => roomId || '', [roomId]);

  // Fetch the initial session state via HTTP when the component mounts
  useEffect(() => {
    if (!memoizedRoomId) return;
    axios.get(`http://localhost:8081/api/rooms/${memoizedRoomId}`)
      .then((response) => {
        setSession(response.data);
        console.error('response: ',memoizedRoomId);

      })
      .catch((error) => {
        console.error('Failed to fetch room session:', error);
      });
  }, [memoizedRoomId]);

  // Real-time updates via WebSocket
  const handleRoomUpdate = useCallback((data: any) => {
    console.log('Received room update:', data);
    setSession(data);
  }, []);

  // Only call useRoomWebSocket if we have a valid roomId
  useRoomWebSocket(memoizedRoomId, handleRoomUpdate);

  if (!session) {
    return <div>Loading...</div>;
  }

  // Map backend phase to frontend component
  const renderCurrentPhase = () => {
    switch (session.currentPhase) {
      case 'CATEGORY_SELECTION':
        return <CategorySelectionScreen session={session} />;
      case 'DIFFICULTY_SELECTION':
        return <DifficultySelectionScreen session={session} />;
      case 'COLLECTING_WRONG_ANSWERS':
        return <QuizScreen session={session} />;
      case 'MCQ_ANSWERING':
        return <QuizScreenMCQ session={session} />;
      case 'SCORE_DISPLAY':
        return <ScoreScreen session={session} />;
      default:
        // LOBBY or unknown phase
        return <Lobby session={session} />;
    }
  };

  return (
    <div className="room-container">
      {renderCurrentPhase()}
    </div>
  );
};

export default Room; 