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
      saved: false
    },
    {
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
      saved: false
    },
    {
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
      saved: false
    },
    {
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
      saved: false
    },
    {
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
      saved: false
    },
    {
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
      saved: false
    },
    {
      id: '7',
      title: 'Introduction to Robotics',
      description: 'Discover how robots work and learn about the amazing machines that help us every day!',
      content: `
        <h2>🤖 What Are Robots?</h2>
        <p>Robots are amazing machines that can move, think, and help people! They're like super-smart helpers that can do tasks automatically without getting tired.</p>
        
        <h3>🔧 Parts of a Robot</h3>
        <ul>
          <li><strong>Sensors:</strong> Like eyes and ears - help robots see and hear</li>
          <li><strong>Actuators:</strong> Like muscles - help robots move</li>
          <li><strong>Controller:</strong> Like a brain - tells the robot what to do</li>
          <li><strong>Power Source:</strong> Like food - gives robots energy to work</li>
        </ul>
        
        <h3>🏭 Types of Robots</h3>
        <p><strong>Industrial Robots:</strong> Work in factories building cars and electronics</p>
        <p><strong>Service Robots:</strong> Help people at home, like vacuum cleaners</p>
        <p><strong>Medical Robots:</strong> Help doctors perform surgeries</p>
        <p><strong>Exploration Robots:</strong> Explore dangerous places like Mars</p>
        
        <h3>🌟 Cool Robot Facts</h3>
        <ul>
          <li>The first robot was built in 1954</li>
          <li>Some robots can walk, swim, and even fly</li>
          <li>Robots help build the cars we drive</li>
          <li>There are robots exploring Mars right now!</li>
        </ul>
      `,
      category: 'robotics',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
      saved: false
    },
    {
      id: '8',
      title: 'Artificial Intelligence for Kids',
      description: 'Learn about AI and how computers can be taught to think and learn like humans!',
      content: `
        <h2>🧠 What is Artificial Intelligence?</h2>
        <p>Artificial Intelligence (AI) is when we teach computers to think and learn like humans! It's like giving computers a brain so they can solve problems and make decisions.</p>
        
        <h3>🎯 How AI Works</h3>
        <ul>
          <li><strong>Learning:</strong> AI looks at lots of examples to learn patterns</li>
          <li><strong>Thinking:</strong> AI uses what it learned to solve new problems</li>
          <li><strong>Improving:</strong> AI gets better with more practice</li>
        </ul>
        
        <h3>📱 AI in Your Daily Life</h3>
        <ul>
          <li><strong>Voice Assistants:</strong> Siri, Alexa, and Google Assistant</li>
          <li><strong>Recommendations:</strong> YouTube suggests videos you might like</li>
          <li><strong>Games:</strong> Computer opponents that learn how you play</li>
          <li><strong>Photos:</strong> Apps that recognize faces in pictures</li>
        </ul>
        
        <h3>🚀 Types of AI</h3>
        <p><strong>Machine Learning:</strong> Computers learn from examples</p>
        <p><strong>Computer Vision:</strong> Computers can "see" and understand images</p>
        <p><strong>Natural Language:</strong> Computers understand human language</p>
        
        <h3>🌟 Amazing AI Facts</h3>
        <ul>
          <li>AI can beat humans at chess and video games</li>
          <li>AI helps doctors find diseases early</li>
          <li>AI can create art and music</li>
          <li>AI helps cars drive themselves</li>
        </ul>
      `,
      category: 'technology',
      difficulty: 3,
      image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
      saved: false
    },
    {
      id: '9',
      title: 'Cybersecurity: Staying Safe Online',
      description: 'Learn how to protect yourself and your information when using computers and the internet!',
      content: `
        <h2>🔒 What is Cybersecurity?</h2>
        <p>Cybersecurity is like having a digital bodyguard! It protects your computer, phone, and personal information from bad people who try to steal or damage them.</p>
        
        <h3>🛡️ Why Do We Need Cybersecurity?</h3>
        <ul>
          <li>Protect personal information like photos and messages</li>
          <li>Keep bank accounts and money safe</li>
          <li>Stop viruses from breaking computers</li>
          <li>Prevent identity theft</li>
        </ul>
        
        <h3>🔐 How to Stay Safe Online</h3>
        <ul>
          <li><strong>Strong Passwords:</strong> Use long passwords with letters, numbers, and symbols</li>
          <li><strong>Don't Share Personal Info:</strong> Never give strangers your address or phone number</li>
          <li><strong>Be Careful with Links:</strong> Don't click suspicious links in emails</li>
          <li><strong>Update Software:</strong> Keep your apps and computer updated</li>
        </ul>
        
        <h3>🦹‍♂️ Cybersecurity Heroes</h3>
        <p><strong>Ethical Hackers:</strong> Good hackers who find security problems to fix them</p>
        <p><strong>Security Analysts:</strong> People who watch for cyber attacks</p>
        <p><strong>Cryptographers:</strong> Create secret codes to protect information</p>
        
        <h3>🌟 Fun Security Facts</h3>
        <ul>
          <li>The first computer virus was created in 1971</li>
          <li>Hackers can be good guys who help protect us</li>
          <li>Two-factor authentication is like having two locks on your door</li>
          <li>Cybersecurity experts are like digital detectives</li>
        </ul>
      `,
      category: 'cybersecurity',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
      saved: false
    },
    {
      id: '10',
      title: 'Computer Programming Basics',
      description: 'Discover how to talk to computers using code and create your own programs!',
      content: `
        <h2>💻 What is Programming?</h2>
        <p>Programming is like writing instructions for computers! Just like you follow a recipe to bake cookies, computers follow code to do tasks.</p>
        
        <h3>🗣️ Programming Languages</h3>
        <ul>
          <li><strong>Scratch:</strong> Perfect for beginners - uses colorful blocks</li>
          <li><strong>Python:</strong> Easy to read and great for learning</li>
          <li><strong>JavaScript:</strong> Makes websites interactive</li>
          <li><strong>Java:</strong> Used to build apps and games</li>
        </ul>
        
        <h3>🧩 Basic Programming Concepts</h3>
        <ul>
          <li><strong>Variables:</strong> Boxes that store information</li>
          <li><strong>Loops:</strong> Repeat actions multiple times</li>
          <li><strong>Conditions:</strong> Make decisions (if this, then that)</li>
          <li><strong>Functions:</strong> Reusable pieces of code</li>
        </ul>
        
        <h3>🎮 What Can You Build?</h3>
        <ul>
          <li>Video games and mobile apps</li>
          <li>Websites and online stores</li>
          <li>Robot controllers</li>
          <li>Art and music programs</li>
        </ul>
        
        <h3>🌟 Programming Fun Facts</h3>
        <ul>
          <li>The first programmer was Ada Lovelace in 1843</li>
          <li>There are over 700 programming languages</li>
          <li>Programming helps you think logically</li>
          <li>Many successful companies started with just code</li>
        </ul>
      `,
      category: 'technology',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
      saved: false
    },
    {
      id: '11',
      title: 'The Physics of Motion',
      description: 'Explore how things move and discover the forces that make everything go!',
      content: `
        <h2>⚛️ What is Motion?</h2>
        <p>Motion is everywhere! From a ball rolling down a hill to planets orbiting the sun, everything in the universe is moving in some way.</p>
        
        <h3>🏃‍♂️ Types of Motion</h3>
        <ul>
          <li><strong>Linear Motion:</strong> Moving in a straight line (like a car on a highway)</li>
          <li><strong>Rotational Motion:</strong> Spinning around (like a wheel)</li>
          <li><strong>Oscillatory Motion:</strong> Back and forth (like a swing)</li>
          <li><strong>Random Motion:</strong> Unpredictable (like gas molecules)</li>
        </ul>
        
        <h3>💪 Forces That Cause Motion</h3>
        <ul>
          <li><strong>Gravity:</strong> Pulls everything toward Earth</li>
          <li><strong>Friction:</strong> Slows things down when they rub together</li>
          <li><strong>Magnetism:</strong> Invisible force between magnets</li>
          <li><strong>Push and Pull:</strong> Forces you apply with your hands</li>
        </ul>
        
        <h3>🎯 Newton's Laws (Simplified)</h3>
        <p><strong>First Law:</strong> Things at rest stay at rest, things moving keep moving</p>
        <p><strong>Second Law:</strong> Heavier things need more force to move</p>
        <p><strong>Third Law:</strong> For every action, there's an equal and opposite reaction</p>
        
        <h3>🌟 Cool Motion Facts</h3>
        <ul>
          <li>You're moving 67,000 mph through space right now!</li>
          <li>A cheetah can run 70 mph</li>
          <li>Sound travels at 767 mph</li>
          <li>Light travels at 186,000 miles per second</li>
        </ul>
      `,
      category: 'physics',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
      saved: false
    },
    {
      id: '12',
      title: 'Energy and Power',
      description: 'Learn about different types of energy and how they power our world!',
      content: `
        <h2>⚡ What is Energy?</h2>
        <p>Energy is the ability to do work or cause change. It's what makes everything happen - from your heartbeat to lightning strikes!</p>
        
        <h3>🔋 Types of Energy</h3>
        <ul>
          <li><strong>Kinetic Energy:</strong> Energy of motion (moving car, flowing river)</li>
          <li><strong>Potential Energy:</strong> Stored energy (water behind a dam, stretched rubber band)</li>
          <li><strong>Chemical Energy:</strong> Energy in food, batteries, and fuel</li>
          <li><strong>Electrical Energy:</strong> Energy that powers our devices</li>
          <li><strong>Solar Energy:</strong> Energy from the sun</li>
          <li><strong>Nuclear Energy:</strong> Energy from atoms</li>
        </ul>
        
        <h3>🔄 Energy Transformation</h3>
        <p>Energy can change from one type to another:</p>
        <ul>
          <li>Food (chemical) → Movement (kinetic)</li>
          <li>Wind (kinetic) → Electricity (electrical)</li>
          <li>Sunlight (solar) → Plant growth (chemical)</li>
          <li>Battery (chemical) → Phone operation (electrical)</li>
        </ul>
        
        <h3>🌱 Renewable vs Non-Renewable</h3>
        <p><strong>Renewable:</strong> Solar, wind, water - never run out</p>
        <p><strong>Non-Renewable:</strong> Coal, oil, gas - limited supply</p>
        
        <h3>🌟 Amazing Energy Facts</h3>
        <ul>
          <li>The sun produces more energy in one second than humans have used in all of history</li>
          <li>Your body is like a 100-watt light bulb</li>
          <li>Lightning contains 5 billion joules of energy</li>
          <li>A single uranium pellet has as much energy as a ton of coal</li>
        </ul>
      `,
      category: 'physics',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400',
      saved: false
    },
    {
      id: '13',
      title: 'Black Holes: Cosmic Mysteries',
      description: 'Journey into the most mysterious objects in space - black holes!',
      content: `
        <h2>🕳️ What Are Black Holes?</h2>
        <p>Black holes are the most mysterious objects in space! They're regions where gravity is so strong that nothing - not even light - can escape once it gets too close.</p>
        
        <h3>🌟 How Black Holes Form</h3>
        <ul>
          <li>When massive stars (much bigger than our sun) die</li>
          <li>The star collapses in on itself</li>
          <li>All the star's mass gets squeezed into a tiny point</li>
          <li>This creates incredibly strong gravity</li>
        </ul>
        
        <h3>🔍 Parts of a Black Hole</h3>
        <ul>
          <li><strong>Singularity:</strong> The center point with infinite density</li>
          <li><strong>Event Horizon:</strong> The "point of no return" boundary</li>
          <li><strong>Accretion Disk:</strong> Swirling matter around the black hole</li>
          <li><strong>Jets:</strong> High-energy beams shooting from the poles</li>
        </ul>
        
        <h3>🔬 How We Study Black Holes</h3>
        <ul>
          <li>Watch how they affect nearby stars</li>
          <li>Observe X-rays from matter falling in</li>
          <li>Use special telescopes to "see" them</li>
          <li>Detect gravitational waves they create</li>
        </ul>
        
        <h3>🌟 Mind-Blowing Black Hole Facts</h3>
        <ul>
          <li>Time slows down near black holes</li>
          <li>The closest black hole is 1,000 light-years away</li>
          <li>Some black holes are billions of times heavier than our sun</li>
          <li>We took the first picture of a black hole in 2019</li>
        </ul>
      `,
      category: 'space',
      difficulty: 3,
      image_url: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400',
      saved: false
    },
    {
      id: '14',
      title: 'The Internet: How It Works',
      description: 'Discover how the internet connects the whole world and lets us share information instantly!',
      content: `
        <h2>🌐 What is the Internet?</h2>
        <p>The internet is like a giant invisible highway that connects computers all around the world! It lets people share information, talk to each other, and access websites instantly.</p>
        
        <h3>🔗 How the Internet Works</h3>
        <ul>
          <li><strong>Servers:</strong> Special computers that store websites and data</li>
          <li><strong>Routers:</strong> Traffic directors that send data to the right place</li>
          <li><strong>Cables:</strong> Underground and underwater cables that carry information</li>
          <li><strong>Protocols:</strong> Rules that help computers talk to each other</li>
        </ul>
        
        <h3>📡 How Data Travels</h3>
        <ol>
          <li>You type a website address</li>
          <li>Your computer sends a request</li>
          <li>The request travels through many routers</li>
          <li>It reaches the server with the website</li>
          <li>The server sends the website back to you</li>
          <li>All this happens in milliseconds!</li>
        </ol>
        
        <h3>🌍 Internet Around the World</h3>
        <ul>
          <li>Fiber optic cables under the ocean connect continents</li>
          <li>Satellites help reach remote areas</li>
          <li>Cell towers provide mobile internet</li>
          <li>Wi-Fi connects devices wirelessly</li>
        </ul>
        
        <h3>🌟 Amazing Internet Facts</h3>
        <ul>
          <li>Over 5 billion people use the internet</li>
          <li>Google processes 8.5 billion searches per day</li>
          <li>The first website was created in 1991</li>
          <li>Internet data travels at nearly the speed of light</li>
        </ul>
      `,
      category: 'technology',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
      saved: false
    },
    {
      id: '15',
      title: 'Quantum Physics for Young Minds',
      description: 'Explore the weird and wonderful world of quantum physics - where particles can be in two places at once!',
      content: `
        <h2>🔬 What is Quantum Physics?</h2>
        <p>Quantum physics is the study of the tiniest things in the universe - smaller than atoms! At this tiny scale, things behave in very strange and magical ways.</p>
        
        <h3>🎭 Quantum Weirdness</h3>
        <ul>
          <li><strong>Superposition:</strong> Particles can be in multiple places at once</li>
          <li><strong>Entanglement:</strong> Particles can be mysteriously connected</li>
          <li><strong>Uncertainty:</strong> You can't know everything about a particle</li>
          <li><strong>Wave-Particle Duality:</strong> Things can be both waves and particles</li>
        </ul>
        
        <h3>🐱 Schrödinger's Cat</h3>
        <p>A famous thought experiment: A cat in a box can be both alive and dead at the same time until you look! This shows how quantum particles behave differently when observed.</p>
        
        <h3>💻 Quantum Technology</h3>
        <ul>
          <li><strong>Quantum Computers:</strong> Super powerful computers using quantum effects</li>
          <li><strong>Quantum Cryptography:</strong> Unbreakable secret codes</li>
          <li><strong>Quantum Sensors:</strong> Incredibly precise measuring devices</li>
          <li><strong>Quantum Internet:</strong> Ultra-secure communication networks</li>
        </ul>
        
        <h3>🌟 Mind-Bending Quantum Facts</h3>
        <ul>
          <li>Quantum tunneling lets particles pass through walls</li>
          <li>Quantum computers could solve problems in minutes that take regular computers thousands of years</li>
          <li>Quantum effects happen in your body every day</li>
          <li>The quantum world is the foundation of all reality</li>
        </ul>
      `,
      category: 'physics',
      difficulty: 3,
      image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
      saved: false
    },
    {
      id: '16',
      title: 'Machine Learning Explained',
      description: 'Learn how computers can learn and get smarter without being explicitly programmed!',
      content: `
        <h2>🧠 What is Machine Learning?</h2>
        <p>Machine Learning is a way to teach computers to learn patterns and make decisions, just like how you learn to recognize faces or ride a bike!</p>
        
        <h3>📚 Types of Machine Learning</h3>
        <ul>
          <li><strong>Supervised Learning:</strong> Learning with a teacher (showing examples with answers)</li>
          <li><strong>Unsupervised Learning:</strong> Finding patterns without a teacher</li>
          <li><strong>Reinforcement Learning:</strong> Learning through trial and error</li>
        </ul>
        
        <h3>🎯 How Machines Learn</h3>
        <ol>
          <li><strong>Data Collection:</strong> Gather lots of examples</li>
          <li><strong>Training:</strong> Show the computer patterns in the data</li>
          <li><strong>Testing:</strong> See how well it learned</li>
          <li><strong>Prediction:</strong> Use what it learned on new data</li>
        </ol>
        
        <h3>🌟 Machine Learning in Action</h3>
        <ul>
          <li><strong>Image Recognition:</strong> Identifying objects in photos</li>
          <li><strong>Language Translation:</strong> Converting text between languages</li>
          <li><strong>Recommendation Systems:</strong> Suggesting movies or music you might like</li>
          <li><strong>Medical Diagnosis:</strong> Helping doctors find diseases</li>
        </ul>
        
        <h3>🚀 Cool ML Facts</h3>
        <ul>
          <li>ML can create art, music, and even write stories</li>
          <li>Self-driving cars use ML to navigate</li>
          <li>ML helps predict weather and natural disasters</li>
          <li>Your phone's camera uses ML to take better photos</li>
        </ul>
      `,
      category: 'technology',
      difficulty: 3,
      image_url: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400',
      saved: false
    },
    {
      id: '17',
      title: 'Drones and Flying Robots',
      description: 'Discover how drones work and explore their amazing uses in our modern world!',
      content: `
        <h2>🚁 What Are Drones?</h2>
        <p>Drones are flying robots that can be controlled remotely or fly on their own! They're like having a bird that follows your commands and can go places humans can't easily reach.</p>
        
        <h3>✈️ How Drones Fly</h3>
        <ul>
          <li><strong>Propellers:</strong> Spinning blades that create lift</li>
          <li><strong>Motors:</strong> Power the propellers</li>
          <li><strong>Gyroscopes:</strong> Keep the drone balanced</li>
          <li><strong>GPS:</strong> Helps the drone know where it is</li>
          <li><strong>Cameras:</strong> Let pilots see what the drone sees</li>
        </ul>
        
        <h3>🎯 Amazing Uses for Drones</h3>
        <ul>
          <li><strong>Photography:</strong> Taking stunning aerial photos and videos</li>
          <li><strong>Delivery:</strong> Bringing packages to your door</li>
          <li><strong>Search and Rescue:</strong> Finding lost people</li>
          <li><strong>Farming:</strong> Monitoring crops and spraying pesticides</li>
          <li><strong>Weather:</strong> Flying into storms to collect data</li>
          <li><strong>Conservation:</strong> Tracking wildlife and protecting forests</li>
        </ul>
        
        <h3>🤖 Types of Drones</h3>
        <ul>
          <li><strong>Quadcopters:</strong> Four propellers, most common type</li>
          <li><strong>Fixed-wing:</strong> Like airplanes, fly longer distances</li>
          <li><strong>Racing Drones:</strong> Super fast for competitions</li>
          <li><strong>Military Drones:</strong> Used for defense and surveillance</li>
        </ul>
        
        <h3>🌟 Drone Fun Facts</h3>
        <ul>
          <li>The fastest drone can fly over 160 mph</li>
          <li>Some drones can stay in the air for over 24 hours</li>
          <li>Drones are helping plant millions of trees</li>
          <li>NASA uses drones to explore other planets</li>
        </ul>
      `,
      category: 'robotics',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400',
      saved: false
    },
    {
      id: '18',
      title: 'Virtual Reality Adventures',
      description: 'Step into amazing virtual worlds and discover how VR technology creates immersive experiences!',
      content: `
        <h2>🥽 What is Virtual Reality?</h2>
        <p>Virtual Reality (VR) is like having a magic window that can transport you to any world imaginable! You can climb mountains, swim with dolphins, or even visit other planets - all from your room.</p>
        
        <h3>🔧 How VR Works</h3>
        <ul>
          <li><strong>VR Headset:</strong> Special goggles with screens for each eye</li>
          <li><strong>Motion Tracking:</strong> Sensors that follow your head and body movements</li>
          <li><strong>3D Graphics:</strong> Computer-generated worlds that look real</li>
          <li><strong>Spatial Audio:</strong> Sound that comes from different directions</li>
        </ul>
        
        <h3>🎮 Amazing VR Experiences</h3>
        <ul>
          <li><strong>Gaming:</strong> Play inside video games as if you're really there</li>
          <li><strong>Education:</strong> Walk through ancient Rome or inside the human body</li>
          <li><strong>Travel:</strong> Visit famous landmarks without leaving home</li>
          <li><strong>Training:</strong> Practice dangerous jobs safely</li>
          <li><strong>Art:</strong> Create 3D sculptures in mid-air</li>
        </ul>
        
        <h3>🌍 VR vs AR vs MR</h3>
        <ul>
          <li><strong>VR:</strong> Completely virtual world</li>
          <li><strong>AR:</strong> Digital objects in the real world</li>
          <li><strong>MR:</strong> Mix of real and virtual that interact</li>
        </ul>
        
        <h3>🚀 The Future of VR</h3>
        <ul>
          <li>Haptic suits that let you feel virtual objects</li>
          <li>Brain-computer interfaces for direct control</li>
          <li>Virtual schools and workplaces</li>
          <li>Shared virtual worlds with friends</li>
        </ul>
        
        <h3>🌟 VR Fun Facts</h3>
        <ul>
          <li>The first VR headset was created in 1968</li>
          <li>VR is helping treat phobias and PTSD</li>
          <li>Surgeons practice operations in VR</li>
          <li>You can attend concerts in VR with people worldwide</li>
        </ul>
      `,
      category: 'technology',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=400',
      saved: false
    },
    {
      id: '19',
      title: 'Renewable Energy Revolution',
      description: 'Explore clean energy sources that can power our world without harming the environment!',
      content: `
        <h2>🌱 What is Renewable Energy?</h2>
        <p>Renewable energy comes from natural sources that never run out! Unlike fossil fuels, these energy sources are clean, sustainable, and help protect our planet.</p>
        
        <h3>☀️ Types of Renewable Energy</h3>
        <ul>
          <li><strong>Solar Power:</strong> Energy from sunlight using solar panels</li>
          <li><strong>Wind Power:</strong> Energy from moving air using wind turbines</li>
          <li><strong>Hydroelectric:</strong> Energy from flowing water</li>
          <li><strong>Geothermal:</strong> Energy from Earth's heat</li>
          <li><strong>Biomass:</strong> Energy from organic materials</li>
          <li><strong>Tidal:</strong> Energy from ocean tides</li>
        </ul>
        
        <h3>🔋 How Solar Panels Work</h3>
        <ol>
          <li>Sunlight hits the solar panel</li>
          <li>Photovoltaic cells convert light to electricity</li>
          <li>An inverter changes DC to AC power</li>
          <li>Electricity powers your home</li>
          <li>Extra power can be stored in batteries</li>
        </ol>
        
        <h3>💨 Wind Power Magic</h3>
        <ul>
          <li>Wind turns massive turbine blades</li>
          <li>Blades spin a generator inside the turbine</li>
          <li>Generator creates electricity</li>
          <li>Power travels through cables to homes</li>
        </ul>
        
        <h3>🌍 Benefits of Renewable Energy</h3>
        <ul>
          <li>Reduces pollution and greenhouse gases</li>
          <li>Creates jobs in green technology</li>
          <li>Saves money on energy bills</li>
          <li>Provides energy independence</li>
          <li>Protects the environment for future generations</li>
        </ul>
        
        <h3>🌟 Renewable Energy Facts</h3>
        <ul>
          <li>Solar energy could power the entire world</li>
          <li>Wind is the fastest-growing energy source</li>
          <li>Iceland gets 100% of its electricity from renewable sources</li>
          <li>One wind turbine can power 1,400 homes</li>
        </ul>
      `,
      category: 'science',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400',
      saved: false
    },
    {
      id: '20',
      title: 'Nanotechnology: The Tiny Revolution',
      description: 'Discover the incredible world of nanotechnology where scientists work with materials smaller than you can imagine!',
      content: `
        <h2>🔬 What is Nanotechnology?</h2>
        <p>Nanotechnology is the science of working with incredibly tiny things - so small that you'd need a super powerful microscope to see them! We're talking about things that are thousands of times smaller than the width of a human hair.</p>
        
        <h3>📏 How Small is Nano?</h3>
        <ul>
          <li>A nanometer is one billionth of a meter</li>
          <li>A human hair is about 80,000 nanometers wide</li>
          <li>A red blood cell is about 7,000 nanometers</li>
          <li>DNA is about 2.5 nanometers wide</li>
        </ul>
        
        <h3>🧪 Amazing Applications</h3>
        <ul>
          <li><strong>Medicine:</strong> Tiny robots that can deliver medicine directly to sick cells</li>
          <li><strong>Electronics:</strong> Making computer chips smaller and faster</li>
          <li><strong>Materials:</strong> Creating super-strong, lightweight materials</li>
          <li><strong>Environment:</strong> Cleaning up pollution with nano-filters</li>
          <li><strong>Sports:</strong> Making tennis rackets and golf clubs stronger</li>
        </ul>
        
        <h3>🏥 Nano-Medicine</h3>
        <ul>
          <li>Nanoparticles can target cancer cells specifically</li>
          <li>Nano-sensors can detect diseases early</li>
          <li>Artificial skin made from nanomaterials</li>
          <li>Nano-robots could repair damaged tissue</li>
        </ul>
        
        <h3>🌟 Mind-Blowing Nano Facts</h3>
        <ul>
          <li>Gecko feet use nano-structures to stick to walls</li>
          <li>Butterfly wings get their colors from nano-structures</li>
          <li>Self-cleaning windows use nanotechnology</li>
          <li>Some sunscreens contain nanoparticles</li>
        </ul>
      `,
      category: 'science',
      difficulty: 3,
      image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400',
      saved: false
    },
    {
      id: '21',
      title: 'The Wonders of Astronomy',
      description: 'Explore the vast universe and discover amazing celestial objects beyond our solar system!',
      content: `
        <h2>🌌 Welcome to the Universe!</h2>
        <p>Astronomy is the study of everything beyond Earth - stars, planets, galaxies, and the entire universe! It's like being a detective, but instead of solving crimes, you're solving the mysteries of space.</p>
        
        <h3>⭐ Types of Stars</h3>
        <ul>
          <li><strong>Red Dwarfs:</strong> Small, cool stars that live for trillions of years</li>
          <li><strong>Yellow Stars:</strong> Like our Sun - medium-sized and warm</li>
          <li><strong>Blue Giants:</strong> Massive, hot stars that burn bright but die young</li>
          <li><strong>White Dwarfs:</strong> Dead stars that are incredibly dense</li>
        </ul>
        
        <h3>🌟 Star Life Cycle</h3>
        <ol>
          <li><strong>Nebula:</strong> A cloud of gas and dust</li>
          <li><strong>Protostar:</strong> The cloud starts to collapse and heat up</li>
          <li><strong>Main Sequence:</strong> The star burns hydrogen for billions of years</li>
          <li><strong>Red Giant:</strong> The star expands as it runs out of fuel</li>
          <li><strong>Death:</strong> Becomes a white dwarf, neutron star, or black hole</li>
        </ol>
        
        <h3>🌌 Galaxies Galore</h3>
        <ul>
          <li><strong>Spiral Galaxies:</strong> Like our Milky Way with beautiful arms</li>
          <li><strong>Elliptical Galaxies:</strong> Oval-shaped with older stars</li>
          <li><strong>Irregular Galaxies:</strong> No specific shape, often chaotic</li>
        </ul>
        
        <h3>🔭 Cool Astronomy Tools</h3>
        <ul>
          <li><strong>Telescopes:</strong> Collect light from distant objects</li>
          <li><strong>Radio Dishes:</strong> Listen to radio waves from space</li>
          <li><strong>Space Probes:</strong> Robots that visit other planets</li>
          <li><strong>Satellites:</strong> Observe space without Earth's atmosphere</li>
        </ul>
        
        <h3>🌟 Amazing Space Facts</h3>
        <ul>
          <li>There are more stars than grains of sand on all Earth's beaches</li>
          <li>A day on Mercury is longer than its year</li>
          <li>Neutron stars are so dense that a teaspoon would weigh 6 billion tons</li>
          <li>The universe is 13.8 billion years old</li>
        </ul>
      `,
      category: 'space',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400',
      saved: false
    },
    {
      id: '22',
      title: 'Climate Change and Our Planet',
      description: 'Learn about climate change, its effects on Earth, and what we can do to help our planet!',
      content: `
        <h2>🌍 Understanding Climate Change</h2>
        <p>Climate change refers to long-term changes in Earth's weather patterns and temperatures. While climate has always changed naturally, human activities are now causing rapid changes that affect our planet.</p>
        
        <h3>🌡️ What Causes Climate Change?</h3>
        <ul>
          <li><strong>Greenhouse Gases:</strong> CO2, methane, and other gases trap heat</li>
          <li><strong>Burning Fossil Fuels:</strong> Coal, oil, and gas release CO2</li>
          <li><strong>Deforestation:</strong> Fewer trees mean less CO2 absorption</li>
          <li><strong>Industrial Processes:</strong> Factories release various greenhouse gases</li>
        </ul>
        
        <h3>🌊 Effects We Can See</h3>
        <ul>
          <li><strong>Rising Temperatures:</strong> Global average temperature is increasing</li>
          <li><strong>Melting Ice:</strong> Glaciers and polar ice caps are shrinking</li>
          <li><strong>Sea Level Rise:</strong> Oceans are getting higher</li>
          <li><strong>Extreme Weather:</strong> More hurricanes, droughts, and floods</li>
          <li><strong>Ecosystem Changes:</strong> Animals and plants are affected</li>
        </ul>
        
        <h3>🌱 What Can We Do?</h3>
        <ul>
          <li><strong>Use Renewable Energy:</strong> Solar, wind, and water power</li>
          <li><strong>Reduce, Reuse, Recycle:</strong> Create less waste</li>
          <li><strong>Plant Trees:</strong> Trees absorb CO2 from the air</li>
          <li><strong>Use Less Energy:</strong> Turn off lights, walk or bike more</li>
          <li><strong>Eat Sustainably:</strong> Choose foods that are better for the environment</li>
        </ul>
        
        <h3>🌟 Positive Climate Actions</h3>
        <ul>
          <li>Many countries are switching to clean energy</li>
          <li>Electric cars are becoming more popular</li>
          <li>Young people are leading climate movements</li>
          <li>New technologies are helping reduce emissions</li>
        </ul>
        
        <h3>🌈 Hope for the Future</h3>
        <ul>
          <li>Scientists are developing carbon capture technology</li>
          <li>Renewable energy is getting cheaper every year</li>
          <li>People around the world are working together</li>
          <li>Every small action makes a difference</li>
        </ul>
      `,
      category: 'science',
      difficulty: 2,
      image_url: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?w=400',
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
    { id: 'technology', name: 'Technology', emoji: '💻' },
    { id: 'robotics', name: 'Robotics', emoji: '🤖' },
    { id: 'cybersecurity', name: 'Cybersecurity', emoji: '🔒' },
    { id: 'physics', name: 'Physics', emoji: '⚛️' },
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