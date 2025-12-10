"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Zap } from "lucide-react"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  difficulty: "easy" | "medium" | "hard"
  category: string
  explanation: string
}

interface QuizContainerProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  progress: number
  difficulty: "easy" | "medium" | "hard"
  onAnswer: (selectedIndex: number) => void
  category: string | null
}

export function QuizContainer({
  question,
  questionNumber,
  totalQuestions,
  progress,
  difficulty,
  onAnswer,
  category,
}: QuizContainerProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      setIsSubmitted(true)
      setTimeout(() => {
        onAnswer(selectedAnswer)
        setSelectedAnswer(null)
        setIsSubmitted(false)
      }, 1500)
    }
  }

  const difficultyColors = {
    easy: "bg-green-500/20 text-green-700 dark:text-green-400",
    medium: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
    hard: "bg-red-500/20 text-red-700 dark:text-red-400",
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">
                Question {questionNumber} of {totalQuestions}
              </h1>
              <p className="text-foreground/60 mt-1">
                {category ? `${category} • ` : ""}
                Difficulty: <Badge className={difficultyColors[difficulty]}>{difficulty.toUpperCase()}</Badge>
              </p>
            </div>
            <Zap
              className={`w-6 h-6 ${difficulty === "hard" ? "text-red-500" : difficulty === "medium" ? "text-yellow-500" : "text-green-500"}`}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-foreground/70">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-6">{question.question}</h2>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !isSubmitted && setSelectedAnswer(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition ${
                    selectedAnswer === index
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  } ${isSubmitted && index === question.correctAnswer ? "border-green-500 bg-green-500/10" : ""} ${
                    isSubmitted && selectedAnswer === index && index !== question.correctAnswer
                      ? "border-red-500 bg-red-500/10"
                      : ""
                  } disabled:opacity-50`}
                  disabled={isSubmitted}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                        selectedAnswer === index ? "border-primary bg-primary text-primary-foreground" : "border-border"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {isSubmitted && (
            <div
              className={`p-4 rounded-lg ${selectedAnswer === question.correctAnswer ? "bg-green-500/10 border border-green-500" : "bg-red-500/10 border border-red-500"}`}
            >
              <p
                className={`font-semibold mb-2 ${selectedAnswer === question.correctAnswer ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
              >
                {selectedAnswer === question.correctAnswer ? "Correct!" : "Incorrect"}
              </p>
              <p className="text-sm text-foreground/80">{question.explanation}</p>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={selectedAnswer === null || isSubmitted} size="lg" className="w-full">
            {isSubmitted ? "Loading..." : "Submit Answer"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
