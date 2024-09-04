'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
// import Confetti from 'react-confetti'
import { Moon, Sun, Check, ArrowRight, X, Upload, Trash2, Home } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Component from './globe'

type CardData = {
  front: string[]
  back: string
}

type DeckData = {
  id: string
  name: string
  cards: CardData[]
}

type DeckStats = {
  correct: number
  incorrect: number
  remaining: number
}

const CSVUpload = ({ onDeckCreated }: { onDeckCreated: (deck: DeckData) => void }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const lines = text.split('\n')
        const cards = lines.map(line => {
          const [front, back] = line.split(',').map(part => part.trim())
          return { 
            front: front.split(';').map(f => f.trim()), 
            back: back
          }
        }).filter(card => card.front.length > 0 && card.back)
        const deckName = file.name.replace('.csv', '')
        onDeckCreated({ id: Date.now().toString(), name: deckName, cards })
      }
      reader.readAsText(file, 'UTF-8')
    }
  }

  return (
    <div className="space-y-2 w-full max-w-72 mx-auto">
      <Label htmlFor="csv-upload" className="text-lg block text-center tracking-tight">Загрузка CSV файла</Label>
      <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileUpload} className="dark:bg-white dark:text-customDark" />
    </div>
  )
}

const DeckComponent = ({ deck, onComplete }: { deck: CardData[], onComplete: (stats: DeckStats) => void }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [message, setMessage] = useState('')
  const [stats, setStats] = useState<DeckStats>({ correct: 0, incorrect: 0, remaining: deck.length })
  const [isAnswerChecked, setIsAnswerChecked] = useState(false)

  const shuffledDeck = useState(() => [...deck].sort(() => Math.random() - 0.5))[0]

  const handleSubmit = () => {
    const isCorrect = userAnswer.toLowerCase() === shuffledDeck[currentCardIndex].back.toLowerCase()
    setMessage(isCorrect ? 'Правильно!' : 'Неправильно')
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      remaining: prev.remaining - 1
    }))
    setIsAnswerChecked(true)
  }

  const handleNext = () => {
    if (currentCardIndex < shuffledDeck.length - 1) {
      setCurrentCardIndex(prev => prev + 1)
      setUserAnswer('')
      setMessage('')
      setIsAnswerChecked(false)
    } else {
      onComplete(stats)
    }
  }

  const handleFinishEarly = () => {
    onComplete(stats)
  }
  
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (!isAnswerChecked) {
        handleSubmit();
      } else {
        handleNext();
      }
    }
  };

  const renderFrontSide = (front: string[]) => {
    if (front.length === 1) {
      return <div className="text-4xl font-bold text-center mb-6">{front[0]}</div>
    } else if (front.length === 2) {
      return (
        <div className="flex flex-col items-center mb-6">
          <div className="text-4xl font-bold text-center">{front[0]}</div>
          <div className="text-2xl text-gray-600 dark:text-gray-400 mt-2">{front[1]}</div>
        </div>
      )
    } else {
      return (
        <div className="flex flex-col items-center mb-6">
          <div className="text-4xl font-bold text-center">{front[0]}</div>
          <div className="text-2xl text-gray-600 dark:text-gray-400 mt-2">{front[1]}</div>
          <div className="text-xl text-gray-500 dark:text-gray-500 mt-1">{front.slice(2).join(', ')}</div>
        </div>
      )
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto dark:bg-customDark dark:text-white">
      <CardHeader className="text-center">
        <CardTitle className="text-sm text-right">{currentCardIndex + 1} из {shuffledDeck.length}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderFrontSide(shuffledDeck[currentCardIndex].front)}
        <Input
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
         
          placeholder="Введите перевод"
          disabled={isAnswerChecked}
          className="text-lg dark:bg-customDark dark:text-white"
        />
        {message && (
          <div className={`text-lg text-center font-semibold ${message === 'Правильно!' ? 'text-green-500' : 'text-red-500'}`}>
            {message}
          </div>
        )}
        {isAnswerChecked && message === 'Неправильно!' && (
          <div className="text-lg text-center">
            Правильный ответ: {shuffledDeck[currentCardIndex].back}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleSubmit} disabled={isAnswerChecked} className="flex-1 mr-2">
          <Check className="mr-2 h-4 w-4" /> Проверить
        </Button>
        <Button onClick={handleNext} disabled={!isAnswerChecked} className="flex-1 ml-2">
          <ArrowRight className="mr-2 h-4 w-4" /> Далее
        </Button>
      </CardFooter>
      <CardFooter className="pt-0">
        <Button onClick={handleFinishEarly} variant="outline" className="w-full">
          <X className="mr-2 h-4 w-4" /> Завершить досрочно
        </Button>
      </CardFooter>
    </Card>
  )
}

const StatisticsComponent = ({ stats, onReplay, onReturnHome }: { stats: DeckStats, onReplay: () => void, onReturnHome: () => void }) => (
  <Card className="w-full max-w-md mx-auto dark:bg-customDark dark:text-white">
    <CardHeader>
      <CardTitle className="text-3xl font-extrabold text-center">Статистика</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col items-center">
      <div className="text-left">
        <p className="text-sm">Правильные ответы: {stats.correct}</p>
        <p className="text-sm">Неправильные ответы: {stats.incorrect}</p>
        <p className="text-sm">Осталось карточек: {stats.remaining}</p>
      </div>
    </CardContent>
    <CardFooter className="flex flex-col space-y-4">
      <Button onClick={onReplay} size="lg" className="w-full text-base">
        <ArrowRight className="mr-2 h-5 w-5" /> Пройти колоду снова
      </Button>
      <Button onClick={onReturnHome} variant="outline" size="lg" className="w-full text-base">
        <Home className="mr-2 h-5 w-5" /> Вернуться на главную
      </Button>
    </CardFooter>
  </Card>
)

const DeckList = ({ decks, onSelectDeck, onDeleteDeck }: { decks: DeckData[], onSelectDeck: (deck: DeckData) => void, onDeleteDeck: (id: string) => void }) => (
  <div className={`grid gap-4 z-50 ${decks.length === 1 ? 'justify-center z-50' : ''} ${decks.length > 1 ? 'sm:grid-cols-2 z-50' : ''} ${decks.length > 2 ? 'lg:grid-cols-3 z-50' : ''}`}>
    {decks.map((deck) => (
      <motion.div
        key={deck.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="dark:bg-customDark dark:text-white z-50">
          <CardHeader>
            <CardTitle className='truncate z-50'>{deck.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{deck.cards.length} карточек</p>
          </CardContent>
          <CardFooter className="flex justify-between z-50">
            <Button onClick={() => onSelectDeck(deck)} className="flex-1 mr-2 z-50">
              Начать
            </Button>
            <Button onClick={() => onDeleteDeck(deck.id)} variant="destructive" className="flex-shrink-0 z-50">
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    ))}
  </div>
)
export function AnkiClone() {
  const [decks, setDecks] = useState<DeckData[]>([])
  const [currentDeck, setCurrentDeck] = useState<DeckData | null>(null)
  const [isDeckComplete, setIsDeckComplete] = useState(false)
  const [stats, setStats] = useState<DeckStats>({ correct: 0, incorrect: 0, remaining: 0 })
  const [showConfetti, setShowConfetti] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    setIsDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)

    const loadDecks = () => {
      const savedDecks = localStorage.getItem('decks')
      if (savedDecks) {
        try {
          const parsedDecks = JSON.parse(savedDecks)
          setDecks(parsedDecks)
          console.log('Loaded decks:', parsedDecks)
        } catch (error) {
          console.error('Error parsing saved decks:', error)
        }
      }
    }

    loadDecks()
  }, [])

  useEffect(() => {
    const saveDecks = () => {
      try {
        localStorage.setItem('decks', JSON.stringify(decks))
        console.log('Saved decks:', decks)
      } catch (error) {
        console.error('Error saving decks:', error)
      }
    }

    if (decks.length > 0) {
      saveDecks()
    }
  }, [decks])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    document.documentElement.classList.toggle('dark', newDarkMode)
  }

  const handleDeckCreated = (newDeck: DeckData) => {
    setDecks(prevDecks => [...prevDecks, newDeck])
  }

  const handleSelectDeck = (deck: DeckData) => {
    setCurrentDeck(deck)
    setIsDeckComplete(false)
    setStats({ correct: 0, incorrect: 0, remaining: deck.cards.length })
  }

  const handleDeleteDeck = (id: string) => {
    setDecks(prevDecks => {
      const updatedDecks = prevDecks.filter(deck => deck.id !== id);
  
      if (updatedDecks.length === 0) {
        localStorage.removeItem('decks');
      } else {
        localStorage.setItem('decks', JSON.stringify(updatedDecks));
      }
  
      return updatedDecks;
    });
  };

  const handleDeckComplete = (finalStats: DeckStats) => {
    setStats(finalStats)
    setIsDeckComplete(true)
    if (finalStats.incorrect === 0 && finalStats.remaining === 0) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }

  const handleReplay = () => {
    if (currentDeck) {
      setIsDeckComplete(false)
      setStats({ correct: 0, incorrect: 0, remaining: currentDeck.cards.length })
    }
  }

  const handleReturnHome = () => {
    setCurrentDeck(null)
    setIsDeckComplete(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-customDark dark:bg-customDark transition-colors duration-200">
      <div className="absolute inset-0 z-0">
        <Component />
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="p-6 flex justify-between items-center max-w-3xl mx-auto w-full">
          <Link href="#" onClick={handleReturnHome} className="tracking-tight text-4xl font-black text-white dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <span className='align-top text-3xl italic'>cy</span>press
          </Link>
          <Button onClick={toggleDarkMode} variant="ghost" size="lg" className="dark:text-white ">
            {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6 text-white" />}
          </Button>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center p-6">
          {!currentDeck ? (
            <>
              <DeckList decks={decks} onSelectDeck={handleSelectDeck} onDeleteDeck={handleDeleteDeck} />
              <div className="mt-12 text-white">
                <CSVUpload onDeckCreated={handleDeckCreated} />
              </div>
            </>
          ) : isDeckComplete ? (
            <StatisticsComponent stats={stats} onReplay={handleReplay} onReturnHome={handleReturnHome} />
          ) : (
            <DeckComponent deck={currentDeck.cards} onComplete={handleDeckComplete} />
          )}
        </main>
      </div>
      {/* {showConfetti && <Confetti />} */}
    </div>
  )
}