'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/lib/questions';

interface QuizProps {
  onSubmit?: (score: number) => void;
}

export default function Quiz({ onSubmit }: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/questions');
        if (response.ok) {
          const data = await response.json();
          setQuestions(data);
        }
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 h-full flex items-center justify-center">
        <div className="text-gray-600">Loading quiz...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No questions available yet.</p>
          <p className="text-sm text-gray-500">Contact the teacher to add questions.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnswered = answers[currentQuestion.id] !== undefined;

  const handleAnswerChange = (questionId: number, optionIndex: number) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Calculate score and submit
      let correct = 0;
      questions.forEach((q) => {
        if (answers[q.id] === q.answer) {
          correct++;
        }
      });
      setScore(correct);
      setSubmitted(true);
      if (onSubmit) {
        onSubmit(correct);
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setCurrentQuestionIndex(0);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col justify-center items-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Quiz Complete! 🎉</h2>
        <div className="mb-6 p-6 bg-blue-100 rounded-lg text-center">
          <p className="text-5xl font-bold text-blue-800 mb-2">
            {score} / {questions.length}
          </p>
          <p className="text-lg text-gray-700">
            {score === questions.length ? 'Perfect Score! 🌟' : 
             score >= questions.length * 0.7 ? 'Great Job! 👏' : 
             score >= questions.length * 0.5 ? 'Good Effort! 👍' : 
             'Keep Practicing! 💪'}
          </p>
        </div>
        
        {/* Review answers */}
        <div className="w-full mb-6 max-h-64 overflow-y-auto space-y-3">
          {questions.map((q, index) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.answer;
            return (
              <div key={q.id} className={`p-3 rounded-lg border-2 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                <p className="font-medium text-sm text-gray-700">Q{index + 1}: {q.question}</p>
                <p className="text-xs mt-1">
                  <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                    Your answer: {q.options[userAnswer]}
                  </span>
                  {!isCorrect && (
                    <span className="text-green-600 ml-2">
                      (Correct: {q.options[q.answer]})
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleReset}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Math Quiz</h2>
        <p className="text-sm text-gray-600 mt-1">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current question */}
      <div className="flex-1 flex flex-col">
        <div className="mb-6">
          <label className="block text-gray-800 font-semibold text-lg mb-4">
            {currentQuestion.question}
          </label>
          <div className="space-y-3">
            {currentQuestion.options.map((option, optionIndex) => {
              const isSelected = answers[currentQuestion.id] === optionIndex;
              
              return (
                <button
                  key={optionIndex}
                  onClick={() => handleAnswerChange(currentQuestion.id, optionIndex)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  } cursor-pointer`}
                >
                  <span className="flex items-center">
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-400'
                    }`}>
                      {isSelected && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </span>
                    <span className="text-gray-700">{option}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-auto pt-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              currentQuestionIndex === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!hasAnswered}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              !hasAnswered
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isLastQuestion
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLastQuestion ? 'Submit Quiz ✓' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
