'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { checkAndAwardBadges, Badge } from '@/lib/badges'

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
  const [newBadges, setNewBadges] = useState<Badge[]>([])

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
    '7': {
      id: '7',
      title: 'Human Body Systems',
      description: 'Discover how your body works',
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
      }
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
      // Check for new badges
      const earnedBadges = await checkAndAwardBadges(user.id)
      setNewBadges(earnedBadges)
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
          
          {/* New Badges Notification */}
          {newBadges.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
              <div className="text-center">
                <div className="text-4xl mb-2">🎖️</div>
                <h3 className="text-xl font-bold text-yellow-800 mb-2">
                  New Badge{newBadges.length > 1 ? 's' : ''} Earned!
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {newBadges.map((badge) => (
                    <div key={badge.id} className="text-center">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-1"
                        style={{ backgroundColor: badge.color + '20' }}
                      >
                        <span className="text-2xl">{badge.icon}</span>
                      </div>
                      <p className="text-sm font-medium text-yellow-800">{badge.name}</p>
                      <p className="text-xs text-yellow-600">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
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