'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

interface Question {
  id: string
  question_text: string
  question_type: string
  answers: Answer[]
}

interface Answer {
  id: string
  answer_text: string
  is_correct: boolean
}

interface Quiz {
  id: string
  title: string
  description: string
  difficulty: number
  points: number
  subject_id: string
  subject?: {
    name: string
    color: string
    icon: string
  }
}

export default function QuizPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Comprehensive quiz data with technical topics
  const sampleQuizzes: Record<string, Quiz> = {
    '1': {
      id: '1',
      title: 'Basic Addition & Subtraction',
      description: 'Master fundamental arithmetic operations',
      difficulty: 1,
      points: 50,
      subject_id: '1',
      subject: { name: 'Mathematics', color: '#3B82F6', icon: '🔢' }
    },
    '2': {
      id: '2',
      title: 'Multiplication & Division',
      description: 'Test your multiplication tables and division skills',
      difficulty: 2,
      points: 75,
      subject_id: '1',
      subject: { name: 'Mathematics', color: '#3B82F6', icon: '🔢' }
    },
    '3': {
      id: '3',
      title: 'Fractions & Decimals',
      description: 'Work with fractions, decimals, and percentages',
      difficulty: 3,
      points: 100,
      subject_id: '1',
      subject: { name: 'Mathematics', color: '#3B82F6', icon: '🔢' }
    },
    '4': {
      id: '4',
      title: 'Geometry Basics',
      description: 'Shapes, angles, and basic geometric concepts',
      difficulty: 2,
      points: 80,
      subject_id: '1',
      subject: { name: 'Mathematics', color: '#3B82F6', icon: '🔢' }
    },
    '5': {
      id: '5',
      title: 'Animals & Habitats',
      description: 'Learn about different animals and where they live',
      difficulty: 1,
      points: 60,
      subject_id: '2',
      subject: { name: 'Science', color: '#10B981', icon: '🔬' }
    },
    '6': {
      id: '6',
      title: 'Solar System',
      description: 'Explore planets, moons, and space facts',
      difficulty: 2,
      points: 80,
      subject_id: '2',
      subject: { name: 'Science', color: '#10B981', icon: '🔬' }
    },
    '7': {
      id: '7',
      title: 'Human Body Systems',
      description: 'Discover how your body works',
      difficulty: 3,
      points: 100,
      subject_id: '2',
      subject: { name: 'Science', color: '#10B981', icon: '🔬' }
    },
    '8': {
      id: '8',
      title: 'Chemistry Basics',
      description: 'Elements, compounds, and chemical reactions',
      difficulty: 3,
      points: 120,
      subject_id: '2',
      subject: { name: 'Science', color: '#10B981', icon: '🔬' }
    },
    '9': {
      id: '9',
      title: 'Ancient Civilizations',
      description: 'Explore ancient Egypt, Greece, and Rome',
      difficulty: 3,
      points: 100,
      subject_id: '3',
      subject: { name: 'History', color: '#F59E0B', icon: '🏛️' }
    },
    '10': {
      id: '10',
      title: 'World Wars',
      description: 'Learn about major historical conflicts',
      difficulty: 4,
      points: 150,
      subject_id: '3',
      subject: { name: 'History', color: '#F59E0B', icon: '🏛️' }
    },
    '11': {
      id: '11',
      title: 'World Capitals',
      description: 'Test your knowledge of country capitals',
      difficulty: 2,
      points: 70,
      subject_id: '4',
      subject: { name: 'Geography', color: '#EF4444', icon: '🌍' }
    },
    '12': {
      id: '12',
      title: 'Climate & Weather',
      description: 'Understanding weather patterns and climate zones',
      difficulty: 3,
      points: 90,
      subject_id: '4',
      subject: { name: 'Geography', color: '#EF4444', icon: '🌍' }
    },
    '13': {
      id: '13',
      title: 'Programming Basics',
      description: 'Introduction to coding concepts and logic',
      difficulty: 2,
      points: 100,
      subject_id: '5',
      subject: { name: 'Computer Science', color: '#8B5CF6', icon: '💻' }
    },
    '14': {
      id: '14',
      title: 'Web Development',
      description: 'HTML, CSS, and JavaScript fundamentals',
      difficulty: 3,
      points: 120,
      subject_id: '5',
      subject: { name: 'Computer Science', color: '#8B5CF6', icon: '💻' }
    },
    '15': {
      id: '15',
      title: 'Algorithms & Data Structures',
      description: 'Basic algorithms and how data is organized',
      difficulty: 4,
      points: 150,
      subject_id: '5',
      subject: { name: 'Computer Science', color: '#8B5CF6', icon: '💻' }
    },
    '16': {
      id: '16',
      title: 'Cybersecurity Basics',
      description: 'Online safety and security fundamentals',
      difficulty: 2,
      points: 90,
      subject_id: '6',
      subject: { name: 'Cybersecurity', color: '#DC2626', icon: '🔒' }
    },
    '17': {
      id: '17',
      title: 'Network Security',
      description: 'How networks are protected from threats',
      difficulty: 4,
      points: 140,
      subject_id: '6',
      subject: { name: 'Cybersecurity', color: '#DC2626', icon: '🔒' }
    },
    '18': {
      id: '18',
      title: 'Robotics Fundamentals',
      description: 'How robots work and their applications',
      difficulty: 3,
      points: 110,
      subject_id: '7',
      subject: { name: 'Robotics', color: '#059669', icon: '🤖' }
    },
    '19': {
      id: '19',
      title: 'AI & Machine Learning',
      description: 'Introduction to artificial intelligence',
      difficulty: 4,
      points: 160,
      subject_id: '7',
      subject: { name: 'Robotics', color: '#059669', icon: '🤖' }
    },
    '20': {
      id: '20',
      title: 'Environmental Science',
      description: 'Climate change and environmental protection',
      difficulty: 3,
      points: 100,
      subject_id: '2',
      subject: { name: 'Science', color: '#10B981', icon: '🔬' }
    }
  }

  const sampleQuestions: { [key: string]: Question[] } = {
    '1': [
      {
        id: '1-1',
        question_text: 'What is 15 + 27?',
        question_type: 'multiple_choice',
        answers: [
          { id: '1-1-a', answer_text: '40', is_correct: false },
          { id: '1-1-b', answer_text: '41', is_correct: false },
          { id: '1-1-c', answer_text: '42', is_correct: true },
          { id: '1-1-d', answer_text: '43', is_correct: false }
        ]
      },
      {
        id: '1-2',
        question_text: 'What is 84 - 29?',
        question_type: 'multiple_choice',
        answers: [
          { id: '1-2-a', answer_text: '54', is_correct: false },
          { id: '1-2-b', answer_text: '55', is_correct: true },
          { id: '1-2-c', answer_text: '56', is_correct: false },
          { id: '1-2-d', answer_text: '57', is_correct: false }
        ]
      },
      {
        id: '1-3',
        question_text: 'What is 36 + 48?',
        question_type: 'multiple_choice',
        answers: [
          { id: '1-3-a', answer_text: '82', is_correct: false },
          { id: '1-3-b', answer_text: '83', is_correct: false },
          { id: '1-3-c', answer_text: '84', is_correct: true },
          { id: '1-3-d', answer_text: '85', is_correct: false }
        ]
      },
      {
        id: '1-4',
        question_text: 'What is 73 - 45?',
        question_type: 'multiple_choice',
        answers: [
          { id: '1-4-a', answer_text: '27', is_correct: false },
          { id: '1-4-b', answer_text: '28', is_correct: true },
          { id: '1-4-c', answer_text: '29', is_correct: false },
          { id: '1-4-d', answer_text: '30', is_correct: false }
        ]
      },
      {
        id: '1-5',
        question_text: 'What is 19 + 34 + 17?',
        question_type: 'multiple_choice',
        answers: [
          { id: '1-5-a', answer_text: '68', is_correct: false },
          { id: '1-5-b', answer_text: '69', is_correct: false },
          { id: '1-5-c', answer_text: '70', is_correct: true },
          { id: '1-5-d', answer_text: '71', is_correct: false }
        ]
      },
      {
        id: '1-6',
        question_text: 'What is 156 + 89?',
        question_type: 'multiple_choice',
        answers: [
          { id: '1-6-a', answer_text: '244', is_correct: false },
          { id: '1-6-b', answer_text: '245', is_correct: true },
          { id: '1-6-c', answer_text: '246', is_correct: false },
          { id: '1-6-d', answer_text: '247', is_correct: false }
        ]
      },
      {
        id: '1-7',
        question_text: 'What is 200 - 67?',
        question_type: 'multiple_choice',
        answers: [
          { id: '1-7-a', answer_text: '132', is_correct: false },
          { id: '1-7-b', answer_text: '133', is_correct: true },
          { id: '1-7-c', answer_text: '134', is_correct: false },
          { id: '1-7-d', answer_text: '135', is_correct: false }
        ]
      },
      {
        id: '1-8',
        question_text: 'What is 45 + 38 + 22?',
        question_type: 'multiple_choice',
        answers: [
          { id: '1-8-a', answer_text: '104', is_correct: false },
          { id: '1-8-b', answer_text: '105', is_correct: true },
          { id: '1-8-c', answer_text: '106', is_correct: false },
          { id: '1-8-d', answer_text: '107', is_correct: false }
        ]
      },
      {
        id: '1-9',
        question_text: 'What is 91 - 46?',
        question_type: 'multiple_choice',
        answers: [
          { id: '1-9-a', answer_text: '44', is_correct: false },
          { id: '1-9-b', answer_text: '45', is_correct: true },
          { id: '1-9-c', answer_text: '46', is_correct: false },
          { id: '1-9-d', answer_text: '47', is_correct: false }
        ]
      },
      {
        id: '1-10',
        question_text: 'What is 123 + 456?',
        question_type: 'multiple_choice',
        answers: [
          { id: '1-10-a', answer_text: '578', is_correct: false },
          { id: '1-10-b', answer_text: '579', is_correct: true },
          { id: '1-10-c', answer_text: '580', is_correct: false },
          { id: '1-10-d', answer_text: '581', is_correct: false }
        ]
      }
    ],
    '2': [
      {
        id: '2-1',
        question_text: 'What is 7 × 8?',
        question_type: 'multiple_choice',
        answers: [
          { id: '2-1-a', answer_text: '54', is_correct: false },
          { id: '2-1-b', answer_text: '55', is_correct: false },
          { id: '2-1-c', answer_text: '56', is_correct: true },
          { id: '2-1-d', answer_text: '57', is_correct: false }
        ]
      },
      {
        id: '2-2',
        question_text: 'What is 9 × 6?',
        question_type: 'multiple_choice',
        answers: [
          { id: '2-2-a', answer_text: '52', is_correct: false },
          { id: '2-2-b', answer_text: '53', is_correct: false },
          { id: '2-2-c', answer_text: '54', is_correct: true },
          { id: '2-2-d', answer_text: '55', is_correct: false }
        ]
      },
      {
        id: '2-3',
        question_text: 'What is 12 × 4?',
        question_type: 'multiple_choice',
        answers: [
          { id: '2-3-a', answer_text: '46', is_correct: false },
          { id: '2-3-b', answer_text: '47', is_correct: false },
          { id: '2-3-c', answer_text: '48', is_correct: true },
          { id: '2-3-d', answer_text: '49', is_correct: false }
        ]
      },
      {
        id: '2-4',
        question_text: 'What is 8 × 9?',
        question_type: 'multiple_choice',
        answers: [
          { id: '2-4-a', answer_text: '70', is_correct: false },
          { id: '2-4-b', answer_text: '71', is_correct: false },
          { id: '2-4-c', answer_text: '72', is_correct: true },
          { id: '2-4-d', answer_text: '73', is_correct: false }
        ]
      },
      {
        id: '2-5',
        question_text: 'What is 6 × 7?',
        question_type: 'multiple_choice',
        answers: [
          { id: '2-5-a', answer_text: '40', is_correct: false },
          { id: '2-5-b', answer_text: '41', is_correct: false },
          { id: '2-5-c', answer_text: '42', is_correct: true },
          { id: '2-5-d', answer_text: '43', is_correct: false }
        ]
      },
      {
        id: '2-6',
        question_text: 'What is 81 ÷ 9?',
        question_type: 'multiple_choice',
        answers: [
          { id: '2-6-a', answer_text: '8', is_correct: false },
          { id: '2-6-b', answer_text: '9', is_correct: true },
          { id: '2-6-c', answer_text: '10', is_correct: false },
          { id: '2-6-d', answer_text: '11', is_correct: false }
        ]
      },
      {
        id: '2-7',
        question_text: 'What is 56 ÷ 7?',
        question_type: 'multiple_choice',
        answers: [
          { id: '2-7-a', answer_text: '7', is_correct: false },
          { id: '2-7-b', answer_text: '8', is_correct: true },
          { id: '2-7-c', answer_text: '9', is_correct: false },
          { id: '2-7-d', answer_text: '10', is_correct: false }
        ]
      },
      {
        id: '2-8',
        question_text: 'What is 11 × 12?',
        question_type: 'multiple_choice',
        answers: [
          { id: '2-8-a', answer_text: '130', is_correct: false },
          { id: '2-8-b', answer_text: '131', is_correct: false },
          { id: '2-8-c', answer_text: '132', is_correct: true },
          { id: '2-8-d', answer_text: '133', is_correct: false }
        ]
      },
      {
        id: '2-9',
        question_text: 'What is 144 ÷ 12?',
        question_type: 'multiple_choice',
        answers: [
          { id: '2-9-a', answer_text: '11', is_correct: false },
          { id: '2-9-b', answer_text: '12', is_correct: true },
          { id: '2-9-c', answer_text: '13', is_correct: false },
          { id: '2-9-d', answer_text: '14', is_correct: false }
        ]
      },
      {
        id: '2-10',
        question_text: 'What is 15 × 6?',
        question_type: 'multiple_choice',
        answers: [
          { id: '2-10-a', answer_text: '88', is_correct: false },
          { id: '2-10-b', answer_text: '89', is_correct: false },
          { id: '2-10-c', answer_text: '90', is_correct: true },
          { id: '2-10-d', answer_text: '91', is_correct: false }
        ],
        '7': [
          {
            id: '7-1',
            question_text: 'How many bones are in the adult human body?',
            question_type: 'multiple_choice',
            answers: [
              { id: '7-1-a', answer_text: '106', is_correct: false },
              { id: '7-1-b', answer_text: '206', is_correct: true },
              { id: '7-1-c', answer_text: '306', is_correct: false },
              { id: '7-1-d', answer_text: '406', is_correct: false }
            ]
          },
          {
            id: '7-2',
            question_text: 'Which organ pumps blood through your body?',
            question_type: 'multiple_choice',
            answers: [
              { id: '7-2-a', answer_text: 'Lungs', is_correct: false },
              { id: '7-2-b', answer_text: 'Heart', is_correct: true },
              { id: '7-2-c', answer_text: 'Liver', is_correct: false },
              { id: '7-2-d', answer_text: 'Kidneys', is_correct: false }
            ]
          },
          {
            id: '7-3',
            question_text: 'What do your lungs help you do?',
            question_type: 'multiple_choice',
            answers: [
              { id: '7-3-a', answer_text: 'Digest food', is_correct: false },
              { id: '7-3-b', answer_text: 'Breathe', is_correct: true },
              { id: '7-3-c', answer_text: 'Think', is_correct: false },
              { id: '7-3-d', answer_text: 'See', is_correct: false }
            ]
          },
          {
            id: '7-4',
            question_text: 'Which part of your body controls thinking?',
            question_type: 'multiple_choice',
            answers: [
              { id: '7-4-a', answer_text: 'Heart', is_correct: false },
              { id: '7-4-b', answer_text: 'Brain', is_correct: true },
              { id: '7-4-c', answer_text: 'Stomach', is_correct: false },
              { id: '7-4-d', answer_text: 'Muscles', is_correct: false }
            ]
          },
          {
            id: '7-5',
            question_text: 'What connects muscles to bones?',
            question_type: 'multiple_choice',
            answers: [
              { id: '7-5-a', answer_text: 'Tendons', is_correct: true },
              { id: '7-5-b', answer_text: 'Ligaments', is_correct: false },
              { id: '7-5-c', answer_text: 'Cartilage', is_correct: false },
              { id: '7-5-d', answer_text: 'Nerves', is_correct: false }
            ]
          }
        ],
        '8': [
          {
            id: '8-1',
            question_text: 'What is the chemical symbol for water?',
            question_type: 'multiple_choice',
            answers: [
              { id: '8-1-a', answer_text: 'H2O', is_correct: true },
              { id: '8-1-b', answer_text: 'CO2', is_correct: false },
              { id: '8-1-c', answer_text: 'O2', is_correct: false },
              { id: '8-1-d', answer_text: 'NaCl', is_correct: false }
            ]
          },
          {
            id: '8-2',
            question_text: 'What is the smallest unit of matter?',
            question_type: 'multiple_choice',
            answers: [
              { id: '8-2-a', answer_text: 'Molecule', is_correct: false },
              { id: '8-2-b', answer_text: 'Atom', is_correct: true },
              { id: '8-2-c', answer_text: 'Cell', is_correct: false },
              { id: '8-2-d', answer_text: 'Compound', is_correct: false }
            ]
          },
          {
            id: '8-3',
            question_text: 'What gas do plants absorb from the air?',
            question_type: 'multiple_choice',
            answers: [
              { id: '8-3-a', answer_text: 'Oxygen', is_correct: false },
              { id: '8-3-b', answer_text: 'Carbon Dioxide', is_correct: true },
              { id: '8-3-c', answer_text: 'Nitrogen', is_correct: false },
              { id: '8-3-d', answer_text: 'Hydrogen', is_correct: false }
            ]
          },
          {
            id: '8-4',
            question_text: 'What happens when you mix an acid and a base?',
            question_type: 'multiple_choice',
            answers: [
              { id: '8-4-a', answer_text: 'Explosion', is_correct: false },
              { id: '8-4-b', answer_text: 'Neutralization', is_correct: true },
              { id: '8-4-c', answer_text: 'Freezing', is_correct: false },
              { id: '8-4-d', answer_text: 'Evaporation', is_correct: false }
            ]
          },
          {
            id: '8-5',
            question_text: 'What is the chemical symbol for gold?',
            question_type: 'multiple_choice',
            answers: [
              { id: '8-5-a', answer_text: 'Go', is_correct: false },
              { id: '8-5-b', answer_text: 'Au', is_correct: true },
              { id: '8-5-c', answer_text: 'Ag', is_correct: false },
              { id: '8-5-d', answer_text: 'Gd', is_correct: false }
            ]
          }
        ],
        '9': [
          {
            id: '9-1',
            question_text: 'Which ancient civilization built the pyramids?',
            question_type: 'multiple_choice',
            answers: [
              { id: '9-1-a', answer_text: 'Greeks', is_correct: false },
              { id: '9-1-b', answer_text: 'Egyptians', is_correct: true },
              { id: '9-1-c', answer_text: 'Romans', is_correct: false },
              { id: '9-1-d', answer_text: 'Babylonians', is_correct: false }
            ]
          },
          {
            id: '9-2',
            question_text: 'Who was the famous Greek philosopher who taught Alexander the Great?',
            question_type: 'multiple_choice',
            answers: [
              { id: '9-2-a', answer_text: 'Plato', is_correct: false },
              { id: '9-2-b', answer_text: 'Aristotle', is_correct: true },
              { id: '9-2-c', answer_text: 'Socrates', is_correct: false },
              { id: '9-2-d', answer_text: 'Homer', is_correct: false }
            ]
          },
          {
            id: '9-3',
            question_text: 'What was the capital of the Roman Empire?',
            question_type: 'multiple_choice',
            answers: [
              { id: '9-3-a', answer_text: 'Athens', is_correct: false },
              { id: '9-3-b', answer_text: 'Rome', is_correct: true },
              { id: '9-3-c', answer_text: 'Alexandria', is_correct: false },
              { id: '9-3-d', answer_text: 'Sparta', is_correct: false }
            ]
          },
          {
            id: '9-4',
            question_text: 'Which river was crucial to ancient Egyptian civilization?',
            question_type: 'multiple_choice',
            answers: [
              { id: '9-4-a', answer_text: 'Amazon', is_correct: false },
              { id: '9-4-b', answer_text: 'Nile', is_correct: true },
              { id: '9-4-c', answer_text: 'Mississippi', is_correct: false },
              { id: '9-4-d', answer_text: 'Thames', is_correct: false }
            ]
          }
        ],
        '10': [
          {
            id: '10-1',
            question_text: 'In which year did World War I begin?',
            question_type: 'multiple_choice',
            answers: [
              { id: '10-1-a', answer_text: '1912', is_correct: false },
              { id: '10-1-b', answer_text: '1914', is_correct: true },
              { id: '10-1-c', answer_text: '1916', is_correct: false },
              { id: '10-1-d', answer_text: '1918', is_correct: false }
            ]
          },
          {
            id: '10-2',
            question_text: 'Which country was NOT part of the Allied Powers in WWII?',
            question_type: 'multiple_choice',
            answers: [
              { id: '10-2-a', answer_text: 'United States', is_correct: false },
              { id: '10-2-b', answer_text: 'Germany', is_correct: true },
              { id: '10-2-c', answer_text: 'Britain', is_correct: false },
              { id: '10-2-d', answer_text: 'Soviet Union', is_correct: false }
            ]
          },
          {
            id: '10-3',
            question_text: 'What event started World War II?',
            question_type: 'multiple_choice',
            answers: [
              { id: '10-3-a', answer_text: 'Pearl Harbor attack', is_correct: false },
              { id: '10-3-b', answer_text: 'Germany invading Poland', is_correct: true },
              { id: '10-3-c', answer_text: 'D-Day invasion', is_correct: false },
              { id: '10-3-d', answer_text: 'Battle of Britain', is_correct: false }
            ]
          }
        ],
        '11': [
          {
            id: '11-1',
            question_text: 'What is the capital of France?',
            question_type: 'multiple_choice',
            answers: [
              { id: '11-1-a', answer_text: 'London', is_correct: false },
              { id: '11-1-b', answer_text: 'Paris', is_correct: true },
              { id: '11-1-c', answer_text: 'Berlin', is_correct: false },
              { id: '11-1-d', answer_text: 'Madrid', is_correct: false }
            ]
          },
          {
            id: '11-2',
            question_text: 'What is the capital of Japan?',
            question_type: 'multiple_choice',
            answers: [
              { id: '11-2-a', answer_text: 'Seoul', is_correct: false },
              { id: '11-2-b', answer_text: 'Tokyo', is_correct: true },
              { id: '11-2-c', answer_text: 'Beijing', is_correct: false },
              { id: '11-2-d', answer_text: 'Bangkok', is_correct: false }
            ]
          },
          {
            id: '11-3',
            question_text: 'What is the capital of Australia?',
            question_type: 'multiple_choice',
            answers: [
              { id: '11-3-a', answer_text: 'Sydney', is_correct: false },
              { id: '11-3-b', answer_text: 'Canberra', is_correct: true },
              { id: '11-3-c', answer_text: 'Melbourne', is_correct: false },
              { id: '11-3-d', answer_text: 'Perth', is_correct: false }
            ]
          },
          {
            id: '11-4',
            question_text: 'What is the capital of Canada?',
            question_type: 'multiple_choice',
            answers: [
              { id: '11-4-a', answer_text: 'Toronto', is_correct: false },
              { id: '11-4-b', answer_text: 'Ottawa', is_correct: true },
              { id: '11-4-c', answer_text: 'Vancouver', is_correct: false },
              { id: '11-4-d', answer_text: 'Montreal', is_correct: false }
            ]
          },
          {
            id: '11-5',
            question_text: 'What is the capital of Brazil?',
            question_type: 'multiple_choice',
            answers: [
              { id: '11-5-a', answer_text: 'Rio de Janeiro', is_correct: false },
              { id: '11-5-b', answer_text: 'Brasília', is_correct: true },
              { id: '11-5-c', answer_text: 'São Paulo', is_correct: false },
              { id: '11-5-d', answer_text: 'Salvador', is_correct: false }
            ]
          }
        ],
        '12': [
          {
            id: '12-1',
            question_text: 'What causes seasons on Earth?',
            question_type: 'multiple_choice',
            answers: [
              { id: '12-1-a', answer_text: 'Distance from the Sun', is_correct: false },
              { id: '12-1-b', answer_text: 'Earth\'s tilt', is_correct: true },
              { id: '12-1-c', answer_text: 'Moon phases', is_correct: false },
              { id: '12-1-d', answer_text: 'Solar flares', is_correct: false }
            ]
          },
          {
            id: '12-2',
            question_text: 'What type of climate do deserts have?',
            question_type: 'multiple_choice',
            answers: [
              { id: '12-2-a', answer_text: 'Hot and humid', is_correct: false },
              { id: '12-2-b', answer_text: 'Hot and dry', is_correct: true },
              { id: '12-2-c', answer_text: 'Cold and wet', is_correct: false },
              { id: '12-2-d', answer_text: 'Mild and rainy', is_correct: false }
            ]
          },
          {
            id: '12-3',
            question_text: 'What is the water cycle?',
            question_type: 'multiple_choice',
            answers: [
              { id: '12-3-a', answer_text: 'How water moves through Earth\'s systems', is_correct: true },
              { id: '12-3-b', answer_text: 'How fish swim in oceans', is_correct: false },
              { id: '12-3-c', answer_text: 'How rivers flow to seas', is_correct: false },
              { id: '12-3-d', answer_text: 'How ice melts', is_correct: false }
            ]
          },
          {
            id: '12-4',
            question_text: 'What causes wind?',
            question_type: 'multiple_choice',
            answers: [
              { id: '12-4-a', answer_text: 'Trees moving', is_correct: false },
              { id: '12-4-b', answer_text: 'Air pressure differences', is_correct: true },
              { id: '12-4-c', answer_text: 'Ocean waves', is_correct: false },
              { id: '12-4-d', answer_text: 'Mountain height', is_correct: false }
            ]
          }
        ],
        '14': [
          {
            id: '14-1',
            question_text: 'Which HTML tag is used to create a paragraph?',
            question_type: 'multiple_choice',
            answers: [
              { id: '14-1-a', answer_text: '<div>', is_correct: false },
              { id: '14-1-b', answer_text: '<p>', is_correct: true },
              { id: '14-1-c', answer_text: '<span>', is_correct: false },
              { id: '14-1-d', answer_text: '<text>', is_correct: false }
            ]
          },
          {
            id: '14-2',
            question_text: 'What does CSS stand for?',
            question_type: 'multiple_choice',
            answers: [
              { id: '14-2-a', answer_text: 'Computer Style Sheets', is_correct: false },
              { id: '14-2-b', answer_text: 'Cascading Style Sheets', is_correct: true },
              { id: '14-2-c', answer_text: 'Creative Style System', is_correct: false },
              { id: '14-2-d', answer_text: 'Colorful Style Sheets', is_correct: false }
            ]
          },
          {
            id: '14-3',
            question_text: 'Which JavaScript method is used to write text to the console?',
            question_type: 'multiple_choice',
            answers: [
              { id: '14-3-a', answer_text: 'print()', is_correct: false },
              { id: '14-3-b', answer_text: 'console.log()', is_correct: true },
              { id: '14-3-c', answer_text: 'write()', is_correct: false },
              { id: '14-3-d', answer_text: 'display()', is_correct: false }
            ]
          },
          {
            id: '14-4',
            question_text: 'What is the correct way to link a CSS file to HTML?',
            question_type: 'multiple_choice',
            answers: [
              { id: '14-4-a', answer_text: '<style src="style.css">', is_correct: false },
              { id: '14-4-b', answer_text: '<link rel="stylesheet" href="style.css">', is_correct: true },
              { id: '14-4-c', answer_text: '<css file="style.css">', is_correct: false },
              { id: '14-4-d', answer_text: '<include css="style.css">', is_correct: false }
            ]
          }
        ],
        '15': [
          {
            id: '15-1',
            question_text: 'What is an algorithm?',
            question_type: 'multiple_choice',
            answers: [
              { id: '15-1-a', answer_text: 'A step-by-step procedure to solve a problem', is_correct: true },
              { id: '15-1-b', answer_text: 'A type of computer', is_correct: false },
              { id: '15-1-c', answer_text: 'A programming language', is_correct: false },
              { id: '15-1-d', answer_text: 'A computer virus', is_correct: false }
            ]
          },
          {
            id: '15-2',
            question_text: 'What is a data structure?',
            question_type: 'multiple_choice',
            answers: [
              { id: '15-2-a', answer_text: 'A way to organize and store data', is_correct: true },
              { id: '15-2-b', answer_text: 'A type of building', is_correct: false },
              { id: '15-2-c', answer_text: 'A computer program', is_correct: false },
              { id: '15-2-d', answer_text: 'A website design', is_correct: false }
            ]
          },
          {
            id: '15-3',
            question_text: 'Which is an example of a sorting algorithm?',
            question_type: 'multiple_choice',
            answers: [
              { id: '15-3-a', answer_text: 'Bubble Sort', is_correct: true },
              { id: '15-3-b', answer_text: 'Linear Search', is_correct: false },
              { id: '15-3-c', answer_text: 'Hash Table', is_correct: false },
              { id: '15-3-d', answer_text: 'Binary Tree', is_correct: false }
            ]
          }
        ],
        '17': [
          {
            id: '17-1',
            question_text: 'What is a firewall?',
            question_type: 'multiple_choice',
            answers: [
              { id: '17-1-a', answer_text: 'A security system that monitors network traffic', is_correct: true },
              { id: '17-1-b', answer_text: 'A type of computer virus', is_correct: false },
              { id: '17-1-c', answer_text: 'A programming language', is_correct: false },
              { id: '17-1-d', answer_text: 'A web browser', is_correct: false }
            ]
          },
          {
            id: '17-2',
            question_text: 'What does VPN stand for?',
            question_type: 'multiple_choice',
            answers: [
              { id: '17-2-a', answer_text: 'Very Private Network', is_correct: false },
              { id: '17-2-b', answer_text: 'Virtual Private Network', is_correct: true },
              { id: '17-2-c', answer_text: 'Verified Public Network', is_correct: false },
              { id: '17-2-d', answer_text: 'Visual Protocol Network', is_correct: false }
            ]
          },
          {
            id: '17-3',
            question_text: 'What is encryption?',
            question_type: 'multiple_choice',
            answers: [
              { id: '17-3-a', answer_text: 'Converting data into a secret code', is_correct: true },
              { id: '17-3-b', answer_text: 'Deleting files permanently', is_correct: false },
              { id: '17-3-c', answer_text: 'Backing up data', is_correct: false },
              { id: '17-3-d', answer_text: 'Compressing files', is_correct: false }
            ]
          }
        ],
        '19': [
          {
            id: '19-1',
            question_text: 'What does AI stand for?',
            question_type: 'multiple_choice',
            answers: [
              { id: '19-1-a', answer_text: 'Automated Intelligence', is_correct: false },
              { id: '19-1-b', answer_text: 'Artificial Intelligence', is_correct: true },
              { id: '19-1-c', answer_text: 'Advanced Information', is_correct: false },
              { id: '19-1-d', answer_text: 'Algorithmic Interface', is_correct: false }
            ]
          },
          {
            id: '19-2',
            question_text: 'What is machine learning?',
            question_type: 'multiple_choice',
            answers: [
              { id: '19-2-a', answer_text: 'Teaching robots to walk', is_correct: false },
              { id: '19-2-b', answer_text: 'Computers learning from data without explicit programming', is_correct: true },
              { id: '19-2-c', answer_text: 'Building computer hardware', is_correct: false },
              { id: '19-2-d', answer_text: 'Creating video games', is_correct: false }
            ]
          },
          {
            id: '19-3',
            question_text: 'Which is an example of AI in everyday life?',
            question_type: 'multiple_choice',
            answers: [
              { id: '19-3-a', answer_text: 'Voice assistants like Siri', is_correct: true },
              { id: '19-3-b', answer_text: 'Regular calculators', is_correct: false },
              { id: '19-3-c', answer_text: 'Printed books', is_correct: false },
              { id: '19-3-d', answer_text: 'Mechanical clocks', is_correct: false }
            ]
          }
        ],
        '20': [
          {
            id: '20-1',
            question_text: 'What is the main cause of climate change?',
            question_type: 'multiple_choice',
            answers: [
              { id: '20-1-a', answer_text: 'Natural weather patterns', is_correct: false },
              { id: '20-1-b', answer_text: 'Greenhouse gas emissions', is_correct: true },
              { id: '20-1-c', answer_text: 'Solar radiation', is_correct: false },
              { id: '20-1-d', answer_text: 'Ocean currents', is_correct: false }
            ]
          },
          {
            id: '20-2',
            question_text: 'Which gas is most responsible for global warming?',
            question_type: 'multiple_choice',
            answers: [
              { id: '20-2-a', answer_text: 'Oxygen', is_correct: false },
              { id: '20-2-b', answer_text: 'Carbon Dioxide', is_correct: true },
              { id: '20-2-c', answer_text: 'Nitrogen', is_correct: false },
              { id: '20-2-d', answer_text: 'Hydrogen', is_correct: false }
            ]
          },
          {
            id: '20-3',
            question_text: 'What is renewable energy?',
            question_type: 'multiple_choice',
            answers: [
              { id: '20-3-a', answer_text: 'Energy that can be naturally replenished', is_correct: true },
              { id: '20-3-b', answer_text: 'Energy from fossil fuels', is_correct: false },
              { id: '20-3-c', answer_text: 'Energy that runs out quickly', is_correct: false },
              { id: '20-3-d', answer_text: 'Energy from nuclear power', is_correct: false }
            ]
          },
          {
            id: '20-4',
            question_text: 'Which is an example of renewable energy?',
            question_type: 'multiple_choice',
            answers: [
              { id: '20-4-a', answer_text: 'Coal', is_correct: false },
              { id: '20-4-b', answer_text: 'Solar power', is_correct: true },
              { id: '20-4-c', answer_text: 'Natural gas', is_correct: false },
              { id: '20-4-d', answer_text: 'Oil', is_correct: false }
            ]
          }
        ]
      }
    ],
    '3': [
      {
        id: '3-1',
        question_text: 'What is 1/2 + 1/4?',
        question_type: 'multiple_choice',
        answers: [
          { id: '3-1-a', answer_text: '2/6', is_correct: false },
          { id: '3-1-b', answer_text: '3/4', is_correct: true },
          { id: '3-1-c', answer_text: '2/4', is_correct: false },
          { id: '3-1-d', answer_text: '1/3', is_correct: false }
        ]
      },
      {
        id: '3-2',
        question_text: 'What is 0.5 + 0.25?',
        question_type: 'multiple_choice',
        answers: [
          { id: '3-2-a', answer_text: '0.75', is_correct: true },
          { id: '3-2-b', answer_text: '0.55', is_correct: false },
          { id: '3-2-c', answer_text: '0.70', is_correct: false },
          { id: '3-2-d', answer_text: '0.80', is_correct: false }
        ]
      },
      {
        id: '3-3',
        question_text: 'What is 50% of 80?',
        question_type: 'multiple_choice',
        answers: [
          { id: '3-3-a', answer_text: '30', is_correct: false },
          { id: '3-3-b', answer_text: '35', is_correct: false },
          { id: '3-3-c', answer_text: '40', is_correct: true },
          { id: '3-3-d', answer_text: '45', is_correct: false }
        ]
      },
      {
        id: '3-4',
        question_text: 'Which fraction is equivalent to 0.25?',
        question_type: 'multiple_choice',
        answers: [
          { id: '3-4-a', answer_text: '1/3', is_correct: false },
          { id: '3-4-b', answer_text: '1/4', is_correct: true },
          { id: '3-4-c', answer_text: '1/5', is_correct: false },
          { id: '3-4-d', answer_text: '2/5', is_correct: false }
        ]
      },
      {
        id: '3-5',
        question_text: 'What is 3/4 - 1/4?',
        question_type: 'multiple_choice',
        answers: [
          { id: '3-5-a', answer_text: '1/2', is_correct: true },
          { id: '3-5-b', answer_text: '2/4', is_correct: false },
          { id: '3-5-c', answer_text: '1/3', is_correct: false },
          { id: '3-5-d', answer_text: '2/8', is_correct: false }
        ]
      },
      {
        id: '3-6',
        question_text: 'What is 25% as a decimal?',
        question_type: 'multiple_choice',
        answers: [
          { id: '3-6-a', answer_text: '0.025', is_correct: false },
          { id: '3-6-b', answer_text: '0.25', is_correct: true },
          { id: '3-6-c', answer_text: '2.5', is_correct: false },
          { id: '3-6-d', answer_text: '0.025', is_correct: false }
        ]
      },
      {
        id: '3-7',
        question_text: 'What is 2/3 × 3/4?',
        question_type: 'multiple_choice',
        answers: [
          { id: '3-7-a', answer_text: '1/2', is_correct: true },
          { id: '3-7-b', answer_text: '5/7', is_correct: false },
          { id: '3-7-c', answer_text: '6/12', is_correct: false },
          { id: '3-7-d', answer_text: '2/4', is_correct: false }
        ]
      },
      {
        id: '3-8',
        question_text: 'What is 0.8 as a percentage?',
        question_type: 'multiple_choice',
        answers: [
          { id: '3-8-a', answer_text: '8%', is_correct: false },
          { id: '3-8-b', answer_text: '80%', is_correct: true },
          { id: '3-8-c', answer_text: '0.8%', is_correct: false },
          { id: '3-8-d', answer_text: '800%', is_correct: false }
        ]
      }
    ],
    '4': [
      {
        id: '4-1',
        question_text: 'How many sides does a triangle have?',
        question_type: 'multiple_choice',
        answers: [
          { id: '4-1-a', answer_text: '2', is_correct: false },
          { id: '4-1-b', answer_text: '3', is_correct: true },
          { id: '4-1-c', answer_text: '4', is_correct: false },
          { id: '4-1-d', answer_text: '5', is_correct: false }
        ]
      },
      {
        id: '4-2',
        question_text: 'What is the sum of angles in a triangle?',
        question_type: 'multiple_choice',
        answers: [
          { id: '4-2-a', answer_text: '90°', is_correct: false },
          { id: '4-2-b', answer_text: '180°', is_correct: true },
          { id: '4-2-c', answer_text: '270°', is_correct: false },
          { id: '4-2-d', answer_text: '360°', is_correct: false }
        ]
      },
      {
        id: '4-3',
        question_text: 'What is the area of a rectangle with length 6 and width 4?',
        question_type: 'multiple_choice',
        answers: [
          { id: '4-3-a', answer_text: '20', is_correct: false },
          { id: '4-3-b', answer_text: '24', is_correct: true },
          { id: '4-3-c', answer_text: '10', is_correct: false },
          { id: '4-3-d', answer_text: '14', is_correct: false }
        ]
      },
      {
        id: '4-4',
        question_text: 'How many sides does a hexagon have?',
        question_type: 'multiple_choice',
        answers: [
          { id: '4-4-a', answer_text: '5', is_correct: false },
          { id: '4-4-b', answer_text: '6', is_correct: true },
          { id: '4-4-c', answer_text: '7', is_correct: false },
          { id: '4-4-d', answer_text: '8', is_correct: false }
        ]
      },
      {
        id: '4-5',
        question_text: 'What is the perimeter of a square with side length 5?',
        question_type: 'multiple_choice',
        answers: [
          { id: '4-5-a', answer_text: '15', is_correct: false },
          { id: '4-5-b', answer_text: '20', is_correct: true },
          { id: '4-5-c', answer_text: '25', is_correct: false },
          { id: '4-5-d', answer_text: '10', is_correct: false }
        ]
      },
      {
        id: '4-6',
        question_text: 'What type of angle is 90 degrees?',
        question_type: 'multiple_choice',
        answers: [
          { id: '4-6-a', answer_text: 'Acute', is_correct: false },
          { id: '4-6-b', answer_text: 'Right', is_correct: true },
          { id: '4-6-c', answer_text: 'Obtuse', is_correct: false },
          { id: '4-6-d', answer_text: 'Straight', is_correct: false }
        ]
      }
    ],
    '5': [
      {
        id: '5-1',
        question_text: 'Which animal is known as the "King of the Jungle"?',
        question_type: 'multiple_choice',
        answers: [
          { id: '5-1-a', answer_text: 'Tiger', is_correct: false },
          { id: '5-1-b', answer_text: 'Lion', is_correct: true },
          { id: '5-1-c', answer_text: 'Elephant', is_correct: false },
          { id: '5-1-d', answer_text: 'Leopard', is_correct: false }
        ]
      },
      {
        id: '5-2',
        question_text: 'Where do polar bears live?',
        question_type: 'multiple_choice',
        answers: [
          { id: '5-2-a', answer_text: 'Desert', is_correct: false },
          { id: '5-2-b', answer_text: 'Arctic', is_correct: true },
          { id: '5-2-c', answer_text: 'Rainforest', is_correct: false },
          { id: '5-2-d', answer_text: 'Grassland', is_correct: false }
        ]
      },
      {
        id: '5-3',
        question_text: 'Which animal can change its color?',
        question_type: 'multiple_choice',
        answers: [
          { id: '5-3-a', answer_text: 'Chameleon', is_correct: true },
          { id: '5-3-b', answer_text: 'Zebra', is_correct: false },
          { id: '5-3-c', answer_text: 'Giraffe', is_correct: false },
          { id: '5-3-d', answer_text: 'Rhino', is_correct: false }
        ]
      },
      {
        id: '5-4',
        question_text: 'What do pandas mainly eat?',
        question_type: 'multiple_choice',
        answers: [
          { id: '5-4-a', answer_text: 'Fish', is_correct: false },
          { id: '5-4-b', answer_text: 'Bamboo', is_correct: true },
          { id: '5-4-c', answer_text: 'Meat', is_correct: false },
          { id: '5-4-d', answer_text: 'Fruits', is_correct: false }
        ]
      },
      {
        id: '5-5',
        question_text: 'Which bird cannot fly?',
        question_type: 'multiple_choice',
        answers: [
          { id: '5-5-a', answer_text: 'Eagle', is_correct: false },
          { id: '5-5-b', answer_text: 'Penguin', is_correct: true },
          { id: '5-5-c', answer_text: 'Sparrow', is_correct: false },
          { id: '5-5-d', answer_text: 'Owl', is_correct: false }
        ]
      },
      {
        id: '5-6',
        question_text: 'What is the largest mammal in the world?',
        question_type: 'multiple_choice',
        answers: [
          { id: '5-6-a', answer_text: 'Elephant', is_correct: false },
          { id: '5-6-b', answer_text: 'Blue Whale', is_correct: true },
          { id: '5-6-c', answer_text: 'Giraffe', is_correct: false },
          { id: '5-6-d', answer_text: 'Hippo', is_correct: false }
        ]
      }
    ],
    '6': [
      {
        id: '6-1',
        question_text: 'Which planet is closest to the Sun?',
        question_type: 'multiple_choice',
        answers: [
          { id: '6-1-a', answer_text: 'Venus', is_correct: false },
          { id: '6-1-b', answer_text: 'Mercury', is_correct: true },
          { id: '6-1-c', answer_text: 'Earth', is_correct: false },
          { id: '6-1-d', answer_text: 'Mars', is_correct: false }
        ]
      },
      {
        id: '6-2',
        question_text: 'How many planets are in our solar system?',
        question_type: 'multiple_choice',
        answers: [
          { id: '6-2-a', answer_text: '7', is_correct: false },
          { id: '6-2-b', answer_text: '8', is_correct: true },
          { id: '6-2-c', answer_text: '9', is_correct: false },
          { id: '6-2-d', answer_text: '10', is_correct: false }
        ]
      },
      {
        id: '6-3',
        question_text: 'Which planet is known as the "Red Planet"?',
        question_type: 'multiple_choice',
        answers: [
          { id: '6-3-a', answer_text: 'Venus', is_correct: false },
          { id: '6-3-b', answer_text: 'Mars', is_correct: true },
          { id: '6-3-c', answer_text: 'Jupiter', is_correct: false },
          { id: '6-3-d', answer_text: 'Saturn', is_correct: false }
        ]
      },
      {
        id: '6-4',
        question_text: 'What is the largest planet in our solar system?',
        question_type: 'multiple_choice',
        answers: [
          { id: '6-4-a', answer_text: 'Saturn', is_correct: false },
          { id: '6-4-b', answer_text: 'Jupiter', is_correct: true },
          { id: '6-4-c', answer_text: 'Neptune', is_correct: false },
          { id: '6-4-d', answer_text: 'Uranus', is_correct: false }
        ]
      },
      {
        id: '6-5',
        question_text: 'How long does it take Earth to orbit the Sun?',
        question_type: 'multiple_choice',
        answers: [
          { id: '6-5-a', answer_text: '365 days', is_correct: true },
          { id: '6-5-b', answer_text: '300 days', is_correct: false },
          { id: '6-5-c', answer_text: '400 days', is_correct: false },
          { id: '6-5-d', answer_text: '500 days', is_correct: false }
        ]
      },
      {
        id: '6-6',
        question_text: 'What causes day and night on Earth?',
        question_type: 'multiple_choice',
        answers: [
          { id: '6-6-a', answer_text: 'Earth\'s rotation', is_correct: true },
          { id: '6-6-b', answer_text: 'Moon\'s orbit', is_correct: false },
          { id: '6-6-c', answer_text: 'Sun\'s movement', is_correct: false },
          { id: '6-6-d', answer_text: 'Earth\'s orbit', is_correct: false }
        ]
      }
    ],
    '13': [
      {
        id: '13-1',
        question_text: 'What does HTML stand for?',
        question_type: 'multiple_choice',
        answers: [
          { id: '13-1-a', answer_text: 'High Tech Modern Language', is_correct: false },
          { id: '13-1-b', answer_text: 'HyperText Markup Language', is_correct: true },
          { id: '13-1-c', answer_text: 'Home Tool Markup Language', is_correct: false },
          { id: '13-1-d', answer_text: 'Hyperlink and Text Markup Language', is_correct: false }
        ]
      },
      {
        id: '13-2',
        question_text: 'Which of these is a programming language?',
        question_type: 'multiple_choice',
        answers: [
          { id: '13-2-a', answer_text: 'Microsoft Word', is_correct: false },
          { id: '13-2-b', answer_text: 'Python', is_correct: true },
          { id: '13-2-c', answer_text: 'Adobe Photoshop', is_correct: false },
          { id: '13-2-d', answer_text: 'Google Chrome', is_correct: false }
        ]
      },
      {
        id: '13-3',
        question_text: 'What is a variable in programming?',
        question_type: 'multiple_choice',
        answers: [
          { id: '13-3-a', answer_text: 'A container that stores data values', is_correct: true },
          { id: '13-3-b', answer_text: 'A type of computer virus', is_correct: false },
          { id: '13-3-c', answer_text: 'A programming error', is_correct: false },
          { id: '13-3-d', answer_text: 'A computer screen', is_correct: false }
        ]
      },
      {
        id: '13-4',
        question_text: 'What does CSS stand for?',
        question_type: 'multiple_choice',
        answers: [
          { id: '13-4-a', answer_text: 'Computer Style Sheets', is_correct: false },
          { id: '13-4-b', answer_text: 'Cascading Style Sheets', is_correct: true },
          { id: '13-4-c', answer_text: 'Creative Style System', is_correct: false },
          { id: '13-4-d', answer_text: 'Colorful Style Sheets', is_correct: false }
        ]
      },
      {
        id: '13-5',
        question_text: 'Which symbol is used to end most statements in JavaScript?',
        question_type: 'multiple_choice',
        answers: [
          { id: '13-5-a', answer_text: '.', is_correct: false },
          { id: '13-5-b', answer_text: ':', is_correct: false },
          { id: '13-5-c', answer_text: ';', is_correct: true },
          { id: '13-5-d', answer_text: '!', is_correct: false }
        ]
      }
    ],
    '16': [
      {
        id: '16-1',
        question_text: 'What is a strong password?',
        question_type: 'multiple_choice',
        answers: [
          { id: '16-1-a', answer_text: 'Your name and birthday', is_correct: false },
          { id: '16-1-b', answer_text: 'A mix of letters, numbers, and symbols', is_correct: true },
          { id: '16-1-c', answer_text: 'The word "password"', is_correct: false },
          { id: '16-1-d', answer_text: 'Your pet\'s name', is_correct: false }
        ]
      },
      {
        id: '16-2',
        question_text: 'What should you do if you receive a suspicious email?',
        question_type: 'multiple_choice',
        answers: [
          { id: '16-2-a', answer_text: 'Click all the links to see what happens', is_correct: false },
          { id: '16-2-b', answer_text: 'Delete it without opening attachments', is_correct: true },
          { id: '16-2-c', answer_text: 'Forward it to all your friends', is_correct: false },
          { id: '16-2-d', answer_text: 'Reply with your personal information', is_correct: false }
        ]
      },
      {
        id: '16-3',
        question_text: 'What is two-factor authentication?',
        question_type: 'multiple_choice',
        answers: [
          { id: '16-3-a', answer_text: 'Using two different passwords', is_correct: false },
          { id: '16-3-b', answer_text: 'An extra security step beyond just a password', is_correct: true },
          { id: '16-3-c', answer_text: 'Having two user accounts', is_correct: false },
          { id: '16-3-d', answer_text: 'Using two different computers', is_correct: false }
        ]
      }
    ],
    '18': [
      {
        id: '18-1',
        question_text: 'What is a robot?',
        question_type: 'multiple_choice',
        answers: [
          { id: '18-1-a', answer_text: 'A machine that can perform tasks automatically', is_correct: true },
          { id: '18-1-b', answer_text: 'A type of computer game', is_correct: false },
          { id: '18-1-c', answer_text: 'A programming language', is_correct: false },
          { id: '18-1-d', answer_text: 'A social media platform', is_correct: false }
        ]
      },
      {
        id: '18-2',
        question_text: 'Which of these is a common use for robots?',
        question_type: 'multiple_choice',
        answers: [
          { id: '18-2-a', answer_text: 'Manufacturing cars', is_correct: true },
          { id: '18-2-b', answer_text: 'Writing poetry', is_correct: false },
          { id: '18-2-c', answer_text: 'Cooking dinner', is_correct: false },
          { id: '18-2-d', answer_text: 'Playing video games', is_correct: false }
        ]
      },
      {
        id: '18-3',
        question_text: 'What do robots use to "see" their environment?',
        question_type: 'multiple_choice',
        answers: [
          { id: '18-3-a', answer_text: 'Cameras and sensors', is_correct: true },
          { id: '18-3-b', answer_text: 'Magic', is_correct: false },
          { id: '18-3-c', answer_text: 'Telepathy', is_correct: false },
          { id: '18-3-d', answer_text: 'Guessing', is_correct: false }
        ]
      }
    ]
  }

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!user || !quizId) return

      try {
        // Try to fetch from database first
        const { data: quizData } = await supabase
          .from('quizzes')
          .select(`
            *,
            subject:subjects(name, color)
          `)
          .eq('id', quizId)
          .single()
        
        const { data: questionsData } = await supabase
          .from('questions')
          .select(`
            *,
            answers(*)
          `)
          .eq('quiz_id', quizId)
          .order('created_at', { ascending: true })

        if (quizData && questionsData && questionsData.length > 0) {
          setQuiz(quizData)
          setQuestions(questionsData)
        } else {
          // Fallback to sample data
          const sampleQuiz = sampleQuizzes[quizId]
          const sampleQs = sampleQuestions[quizId]
          
          if (sampleQuiz && sampleQs) {
            setQuiz(sampleQuiz)
            setQuestions(sampleQs)
          }
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error)
        // Fallback to sample data
        const sampleQuiz = sampleQuizzes[quizId]
        const sampleQs = sampleQuestions[quizId]
        
        if (sampleQuiz && sampleQs) {
          setQuiz(sampleQuiz)
          setQuestions(sampleQs)
        }
      }

      setLoading(false)
    }

    fetchQuizData()
  }, [user, quizId])

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      handleSubmitQuiz()
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    if (!user || !quiz) return

    setSubmitting(true)
    
    // Calculate score
    let correctAnswers = 0

    for (const question of questions) {
      const selectedAnswerId = selectedAnswers[question.id]
      if (selectedAnswerId) {
        const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId)
        if (selectedAnswer?.is_correct) {
          correctAnswers++
        }
      }
    }

    const finalScore = Math.round((correctAnswers / questions.length) * 100)
    setScore(finalScore)

    // Try to save progress to database
    try {
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          quiz_id: quiz.id,
          completed: true,
          score: finalScore,
          max_score: 100,
          completed_at: new Date().toISOString()
        })
      
      if (progressError) {
        console.error('Error updating progress:', progressError)
      }

      // Update user points
      const pointsEarned = Math.round((finalScore / 100) * quiz.points)
      const { error: pointsError } = await supabase
        .from('users')
        .update({ points: (user.user_metadata?.points || 0) + pointsEarned })
        .eq('id', user.id)
      
      if (pointsError) {
        console.error('Error updating points:', pointsError)
      }
    } catch (error) {
      console.error('Error saving quiz results:', error)
    }

    setQuizCompleted(true)
    setSubmitting(false)
  }

  const restartQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setQuizCompleted(false)
    setScore(0)
  }

  const goToQuizzes = () => {
    router.push('/quizzes')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-fun p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold gradient-text mb-4">Login Required</h1>
          <p className="text-gray-600 mb-6">Please log in to take quizzes!</p>
          <button className="btn-fun btn-success" onClick={() => router.push('/auth')}>
            🚀 Login
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
        <div className="text-2xl ml-4 gradient-text">Loading quiz...</div>
      </div>
    )
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-fun p-8 text-center max-w-md">
          <div className="text-6xl mb-4">❓</div>
          <h1 className="text-2xl font-bold gradient-text mb-4">Quiz Not Found</h1>
          <p className="text-gray-600 mb-6">This quiz doesn't exist or has no questions.</p>
          <button className="btn-fun btn-secondary" onClick={goToQuizzes}>
            🔙 Back to Quizzes
          </button>
        </div>
      </div>
    )
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="card-fun p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold gradient-text mb-4">Quiz Completed!</h1>
          
          <div className="mb-6">
            <div className="text-6xl font-bold gradient-text mb-2">{score}%</div>
            <p className="text-gray-600">Your Score</p>
          </div>
          
          {score === 100 && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
              <div className="text-yellow-800 font-bold text-lg">🌟 Perfect Score! 🌟</div>
              <div className="text-yellow-700">You're amazing!</div>
            </div>
          )}
          
          {score >= 80 && score < 100 && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <div className="text-green-800 font-bold">🎯 Great Job!</div>
              <div className="text-green-700">You did really well!</div>
            </div>
          )}
          
          {score >= 60 && score < 80 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="text-blue-800 font-bold">👍 Good Work!</div>
              <div className="text-blue-700">Keep practicing!</div>
            </div>
          )}
          
          {score < 60 && (
            <div className="mb-6 p-4 bg-orange-50 rounded-lg">
              <div className="text-orange-800 font-bold">💪 Keep Trying!</div>
              <div className="text-orange-700">Practice makes perfect!</div>
            </div>
          )}
          
          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              🏆 You earned {Math.round((score / 100) * quiz.points)} points!
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button className="btn-fun btn-secondary" onClick={restartQuiz}>
              🔄 Try Again
            </button>
            <button className="btn-fun btn-success" onClick={goToQuizzes}>
              🔙 Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="card-fun p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold gradient-text">{quiz.title}</h1>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="progress-fun h-3 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{quiz.subject?.icon} {quiz.subject?.name}</span>
            <span>🏆 {quiz.points} points</span>
          </div>
        </div>

        {/* Question */}
        <div className="card-fun p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion.question_text}
          </h2>
          
          <div className="space-y-3">
            {currentQuestion.answers.map((answer) => (
              <div
                key={answer.id}
                className={`quiz-option ${
                  selectedAnswers[currentQuestion.id] === answer.id ? 'selected' : ''
                }`}
                onClick={() => handleAnswerSelect(currentQuestion.id, answer.id)}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${
                    selectedAnswers[currentQuestion.id] === answer.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-400'
                  }`}>
                    {selectedAnswers[currentQuestion.id] === answer.id && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-lg">{answer.answer_text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            className="btn-fun btn-secondary"
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            ⬅️ Previous
          </button>
          
          <button
            className="btn-fun btn-success"
            onClick={handleNextQuestion}
            disabled={!selectedAnswers[currentQuestion.id] || submitting}
          >
            {submitting
              ? '⏳ Submitting...'
              : currentQuestionIndex === questions.length - 1
                ? '🏁 Finish Quiz'
                : 'Next ➡️'
            }
          </button>
        </div>
      </div>
    </div>
  )
}