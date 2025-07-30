'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Subject {
  id: string
  name: string
  description: string
  color: string
  icon: string
}

interface Quiz {
  id: string
  title: string
  description: string
  difficulty: number
  points: number
  subject_id: string
  subject?: Subject
}

export default function QuizzesPage() {
  const { user } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<string>('all')

  // Comprehensive subjects including technical topics
  const sampleSubjects: Subject[] = [
    {
      id: '1',
      name: 'Mathematics',
      description: 'Numbers, equations, and problem solving!',
      color: '#3B82F6',
      icon: '🔢'
    },
    {
      id: '2',
      name: 'Science',
      description: 'Discover how the world works!',
      color: '#10B981',
      icon: '🔬'
    },
    {
      id: '3',
      name: 'History',
      description: 'Learn about the past and famous people!',
      color: '#F59E0B',
      icon: '🏛️'
    },
    {
      id: '4',
      name: 'Geography',
      description: 'Explore countries, capitals, and landmarks!',
      color: '#EF4444',
      icon: '🌍'
    },
    {
      id: '5',
      name: 'Computer Science',
      description: 'Programming, algorithms, and technology!',
      color: '#8B5CF6',
      icon: '💻'
    },
    {
      id: '6',
      name: 'Cybersecurity',
      description: 'Online safety and digital security!',
      color: '#DC2626',
      icon: '🔒'
    },
    {
      id: '7',
      name: 'Robotics',
      description: 'Robots, AI, and automation!',
      color: '#059669',
      icon: '🤖'
    }
  ]

  // Comprehensive quiz collection
  const sampleQuizzes: Quiz[] = [
    // Mathematics
    {
      id: '1',
      title: 'Basic Addition & Subtraction',
      description: 'Master fundamental arithmetic operations',
      difficulty: 1,
      points: 50,
      subject_id: '1',
      subject: sampleSubjects[0]
    },
    {
      id: '2',
      title: 'Multiplication & Division',
      description: 'Test your multiplication tables and division skills',
      difficulty: 2,
      points: 75,
      subject_id: '1',
      subject: sampleSubjects[0]
    },
    {
      id: '3',
      title: 'Fractions & Decimals',
      description: 'Work with fractions, decimals, and percentages',
      difficulty: 3,
      points: 100,
      subject_id: '1',
      subject: sampleSubjects[0]
    },
    {
      id: '4',
      title: 'Geometry Basics',
      description: 'Shapes, angles, and basic geometric concepts',
      difficulty: 2,
      points: 80,
      subject_id: '1',
      subject: sampleSubjects[0]
    },
    // Science
    {
      id: '5',
      title: 'Animals & Habitats',
      description: 'Learn about different animals and where they live',
      difficulty: 1,
      points: 60,
      subject_id: '2',
      subject: sampleSubjects[1]
    },
    {
      id: '6',
      title: 'Solar System',
      description: 'Explore planets, moons, and space facts',
      difficulty: 2,
      points: 80,
      subject_id: '2',
      subject: sampleSubjects[1]
    },
    {
      id: '7',
      title: 'Human Body Systems',
      description: 'Discover how your body works',
      difficulty: 3,
      points: 100,
      subject_id: '2',
      subject: sampleSubjects[1]
    },
    {
      id: '8',
      title: 'Chemistry Basics',
      description: 'Elements, compounds, and chemical reactions',
      difficulty: 3,
      points: 120,
      subject_id: '2',
      subject: sampleSubjects[1]
    },
    {
      id: '20',
      title: 'Environmental Science',
      description: 'Climate change and environmental protection',
      difficulty: 3,
      points: 100,
      subject_id: '2',
      subject: sampleSubjects[1]
    },
    // History
    {
      id: '9',
      title: 'Ancient Civilizations',
      description: 'Explore ancient Egypt, Greece, and Rome',
      difficulty: 3,
      points: 100,
      subject_id: '3',
      subject: sampleSubjects[2]
    },
    {
      id: '10',
      title: 'World Wars',
      description: 'Learn about major historical conflicts',
      difficulty: 4,
      points: 150,
      subject_id: '3',
      subject: sampleSubjects[2]
    },
    // Geography
    {
      id: '11',
      title: 'World Capitals',
      description: 'Test your knowledge of country capitals',
      difficulty: 2,
      points: 70,
      subject_id: '4',
      subject: sampleSubjects[3]
    },
    {
      id: '12',
      title: 'Climate & Weather',
      description: 'Understanding weather patterns and climate zones',
      difficulty: 3,
      points: 90,
      subject_id: '4',
      subject: sampleSubjects[3]
    },
    // Computer Science
    {
      id: '13',
      title: 'Programming Basics',
      description: 'Introduction to coding concepts and logic',
      difficulty: 2,
      points: 100,
      subject_id: '5',
      subject: sampleSubjects[4]
    },
    {
      id: '14',
      title: 'Web Development',
      description: 'HTML, CSS, and JavaScript fundamentals',
      difficulty: 3,
      points: 120,
      subject_id: '5',
      subject: sampleSubjects[4]
    },
    {
      id: '15',
      title: 'Algorithms & Data Structures',
      description: 'Basic algorithms and how data is organized',
      difficulty: 4,
      points: 150,
      subject_id: '5',
      subject: sampleSubjects[4]
    },
    // Cybersecurity
    {
      id: '16',
      title: 'Cybersecurity Basics',
      description: 'Online safety and security fundamentals',
      difficulty: 2,
      points: 90,
      subject_id: '6',
      subject: sampleSubjects[5]
    },
    {
      id: '17',
      title: 'Network Security',
      description: 'How networks are protected from threats',
      difficulty: 4,
      points: 140,
      subject_id: '6',
      subject: sampleSubjects[5]
    },
    // Robotics
    {
      id: '18',
      title: 'Robotics Fundamentals',
      description: 'How robots work and their applications',
      difficulty: 3,
      points: 110,
      subject_id: '7',
      subject: sampleSubjects[6]
    },
    {
      id: '19',
      title: 'AI & Machine Learning',
      description: 'Introduction to artificial intelligence',
      difficulty: 4,
      points: 160,
      subject_id: '7',
      subject: sampleSubjects[6]
    }
  ]

  useEffect(() => {
    const fetchQuizzesAndSubjects = async () => {
      try {
        // Fetch subjects
        const { data: subjectsData } = await supabase
          .from('subjects')
          .select('*')
        
        if (subjectsData && subjectsData.length > 0) {
          setSubjects(subjectsData)
        } else {
          setSubjects(sampleSubjects)
        }

        // Fetch quizzes with subject information
        const { data: quizzesData } = await supabase
          .from('quizzes')
          .select(`
            *,
            subject:subjects(*)
          `)
          .order('created_at', { ascending: false })
        
        if (quizzesData && quizzesData.length > 0) {
          setQuizzes(quizzesData)
        } else {
          setQuizzes(sampleQuizzes)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        // Fallback to sample data
        setSubjects(sampleSubjects)
        setQuizzes(sampleQuizzes)
      }

      setLoading(false)
    }

    fetchQuizzesAndSubjects()
  }, [user])

  const filteredQuizzes = selectedSubject === 'all' 
    ? quizzes 
    : quizzes.filter(quiz => quiz.subject_id === selectedSubject)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-fun p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-2xl font-bold gradient-text mb-4">Ready to Test Your Knowledge?</h1>
          <p className="text-gray-600 mb-6">Log in to access comprehensive quizzes and earn points!</p>
          <Link href="/auth">
            <button className="btn-fun btn-success">🚀 Login to Start</button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
        <div className="text-2xl ml-4 gradient-text">Loading comprehensive quiz collection...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text-light mb-2 star-decoration">🎯 Quiz Center 🏆</h1>
          <p className="text-lg text-white">Test your knowledge across multiple subjects and earn points!</p>
          <p className="text-sm text-gray-200 mt-2">
            {quizzes.length} quizzes available • {subjects.length} subjects • Technical topics included
          </p>
        </div>

        {/* Subject Filter */}
        <div className="card-fun p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Choose Your Subject</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              className={`btn-fun ${selectedSubject === 'all' ? 'btn-success' : 'btn-secondary'}`}
              onClick={() => setSelectedSubject('all')}
            >
              🌟 All Subjects ({quizzes.length})
            </button>
            {subjects.map((subject) => {
              const subjectQuizCount = quizzes.filter(q => q.subject_id === subject.id).length
              return (
                <button
                  key={subject.id}
                  className={`btn-fun ${selectedSubject === subject.id ? 'btn-success' : 'btn-secondary'}`}
                  onClick={() => setSelectedSubject(subject.id)}
                >
                  {subject.icon} {subject.name} ({subjectQuizCount})
                </button>
              )
            })}
          </div>
        </div>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="card-fun overflow-hidden">
              <div 
                className="h-3" 
                style={{ backgroundColor: quiz.subject?.color || '#3B82F6' }}
              ></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{quiz.title}</h3>
                  <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-2">
                    <span className="text-sm mr-1">🏆</span>
                    <span className="font-bold text-sm">{quiz.points}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm">{quiz.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                      {quiz.subject?.icon} {quiz.subject?.name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-1">Level:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${i < quiz.difficulty ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Link href={`/quizzes/${quiz.id}`}>
                  <button className="btn-fun w-full btn-success">
                    🚀 Start Quiz
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredQuizzes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No quizzes found</h3>
            <p className="text-gray-200">Try selecting a different subject or check back later for new quizzes.</p>
          </div>
        )}

        {/* Subject Showcase */}
        <div className="card-fun p-8 mt-12">
          <h2 className="text-2xl font-bold gradient-text mb-6 text-center">📚 Subject Areas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subjects.map((subject) => {
              const subjectQuizCount = quizzes.filter(q => q.subject_id === subject.id).length
              return (
                <div key={subject.id} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="text-3xl mb-2">{subject.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-1">{subject.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{subject.description}</p>
                  <div className="text-xs text-gray-500">{subjectQuizCount} quizzes available</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats Section */}
        {user && (
          <div className="card-fun p-6 mt-8">
            <h2 className="text-2xl font-bold gradient-text mb-4 text-center">🎮 Your Learning Journey</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🎯</div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-gray-600">Quizzes Completed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">⭐</div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-gray-600">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-gray-600">Badges Earned</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <div className="text-2xl font-bold text-gray-900">0%</div>
                <div className="text-gray-600">Average Score</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}