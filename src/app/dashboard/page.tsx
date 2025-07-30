'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getUserBadges } from '@/lib/badges'

interface UserProgress {
  id: string
  quiz_id: string
  quiz: {
    id: string
    title: string
    subject: {
      name: string
      color: string
    }
  }
  completed: boolean
  score: number
  max_score: number
  completed_at: string
}

interface UserBadge {
  id: string
  badge: {
    id: string
    name: string
    description: string
    icon: string
    color: string
  }
  earned_at: string
}

interface UserProfile {
  id: string
  username: string
  avatar_url: string
  points: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileData) {
        setUserProfile(profileData)
      }

      // Fetch user progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select(`
          *,
          quiz:quizzes(
            id,
            title,
            subject:subjects(name, color)
          )
        `)
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false })
      
      if (progressData) {
        setUserProgress(progressData as UserProgress[])
      }

      // Fetch user badges using the new function
      const badges = await getUserBadges(user.id)
      setUserBadges(badges.map(badge => ({
        id: badge.id,
        badge: badge,
        earned_at: new Date().toISOString()
      })))

      setLoading(false)
    }

    fetchUserData()
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h1>
          <Link href="/auth">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading dashboard...</div>
      </div>
    )
  }

  const completedQuizzes = userProgress.length
  const averageScore = completedQuizzes > 0 
    ? Math.round(userProgress.reduce((sum, progress) => sum + progress.score, 0) / completedQuizzes)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl mr-4">{userProfile?.avatar_url || '🧑‍🎓'}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {userProfile?.username || 'Student'}!
              </h1>
              <p className="text-lg text-gray-600">Track your learning progress and achievements</p>
              <Link href="/profile">
                <button className="btn-fun btn-secondary mt-2 text-sm">
                  ⚙️ Edit Profile
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">{completedQuizzes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Points Earned</p>
                <p className="text-2xl font-bold text-gray-900">{userProfile?.points || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Quiz Results */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Quiz Results</h2>
            {userProgress.length > 0 ? (
              <div className="space-y-4">
                {userProgress.slice(0, 5).map((progress) => (
                  <div key={progress.id} className="flex items-center justify-between p-3 border-b border-gray-200">
                    <div>
                      <h3 className="font-medium text-gray-900">{progress.quiz.title}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-3">{progress.quiz.subject.name}</span>
                        <span>{new Date(progress.completed_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-900 mr-2">{progress.score}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${progress.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't completed any quizzes yet</p>
                <Link href="/quizzes">
                  <Button>Take Your First Quiz</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Badges</h2>
            {userBadges.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {userBadges.map((userBadge) => (
                  <div key={userBadge.id} className="text-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2"
                      style={{ backgroundColor: userBadge.badge.color + '20' }}
                    >
                      <span className="text-2xl">{userBadge.badge.icon}</span>
                    </div>
                    <h3 className="font-medium text-gray-900">{userBadge.badge.name}</h3>
                    <p className="text-xs text-gray-500">{userBadge.badge.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Complete quizzes to earn badges!</p>
                <Link href="/quizzes">
                  <Button>Start Learning</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}