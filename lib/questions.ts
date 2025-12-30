export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: number; // Index of correct option
}

export const mathQuestions: Question[] = [
  { 
    id: 1, 
    question: "What is 12 + 8?", 
    options: ["18", "20", "22", "24"],
    answer: 1 
  },
  { 
    id: 2, 
    question: "What is 25 - 9?", 
    options: ["14", "15", "16", "17"],
    answer: 2 
  },
  { 
    id: 3, 
    question: "What is 7 × 6?", 
    options: ["36", "40", "42", "48"],
    answer: 2 
  },
  { 
    id: 4, 
    question: "What is 48 ÷ 6?", 
    options: ["6", "7", "8", "9"],
    answer: 2 
  },
  { 
    id: 5, 
    question: "What is 15 + 17?", 
    options: ["30", "31", "32", "33"],
    answer: 2 
  },
  { 
    id: 6, 
    question: "What is 100 - 45?", 
    options: ["50", "55", "60", "65"],
    answer: 1 
  },
];
