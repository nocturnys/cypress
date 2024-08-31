'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Confetti from 'react-confetti'
import { Moon, Sun } from 'lucide-react'

type CardData = {
  front: string
  back: string
}

type DeckStats = {
  correct: number
  incorrect: number
}

const CSVUpload = ({ onDeckCreated }: { onDeckCreated: (deck: CardData[]) => void }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const lines = text.split('\n')
        const deck = lines.map(line => {
          const parts = line.split(',')
          const front = parts[0]?.trim() || ''
          const back = parts[1]?.trim() || ''
          return { front, back }
        }).filter(card => card.front && card.back)
        onDeckCreated(deck)
      }
      reader.readAsText(file, 'UTF-8')
    }
  }

  return (
    <div className="space-y-2 w-full max-w-xs mx-auto">
      <Label htmlFor="csv-upload" className="text-lg block text-center">Загрузка CSV файла</Label>
      <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileUpload} className="dark:bg-gray-800 dark:text-white" />
    </div>
  )
}

const DeckComponent = ({ deck, onComplete }: { deck: CardData[], onComplete: (stats: DeckStats) => void }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [message, setMessage] = useState('')
  const [stats, setStats] = useState<DeckStats>({ correct: 0, incorrect: 0 })
  const [isAnswerChecked, setIsAnswerChecked] = useState(false)

  const shuffledDeck = useState(() => [...deck].sort(() => Math.random() - 0.5))[0]

  const handleSubmit = () => {
    const isCorrect = userAnswer.toLowerCase() === shuffledDeck[currentCardIndex].back.toLowerCase()
    setMessage(isCorrect ? 'Правильно!' : 'Неправильно')
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1)
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

  return (
    <Card className="w-full max-w-md mx-auto dark:bg-gray-800 dark:text-white">
      <CardHeader>
        <CardTitle>Карта {currentCardIndex + 1} из {shuffledDeck.length}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold">{shuffledDeck[currentCardIndex].front}</div>
        <Input
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Введите перевод"
          disabled={isAnswerChecked}
          className="text-lg dark:bg-gray-700 dark:text-white"
        />
        <div className="space-x-2">
          <Button onClick={handleSubmit} disabled={isAnswerChecked} className="text-lg p-4">Проверить</Button>
          <Button onClick={handleNext} disabled={!isAnswerChecked} className="text-lg p-4">Следующая карта</Button>
        </div>
        {message && <div className={`text-lg ${message === 'Правильно!' ? 'text-green-500' : 'text-red-500'}`}>{message}</div>}
      </CardContent>
    </Card>
  )
}

const StatisticsComponent = ({ stats, onReplay }: { stats: DeckStats, onReplay: () => void }) => (
  <Card className="w-full max-w-md mx-auto dark:bg-gray-800 dark:text-white">
    <CardHeader>
      <CardTitle>Статистика</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-lg">Правильные ответы: {stats.correct}</p>
      <p className="text-lg">Неправильные ответы: {stats.incorrect}</p>
      <Button onClick={onReplay} className="text-lg p-4 w-full">Пройти колоду снова</Button>
    </CardContent>
  </Card>
)

export function AnkiClone() {
  const [deck, setDeck] = useState<CardData[]>([])
  const [isDeckComplete, setIsDeckComplete] = useState(false)
  const [stats, setStats] = useState<DeckStats>({ correct: 0, incorrect: 0 })
  const [showConfetti, setShowConfetti] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    setIsDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  useEffect(() => {
    if (showConfetti) {
      document.body.style.overflow = 'hidden';
      document.body.style.marginBottom = '0px';
    } else {
      document.body.style.overflow = '';
      document.body.style.marginBottom = '';
    }
  }, [showConfetti]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    document.documentElement.classList.toggle('dark', newDarkMode)
  }

  const handleDeckCreated = (newDeck: CardData[]) => {
    setDeck(newDeck)
    setIsDeckComplete(false)
  }

  const handleDeckComplete = (finalStats: DeckStats) => {
    setStats(finalStats)
    setIsDeckComplete(true)
    if (finalStats.incorrect === 0) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }

  const handleReplay = () => {
    setIsDeckComplete(false)
    setStats({ correct: 0, incorrect: 0 })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-customDark transition-colors duration-200">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-black dark:text-white">cypress</h1>
        <Button onClick={toggleDarkMode} variant="ghost" size="icon" className="dark:text-white">
          {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
        </Button>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {deck.length === 0 ? (
            <CSVUpload onDeckCreated={handleDeckCreated} />
          ) : isDeckComplete ? (
            <StatisticsComponent stats={stats} onReplay={handleReplay} />
          ) : (
            <DeckComponent deck={deck} onComplete={handleDeckComplete} />
          )}
        </div>
      </main>
      {showConfetti && <Confetti />}
    </div>
  )
}
