'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

interface ReferenceItem {
  id: string
  title: string
  content: string
  category: string
  subject: string
}

interface SavedReference {
  id: string
  user_id: string
  reference_item_id: string
  saved_at: string
}

export default function CalculatorPage() {
  const { user } = useAuth()
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [memory, setMemory] = useState(0)
  const [history, setHistory] = useState<string[]>([])
  const [isRadians, setIsRadians] = useState(true)
  const [referenceItems, setReferenceItems] = useState<ReferenceItem[]>([])
  const [savedItems, setSavedItems] = useState<SavedReference[]>([])
  const [filteredItems, setFilteredItems] = useState<ReferenceItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  // Comprehensive reference materials for production app
  const comprehensiveReferences: ReferenceItem[] = [
    // Mathematical Formulas
    {
      id: '1',
      title: 'Pythagorean Theorem',
      content: '<strong>a² + b² = c²</strong><br/>Where c is the hypotenuse and a, b are the other two sides of a right triangle.<br/><em>Example: If a=3 and b=4, then c=√(9+16)=5</em>',
      category: 'formulas',
      subject: 'math'
    },
    {
      id: '2',
      title: 'Area of Circle',
      content: '<strong>A = πr²</strong><br/>Where r is the radius of the circle.<br/><em>Example: Circle with radius 5 has area = π × 25 ≈ 78.54</em>',
      category: 'formulas',
      subject: 'math'
    },
    {
      id: '3',
      title: 'Quadratic Formula',
      content: '<strong>x = (-b ± √(b² - 4ac)) / 2a</strong><br/>For equation ax² + bx + c = 0<br/><em>Used to find roots of quadratic equations</em>',
      category: 'formulas',
      subject: 'math'
    },
    {
      id: '4',
      title: 'Distance Formula',
      content: '<strong>d = √[(x₂-x₁)² + (y₂-y₁)²]</strong><br/>Distance between two points (x₁,y₁) and (x₂,y₂).<br/><em>Example: Distance from (0,0) to (3,4) = √(9+16) = 5</em>',
      category: 'formulas',
      subject: 'math'
    },
    {
      id: '5',
      title: 'Slope Formula',
      content: '<strong>m = (y₂-y₁)/(x₂-x₁)</strong><br/>Slope of line through points (x₁,y₁) and (x₂,y₂).<br/><em>Positive slope = line goes up, Negative slope = line goes down</em>',
      category: 'formulas',
      subject: 'math'
    },
    {
      id: '6',
      title: 'Volume of Sphere',
      content: '<strong>V = (4/3)πr³</strong><br/>Where r is the radius of the sphere.<br/><em>Example: Sphere with radius 3 has volume = (4/3)π × 27 ≈ 113.1</em>',
      category: 'formulas',
      subject: 'math'
    },
    {
      id: '7',
      title: 'Surface Area of Cylinder',
      content: '<strong>SA = 2πr² + 2πrh</strong><br/>Where r is radius and h is height.<br/><em>Includes top, bottom, and curved surface</em>',
      category: 'formulas',
      subject: 'math'
    },
    {
      id: '8',
      title: 'Compound Interest',
      content: '<strong>A = P(1 + r/n)^(nt)</strong><br/>P=principal, r=rate, n=compounds per year, t=time<br/><em>Shows how money grows with compound interest</em>',
      category: 'formulas',
      subject: 'math'
    },

    // Mathematical Constants
    {
      id: '9',
      title: 'Pi (π)',
      content: '<strong>π ≈ 3.14159265359</strong><br/>The ratio of circumference to diameter of a circle.<br/><em>Used in circle calculations, trigonometry, and many physics formulas</em>',
      category: 'constants',
      subject: 'math'
    },
    {
      id: '10',
      title: 'Euler\'s Number (e)',
      content: '<strong>e ≈ 2.71828182846</strong><br/>The base of natural logarithms.<br/><em>Important in calculus, compound interest, and exponential growth</em>',
      category: 'constants',
      subject: 'math'
    },
    {
      id: '11',
      title: 'Golden Ratio (φ)',
      content: '<strong>φ ≈ 1.61803398875</strong><br/>φ = (1 + √5)/2<br/><em>Found in nature, art, and architecture. Fibonacci ratio approaches φ</em>',
      category: 'constants',
      subject: 'math'
    },
    {
      id: '12',
      title: 'Square Root of 2',
      content: '<strong>√2 ≈ 1.41421356237</strong><br/>The diagonal of a unit square.<br/><em>First known irrational number, discovered by ancient Greeks</em>',
      category: 'constants',
      subject: 'math'
    },

    // Physics Formulas
    {
      id: '13',
      title: 'Newton\'s Second Law',
      content: '<strong>F = ma</strong><br/>Force equals mass times acceleration.<br/><em>Fundamental law of motion. F in Newtons, m in kg, a in m/s²</em>',
      category: 'formulas',
      subject: 'physics'
    },
    {
      id: '14',
      title: 'Kinetic Energy',
      content: '<strong>KE = ½mv²</strong><br/>Where m is mass and v is velocity.<br/><em>Energy of motion. Doubles when mass doubles, quadruples when speed doubles</em>',
      category: 'formulas',
      subject: 'physics'
    },
    {
      id: '15',
      title: 'Potential Energy',
      content: '<strong>PE = mgh</strong><br/>Where m=mass, g=gravity (9.8 m/s²), h=height.<br/><em>Energy stored due to position in gravitational field</em>',
      category: 'formulas',
      subject: 'physics'
    },
    {
      id: '16',
      title: 'Wave Equation',
      content: '<strong>v = fλ</strong><br/>Velocity = frequency × wavelength.<br/><em>Applies to all waves: sound, light, water waves</em>',
      category: 'formulas',
      subject: 'physics'
    },
    {
      id: '17',
      title: 'Ohm\'s Law',
      content: '<strong>V = IR</strong><br/>Voltage = Current × Resistance.<br/><em>Fundamental law of electricity. V in volts, I in amperes, R in ohms</em>',
      category: 'formulas',
      subject: 'physics'
    },

    // Physics Constants
    {
      id: '18',
      title: 'Speed of Light',
      content: '<strong>c = 299,792,458 m/s</strong><br/>The speed of light in vacuum.<br/><em>Universal speed limit. Nothing can travel faster than light</em>',
      category: 'constants',
      subject: 'physics'
    },
    {
      id: '19',
      title: 'Gravitational Constant',
      content: '<strong>G = 6.674 × 10⁻¹¹ m³/kg⋅s²</strong><br/>Universal gravitational constant.<br/><em>Used in Newton\'s law of universal gravitation</em>',
      category: 'constants',
      subject: 'physics'
    },
    {
      id: '20',
      title: 'Planck\'s Constant',
      content: '<strong>h = 6.626 × 10⁻³⁴ J⋅s</strong><br/>Fundamental constant of quantum mechanics.<br/><em>Relates energy to frequency: E = hf</em>',
      category: 'constants',
      subject: 'physics'
    },
    {
      id: '21',
      title: 'Acceleration due to Gravity',
      content: '<strong>g = 9.80665 m/s²</strong><br/>Standard gravity on Earth\'s surface.<br/><em>Varies slightly by location. Used in weight calculations: W = mg</em>',
      category: 'constants',
      subject: 'physics'
    },

    // Chemistry Formulas
    {
      id: '22',
      title: 'Ideal Gas Law',
      content: '<strong>PV = nRT</strong><br/>P=pressure, V=volume, n=moles, R=gas constant, T=temperature.<br/><em>Describes behavior of ideal gases</em>',
      category: 'formulas',
      subject: 'chemistry'
    },
    {
      id: '23',
      title: 'Molarity',
      content: '<strong>M = n/V</strong><br/>Molarity = moles of solute / liters of solution.<br/><em>Concentration measurement in chemistry</em>',
      category: 'formulas',
      subject: 'chemistry'
    },
    {
      id: '24',
      title: 'pH Formula',
      content: '<strong>pH = -log[H⁺]</strong><br/>Where [H⁺] is hydrogen ion concentration.<br/><em>pH < 7 is acidic, pH > 7 is basic, pH = 7 is neutral</em>',
      category: 'formulas',
      subject: 'chemistry'
    },

    // Chemistry Constants
    {
      id: '25',
      title: 'Avogadro\'s Number',
      content: '<strong>Nₐ = 6.022 × 10²³ mol⁻¹</strong><br/>Number of particles in one mole.<br/><em>Connects atomic scale to macroscopic scale</em>',
      category: 'constants',
      subject: 'chemistry'
    },
    {
      id: '26',
      title: 'Gas Constant',
      content: '<strong>R = 8.314 J/(mol⋅K)</strong><br/>Universal gas constant.<br/><em>Used in ideal gas law and thermodynamics</em>',
      category: 'constants',
      subject: 'chemistry'
    },

    // Conversions
    {
      id: '27',
      title: 'Temperature Conversions',
      content: '<strong>Celsius ↔ Fahrenheit:</strong><br/>F = (C × 9/5) + 32<br/>C = (F - 32) × 5/9<br/><strong>Celsius ↔ Kelvin:</strong><br/>K = C + 273.15',
      category: 'conversions',
      subject: 'science'
    },
    {
      id: '28',
      title: 'Length Conversions',
      content: '<strong>Metric:</strong><br/>1 km = 1000 m<br/>1 m = 100 cm = 1000 mm<br/><strong>Imperial:</strong><br/>1 mile = 5280 feet<br/>1 foot = 12 inches<br/><strong>Mixed:</strong><br/>1 inch = 2.54 cm<br/>1 mile ≈ 1.609 km',
      category: 'conversions',
      subject: 'science'
    },
    {
      id: '29',
      title: 'Mass/Weight Conversions',
      content: '<strong>Metric:</strong><br/>1 kg = 1000 g<br/>1 tonne = 1000 kg<br/><strong>Imperial:</strong><br/>1 pound = 16 ounces<br/>1 ton = 2000 pounds<br/><strong>Mixed:</strong><br/>1 kg ≈ 2.205 pounds',
      category: 'conversions',
      subject: 'science'
    },
    {
      id: '30',
      title: 'Volume Conversions',
      content: '<strong>Metric:</strong><br/>1 L = 1000 mL<br/>1 m³ = 1000 L<br/><strong>Imperial:</strong><br/>1 gallon = 4 quarts = 8 pints<br/>1 quart = 2 pints = 32 fl oz<br/><strong>Mixed:</strong><br/>1 L ≈ 0.264 gallons',
      category: 'conversions',
      subject: 'science'
    },
    {
      id: '31',
      title: 'Energy Conversions',
      content: '<strong>Energy Units:</strong><br/>1 kWh = 3.6 × 10⁶ J<br/>1 calorie = 4.184 J<br/>1 BTU ≈ 1055 J<br/>1 eV = 1.602 × 10⁻¹⁹ J<br/><em>Used in physics, chemistry, and engineering</em>',
      category: 'conversions',
      subject: 'physics'
    },
    {
      id: '32',
      title: 'Time Conversions',
      content: '<strong>Time Units:</strong><br/>1 minute = 60 seconds<br/>1 hour = 60 minutes = 3600 seconds<br/>1 day = 24 hours<br/>1 year ≈ 365.25 days<br/>1 year = 8760 hours = 525,600 minutes',
      category: 'conversions',
      subject: 'science'
    },

    // Computer Science
    {
      id: '33',
      title: 'Binary/Decimal Conversion',
      content: '<strong>Binary to Decimal:</strong><br/>Sum powers of 2 for each 1 bit<br/><strong>Example:</strong> 1011₂ = 1×8 + 0×4 + 1×2 + 1×1 = 11₁₀<br/><strong>Decimal to Binary:</strong><br/>Repeatedly divide by 2, read remainders backwards',
      category: 'conversions',
      subject: 'computer-science'
    },
    {
      id: '34',
      title: 'Data Storage Units',
      content: '<strong>Binary Units:</strong><br/>1 KB = 1024 bytes<br/>1 MB = 1024 KB<br/>1 GB = 1024 MB<br/>1 TB = 1024 GB<br/><strong>Decimal Units:</strong><br/>1 kB = 1000 bytes (sometimes used)',
      category: 'conversions',
      subject: 'computer-science'
    },
    {
      id: '35',
      title: 'Algorithm Complexity',
      content: '<strong>Big O Notation:</strong><br/>O(1) - Constant time<br/>O(log n) - Logarithmic<br/>O(n) - Linear<br/>O(n log n) - Linearithmic<br/>O(n²) - Quadratic<br/>O(2ⁿ) - Exponential',
      category: 'formulas',
      subject: 'computer-science'
    },

    // Advanced Mathematics
    {
      id: '36',
      title: 'Trigonometric Identities',
      content: '<strong>Basic Identities:</strong><br/>sin²θ + cos²θ = 1<br/>tan θ = sin θ / cos θ<br/>sin(A ± B) = sin A cos B ± cos A sin B<br/>cos(A ± B) = cos A cos B ∓ sin A sin B',
      category: 'formulas',
      subject: 'math'
    },
    {
      id: '37',
      title: 'Logarithm Properties',
      content: '<strong>Log Rules:</strong><br/>log(ab) = log a + log b<br/>log(a/b) = log a - log b<br/>log(aⁿ) = n log a<br/>log₁₀(10ⁿ) = n<br/>ln(eⁿ) = n',
      category: 'formulas',
      subject: 'math'
    },
    {
      id: '38',
      title: 'Derivative Rules',
      content: '<strong>Basic Derivatives:</strong><br/>d/dx(xⁿ) = nxⁿ⁻¹<br/>d/dx(eˣ) = eˣ<br/>d/dx(ln x) = 1/x<br/>d/dx(sin x) = cos x<br/>d/dx(cos x) = -sin x<br/><strong>Chain Rule:</strong> d/dx[f(g(x))] = f\'(g(x))⋅g\'(x)',
      category: 'formulas',
      subject: 'math'
    },
    {
      id: '39',
      title: 'Integration Rules',
      content: '<strong>Basic Integrals:</strong><br/>∫xⁿ dx = xⁿ⁺¹/(n+1) + C<br/>∫eˣ dx = eˣ + C<br/>∫(1/x) dx = ln|x| + C<br/>∫sin x dx = -cos x + C<br/>∫cos x dx = sin x + C',
      category: 'formulas',
      subject: 'math'
    },
    {
      id: '40',
      title: 'Statistics Formulas',
      content: '<strong>Mean:</strong> x̄ = Σx/n<br/><strong>Variance:</strong> σ² = Σ(x-μ)²/n<br/><strong>Standard Deviation:</strong> σ = √(variance)<br/><strong>Normal Distribution:</strong> 68-95-99.7 rule<br/><em>68% within 1σ, 95% within 2σ, 99.7% within 3σ</em>',
      category: 'formulas',
      subject: 'math'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'formulas', name: 'Formulas' },
    { id: 'constants', name: 'Constants' },
    { id: 'conversions', name: 'Conversions' },
  ]

  const subjects = [
    { id: 'all', name: 'All Subjects' },
    { id: 'math', name: 'Mathematics' },
    { id: 'physics', name: 'Physics' },
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'computer-science', name: 'Computer Science' },
    { id: 'science', name: 'General Science' },
  ]

  useEffect(() => {
    const fetchReferenceData = async () => {
      if (!user) {
        // Use comprehensive data if not logged in
        setReferenceItems(comprehensiveReferences)
        setFilteredItems(comprehensiveReferences)
        setLoading(false)
        return
      }

      try {
        // Try to fetch from database
        const { data: itemsData } = await supabase
          .from('reference_items')
          .select('*')
          .order('title', { ascending: true })
        
        if (itemsData && itemsData.length > 0) {
          setReferenceItems(itemsData as ReferenceItem[])
          setFilteredItems(itemsData as ReferenceItem[])
        } else {
          // Fallback to comprehensive data if database is empty
          setReferenceItems(comprehensiveReferences)
          setFilteredItems(comprehensiveReferences)
        }

        // Fetch saved items
        const { data: savedData } = await supabase
          .from('saved_references')
          .select('*')
          .eq('user_id', user.id)
        
        if (savedData) {
          setSavedItems(savedData as SavedReference[])
        }
      } catch (error) {
        console.error('Error fetching reference data:', error)
        // Fallback to comprehensive data on error
        setReferenceItems(comprehensiveReferences)
        setFilteredItems(comprehensiveReferences)
      }

      setLoading(false)
    }

    fetchReferenceData()
  }, [user])

  useEffect(() => {
    // Filter items based on category and subject
    let result = referenceItems

    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory)
    }

    if (selectedSubject !== 'all') {
      result = result.filter(item => item.subject === selectedSubject)
    }

    setFilteredItems(result)
  }, [referenceItems, selectedCategory, selectedSubject])

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? digit : display + digit)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.')
    }
  }

  const clearDisplay = () => {
    setDisplay('0')
  }

  const clearAll = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      let newValue: number

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue
          break
        case '-':
          newValue = currentValue - inputValue
          break
        case '×':
          newValue = currentValue * inputValue
          break
        case '÷':
          newValue = inputValue !== 0 ? currentValue / inputValue : 0
          break
        case '^':
          newValue = Math.pow(currentValue, inputValue)
          break
        case 'mod':
          newValue = currentValue % inputValue
          break
        default:
          newValue = inputValue
      }

      setDisplay(String(newValue))
      setPreviousValue(newValue)
      addToHistory(`${currentValue} ${operation} ${inputValue} = ${newValue}`)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const handleEquals = () => {
    const inputValue = parseFloat(display)

    if (previousValue !== null && operation) {
      const currentValue = previousValue || 0
      let newValue: number

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue
          break
        case '-':
          newValue = currentValue - inputValue
          break
        case '×':
          newValue = currentValue * inputValue
          break
        case '÷':
          newValue = inputValue !== 0 ? currentValue / inputValue : 0
          break
        case '^':
          newValue = Math.pow(currentValue, inputValue)
          break
        case 'mod':
          newValue = currentValue % inputValue
          break
        default:
          newValue = inputValue
      }

      setDisplay(String(newValue))
      setPreviousValue(null)
      setOperation(null)
      setWaitingForOperand(true)
      addToHistory(`${currentValue} ${operation} ${inputValue} = ${newValue}`)
    }
  }

  const performScientificOperation = (func: string) => {
    const inputValue = parseFloat(display)
    let result: number

    switch (func) {
      case 'sin':
        result = Math.sin(isRadians ? inputValue : inputValue * Math.PI / 180)
        break
      case 'cos':
        result = Math.cos(isRadians ? inputValue : inputValue * Math.PI / 180)
        break
      case 'tan':
        result = Math.tan(isRadians ? inputValue : inputValue * Math.PI / 180)
        break
      case 'log':
        result = Math.log10(inputValue)
        break
      case 'ln':
        result = Math.log(inputValue)
        break
      case 'sqrt':
        result = Math.sqrt(inputValue)
        break
      case 'square':
        result = inputValue * inputValue
        break
      case 'factorial':
        result = factorial(Math.floor(inputValue))
        break
      case 'pi':
        result = Math.PI
        break
      case 'e':
        result = Math.E
        break
      case 'abs':
        result = Math.abs(inputValue)
        break
      case '1/x':
        result = inputValue !== 0 ? 1 / inputValue : 0
        break
      default:
        result = inputValue
    }

    setDisplay(String(result))
    setWaitingForOperand(true)
    addToHistory(`${func}(${inputValue}) = ${result}`)
  }

  const factorial = (n: number): number => {
    if (n < 0) return 0
    if (n === 0 || n === 1) return 1
    return n * factorial(n - 1)
  }

  const addToHistory = (entry: string) => {
    setHistory(prev => [entry, ...prev.slice(0, 9)]) // Keep last 10 entries
  }

  const memoryStore = () => {
    setMemory(parseFloat(display))
  }

  const memoryRecall = () => {
    setDisplay(String(memory))
    setWaitingForOperand(true)
  }

  const memoryClear = () => {
    setMemory(0)
  }

  const memoryAdd = () => {
    setMemory(memory + parseFloat(display))
  }

  const handleSaveItem = async (itemId: string) => {
    if (!user) return

    setSaving(prev => ({ ...prev, [itemId]: true }))

    const isSaved = savedItems.some(item => item.reference_item_id === itemId)

    if (isSaved) {
      // Unsave the item
      const { error } = await supabase
        .from('saved_references')
        .delete()
        .eq('user_id', user.id)
        .eq('reference_item_id', itemId)
      
      if (!error) {
        setSavedItems(prev => prev.filter(item => item.reference_item_id !== itemId))
      }
    } else {
      // Save the item
      const { error } = await supabase
        .from('saved_references')
        .insert({
          user_id: user.id,
          reference_item_id: itemId
        })
      
      if (!error) {
        setSavedItems(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            user_id: user.id,
            reference_item_id: itemId,
            saved_at: new Date().toISOString()
          }
        ])
      }
    }

    setSaving(prev => ({ ...prev, [itemId]: false }))
  }

  const isItemSaved = (itemId: string) => {
    return savedItems.some(item => item.reference_item_id === itemId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
        <div className="text-2xl ml-4 gradient-text">Loading calculator...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text-light mb-2 star-decoration">🧮 Scientific Calculator & Reference 📚</h1>
          <p className="text-lg text-white">Advanced calculations with comprehensive reference materials!</p>
          <p className="text-sm text-gray-200 mt-2">
            {referenceItems.length} reference items • Multiple subjects • Production-ready content
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Calculator Section */}
          <div className="xl:col-span-2">
            <div className="card-fun p-6">
              <h2 className="text-2xl font-bold gradient-text mb-4">🔬 Scientific Calculator</h2>
              
              {/* Display */}
              <div className="mb-6">
                <div className="bg-gray-900 rounded-lg p-4 text-right border-2 border-gray-700">
                  <div className="text-gray-400 text-sm h-6 mb-2">
                    {previousValue !== null ? `${previousValue} ${operation || ''}` : ''}
                  </div>
                  <div className="text-4xl font-bold text-white break-all">{display}</div>
                  <div className="text-xs text-gray-400 mt-2">
                    Mode: {isRadians ? 'RAD' : 'DEG'} | Memory: {memory}
                  </div>
                </div>
              </div>

              {/* History */}
              {history.length > 0 && (
                <div className="mb-4">
                  <details className="bg-gray-100 rounded-lg p-3">
                    <summary className="cursor-pointer font-semibold text-gray-700">📜 History</summary>
                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                      {history.map((entry, index) => (
                        <div key={index} className="text-sm text-gray-600 font-mono">{entry}</div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
              
              {/* Scientific Functions Row */}
              <div className="grid grid-cols-6 gap-2 mb-4">
                <button
                  className="calc-button text-sm"
                  onClick={() => setIsRadians(!isRadians)}
                >
                  {isRadians ? 'RAD' : 'DEG'}
                </button>
                <button
                  className="calc-button operator text-sm"
                  onClick={() => performScientificOperation('sin')}
                >
                  sin
                </button>
                <button
                  className="calc-button operator text-sm"
                  onClick={() => performScientificOperation('cos')}
                >
                  cos
                </button>
                <button
                  className="calc-button operator text-sm"
                  onClick={() => performScientificOperation('tan')}
                >
                  tan
                </button>
                <button
                  className="calc-button operator text-sm"
                  onClick={() => performScientificOperation('log')}
                >
                  log
                </button>
                <button
                  className="calc-button operator text-sm"
                  onClick={() => performScientificOperation('ln')}
                >
                  ln
                </button>
              </div>

              {/* Advanced Functions Row */}
              <div className="grid grid-cols-6 gap-2 mb-4">
                <button
                  className="calc-button operator text-sm"
                  onClick={() => performScientificOperation('sqrt')}
                >
                  √
                </button>
                <button
                  className="calc-button operator text-sm"
                  onClick={() => performScientificOperation('square')}
                >
                  x²
                </button>
                <button
                  className="calc-button operator text-sm"
                  onClick={() => performOperation('^')}
                >
                  x^y
                </button>
                <button
                  className="calc-button operator text-sm"
                  onClick={() => performScientificOperation('factorial')}
                >
                  x!
                </button>
                <button
                  className="calc-button operator text-sm"
                  onClick={() => performScientificOperation('pi')}
                >
                  π
                </button>
                <button
                  className="calc-button operator text-sm"
                  onClick={() => performScientificOperation('e')}
                >
                  e
                </button>
              </div>

              {/* Memory Functions Row */}
              <div className="grid grid-cols-6 gap-2 mb-4">
                <button
                  className="calc-button text-sm"
                  onClick={memoryClear}
                >
                  MC
                </button>
                <button
                  className="calc-button text-sm"
                  onClick={memoryRecall}
                >
                  MR
                </button>
                <button
                  className="calc-button text-sm"
                  onClick={memoryStore}
                >
                  MS
                </button>
                <button
                  className="calc-button text-sm"
                  onClick={memoryAdd}
                >
                  M+
                </button>
                <button
                  className="calc-button operator text-sm"
                  onClick={() => performScientificOperation('abs')}
                >
                  |x|
                </button>
                <button
                  className="calc-button operator text-sm"
                  onClick={() => performScientificOperation('1/x')}
                >
                  1/x
                </button>
              </div>
              
              {/* Main Calculator Grid */}
              <div className="grid grid-cols-4 gap-3">
                <button
                  className="calc-button col-span-2"
                  onClick={clearAll}
                >
                  Clear All
                </button>
                <button
                  className="calc-button operator"
                  onClick={() => performOperation('÷')}
                >
                  ÷
                </button>
                <button
                  className="calc-button operator"
                  onClick={() => performOperation('mod')}
                >
                  mod
                </button>
                
                <button
                  className="calc-button"
                  onClick={() => inputDigit('7')}
                >
                  7
                </button>
                <button
                  className="calc-button"
                  onClick={() => inputDigit('8')}
                >
                  8
                </button>
                <button
                  className="calc-button"
                  onClick={() => inputDigit('9')}
                >
                  9
                </button>
                <button
                  className="calc-button operator"
                  onClick={() => performOperation('×')}
                >
                  ×
                </button>
                
                <button
                  className="calc-button"
                  onClick={() => inputDigit('4')}
                >
                  4
                </button>
                <button
                  className="calc-button"
                  onClick={() => inputDigit('5')}
                >
                  5
                </button>
                <button
                  className="calc-button"
                  onClick={() => inputDigit('6')}
                >
                  6
                </button>
                <button
                  className="calc-button operator"
                  onClick={() => performOperation('-')}
                >
                  -
                </button>
                
                <button
                  className="calc-button"
                  onClick={() => inputDigit('1')}
                >
                  1
                </button>
                <button
                  className="calc-button"
                  onClick={() => inputDigit('2')}
                >
                  2
                </button>
                <button
                  className="calc-button"
                  onClick={() => inputDigit('3')}
                >
                  3
                </button>
                <button
                  className="calc-button operator"
                  onClick={() => performOperation('+')}
                >
                  +
                </button>
                
                <button
                  className="calc-button col-span-2"
                  onClick={() => inputDigit('0')}
                >
                  0
                </button>
                <button
                  className="calc-button"
                  onClick={inputDecimal}
                >
                  .
                </button>
                <button
                  className="calc-button equals"
                  onClick={handleEquals}
                >
                  =
                </button>
              </div>
            </div>
          </div>

          {/* Reference Section */}
          <div className="xl:col-span-1">
            <div className="card-fun p-6">
              <h2 className="text-2xl font-bold gradient-text mb-4">📚 Reference Materials</h2>
              <p className="text-sm text-gray-600 mb-4">{filteredItems.length} items available</p>
              
              <div className="flex flex-col gap-4 mb-6">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {filteredItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 text-sm">{item.title}</h3>
                      {user && (
                        <button
                          className="text-gray-400 hover:text-yellow-500 transition-colors"
                          onClick={() => handleSaveItem(item.id)}
                          disabled={saving[item.id]}
                        >
                          {saving[item.id] ? (
                            <span className="text-xs">💾</span>
                          ) : isItemSaved(item.id) ? (
                            <span className="text-yellow-500">⭐</span>
                          ) : (
                            <span>☆</span>
                          )}
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        {item.category}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {item.subject}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-700">
                      <div dangerouslySetInnerHTML={{ __html: item.content }} />
                    </div>
                  </div>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">📭 No references found</h3>
                  <p className="text-gray-500">Try a different category or subject.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}