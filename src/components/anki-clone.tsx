'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

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
        console.log('File content:', text)
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
    <div className="space-y-2 w-60"> {/* Уменьшаем ширину поля загрузки */}
      <Label htmlFor="csv-upload" className="text-lg">Загрузка CSV файла</Label>
      <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileUpload} />
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Карта {currentCardIndex + 1} из {shuffledDeck.length}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold">{shuffledDeck[currentCardIndex].front}</div> {/* Увеличен размер текста */}
        <Input
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Введите перевод"
          disabled={isAnswerChecked}
          className="text-lg" // Увеличен размер текста в поле ввода
        />
        <div className="space-x-2">
          <Button onClick={handleSubmit} disabled={isAnswerChecked} className="text-lg p-4">Проверить</Button> {/* Увеличен размер текста на кнопках */}
          <Button onClick={handleNext} disabled={!isAnswerChecked} className="text-lg p-4">Следующая карта</Button> {/* Увеличен размер текста на кнопках */}
        </div>
        {message && <div className={`text-lg ${message === 'Правильно!' ? 'text-green-500' : 'text-red-500'}`}>{message}</div>}
      </CardContent>
    </Card>
  )
}

const StatisticsComponent = ({ stats }: { stats: DeckStats }) => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle>Статистика</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-lg">Правильные ответы: {stats.correct}</p>
      <p className="text-lg">Неправильные ответы: {stats.incorrect}</p>
    </CardContent>
  </Card>
)

export function AnkiClone() {
  const [deck, setDeck] = useState<CardData[]>([])
  const [isDeckComplete, setIsDeckComplete] = useState(false)
  const [stats, setStats] = useState<DeckStats>({ correct: 0, incorrect: 0 })

  const handleDeckCreated = (newDeck: CardData[]) => {
    setDeck(newDeck)
    setIsDeckComplete(false)
  }

  const handleDeckComplete = (finalStats: DeckStats) => {
    setStats(finalStats)
    setIsDeckComplete(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-8 text-center">
        <h1 className="text-3xl font-bold mb-4">cypress</h1>
        {deck.length === 0 ? (
          <CSVUpload onDeckCreated={handleDeckCreated} />
        ) : isDeckComplete ? (
          <StatisticsComponent stats={stats} />
        ) : (
          <DeckComponent deck={deck} onComplete={handleDeckComplete} />
        )}
      </div>
    </div>
  )
}
