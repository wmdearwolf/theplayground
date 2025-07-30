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

  // Sample research items for fallback
  const sampleResearchItems: Record<string, ResearchItem> = {
    '1': {
      id: '1',
      title: 'How Do Volcanoes Work?',
      description: 'Discover the amazing science behind volcanic eruptions and how they shape our planet!',
      content: `
        <h2>🌋 What Are Volcanoes?</h2>
        <p>Volcanoes are like Earth's pressure valves! Deep underground, hot melted rock called <strong>magma</strong> builds up pressure. When this pressure gets too strong, the magma bursts through the Earth's surface in an amazing display called a volcanic eruption!</p>
        
        <h3>🔥 How Do Volcanoes Form?</h3>
        <p>Volcanoes form when:</p>
        <ul>
          <li>Hot magma rises from deep inside the Earth</li>
          <li>The magma finds weak spots in the Earth's crust</li>
          <li>Pressure builds up until the magma breaks through</li>
          <li>The erupted material cools and hardens, building up the volcano over time</li>
        </ul>
        
        <h3>🌍 Types of Volcanoes</h3>
        <p><strong>Shield Volcanoes:</strong> Wide and gentle, like Hawaiian volcanoes</p>
        <p><strong>Stratovolcanoes:</strong> Tall and cone-shaped, like Mount Fuji</p>
        <p><strong>Cinder Cones:</strong> Small and steep, formed from volcanic debris</p>
        
        <h3>🔬 Fun Volcano Facts</h3>
        <ul>
          <li>There are about 1,500 active volcanoes in the world</li>
          <li>The "Ring of Fire" around the Pacific Ocean has the most volcanoes</li>
          <li>Volcanic soil is very fertile and great for growing plants</li>
          <li>Some volcanoes create new islands, like Hawaii!</li>
        </ul>
      `,
      category: 'science',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      created_at: '2024-01-15T00:00:00Z'
    },
    '2': {
      id: '2',
      title: 'The Amazing World of Dinosaurs',
      description: 'Journey back in time to learn about the incredible creatures that ruled the Earth millions of years ago!',
      content: `
        <h2>🦕 Welcome to the Age of Dinosaurs!</h2>
        <p>Dinosaurs lived on Earth for over 160 million years! They came in all shapes and sizes, from tiny bird-like creatures to massive giants that were longer than school buses.</p>
        
        <h3>🦖 Types of Dinosaurs</h3>
        <p><strong>Carnivores (Meat-eaters):</strong></p>
        <ul>
          <li><strong>Tyrannosaurus Rex:</strong> The famous "king of dinosaurs" with huge teeth</li>
          <li><strong>Velociraptor:</strong> Smart, fast hunters that worked in packs</li>
          <li><strong>Allosaurus:</strong> A fierce predator with sharp claws</li>
        </ul>
        
        <p><strong>Herbivores (Plant-eaters):</strong></p>
        <ul>
          <li><strong>Triceratops:</strong> Had three horns and a big frill for protection</li>
          <li><strong>Brontosaurus:</strong> Long-necked giants that ate leaves from tall trees</li>
          <li><strong>Stegosaurus:</strong> Had spiky plates on its back for defense</li>
        </ul>
        
        <h3>🔍 How Do We Know About Dinosaurs?</h3>
        <p>Scientists called <strong>paleontologists</strong> study dinosaur fossils - these are remains of dinosaurs that turned to stone over millions of years. From fossils, we can learn:</p>
        <ul>
          <li>What dinosaurs looked like</li>
          <li>What they ate</li>
          <li>How they moved</li>
          <li>How big they were</li>
        </ul>
        
        <h3>🌟 Amazing Dinosaur Facts</h3>
        <ul>
          <li>Birds are actually living dinosaurs!</li>
          <li>Some dinosaurs had feathers</li>
          <li>The smallest dinosaur was only the size of a chicken</li>
          <li>Dinosaurs lived on every continent, even Antarctica</li>
        </ul>
      `,
      category: 'history',
      difficulty: 1,
      image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      created_at: '2024-01-14T00:00:00Z'
    },
    '3': {
      id: '3',
      title: 'Space Exploration Adventures',
      description: 'Blast off into space and learn about rockets, astronauts, and distant planets!',
      content: `
        <h2>🚀 Journey to the Stars!</h2>
        <p>Space is the ultimate frontier! Humans have been exploring space for over 60 years, and we've made incredible discoveries about our universe.</p>
        
        <h3>👨‍🚀 Famous Space Missions</h3>
        <p><strong>Apollo 11 (1969):</strong> First humans to land on the Moon! Neil Armstrong and Buzz Aldrin walked on the lunar surface.</p>
        <p><strong>International Space Station (ISS):</strong> A floating laboratory where astronauts live and work in space.</p>
        <p><strong>Mars Rovers:</strong> Robot explorers that drive around Mars, taking pictures and studying rocks.</p>
        
        <h3>🌌 What's in Space?</h3>
        <ul>
          <li><strong>Planets:</strong> Eight planets orbit our Sun, including Earth</li>
          <li><strong>Stars:</strong> Huge balls of burning gas that create light and heat</li>
          <li><strong>Galaxies:</strong> Collections of billions of stars - we live in the Milky Way</li>
          <li><strong>Black Holes:</strong> Mysterious objects with gravity so strong that nothing can escape</li>
        </ul>
        
        <h3>🛸 How Do Rockets Work?</h3>
        <p>Rockets work by pushing hot gases out of their engines very fast. This creates a force that pushes the rocket in the opposite direction - just like when you let go of a balloon!</p>
        
        <h3>⭐ Cool Space Facts</h3>
        <ul>
          <li>Space is completely silent because there's no air to carry sound</li>
          <li>A day on Venus is longer than its year!</li>
          <li>There are more stars in the universe than grains of sand on all Earth's beaches</li>
          <li>Astronauts can grow up to 2 inches taller in space</li>
        </ul>
      `,
      category: 'space',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400',
      created_at: '2024-01-13T00:00:00Z'
    },
    '4': {
      id: '4',
      title: 'Ocean Mysteries and Marine Life',
      description: 'Dive deep into the ocean to discover amazing sea creatures and underwater wonders!',
      content: `
        <h2>🌊 Dive into the Deep Blue!</h2>
        <p>The ocean covers more than 70% of Earth's surface and is home to incredible creatures. From tiny plankton to massive whales, the ocean is full of life!</p>
        
        <h3>🐠 Ocean Zones</h3>
        <p><strong>Sunlight Zone (0-200m):</strong> Where most sea life lives, including colorful fish and coral reefs</p>
        <p><strong>Twilight Zone (200-1000m):</strong> Dim light, home to jellyfish and squid</p>
        <p><strong>Midnight Zone (1000-4000m):</strong> Completely dark, creatures make their own light</p>
        <p><strong>Abyssal Zone (4000m+):</strong> The deepest, coldest part with strange creatures</p>
        
        <h3>🦈 Amazing Ocean Animals</h3>
        <ul>
          <li><strong>Blue Whale:</strong> The largest animal ever - bigger than any dinosaur!</li>
          <li><strong>Octopus:</strong> Super smart with eight arms and can change colors</li>
          <li><strong>Seahorse:</strong> The only fish where the dad has the babies</li>
          <li><strong>Anglerfish:</strong> Uses a glowing lure to catch prey in the dark depths</li>
        </ul>
        
        <h3>🏝️ Coral Reefs - Ocean Cities</h3>
        <p>Coral reefs are like underwater cities! They're built by tiny animals called coral polyps and provide homes for 25% of all ocean species.</p>
        
        <h3>🌊 Ocean Facts That Will Amaze You</h3>
        <ul>
          <li>We've explored less than 5% of our oceans</li>
          <li>The ocean produces over 50% of the oxygen we breathe</li>
          <li>The deepest part of the ocean is deeper than Mount Everest is tall</li>
          <li>Ocean currents help control Earth's climate</li>
        </ul>
      `,
      category: 'animals',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      created_at: '2024-01-12T00:00:00Z'
    },
    '5': {
      id: '5',
      title: 'Weather Patterns and Climate',
      description: 'Learn how weather forms and why different places have different climates!',
      content: `
        <h2>🌤️ Understanding Weather and Climate</h2>
        <p>Weather is what happens in the atmosphere every day. Climate is the average weather over many years. Let's explore how both work!</p>
        
        <h3>☁️ How Weather Forms</h3>
        <p>Weather happens because:</p>
        <ul>
          <li>The Sun heats Earth unevenly</li>
          <li>Warm air rises and cool air sinks</li>
          <li>Water evaporates and forms clouds</li>
          <li>Air pressure differences create wind</li>
        </ul>
        
        <h3>🌍 Climate Zones</h3>
        <p><strong>Tropical:</strong> Hot and humid all year (like rainforests)</p>
        <p><strong>Desert:</strong> Very dry with hot days and cool nights</p>
        <p><strong>Temperate:</strong> Four seasons with moderate temperatures</p>
        <p><strong>Polar:</strong> Very cold with ice and snow</p>
        
        <h3>⛈️ Types of Weather</h3>
        <ul>
          <li><strong>Thunderstorms:</strong> Form when warm, moist air rises quickly</li>
          <li><strong>Hurricanes:</strong> Massive spinning storms over warm ocean water</li>
          <li><strong>Tornadoes:</strong> Spinning columns of air that touch the ground</li>
          <li><strong>Blizzards:</strong> Heavy snowstorms with strong winds</li>
        </ul>
        
        <h3>🌡️ Weather Instruments</h3>
        <ul>
          <li><strong>Thermometer:</strong> Measures temperature</li>
          <li><strong>Barometer:</strong> Measures air pressure</li>
          <li><strong>Anemometer:</strong> Measures wind speed</li>
          <li><strong>Rain Gauge:</strong> Measures rainfall</li>
        </ul>
        
        <h3>🌈 Fun Weather Facts</h3>
        <ul>
          <li>Lightning is five times hotter than the Sun's surface</li>
          <li>No two snowflakes are exactly alike</li>
          <li>A rainbow always appears opposite the Sun</li>
          <li>The fastest wind speed recorded was 231 mph!</li>
        </ul>
      `,
      category: 'geography',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400',
      created_at: '2024-01-11T00:00:00Z'
    },
    '6': {
      id: '6',
      title: 'The Human Body Systems',
      description: 'Explore how your amazing body works, from your beating heart to your thinking brain!',
      content: `
        <h2>🫀 Your Amazing Body Machine</h2>
        <p>Your body is like an incredible machine with many different systems working together to keep you alive and healthy!</p>
        
        <h3>💓 Circulatory System</h3>
        <p>Your heart pumps blood through your body 24/7! Blood carries oxygen and nutrients to every cell.</p>
        <ul>
          <li>Your heart beats about 100,000 times per day</li>
          <li>You have about 5 liters of blood in your body</li>
          <li>Blood travels through 60,000 miles of blood vessels</li>
        </ul>
        
        <h3>🫁 Respiratory System</h3>
        <p>You breathe about 20,000 times per day! Your lungs take in oxygen and remove carbon dioxide.</p>
        <ul>
          <li>Your lungs contain about 300 million tiny air sacs</li>
          <li>You can hold your breath for about 1-2 minutes</li>
          <li>Your diaphragm muscle helps you breathe</li>
        </ul>
        
        <h3>🧠 Nervous System</h3>
        <p>Your brain is the control center! It processes information and controls everything your body does.</p>
        <ul>
          <li>Your brain has about 86 billion nerve cells</li>
          <li>Nerve signals travel at 120 meters per second</li>
          <li>Your brain uses 20% of your body's energy</li>
        </ul>
        
        <h3>🦴 Skeletal System</h3>
        <p>Your 206 bones give your body structure and protect your organs.</p>
        <ul>
          <li>Bones are stronger than steel but lighter than aluminum</li>
          <li>Your bones are constantly rebuilding themselves</li>
          <li>The smallest bone is in your ear</li>
        </ul>
        
        <h3>💪 Muscular System</h3>
        <p>You have over 600 muscles that help you move and stay upright!</p>
        <ul>
          <li>Your strongest muscle is your jaw muscle</li>
          <li>Your heart is your hardest-working muscle</li>
          <li>Muscles make up about 40% of your body weight</li>
        </ul>
        
        <h3>🌟 Body Facts That Will Blow Your Mind</h3>
        <ul>
          <li>You shed about 30,000 dead skin cells every minute</li>
          <li>Your stomach gets a new lining every 3-4 days</li>
          <li>You produce about 1.5 liters of saliva per day</li>
          <li>Your eyes can distinguish about 10 million colors</li>
        </ul>
      `,
      category: 'science',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
      created_at: '2024-01-10T00:00:00Z'
    }
  }

  useEffect(() => {
    const fetchResearchData = async () => {
      if (!researchId) return

      try {
        // Try to fetch from database first
        const { data: itemData } = await supabase
          .from('research_items')
          .select('*')
          .eq('id', researchId)
          .single()
        
        if (itemData) {
          setResearchItem(itemData as ResearchItem)
        } else {
          // Fallback to sample data
          const sampleItem = sampleResearchItems[researchId]
          if (sampleItem) {
            setResearchItem(sampleItem)
          }
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
      } catch (error) {
        console.error('Error fetching research data:', error)
        // Fallback to sample data on error
        const sampleItem = sampleResearchItems[researchId]
        if (sampleItem) {
          setResearchItem(sampleItem)
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
        <div className="loading-spinner"></div>
        <div className="text-2xl ml-4 text-white">Loading research content...</div>
      </div>
    )
  }

  if (!researchItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-fun p-8 text-center max-w-md">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Research not found</h1>
          <p className="text-gray-600 mb-6">This research article doesn't exist or has been removed.</p>
          <button className="btn-fun btn-secondary" onClick={() => router.push('/research')}>
            🔙 Back to Research
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            className="btn-fun btn-secondary"
            onClick={() => router.push('/research')}
          >
            ⬅️ Back to Research
          </button>
        </div>

        <article className="card-fun overflow-hidden">
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
                      <span
                        key={i}
                        className={`text-lg ${i < researchItem.difficulty ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{researchItem.title}</h1>
                <p className="text-lg text-gray-600 mb-6">{researchItem.description}</p>
              </div>
              
              {user && (
                <button
                  className={`btn-fun ${isItemSaved() ? 'btn-success' : 'btn-secondary'} ml-4`}
                  onClick={handleSaveItem}
                  disabled={saving}
                >
                  {saving ? (
                    <span>💾 Saving...</span>
                  ) : isItemSaved() ? (
                    <span>⭐ Saved</span>
                  ) : (
                    <span>☆ Save</span>
                  )}
                </button>
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
          <div className="card-fun p-6 text-center mt-8">
            <div className="text-4xl mb-4">🌟</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Want to save this article?</h3>
            <p className="text-gray-600 mb-4">Create an account to save your favorite research items and track your learning progress!</p>
            <button className="btn-fun btn-success" onClick={() => router.push('/auth')}>
              🚀 Sign Up Now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}