"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, RotateCcw, Home } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { createQuizAttempt, updateUserProgress, updateUser, getUser } from "@/lib/firestore"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  difficulty: "easy" | "medium" | "hard"
  category: string
  explanation: string
}

interface QuizResultsProps {
  score: number
  total: number
  percentage: number
  difficulty: "easy" | "medium" | "hard"
  category: string | null
  onRetake: () => void
  onHome: () => void
  questions: Question[]
  userAnswers: (number | null)[]
}

export function QuizResults({
  score,
  total,
  percentage,
  difficulty,
  category,
  onRetake,
  onHome,
  questions,
  userAnswers,
}: QuizResultsProps) {
  const { user } = useAuth()

  useEffect(() => {
    const saveQuizResults = async () => {
      if (!user) return

      try {
        console.log('Starting to save quiz results...')

        // Calculate time spent (mock for now - in real app would track actual time)
        const timeSpent = Math.floor(Math.random() * 300) + 60 // 1-5 minutes

        console.log('Creating quiz attempt record...')

        // Create quiz attempt record
        await createQuizAttempt({
          userId: user.uid,
          quizId: `quiz-${Date.now()}`, // Generate unique quiz ID
          score: percentage,
          totalQuestions: total,
          answers: userAnswers.filter((answer): answer is number => answer !== null),
          timeSpent,
          completedAt: new Date(),
          category: category || "General",
          difficulty,
        })

        console.log('Quiz attempt created, updating user progress...')

        // Update user progress for the category
        if (category) {
          await updateUserProgress(user.uid, category, percentage, timeSpent)
        }

        // Also update progress for "General" category if no specific category
        if (!category) {
          await updateUserProgress(user.uid, "General", percentage, timeSpent)
        }

        console.log('User progress updated, updating user stats...')

        // Update user stats
        const pointsEarned = Math.floor(percentage / 10) // 1 point per 10% score

        // Get current user data first
        const currentUserData = await getUser(user.uid)
        if (currentUserData) {
          const newQuizzesTaken = currentUserData.quizzesTaken + 1
          const newAverageScore = Math.round(((currentUserData.averageScore * currentUserData.quizzesTaken) + percentage) / newQuizzesTaken)

          console.log('Updating user stats:', {
            oldPoints: currentUserData.totalPoints,
            newPoints: currentUserData.totalPoints + pointsEarned,
            oldQuizzes: currentUserData.quizzesTaken,
            newQuizzes: newQuizzesTaken,
            oldAverage: currentUserData.averageScore,
            newAverage: newAverageScore
          })

          await updateUser(user.uid, {
            totalPoints: currentUserData.totalPoints + pointsEarned,
            quizzesTaken: newQuizzesTaken,
            averageScore: newAverageScore,
          })
        }

        console.log('Quiz results saved successfully!')
      } catch (error) {
        console.error('Error saving quiz results:', error)
      }
    }

    saveQuizResults()
  }, [user, score, total, percentage, difficulty, category, userAnswers])
  const getResultMessage = () => {
    if (percentage >= 90) return "Outstanding! You're a quiz master!"
    if (percentage >= 80) return "Great job! You really know your stuff!"
    if (percentage >= 70) return "Good effort! Keep practicing!"
    if (percentage >= 60) return "Not bad! Try again to improve!"
    return "Keep learning! You'll improve with practice!"
  }

  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400"
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-accent" />
            <CardTitle className="text-3xl mb-4">Quiz Complete!</CardTitle>
            <div className={`text-5xl font-bold mb-2 ${getScoreColor()}`}>{percentage}%</div>
            <p className="text-lg text-foreground/70">{getResultMessage()}</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-center mb-6">
              <div>
                <p className="text-2xl font-bold text-primary">{score}</p>
                <p className="text-sm text-foreground/60">Correct Answers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{total - score}</p>
                <p className="text-sm text-foreground/60">Incorrect Answers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">{total}</p>
                <p className="text-sm text-foreground/60">Total Questions</p>
              </div>
              <div>
                <Badge className="text-base">{difficulty.toUpperCase()}</Badge>
                <p className="text-sm text-foreground/60 mt-2">Final Level</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={onRetake} size="lg">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
              <Button onClick={onHome} size="lg" variant="outline" asChild>
                <Link href="/dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Review Answers */}
        <Card>
          <CardHeader>
            <CardTitle>Review Your Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {questions.map((question, index) => {
                const userAnswer = userAnswers[index]
                const isCorrect = userAnswer === question.correctAnswer
                return (
                  <div
                    key={question.id}
                    className={`p-4 rounded-lg border-2 ${isCorrect ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${isCorrect ? "bg-green-500" : "bg-red-500"}`}
                      >
                        {isCorrect ? "✓" : "✗"}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{question.question}</p>
                        <p className="text-sm text-foreground/70 mt-2">
                          Your answer: <span className="font-medium">{question.options[userAnswer!]}</span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            Correct answer:{" "}
                            <span className="font-medium">{question.options[question.correctAnswer]}</span>
                          </p>
                        )}
                        <p className="text-sm text-foreground/70 mt-2 italic">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
