'use client'

import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return '🌅 Good Morning'
    if (hour < 17) return '☀️ Good Afternoon'
    return '🌙 Good Evening'
  }

  const features = [
    {
      title: 'Quiz Center',
      description: 'Test your knowledge with fun quizzes and earn points!',
      icon: '🎯',
      color: 'from-blue-400 to-purple-500',
      href: '/quizzes',
      stats: 'Complete quizzes to unlock badges!'
    },
    {
      title: 'Research Discovery',
      description: 'Explore amazing facts and real scientific papers!',
      icon: '🔬',
      color: 'from-green-400 to-blue-500',
      href: '/research',
      stats: 'Discover new topics every day!'
    },
    {
      title: 'Scientific Calculator',
      description: 'Solve complex problems with our advanced calculator!',
      icon: '🧮',
      color: 'from-purple-400 to-pink-500',
      href: '/calculator',
      stats: 'Access math formulas and constants!'
    },
    {
      title: 'Your Dashboard',
      description: 'Track your progress and see your achievements!',
      icon: '📊',
      color: 'from-yellow-400 to-orange-500',
      href: '/dashboard',
      stats: 'View your learning journey!'
    }
  ]

  const funFacts = [
    "🌟 Did you know? A group of flamingos is called a 'flamboyance'!",
    "🚀 Fun fact: It would take 9 years to walk to the moon!",
    "🐙 Amazing: Octopuses have three hearts and blue blood!",
    "🌈 Cool: Rainbows can only be seen when the sun is behind you!",
    "🦋 Wow: Butterflies taste with their feet!",
    "🌍 Incredible: Earth is the only planet not named after a god!"
  ]

  const [currentFact, setCurrentFact] = useState(0)

  useEffect(() => {
    const factTimer = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % funFacts.length)
    }, 5000)

    return () => clearInterval(factTimer)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold gradient-text-light mb-4 star-decoration">
                🎓 The Playground 🚀
              </h1>
              <p className="text-xl md:text-2xl text-white mb-6">
                Where curiosity meets discovery!
              </p>
            </div>

            {user ? (
              <div className="card-fun p-6 mb-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold gradient-text mb-2">
                  {getGreeting()}, {user.user_metadata?.full_name || user.email?.split('@')[0]}! 👋
                </h2>
                <p className="text-gray-600 mb-4">Ready for another amazing learning adventure?</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-2xl mb-1">🎯</div>
                    <div className="text-lg font-bold text-blue-800">0</div>
                    <div className="text-sm text-blue-600">Quizzes Completed</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-2xl mb-1">⭐</div>
                    <div className="text-lg font-bold text-green-800">0</div>
                    <div className="text-sm text-green-600">Points Earned</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="text-lg font-bold text-purple-800">0</div>
                    <div className="text-sm text-purple-600">Badges Unlocked</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-fun p-8 mb-8 max-w-md mx-auto">
                <h2 className="text-2xl font-bold gradient-text mb-4">Join the Adventure! 🌟</h2>
                <p className="text-gray-600 mb-6">
                  Create your account to start learning, take quizzes, and earn awesome badges!
                </p>
                <Link href="/auth">
                  <button className="btn-fun btn-success w-full text-lg">
                    🚀 Start Learning Now!
                  </button>
                </Link>
              </div>
            )}

            {/* Fun Fact Carousel */}
            <div className="card-fun p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-bold gradient-text mb-3">💡 Fun Fact of the Moment</h3>
              <p className="text-gray-700 text-lg">
                {funFacts[currentFact]}
              </p>
              <div className="flex justify-center mt-3 space-x-2">
                {funFacts.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentFact ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold gradient-text mb-4">🎮 Choose Your Adventure!</h2>
          <p className="text-lg text-white">Explore different ways to learn and have fun!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href}>
              <div className="card-fun p-6 h-full cursor-pointer group">
                <div className="text-center">
                  <div className="text-5xl mb-4 group-hover:scale-105 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  <div className="text-sm text-blue-600 font-medium">
                    {feature.stats}
                  </div>
                  <div className="mt-4">
                    <div className={`btn-fun bg-gradient-to-r ${feature.color} text-white w-full`}>
                      Explore Now! 🚀
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Learning Tips Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card-fun p-8">
          <h2 className="text-3xl font-bold gradient-text text-center mb-8">
            🌟 Learning Tips for Success! 🌟
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-blue-800 mb-2">Set Goals</h3>
              <p className="text-blue-600 text-sm">
                Try to complete one quiz each day to build your knowledge!
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="font-bold text-green-800 mb-2">Practice Daily</h3>
              <p className="text-green-600 text-sm">
                Regular practice helps you remember what you've learned!
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-3">🤔</div>
              <h3 className="font-bold text-purple-800 mb-2">Ask Questions</h3>
              <p className="text-purple-600 text-sm">
                Curiosity is the key to discovering amazing new things!
              </p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-bold text-yellow-800 mb-2">Read More</h3>
              <p className="text-yellow-600 text-sm">
                Explore research topics to learn fascinating facts!
              </p>
            </div>
            
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <div className="text-3xl mb-3">🎉</div>
              <h3 className="font-bold text-pink-800 mb-2">Celebrate Wins</h3>
              <p className="text-pink-600 text-sm">
                Every correct answer and new fact learned is worth celebrating!
              </p>
            </div>
            
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-3xl mb-3">🌈</div>
              <h3 className="font-bold text-indigo-800 mb-2">Have Fun</h3>
              <p className="text-indigo-600 text-sm">
                Learning should be enjoyable - play and explore freely!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      {!user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="card-fun p-8 text-center">
            <h2 className="text-3xl font-bold gradient-text mb-4">
              🚀 Ready to Start Your Learning Journey? 🚀
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Join thousands of young learners exploring science, math, history, and more!
            </p>
            <Link href="/auth">
              <button className="btn-fun btn-success text-xl px-8 py-4">
                🌟 Create Your Account Now! 🌟
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-white">
          <p className="text-lg mb-2">
            🎓 The Playground - Where Education Meets Fun! 🎮
          </p>
          <p className="text-sm opacity-75">
            Made with ❤️ for curious young minds everywhere
          </p>
        </div>
      </footer>
    </div>
  )
}