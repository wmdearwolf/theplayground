'use client'

import { useState } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'
import { Button } from '@/components/ui/button'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b">
            <Button
              variant={isLogin ? "default" : "ghost"}
              className={`flex-1 rounded-none ${isLogin ? 'border-b-2 border-primary-600' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </Button>
            <Button
              variant={!isLogin ? "default" : "ghost"}
              className={`flex-1 rounded-none ${!isLogin ? 'border-b-2 border-primary-600' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </Button>
          </div>
          
          <div className="p-1">
            {isLogin ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Welcome to The Playground! A fun place to learn and grow.
          </p>
        </div>
      </div>
    </div>
  )
}