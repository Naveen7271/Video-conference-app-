'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/lib/questions';

export default function QuestionManagement() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    answer: 0,
  });

  // Load questions from API
  useEffect(() => {
    fetchQuestions();
  }, []);

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

  const resetForm = () => {
    setFormData({
      question: '',
      options: ['', '', '', ''],
      answer: 0,
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleEdit = (question: Question) => {
    setFormData({
      question: question.question,
      options: [...question.options],
      answer: question.answer,
    });
    setEditingId(question.id);
    setIsAdding(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const response = await fetch('/api/questions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchQuestions();
      } else {
        alert('Failed to delete question');
      }
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete question');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.question.trim()) {
      alert('Please enter a question');
      return;
    }

    if (formData.options.some(opt => !opt.trim())) {
      alert('Please fill in all options');
      return;
    }

    try {
      const method = editingId !== null ? 'PUT' : 'POST';
      const body = editingId !== null
        ? { id: editingId, ...formData }
        : formData;

      const response = await fetch('/api/questions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchQuestions();
        resetForm();
      } else {
        alert(`Failed to ${editingId !== null ? 'update' : 'add'} question`);
      }
    } catch (error) {
      console.error('Failed to save question:', error);
      alert('Failed to save question');
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Question Management</h1>
          {!isAdding && editingId === null && (
            <button
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add New Question
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {(isAdding || editingId !== null) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-black" >
              {editingId !== null ? 'Edit Question' : 'Add New Question'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Question
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                  placeholder="Enter your question"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Options
                </label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.answer === index}
                        onChange={() => setFormData({ ...formData, answer: index })}
                        className="w-4 h-4 text-black"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-black"
                        placeholder={`Option ${index + 1}`}
                      />
                      <span className="text-sm text-gray-500 w-24">
                        {formData.answer === index ? '(Correct)' : ''}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Select the radio button next to the correct answer
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {editingId !== null ? 'Update Question' : 'Add Question'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Questions List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-100 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Existing Questions ({questions.length})
            </h2>
          </div>
          
          {questions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No questions yet. Add your first question to get started!
            </div>
          ) : (
            <div className="divide-y">
              {questions.map((q, index) => (
                <div key={q.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-3">
                        {index + 1}. {q.question}
                      </h3>
                      <div className="space-y-2 ml-4">
                        {q.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`flex items-center gap-2 ${
                              q.answer === optIndex
                                ? 'text-green-700 font-medium'
                                : 'text-gray-700'
                            }`}
                          >
                            <span className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-current text-sm">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span>{option}</span>
                            {q.answer === optIndex && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Correct Answer
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(q)}
                        className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
