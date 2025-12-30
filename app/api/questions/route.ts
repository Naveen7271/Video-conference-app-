import { NextRequest, NextResponse } from 'next/server';
import { mathQuestions, Question } from '@/lib/questions';

// In-memory storage (in production, use a database)
let questions: Question[] = [...mathQuestions];
let nextId = Math.max(...questions.map(q => q.id)) + 1;

// GET - Fetch all questions
export async function GET() {
  return NextResponse.json(questions);
}

// POST - Add a new question
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, options, answer } = body;

    // Validation
    if (!question || !options || answer === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return NextResponse.json(
        { error: 'Options must be an array of 4 items' },
        { status: 400 }
      );
    }

    if (answer < 0 || answer > 3) {
      return NextResponse.json(
        { error: 'Answer must be between 0 and 3' },
        { status: 400 }
      );
    }

    const newQuestion: Question = {
      id: nextId++,
      question,
      options,
      answer,
    };

    questions.push(newQuestion);

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing question
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, question, options, answer } = body;

    // Validation
    if (!id || !question || !options || answer === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const index = questions.findIndex(q => q.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return NextResponse.json(
        { error: 'Options must be an array of 4 items' },
        { status: 400 }
      );
    }

    if (answer < 0 || answer > 3) {
      return NextResponse.json(
        { error: 'Answer must be between 0 and 3' },
        { status: 400 }
      );
    }

    questions[index] = {
      id,
      question,
      options,
      answer,
    };

    return NextResponse.json(questions[index]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a question
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }

    const index = questions.findIndex(q => q.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    questions.splice(index, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
