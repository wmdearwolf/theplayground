'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ArxivPaper {
  id: string
  title: string
  summary: string
  authors: string[]
  published: string
  link: string
  category: string
  pdf_url: string
}

interface ResearchItem {
  id: string
  title: string
  description: string
  content: string
  category: string
  difficulty: number
  image_url?: string
  saved: boolean
}

interface SavedResearch {
  id: string
  user_id: string
  research_item_id: string
  saved_at: string
}

export default function ResearchPage() {
  const { user } = useAuth()
  const [researchItems, setResearchItems] = useState<ResearchItem[]>([])
  const [arxivPapers, setArxivPapers] = useState<ArxivPaper[]>([])
  const [savedItems, setSavedItems] = useState<SavedResearch[]>([])
  const [filteredItems, setFilteredItems] = useState<ResearchItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [arxivSearchTerm, setArxivSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [arxivLoading, setArxivLoading] = useState(false)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<'curated' | 'arxiv'>('curated')

  // Sample curated content for kids
  const sampleResearchItems: ResearchItem[] = [
    {
      id: '1',
      title: 'How Do Volcanoes Work?',
      description: 'Discover the amazing science behind volcanic eruptions and how they shape our planet!',
      content: 'Volcanoes are like Earth\'s pressure valves! Deep underground, hot melted rock called magma builds up pressure...',
      category: 'science',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      saved: false
    },
    {
      id: '2',
      title: 'The Amazing World of Dinosaurs',
      description: 'Journey back in time to learn about the incredible creatures that ruled the Earth millions of years ago!',
      content: 'Dinosaurs lived on Earth for over 160 million years! They came in all shapes and sizes...',
      category: 'history',
      difficulty: 1,
      image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      saved: false
    },
    {
      id: '3',
      title: 'Space Exploration Adventures',
      description: 'Blast off into space and learn about rockets, astronauts, and distant planets!',
      content: 'Space is the ultimate frontier! Humans have been exploring space for over 60 years...',
      category: 'space',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400',
      saved: false
    },
    {
      id: '4',
      title: 'Ocean Mysteries and Marine Life',
      description: 'Dive deep into the ocean to discover amazing sea creatures and underwater wonders!',
      content: 'The ocean covers more than 70% of Earth\'s surface and is home to incredible creatures...',
      category: 'animals',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      saved: false
    },
    {
      id: '5',
      title: 'Weather Patterns and Climate',
      description: 'Learn how weather forms and why different places have different climates!',
      content: 'Weather is what happens in the atmosphere every day. Climate is the average weather over many years...',
      category: 'geography',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400',
      saved: false
    },
    {
      id: '6',
      title: 'The Human Body Systems',
      description: 'Explore how your amazing body works, from your beating heart to your thinking brain!',
      content: 'Your body is like an incredible machine with many different systems working together...',
      category: 'science',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
      saved: false
    }
  ]

  const categories = [
    { id: 'all', name: 'All Topics', emoji: '🌟' },
    { id: 'science', name: 'Science', emoji: '🔬' },
    { id: 'history', name: 'History', emoji: '🏛️' },
    { id: 'geography', name: 'Geography', emoji: '🌍' },
    { id: 'animals', name: 'Animals', emoji: '🦁' },
    { id: 'space', name: 'Space', emoji: '🚀' },
  ]

  const arxivCategories = [
    { id: 'physics', name: 'Physics', query: 'cat:physics.*' },
    { id: 'math', name: 'Mathematics', query: 'cat:math.*' },
    { id: 'cs', name: 'Computer Science', query: 'cat:cs.*' },
    { id: 'bio', name: 'Biology', query: 'cat:q-bio.*' },
    { id: 'astro', name: 'Astronomy', query: 'cat:astro-ph.*' },
  ]

  useEffect(() => {
    const fetchResearchData = async () => {
      try {
        // Try to fetch from database
        const { data: itemsData } = await supabase
          .from('research_items')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (itemsData && itemsData.length > 0) {
          setResearchItems(itemsData as ResearchItem[])
          setFilteredItems(itemsData as ResearchItem[])
        } else {
          // Fallback to sample data
          setResearchItems(sampleResearchItems)
          setFilteredItems(sampleResearchItems)
        }

        // Fetch saved items if user is logged in
        if (user) {
          const { data: savedData } = await supabase
            .from('saved_research')
            .select('*')
            .eq('user_id', user.id)
          
          if (savedData) {
            setSavedItems(savedData as SavedResearch[])
          }
        }
      } catch (error) {
        console.error('Error fetching research data:', error)
        // Fallback to sample data on error
        setResearchItems(sampleResearchItems)
        setFilteredItems(sampleResearchItems)
      }

      setLoading(false)
    }

    fetchResearchData()
  }, [user])

  useEffect(() => {
    // Filter items based on search term and category
    let result = researchItems

    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(item => 
        item.title.toLowerCase().includes(term) || 
        item.description.toLowerCase().includes(term)
      )
    }

    setFilteredItems(result)
  }, [researchItems, searchTerm, selectedCategory])

  const searchArxiv = async (query: string, category?: string) => {
    setArxivLoading(true)
    try {
      let searchQuery = query
      if (category) {
        const categoryData = arxivCategories.find(c => c.id === category)
        if (categoryData) {
          searchQuery = `${categoryData.query} AND (${query})`
        }
      }

      // Using arXiv API
      const response = await fetch(`https://export.arxiv.org/api/query?search_query=${encodeURIComponent(searchQuery)}&start=0&max_results=20&sortBy=submittedDate&sortOrder=descending`)
      const xmlText = await response.text()
      
      // Parse XML response
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
      const entries = xmlDoc.getElementsByTagName('entry')
      
      const papers: ArxivPaper[] = []
      
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]
        const id = entry.getElementsByTagName('id')[0]?.textContent || ''
        const title = entry.getElementsByTagName('title')[0]?.textContent?.trim() || ''
        const summary = entry.getElementsByTagName('summary')[0]?.textContent?.trim() || ''
        const published = entry.getElementsByTagName('published')[0]?.textContent || ''
        
        const authors: string[] = []
        const authorElements = entry.getElementsByTagName('author')
        for (let j = 0; j < authorElements.length; j++) {
          const name = authorElements[j].getElementsByTagName('name')[0]?.textContent
          if (name) authors.push(name)
        }
        
        const links = entry.getElementsByTagName('link')
        let pdfUrl = ''
        let htmlUrl = id
        
        for (let k = 0; k < links.length; k++) {
          const link = links[k]
          const type = link.getAttribute('type')
          const href = link.getAttribute('href')
          if (type === 'application/pdf' && href) {
            pdfUrl = href
          }
        }
        
        const categoryElements = entry.getElementsByTagName('category')
        const category = categoryElements.length > 0 ? categoryElements[0].getAttribute('term') || 'general' : 'general'
        
        papers.push({
          id: id.split('/').pop() || `paper-${i}`,
          title: title.replace(/\s+/g, ' '),
          summary: summary.replace(/\s+/g, ' ').substring(0, 300) + '...',
          authors,
          published,
          link: htmlUrl,
          category,
          pdf_url: pdfUrl
        })
      }
      
      setArxivPapers(papers)
    } catch (error) {
      console.error('Error searching arXiv:', error)
      // Fallback to sample papers
      setArxivPapers([
        {
          id: 'sample1',
          title: 'Introduction to Quantum Computing for Young Minds',
          summary: 'This paper provides a simplified introduction to quantum computing concepts that can be understood by students. It covers basic principles of quantum mechanics and how they apply to computing...',
          authors: ['Dr. Jane Smith', 'Prof. John Doe'],
          published: '2024-01-15',
          link: 'https://arxiv.org/abs/sample1',
          category: 'physics',
          pdf_url: 'https://arxiv.org/pdf/sample1.pdf'
        },
        {
          id: 'sample2',
          title: 'Mathematical Patterns in Nature: A Visual Guide',
          summary: 'Exploring the fascinating mathematical patterns found in nature, from the Fibonacci sequence in flowers to fractals in coastlines. This research makes complex mathematical concepts accessible...',
          authors: ['Dr. Maria Garcia', 'Dr. Ahmed Hassan'],
          published: '2024-01-10',
          link: 'https://arxiv.org/abs/sample2',
          category: 'math',
          pdf_url: 'https://arxiv.org/pdf/sample2.pdf'
        }
      ])
    }
    setArxivLoading(false)
  }

  const handleArxivSearch = () => {
    if (arxivSearchTerm.trim()) {
      searchArxiv(arxivSearchTerm)
    }
  }

  const handleCategorySearch = (categoryId: string) => {
    const category = arxivCategories.find(c => c.id === categoryId)
    if (category) {
      searchArxiv('', categoryId)
    }
  }

  const handleSaveItem = async (itemId: string) => {
    if (!user) return

    setSaving(prev => ({ ...prev, [itemId]: true }))

    const isSaved = savedItems.some(item => item.research_item_id === itemId)

    if (isSaved) {
      // Unsave the item
      const { error } = await supabase
        .from('saved_research')
        .delete()
        .eq('user_id', user.id)
        .eq('research_item_id', itemId)
      
      if (!error) {
        setSavedItems(prev => prev.filter(item => item.research_item_id !== itemId))
      }
    } else {
      // Save the item
      const { error } = await supabase
        .from('saved_research')
        .insert({
          user_id: user.id,
          research_item_id: itemId
        })
      
      if (!error) {
        setSavedItems(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            user_id: user.id,
            research_item_id: itemId,
            saved_at: new Date().toISOString()
          }
        ])
      }
    }

    setSaving(prev => ({ ...prev, [itemId]: false }))
  }

  const isItemSaved = (itemId: string) => {
    return savedItems.some(item => item.research_item_id === itemId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
        <div className="text-2xl ml-4 gradient-text">Loading research content...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 star-decoration">🔬 Research Discovery Hub 📚</h1>
          <p className="text-lg text-white">Explore amazing facts and discover real scientific research!</p>
        </div>

        {/* Tab Navigation */}
        <div className="card-fun p-6 mb-8">
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <button
              className={`btn-fun ${activeTab === 'curated' ? 'btn-success' : 'btn-secondary'}`}
              onClick={() => setActiveTab('curated')}
            >
              🎯 Kid-Friendly Content
            </button>
            <button
              className={`btn-fun ${activeTab === 'arxiv' ? 'btn-success' : 'btn-secondary'}`}
              onClick={() => setActiveTab('arxiv')}
            >
              🔬 Scientific Papers (arXiv)
            </button>
          </div>

          {activeTab === 'curated' ? (
            /* Curated Content Search */
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="🔍 Search for topics..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`btn-fun ${selectedCategory === category.id ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.emoji} {category.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* arXiv Search */
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="🔍 Search scientific papers (e.g., 'quantum physics', 'machine learning')..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    value={arxivSearchTerm}
                    onChange={(e) => setArxivSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleArxivSearch()}
                  />
                </div>
                <button
                  className="btn-fun btn-success"
                  onClick={handleArxivSearch}
                  disabled={arxivLoading}
                >
                  {arxivLoading ? '🔄 Searching...' : '🔍 Search Papers'}
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-white font-semibold">Quick Categories:</span>
                {arxivCategories.map((category) => (
                  <button
                    key={category.id}
                    className="btn-fun btn-secondary text-sm"
                    onClick={() => handleCategorySearch(category.id)}
                    disabled={arxivLoading}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Display */}
        {activeTab === 'curated' ? (
          /* Curated Content Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="research-card">
                {item.image_url && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform hover:scale-110"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                    {user && (
                      <button
                        className="text-2xl hover:scale-125 transition-transform"
                        onClick={() => handleSaveItem(item.id)}
                        disabled={saving[item.id]}
                      >
                        {saving[item.id] ? (
                          <span>💾</span>
                        ) : isItemSaved(item.id) ? (
                          <span className="text-yellow-500">⭐</span>
                        ) : (
                          <span className="text-gray-400">☆</span>
                        )}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2">
                      {categories.find(c => c.id === item.category)?.emoji} {item.category}
                    </span>
                    <div className="flex">
                      {[...Array(3)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${i < item.difficulty ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  
                  <Link href={`/research/${item.id}`}>
                    <button className="btn-fun w-full">
                      🚀 Learn More
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* arXiv Papers Grid */
          <div className="space-y-6">
            {arxivLoading && (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-white text-lg">Searching scientific papers...</p>
              </div>
            )}
            
            {arxivPapers.map((paper) => (
              <div key={paper.id} className="card-fun p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{paper.title}</h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        📄 {paper.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        📅 {new Date(paper.published).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">👨‍🔬 Authors:</p>
                      <p className="text-sm text-gray-800">{paper.authors.join(', ')}</p>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{paper.summary}</p>
                  </div>
                  
                  <div className="flex flex-col gap-3 lg:w-48">
                    <a
                      href={paper.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-fun btn-secondary text-center"
                    >
                      🔗 View Abstract
                    </a>
                    {paper.pdf_url && (
                      <a
                        href={paper.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-fun btn-success text-center"
                      >
                        📄 Download PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty States */}
        {activeTab === 'curated' && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No content found</h3>
            <p className="text-gray-200">Try a different search term or category.</p>
          </div>
        )}

        {activeTab === 'arxiv' && !arxivLoading && arxivPapers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-white mb-2">Ready to explore scientific papers!</h3>
            <p className="text-gray-200">Use the search box above to find research papers from arXiv.</p>
          </div>
        )}
      </div>
    </div>
  )
}