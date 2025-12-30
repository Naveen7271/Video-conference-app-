'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LiveKitRoom, RoomAudioRenderer, useTracks, VideoTrack, useRoomContext, useLocalParticipant } from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

function TeacherRoomContent() {
  const searchParams = useSearchParams();
  const roomName = searchParams.get('room');
  const username = searchParams.get('username');
  const [token, setToken] = useState('');
  const [handRaisedStudents, setHandRaisedStudents] = useState<string[]>([]);

  useEffect(() => {
    if (roomName && username) {
      fetch(`/api/token?room=${roomName}&username=${username}&role=teacher`)
        .then((res) => res.json())
        .then((data) => setToken(data.token))
        .catch((error) => {
          console.error('Error fetching token:', error);
          alert('Failed to connect. Please check your LiveKit configuration in .env.local');
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
      <TeacherRoomLayout handRaisedStudents={handRaisedStudents} setHandRaisedStudents={setHandRaisedStudents} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function TeacherRoomLayout({ handRaisedStudents, setHandRaisedStudents }: { handRaisedStudents: string[], setHandRaisedStudents: React.Dispatch<React.SetStateAction<string[]>> }) {
  const router = useRouter();
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; message: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [selectedScreenIndex, setSelectedScreenIndex] = useState(0);
  
  const cameraTracks = tracks.filter((track) => track.source === Track.Source.Camera);
  const screenTracks = tracks.filter((track) => track.source === Track.Source.ScreenShare);

  // Filter to show only student camera feeds (not teacher's own)
  const studentTracks = cameraTracks.filter(
    (track) => track.participant.identity !== room.localParticipant.identity
  ).slice(0, 4);

  // Debug: Log available tracks and reset selection if needed
  useEffect(() => {
    console.log('[Teacher] Available tracks:', tracks.length);
    console.log('[Teacher] Camera tracks:', cameraTracks.length);
    console.log('[Teacher] Student tracks:', studentTracks.length);
    console.log('[Teacher] Screen tracks:', screenTracks.length);
    tracks.forEach((track, idx) => {
      console.log(`[Teacher] Track ${idx}:`, {
        identity: track.participant.identity,
        name: track.participant.name,
        source: track.source,
        isLocal: track.participant.identity === localParticipant.identity
      });
    });
    
    // Reset selected screen if index is out of bounds
    if (selectedScreenIndex >= screenTracks.length && screenTracks.length > 0) {
      setSelectedScreenIndex(0);
    }
  }, [tracks, cameraTracks, studentTracks, screenTracks, localParticipant, selectedScreenIndex]);

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

  // Listen for data messages
  useEffect(() => {
    const handleDataReceived = (payload: Uint8Array, participant: any) => {
      try {
        const decoder = new TextDecoder();
        const data = JSON.parse(decoder.decode(payload));
        if (data.type === 'hand-raised' && data.raised) {
          setHandRaisedStudents((prev) => 
            prev.includes(data.username) ? prev : [...prev, data.username]
          );
        } else if (data.type === 'hand-raised' && !data.raised) {
          setHandRaisedStudents((prev) => 
            prev.filter((name) => name !== data.username)
          );
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
  }, [room, setHandRaisedStudents]);

  const handleMuteToggle = async (participantIdentity: string, currentlyMuted: boolean) => {
    const participant = Array.from(room.remoteParticipants.values()).find(
      (p) => p.identity === participantIdentity
    );
    
    if (participant) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(
          JSON.stringify({
            type: 'mute-request',
            targetParticipant: participantIdentity,
            muted: currentlyMuted, // This should be true to mute, false to unmute
          })
        );
        await room.localParticipant.publishData(data, { reliable: true });
      } catch (error) {
        console.error('Error sending mute request:', error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (chatInput.trim()) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(
          JSON.stringify({
            type: 'chat-message',
            sender: localParticipant.name || 'Teacher',
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
    router.push('/teacher');
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center - Screen Share or Main View */}
        <div className="flex-1 p-4">
          {screenTracks.length > 0 ? (
            <div className="h-full bg-black rounded-lg overflow-hidden relative">
              {/* Display selected student's screen */}
              {screenTracks[selectedScreenIndex] && screenTracks[selectedScreenIndex].publication ? (
                <VideoTrack 
                  trackRef={screenTracks[selectedScreenIndex]} 
                  className="w-full h-full object-contain" 
                />
              ) : null}
              
              {/* Student selector dropdown when multiple screens */}
              {screenTracks.length > 1 && (
                <div className="absolute top-2 left-2 flex items-center gap-2">
                  <div className="bg-black bg-opacity-60 text-white px-3 py-1 rounded">
                    📺 Viewing:
                  </div>
                  <select
                    value={selectedScreenIndex}
                    onChange={(e) => setSelectedScreenIndex(Number(e.target.value))}
                    className="bg-black bg-opacity-80 text-white px-3 py-1 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {screenTracks.map((track, index) => (
                      <option key={track.participant.identity} value={index}>
                        {track.participant.name || `Student ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Single student indicator */}
              {screenTracks.length === 1 && (
                <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded">
                  📺 Screen Share - {screenTracks[0]?.participant.name}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-2">📺</div>
                <p>Waiting for student to share screen...</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Students and Chat */}
        <div className="w-80 p-4 flex flex-col space-y-3 overflow-y-auto">
          <h2 className="text-white text-lg font-bold">Students ({studentTracks.length})</h2>
          
          {/* Hand Raised Notifications */}
          {handRaisedStudents.length > 0 && (
            <div className="bg-yellow-600 text-white p-3 rounded-lg">
              <div className="font-semibold flex items-center text-sm">
                <span className="mr-2">🖐️</span> Hand Raised
              </div>
              {handRaisedStudents.map((student) => (
                <div key={student} className="text-xs mt-1">{student}</div>
              ))}
            </div>
          )}

          {/* Student Videos */}
          {studentTracks.map((track) => {
            const participant = track.participant;
            const audioTrack = participant.audioTrackPublications.values().next().value;
            const isMuted = audioTrack?.isMuted ?? true;

            return (
              <div key={track.participant.identity} className="relative bg-gray-700 rounded-lg overflow-hidden h-36">
                {track.publication && (
                  <VideoTrack trackRef={track} className="w-full h-full object-cover" />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-xs font-semibold truncate">
                      {participant.name}
                    </span>
                    <button
                      onClick={() => handleMuteToggle(participant.identity, !isMuted)}
                      className={`${
                        isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-500'
                      } text-white px-2 py-1 rounded text-xs font-semibold transition`}
                      title={isMuted ? 'Click to unmute student' : 'Click to mute student'}
                    >
                      {isMuted ? '🔇 Unmute' : '🎤 Mute'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {studentTracks.length === 0 && (
            <div className="text-gray-400 text-center py-4 text-sm">
              No students connected yet
            </div>
          )}

          {/* Chat Toggle */}
          {showChat ? (
            <div className="bg-gray-800 rounded-lg p-3 flex flex-col h-64">
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

export default function TeacherRoom() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <TeacherRoomContent />
    </Suspense>
  );
}
