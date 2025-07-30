import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL format')
}

// Create Supabase client with enhanced configuration
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'the-playground-app'
    }
  }
})

// Connection test function
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return false
  }
}

// Database types (extend as needed)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          avatar_url: string | null
          points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          avatar_url?: string | null
          points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          avatar_url?: string | null
          points?: number
          created_at?: string
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          difficulty: string
          questions: any[]
          created_at: string
          updated_at: string
        }
      }
      user_quiz_attempts: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          score: number
          total_questions: number
          completed_at: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_type: string
          earned_at: string
        }
      }
      research_articles: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          difficulty: string
          reading_time: number
          created_at: string
          updated_at: string
        }
      }
      saved_research: {
        Row: {
          id: string
          user_id: string
          article_id: string
          saved_at: string
        }
      }
    }
  }
}

// Typed Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>
export const typedSupabase = supabase as TypedSupabaseClient