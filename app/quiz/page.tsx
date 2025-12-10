"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuizContainer } from "@/components/quiz-container"
import { QuizResults } from "@/components/quiz-results"
import { BookOpen, Zap, Loader2 } from "lucide-react"
import { getRandomQuestions, getQuestions } from "@/lib/firestore"
import { useAuth } from "@/lib/auth-context"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  difficulty: "easy" | "medium" | "hard"
  category: string
  explanation: string
}

type QuizState = "start" | "loading" | "quiz" | "results"

export default function QuizPage() {
  const { user } = useAuth()
  const [quizState, setQuizState] = useState<QuizState>("start")
  const [currentDifficulty, setCurrentDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([])
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])

  // Load available categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const allQuestions = await getQuestions()
        const categories = Array.from(new Set(allQuestions.map((q) => q.category)))
        setAvailableCategories(categories)
      } catch (error) {
        console.error('Error loading categories:', error)
        // Fallback to hardcoded categories if Firestore fails
        setAvailableCategories(['Math', 'Geography', 'Science', 'History', 'Literature', 'Programming'])
      }
    }

    loadCategories()
  }, [])

  const startQuiz = async (category?: string) => {
    setQuizState("loading")
    setSelectedCategory(category || null)

    try {
      // Get random questions from Firestore
      const questions = await getRandomQuestions(10, category, undefined)
      setQuizQuestions(questions)
      setCurrentQuestionIndex(0)
      setScore(0)
      setQuestionsAnswered(0)
      setUserAnswers([])
      setCurrentDifficulty("medium")
      setQuizState("quiz")
    } catch (error) {
      console.error('Error loading questions:', error)
      // Fallback to hardcoded questions if Firestore fails
      setQuizQuestions(getFallbackQuestions(category))
      setCurrentQuestionIndex(0)
      setScore(0)
      setQuestionsAnswered(0)
      setUserAnswers([])
      setCurrentDifficulty("medium")
      setQuizState("quiz")
    }
  }

  // Fallback questions in case Firestore fails
  const getFallbackQuestions = (category?: string): Question[] => {
    const fallbackQuestions: Question[] = [
      {
        id: "fallback-1",
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1,
        difficulty: "easy",
        category: "Math",
        explanation: "2 + 2 equals 4. This is basic arithmetic addition.",
      },
      {
        id: "fallback-2",
        question: "What is the capital of France?",
        options: ["London", "Paris", "Berlin", "Madrid"],
        correctAnswer: 1,
        difficulty: "easy",
        category: "Geography",
        explanation: "Paris is the capital and largest city of France.",
      },
      {
        id: "fallback-3",
        question: "Which planet is closest to the Sun?",
        options: ["Venus", "Mercury", "Earth", "Mars"],
        correctAnswer: 1,
        difficulty: "easy",
        category: "Science",
        explanation: "Mercury is the smallest and closest planet to the Sun in our solar system.",
      },
    ]

    return category ? fallbackQuestions.filter(q => q.category === category) : fallbackQuestions
  }

  const handleAnswer = (selectedIndex: number) => {
    const currentQuestion = quizQuestions[currentQuestionIndex]
    const isCorrect = selectedIndex === currentQuestion.correctAnswer

    // Update score
    if (isCorrect) {
      setScore(score + 1)
    }

    // Store answer
    setUserAnswers([...userAnswers, selectedIndex])

    // Adaptive difficulty adjustment
    const correctAnswers = isCorrect ? questionsAnswered + 1 : questionsAnswered
    const correctPercentage = ((correctAnswers + 1) / (questionsAnswered + 1)) * 100

    // Move to next question or results
    if (currentQuestionIndex < quizQuestions.length - 1) {
      // Adjust difficulty based on performance
      if (correctPercentage >= 80 && currentDifficulty !== "hard") {
        setCurrentDifficulty("hard")
      } else if (correctPercentage < 50 && currentDifficulty !== "easy") {
        setCurrentDifficulty("easy")
      }

      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setQuestionsAnswered(questionsAnswered + 1)
    } else {
      setQuestionsAnswered(questionsAnswered + 1)
      setQuizState("results")
    }
  }

  const retakeQuiz = () => {
    startQuiz(selectedCategory || undefined)
  }

  const backToHome = () => {
    setQuizState("start")
    setCurrentQuestionIndex(0)
    setScore(0)
    setQuestionsAnswered(0)
    setUserAnswers([])
  }

  if (quizState === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Loading quiz questions...</p>
        </div>
      </div>
    )
  }

  if (quizState === "start") {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold">Adaptive Quiz System</h1>
            <p className="text-foreground/60 mt-2">Questions difficulty adapts based on your performance</p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Start Quick Quiz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 mb-4">
                  Take a general knowledge quiz with adaptive difficulty. Questions get harder or easier based on your
                  answers.
                </p>
                <Button onClick={() => startQuiz()} className="w-full">
                  Start General Quiz
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li>• Start with medium difficulty questions</li>
                  <li>• Answer correctly to unlock harder questions</li>
                  <li>• Incorrect answers may lower difficulty</li>
                  <li>• Get detailed explanations after each quiz</li>
                  <li>• Track your progress and improvement</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Choose a Category</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {availableCategories.map((category) => (
                <Card
                  key={category}
                  className="hover:shadow-lg transition cursor-pointer"
                  onClick={() => startQuiz(category)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/70 mb-4">Questions available</p>
                    <Button className="w-full bg-transparent" variant="outline">
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (quizState === "results") {
    const percentage = Math.round((score / questionsAnswered) * 100)
    return (
      <QuizResults
        score={score}
        total={questionsAnswered}
        percentage={percentage}
        difficulty={currentDifficulty}
        category={selectedCategory}
        onRetake={retakeQuiz}
        onHome={backToHome}
        questions={quizQuestions}
        userAnswers={userAnswers}
      />
    )
  }

  const currentQuestion = quizQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading quiz...</p>
        </div>
      </div>
    )
  }

  return (
    <QuizContainer
      question={currentQuestion}
      questionNumber={currentQuestionIndex + 1}
      totalQuestions={quizQuestions.length}
      progress={progress}
      difficulty={currentDifficulty}
      onAnswer={handleAnswer}
      category={selectedCategory}
    />
  )
}
