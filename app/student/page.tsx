'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentLogin() {
  const [username, setUsername] = useState('');
  const router = useRouter();
  const defaultRoom = 'main-classroom';

  const handleJoin = () => {
    if (username) {
      router.push(`/student/room?room=${defaultRoom}&username=${username}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-teal-600">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-96">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Student Dashboard
        </h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg  focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>
          <button
            onClick={handleJoin}
            disabled={!username}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Join Classroom
          </button>
        </div>
      </div>
    </div>
  );
}
