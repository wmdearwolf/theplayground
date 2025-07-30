'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

interface ResearchItem {
  id: string
  title: string
  description: string
  content: string
  category: string
  difficulty: number
  image_url?: string
  created_at: string
}

interface SavedResearch {
  id: string
  user_id: string
  research_item_id: string
  saved_at: string
}

export default function ResearchDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const researchId = params.id as string
  
  const [researchItem, setResearchItem] = useState<ResearchItem | null>(null)
  const [savedItems, setSavedItems] = useState<SavedResearch[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchResearchData = async () => {
      if (!researchId) return

      // Fetch research item
      const { data: itemData } = await supabase
        .from('research_items')
        .select('*')
        .eq('id', researchId)
        .single()
      
      if (itemData) {
        setResearchItem(itemData as ResearchItem)
      }

      if (user) {
        // Fetch saved items
        const { data: savedData } = await supabase
          .from('saved_research')
          .select('*')
          .eq('user_id', user.id)
        
        if (savedData) {
          setSavedItems(savedData as SavedResearch[])
        }
      }

      setLoading(false)
    }

    fetchResearchData()
  }, [researchId, user])

  const handleSaveItem = async () => {
    if (!user || !researchItem) return

    setSaving(true)

    const isSaved = savedItems.some(item => item.research_item_id === researchItem.id)

    if (isSaved) {
      // Unsave the item
      const { error } = await supabase
        .from('saved_research')
        .delete()
        .eq('user_id', user.id)
        .eq('research_item_id', researchItem.id)
      
      if (!error) {
        setSavedItems(prev => prev.filter(item => item.research_item_id !== researchItem.id))
      }
    } else {
      // Save the item
      const { error } = await supabase
        .from('saved_research')
        .insert({
          user_id: user.id,
          research_item_id: researchItem.id
        })
      
      if (!error) {
        setSavedItems(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            user_id: user.id,
            research_item_id: researchItem.id,
            saved_at: new Date().toISOString()
          }
        ])
      }
    }

    setSaving(false)
  }

  const isItemSaved = () => {
    return savedItems.some(item => item.research_item_id === researchItem?.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading research content...</div>
      </div>
    )
  }

  if (!researchItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Research not found</h1>
          <Button onClick={() => router.push('/research')}>Back to Research</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/research')}
          >
            ← Back to Research
          </Button>
        </div>

        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {researchItem.image_url && (
            <div className="h-64 md:h-80 bg-gray-200">
              <img 
                src={researchItem.image_url} 
                alt={researchItem.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center mb-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-3">
                    {researchItem.category}
                  </span>
                  <div className="flex">
                    {[...Array(3)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < researchItem.difficulty ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{researchItem.title}</h1>
                <p className="text-lg text-gray-600 mb-6">{researchItem.description}</p>
              </div>
              
              {user && (
                <Button
                  variant={isItemSaved() ? "default" : "outline"}
                  onClick={handleSaveItem}
                  disabled={saving}
                  className="ml-4"
                >
                  {saving ? (
                    <span>Saving...</span>
                  ) : isItemSaved() ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292z" />
                      </svg>
                      Saved
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Save
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: researchItem.content }} />
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Published on {new Date(researchItem.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </article>
        
        {!user && (
          <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Want to save this article?</h3>
            <p className="text-blue-700 mb-4">Create an account to save your favorite research items and track your learning progress.</p>
            <Button onClick={() => router.push('/auth')}>
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}