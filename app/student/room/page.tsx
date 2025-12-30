'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTracks,
  VideoTrack,
  useRoomContext,
  useLocalParticipant,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import Quiz from '@/components/Quiz';

function StudentRoomContent() {
  const searchParams = useSearchParams();
  const roomName = searchParams.get('room');
  const username = searchParams.get('username');
  const [token, setToken] = useState('');

  useEffect(() => {
    if (roomName && username) {
      fetch(`/api/token?room=${roomName}&username=${username}&role=student`)
        .then((res) => res.json())
        .then((data) => setToken(data.token))
        .catch((error) => {
          console.error('Error fetching token:', error);
          alert('Failed to connect to server. Please check your LiveKit configuration in .env.local');
        });
    }
  }, [roomName, username]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Connecting to room...</div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={true}
      data-lk-theme="default"
      className="h-screen lk-room-container"
      style={{ height: '100vh' }}
      onError={(error) => {
        console.error('LiveKit connection error:', error);
        alert('Failed to connect to LiveKit. Please check your configuration.');
      }}
    >
      <StudentRoomLayout username={username || ''} />
      <RoomAudioRenderer />
    </LiveKitRoom>
   );
}

function StudentRoomLayout({ username }: { username: string }) {
  const router = useRouter();
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [handRaised, setHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; message: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showScreenSharePrompt, setShowScreenSharePrompt] = useState(true);

  // Enable camera and microphone on mount
  useEffect(() => {
    const enableDevices = async () => {
      try {
        await localParticipant.setCameraEnabled(true);
        await localParticipant.setMicrophoneEnabled(true);
        setIsCameraOn(true);
        setIsMicOn(true);
      } catch (error) {
        console.error('Error enabling devices:', error);
      }
    };
    enableDevices();
  }, [localParticipant]);

  // Prompt for screen sharing on mount
  const handleScreenSharePromptResponse = async (accepted: boolean) => {
    setShowScreenSharePrompt(false);
    if (accepted) {
      try {
        // Request current tab screen share with specific constraints
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'browser',
          },
          audio: false,
          preferCurrentTab: true,
        } as any);
        
        // Publish the screen share track
        await localParticipant.publishTrack(stream.getVideoTracks()[0], {
          name: 'screen',
          source: Track.Source.ScreenShare,
        });
        setIsScreenSharing(true);
        
        // Handle when user stops sharing via browser UI
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          setIsScreenSharing(false);
        });
      } catch (error) {
        console.error('Error enabling screen share:', error);
        if ((error as Error).name === 'NotAllowedError') {
          alert('Screen sharing was denied. You can share later by clicking "Share Screen".');
        } else {
          alert('Failed to share screen. Please try manually clicking "Share Screen".');
        }
      }
    }
  };

  // Filter camera tracks
  const cameraTracks = tracks.filter((track) => track.source === Track.Source.Camera);
  
  // Find teacher's video feed (first camera track that's not the student's own)
  const teacherTrack = cameraTracks.find(
    (track) => track.participant.identity !== localParticipant.identity
  );

  // Find student's own video
  const myVideoTrack = cameraTracks.find(
    (track) => track.participant.identity === localParticipant.identity
  );

  // Debug: Log available tracks
  useEffect(() => {
    console.log('Available tracks:', tracks.length);
    console.log('Camera tracks:', cameraTracks.length);
    console.log('Teacher track found:', !!teacherTrack);
    console.log('My video track found:', !!myVideoTrack);
    tracks.forEach((track, idx) => {
      console.log(`Track ${idx}:`, {
        identity: track.participant.identity,
        name: track.participant.name,
        source: track.source,
        isLocal: track.participant.identity === localParticipant.identity
      });
    });
  }, [tracks, cameraTracks, teacherTrack, myVideoTrack, localParticipant]);

  const handleToggleCamera = async () => {
    const newState = !isCameraOn;
    await localParticipant.setCameraEnabled(newState);
    setIsCameraOn(newState);
  };

  const handleToggleMic = async () => {
    const newState = !isMicOn;
    await localParticipant.setMicrophoneEnabled(newState);
    setIsMicOn(newState);
  };

  const handleLeave = () => {
    room.disconnect();
    router.push('/student');
  };

  const handleRaiseHand = async () => {
    const newState = !handRaised;
    setHandRaised(newState);

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(
        JSON.stringify({
          type: 'hand-raised',
          username: username,
          raised: newState,
        })
      );
      await localParticipant.publishData(data, { reliable: true });
    } catch (error) {
      console.error('Error raising hand:', error);
    }
  };

  const handleShareScreen = async () => {
    if (!isScreenSharing) {
      try {
        // Request current tab screen share
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'browser' as any,
          } as any,
          audio: false,
          preferCurrentTab: true as any,
        });
        
        await localParticipant.publishTrack(stream.getVideoTracks()[0], {
          name: 'screen',
          source: Track.Source.ScreenShare,
        });
        setIsScreenSharing(true);
        
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          setIsScreenSharing(false);
        });
      } catch (error) {
        console.error('Error sharing screen:', error);
        alert('Failed to share screen. Please grant screen sharing permissions.');
      }
    } else {
      // Stop screen sharing
      const screenTracks = Array.from(localParticipant.trackPublications.values())
        .filter(pub => pub.source === Track.Source.ScreenShare);
      
      for (const track of screenTracks) {
        await localParticipant.unpublishTrack(track.track!);
      }
      setIsScreenSharing(false);
    }
  };

  // Listen for mute requests and chat messages from teacher
  useEffect(() => {
    const handleDataReceived = (payload: Uint8Array, participant: any) => {
      try {
        const decoder = new TextDecoder();
        const data = JSON.parse(decoder.decode(payload));
        if (
          data.type === 'mute-request' &&
          data.targetParticipant === localParticipant.identity
        ) {
          localParticipant.setMicrophoneEnabled(!data.muted);
          setIsMicOn(!data.muted);
        } else if (data.type === 'chat-message') {
          setChatMessages((prev) => [...prev, { sender: data.sender, message: data.message }]);
        }
      } catch (error) {
        console.error('Error handling data:', error);
      }
    };

    room.on('dataReceived', handleDataReceived);
    return () => {
      room.off('dataReceived', handleDataReceived);
    };
  }, [room, localParticipant]);

  const handleSendMessage = async () => {
    if (chatInput.trim()) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(
          JSON.stringify({
            type: 'chat-message',
            sender: username,
            message: chatInput.trim(),
          })
        );
        await localParticipant.publishData(data, { reliable: true });
        setChatMessages((prev) => [...prev, { sender: 'You', message: chatInput.trim() }]);
        setChatInput('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Screen Share Prompt Modal */}
      {showScreenSharePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4 border border-gray-700">
            <h2 className="text-white text-xl font-bold mb-4">Share Your Screen?</h2>
            <p className="text-gray-300 mb-6">
              The teacher would like to see your screen to monitor your progress and provide better assistance during the session.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleScreenSharePromptResponse(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition"
              >
                Not Now
              </button>
              <button
                onClick={() => handleScreenSharePromptResponse(true)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
              >
                Share Screen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left side - Quiz */}
        <div className="w-1/2 p-4 overflow-y-auto">
          <Quiz />
        </div>

        {/* Right side - Video and Chat */}
        <div className="w-1/2 p-4 flex flex-col">
          {/* Teacher Video */}
          <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden mb-3 relative">
            {teacherTrack && teacherTrack.publication ? (
              <VideoTrack trackRef={teacherTrack} className="w-full h-full object-cover" />
            ) : (
              <div className="h-full flex items-center justify-center text-white text-lg">
                Waiting for teacher to join...
              </div>
            )}
            <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm">
              Teacher
            </div>
          </div>

          {/* Student's own video preview */}
          <div className="h-40 bg-gray-800 rounded-lg overflow-hidden mb-3 relative">
            {myVideoTrack && myVideoTrack.publication ? (
              <VideoTrack trackRef={myVideoTrack as any} className="w-full h-full object-cover" />
            ) : (
              <div className="h-full flex items-center justify-center text-white text-sm">
                Camera Off
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
              You ({username})
            </div>
          </div>

          {/* Chat Section */}
          {showChat ? (
            <div className="bg-gray-800 rounded-lg p-3 flex flex-col h-48">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-semibold text-sm">Chat</h3>
                <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto mb-2 space-y-1">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className="bg-gray-700 rounded p-2">
                    <span className="text-blue-300 font-semibold text-xs">{msg.sender}: </span>
                    <span className="text-white text-xs">{msg.message}</span>
                  </div>
                ))}
                {chatMessages.length === 0 && (
                  <div className="text-gray-400 text-xs text-center py-4">No messages yet</div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type message..."
                  className="flex-1 px-2 py-1 rounded bg-gray-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowChat(true)}
              className="bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 text-sm"
            >
              💬 Open Chat
            </button>
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-3">
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={handleToggleMic}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              isMicOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isMicOn ? '🎤 Mic' : '🔇 Muted'}
          </button>
          
          <button
            onClick={handleToggleCamera}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              isCameraOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isCameraOn ? '📹 Camera' : '📹 Off'}
          </button>

          <button
            onClick={handleShareScreen}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              isScreenSharing
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {isScreenSharing ? '🛑 Stop Share' : '📺 Share Screen'}
          </button>

          <button
            onClick={handleRaiseHand}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              handRaised
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {handRaised ? '🖐️ Hand Raised' : '✋ Raise Hand'}
          </button>

          <button
            onClick={handleLeave}
            className="px-4 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition ml-auto"
          >
            🚪 Leave
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentRoom() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <StudentRoomContent />
    </Suspense>
  );
}
