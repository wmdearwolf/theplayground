'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  username: string
  avatar_url: string
  points: number
}

const avatarOptions = [
  { id: '🧑‍🎓', name: 'Student', emoji: '🧑‍🎓' },
  { id: '👨‍🔬', name: 'Scientist', emoji: '👨‍🔬' },
  { id: '👩‍🔬', name: 'Scientist', emoji: '👩‍🔬' },
  { id: '🧑‍💻', name: 'Programmer', emoji: '🧑‍💻' },
  { id: '👨‍🚀', name: 'Astronaut', emoji: '👨‍🚀' },
  { id: '👩‍🚀', name: 'Astronaut', emoji: '👩‍🚀' },
  { id: '🧑‍🏫', name: 'Teacher', emoji: '🧑‍🏫' },
  { id: '👨‍🎨', name: 'Artist', emoji: '👨‍🎨' },
  { id: '👩‍🎨', name: 'Artist', emoji: '👩‍🎨' },
  { id: '🧑‍⚕️', name: 'Doctor', emoji: '🧑‍⚕️' },
  { id: '👨‍🔧', name: 'Engineer', emoji: '👨‍🔧' },
  { id: '👩‍🔧', name: 'Engineer', emoji: '👩‍🔧' },
  { id: '🦸‍♂️', name: 'Hero', emoji: '🦸‍♂️' },
  { id: '🦸‍♀️', name: 'Hero', emoji: '🦸‍♀️' },
  { id: '🧙‍♂️', name: 'Wizard', emoji: '🧙‍♂️' },
  { id: '🧙‍♀️', name: 'Wizard', emoji: '🧙‍♀️' },
  { id: '🤖', name: 'Robot', emoji: '🤖' },
  { id: '👽', name: 'Alien', emoji: '👽' },
  { id: '🦄', name: 'Unicorn', emoji: '🦄' },
  { id: '🐱', name: 'Cat', emoji: '🐱' },
  { id: '🐶', name: 'Dog', emoji: '🐶' },
  { id: '🦊', name: 'Fox', emoji: '🦊' },
  { id: '🐼', name: 'Panda', emoji: '🐼' },
  { id: '🦁', name: 'Lion', emoji: '🦁' }
]

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  
  // Form states
  const [username, setUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('🧑‍🎓')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Messages
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
          setUsername(profileData.username || '')
          setSelectedAvatar(profileData.avatar_url || '🧑‍🎓')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [user])

  const handleUpdateProfile = async () => {
    if (!user || !username.trim()) {
      setError('Username is required')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: username.trim(),
          avatar_url: selectedAvatar
        })
        .eq('id', user.id)

      if (error) {
        setError('Failed to update profile')
      } else {
        setMessage('Profile updated successfully!')
        setProfile(prev => prev ? {
          ...prev,
          username: username.trim(),
          avatar_url: selectedAvatar
        } : null)
      }
    } catch (error) {
      setError('An error occurred while updating profile')
    }

    setSaving(false)
  }

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        setError('Failed to update password: ' + error.message)
      } else {
        setMessage('Password updated successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setShowPasswordForm(false)
      }
    } catch (error) {
      setError('An error occurred while updating password')
    }

    setSaving(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-fun p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold gradient-text mb-4">Login Required</h1>
          <p className="text-gray-600 mb-6">Please log in to view your profile!</p>
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
        <div className="text-2xl ml-4 gradient-text">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 star-decoration">⚙️ Profile Settings 👤</h1>
          <p className="text-lg text-white">Customize your account and preferences</p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✅ {message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">❌ {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="card-fun p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">👤 Profile Information</h2>
            
            {/* Current Avatar Display */}
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full mb-3">
                <div className="text-6xl">{selectedAvatar}</div>
              </div>
              <p className="text-gray-600 font-medium">Current Avatar</p>
            </div>

            {/* Username */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                🏷️ Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all duration-200"
                placeholder="Enter your username"
              />
            </div>

            {/* Avatar Selection */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-4">
                🎭 Choose Your Avatar
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-lg p-4">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`aspect-square flex items-center justify-center p-2 rounded-lg text-2xl hover:bg-blue-50 transition-all duration-200 ${
                      selectedAvatar === avatar.id
                        ? 'bg-blue-100 border-2 border-blue-500 scale-105'
                        : 'border-2 border-gray-200 hover:border-blue-300'
                    }`}
                    title={avatar.name}
                  >
                    {avatar.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Update Profile Button */}
            <button
              onClick={handleUpdateProfile}
              disabled={saving}
              className="btn-fun btn-success w-full"
            >
              {saving ? '⏳ Updating...' : '💾 Update Profile'}
            </button>
          </div>

          {/* Account Security */}
          <div className="card-fun p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">🔐 Account Security</h2>
            
            {/* Account Info */}
            <div className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 text-center">📊 Account Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <span className="text-sm font-medium text-gray-700">📧 Email:</span>
                  <span className="text-sm text-gray-900 font-medium">{user.email}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <span className="text-sm font-medium text-gray-700">🏆 Points:</span>
                  <span className="text-sm text-gray-900 font-bold">{profile?.points || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <span className="text-sm font-medium text-gray-700">📅 Member since:</span>
                  <span className="text-sm text-gray-900 font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Password Change */}
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="btn-fun btn-secondary w-full"
              >
                🔑 Change Password
              </button>
            ) : (
              <div className="space-y-6 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
                <h3 className="font-bold text-gray-900 text-center mb-4">🔑 Change Password</h3>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    🔒 New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    🔒 Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="btn-fun btn-success flex-1"
                  >
                    {saving ? '⏳ Updating...' : '✅ Update Password'}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordForm(false)
                      setNewPassword('')
                      setConfirmPassword('')
                      setError('')
                    }}
                    className="btn-fun btn-secondary flex-1"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-fun btn-secondary"
          >
            🔙 Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}