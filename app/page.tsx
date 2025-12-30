import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-100 to-red-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-4 text-center text-gray-800">
          Video Conferencing Platform
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Link
            href="/teacher"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-8 px-6 rounded-xl text-center transition transform hover:scale-105 shadow-lg"
          >
            <div className="text-4xl mb-3">👨‍🏫</div>
            <div className="text-xl">Teacher Dashboard</div>
            <div className="text-sm mt-2 opacity-90">
              Monitor students, manage room
            </div>
          </Link>
          
          <Link
            href="/student"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-8 px-6 rounded-xl text-center transition transform hover:scale-105 shadow-lg"
          >
            <div className="text-4xl mb-3">👨‍🎓</div>
            <div className="text-xl">Student Dashboard</div>
            <div className="text-sm mt-2 opacity-90">
              Join class, take quiz
            </div>
          </Link>
        </div>

        <div className="border-t pt-6">
          <Link
            href="/admin/questions"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl text-center transition transform hover:scale-105 shadow-lg block"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <div className="text-lg">Manage Quiz Questions</div>
            <div className="text-sm mt-1 opacity-90">
              Add, edit, or delete questions
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
