"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, Lightbulb, BookOpen, Zap } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

const suggestedQuestions = [
  "How do I improve my math scores?",
  "What topics should I study next?",
  "Explain quantum mechanics in simple terms",
  "Give me tips for maintaining my learning streak",
]

const recommendedCourses = [
  {
    id: 1,
    title: "Calculus Mastery",
    category: "Mathematics",
    difficulty: "Advanced",
    reason: "Perfect for your math interest",
    progress: 0,
  },
  {
    id: 2,
    title: "Physics Foundations",
    category: "Science",
    difficulty: "Intermediate",
    reason: "Build on your science knowledge",
    progress: 0,
  },
  {
    id: 3,
    title: "World History Deep Dive",
    category: "History",
    difficulty: "Intermediate",
    reason: "Aligns with your favorite category",
    progress: 0,
  },
]

import { useAuth } from "@/lib/auth-context"
import { getUser, getUserAttempts } from "@/lib/firestore"

// Dynamic AI responses using server-side API
const getAIResponse = async (userMessage: string, user: any, attempts: any[]): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        user,
        attempts
      })
    })

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    return data.response
  } catch (error) {
    console.error('API error:', error)
    // Fallback to static response
    return getStaticResponse(userMessage, user, attempts)
  }
}

// Static response function as fallback
const getStaticResponse = (userMessage: string, user: any, attempts: any[]): string => {
  const lowerMessage = userMessage.toLowerCase()

  // Personalized greeting based on user data
  const totalQuizzes = user?.quizzesTaken || 0
  const averageScore = user?.averageScore || 0
  const currentStreak = user?.streak || 0

  if (totalQuizzes === 0) {
    return `Welcome to your learning journey! I'm here to help you succeed. You haven't taken any quizzes yet - would you like to start with a general knowledge quiz to get familiar with the platform?`
  }

  // Analyze user's performance by category for dynamic recommendations
  const categoryPerformance: Record<string, { total: number; count: number; recent: number[] }> = {}
  const recentAttempts = attempts.slice(0, 5) // Last 5 attempts

  attempts.forEach(attempt => {
    if (!categoryPerformance[attempt.category]) {
      categoryPerformance[attempt.category] = { total: 0, count: 0, recent: [] }
    }
    categoryPerformance[attempt.category].total += attempt.score
    categoryPerformance[attempt.category].count += 1
    if (recentAttempts.includes(attempt)) {
      categoryPerformance[attempt.category].recent.push(attempt.score)
    }
  })

  // Dynamic responses based on real user data
  if (lowerMessage.includes("improve") && lowerMessage.includes("math")) {
    // Check if user has math attempts
    const mathAttempts = attempts.filter(a => a.category.toLowerCase().includes('math'))
    const mathAverage = mathAttempts.length > 0 ?
      mathAttempts.reduce((sum, a) => sum + a.score, 0) / mathAttempts.length : averageScore

    return `To improve your math scores, I recommend:\n\n1. **Focus on fundamentals** - Review basic concepts before moving to advanced topics\n2. **Practice regularly** - Solve 5-10 problems daily\n3. **Understand, don't memorize** - Make sure you understand the 'why' behind each formula\n4. **Use our adaptive quizzes** - They adjust to your level automatically\n\nBased on your ${totalQuizzes} quizzes with ${Math.round(mathAverage)}% math average, you're doing great! Would you like me to recommend specific math topics to focus on?`
  }

  if (lowerMessage.includes("what topics") || lowerMessage.includes("study next")) {
    // Find weak categories based on real performance data
    const weakCategories = Object.entries(categoryPerformance)
      .map(([category, data]) => ({
        category,
        average: data.total / data.count,
        attempts: data.count,
        recentAvg: data.recent.length > 0 ? data.recent.reduce((a,b) => a+b, 0) / data.recent.length : 0
      }))
      .filter(item => item.average < 70 || item.recentAvg < 70)
      .sort((a, b) => (a.recentAvg || a.average) - (b.recentAvg || b.average))

    if (weakCategories.length > 0) {
      const topWeak = weakCategories[0]
      const recentScore = topWeak.recentAvg > 0 ? Math.round(topWeak.recentAvg) : Math.round(topWeak.average)
      return `Based on your recent performance (${totalQuizzes} quizzes, ${averageScore}% average), I recommend studying these topics next:\n\n1. **${topWeak.category}** - Your recent average is ${recentScore}% (${topWeak.attempts} attempts). Focus here first!\n2. **Practice regularly** - Take daily quizzes to improve\n3. **Review explanations** - Pay attention to the detailed explanations after each quiz\n\nWould you like to start a quiz in ${topWeak.category}?`
    }

    // Find categories with potential for improvement
    const improvableCategories = Object.entries(categoryPerformance)
      .map(([category, data]) => ({
        category,
        average: data.total / data.count,
        attempts: data.count
      }))
      .filter(item => item.average >= 70 && item.average < 85)
      .sort((a, b) => a.average - b.average)

    if (improvableCategories.length > 0) {
      return `Based on your strong performance (${totalQuizzes} quizzes, ${averageScore}% average), I recommend:\n\n1. **Challenge yourself in ${improvableCategories[0].category}** - Your ${Math.round(improvableCategories[0].average)}% average shows room for growth!\n2. **Try harder difficulty levels** - Push your boundaries\n3. **Explore new categories** - Branch out to subjects you haven't tried\n4. **Maintain consistency** - Keep your ${currentStreak}-day streak going!\n\nWhat category interests you most?`
    }

    return `Based on your excellent performance (${totalQuizzes} quizzes, ${averageScore}% average), I recommend:\n\n1. **Challenge yourself** - Try expert-level quizzes\n2. **Explore new categories** - Branch out to subjects you haven't tried\n3. **Maintain consistency** - Keep your ${currentStreak}-day streak going!\n4. **Help others** - Consider mentoring or teaching concepts you know well\n\nWhat would you like to focus on next?`
  }

  if (lowerMessage.includes("quantum") || lowerMessage.includes("physics")) {
    return `**Quantum Mechanics Explained Simply:**\n\nQuantum mechanics is the science of the very small - atoms and subatomic particles. Here are key concepts:\n\n- **Superposition** - Particles can exist in multiple states simultaneously until observed\n- **Entanglement** - Particles can be mysteriously connected across distances\n- **Wave-particle duality** - Things can behave like both waves and particles\n\nIt's counterintuitive but amazing! With your ${averageScore}% average across ${totalQuizzes} quizzes, you're well-prepared to explore this further with our quantum mechanics course?`
  }

  if (lowerMessage.includes("streak")) {
    // Analyze streak patterns from recent attempts
    const recentDates = attempts.slice(0, 10).map(a => new Date(a.completedAt.seconds * 1000).toDateString())
    const uniqueDates = [...new Set(recentDates)]
    const actualStreak = uniqueDates.length

    return `Great question! Here are tips to maintain your learning streak:\n\n1. **Set a daily goal** - Even 15-20 minutes counts\n2. **Schedule learning time** - Make it part of your routine\n3. **Start with easier quizzes** - Build momentum gradually\n4. **Take a break if needed** - Rest is part of learning\n5. **Share your goal** - Tell friends about your streak for motivation\n\nYou're currently on a ${actualStreak}-day streak${actualStreak > 0 ? ' - keep it up!' : ' - start today!'}`
  }

  if (lowerMessage.includes("how am i doing") || lowerMessage.includes("my progress")) {
    // Calculate detailed progress metrics
    const recentScores = attempts.slice(0, 5).map(a => a.score)
    const recentAverage = recentScores.length > 0 ? recentScores.reduce((a,b) => a+b, 0) / recentScores.length : 0
    const improvement = recentAverage > averageScore ? 'improving' : recentAverage < averageScore ? 'needs attention' : 'steady'

    let progressAnalysis = ''
    if (averageScore >= 85) {
      progressAnalysis = 'Outstanding! You\'re performing at an expert level.'
    } else if (averageScore >= 75) {
      progressAnalysis = 'Excellent work! You\'re performing at a high level.'
    } else if (averageScore >= 60) {
      progressAnalysis = 'Good progress! Keep practicing to reach the next level.'
    } else {
      progressAnalysis = 'You\'re on the right track! Focus on understanding concepts and regular practice.'
    }

    return `Let's review your progress! 📊\n\n**Your Stats:**\n- Total Quizzes: ${totalQuizzes}\n- Average Score: ${averageScore}%\n- Recent Performance: ${Math.round(recentAverage)}% (last 5 quizzes)\n- Current Streak: ${currentStreak} days\n- Total Points: ${user?.totalPoints || 0}\n\n**Performance Analysis:**\n${progressAnalysis}\n\n**Trend:** Your recent scores are ${improvement} compared to your overall average.\n\nWould you like specific recommendations for improvement?`
  }

  // Dynamic help response based on user data
  const helpTopics = []
  if (totalQuizzes < 5) {
    helpTopics.push('getting started with quizzes')
  }
  if (averageScore < 70) {
    helpTopics.push('improving your scores')
  }
  if (currentStreak < 3) {
    helpTopics.push('building a learning streak')
  }
  if (Object.keys(categoryPerformance).length < 3) {
    helpTopics.push('exploring new subjects')
  }

  const helpText = helpTopics.length > 0 ?
    `Based on your progress, I can help with: ${helpTopics.join(', ')}.` :
    'I can help with study recommendations, explanations, and learning strategies.'

  return `That's a great question! I'm here to help you succeed. ${helpText}\n\nHere's what I can assist with:\n\n- **Study recommendations** based on your performance (${totalQuizzes} quizzes completed, ${averageScore}% average)\n- **Explanations** of difficult concepts\n- **Tips** for improving your scores\n- **Course suggestions** tailored to your interests\n- **Learning strategies** to optimize your study time\n\nWhat would you like help with today?`
}


export default function ChatPage() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [userAttempts, setUserAttempts] = useState<any[]>([])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hello! I'm your AI learning tutor. I can help you with explanations, study tips, course recommendations, and learning strategies. What would you like help with today?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load user data and attempts
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return

      try {
        const [userInfo, attempts] = await Promise.all([
          getUser(user.uid),
          getUserAttempts(user.uid, 20)
        ])
        setUserData(userInfo)
        setUserAttempts(attempts)
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }

    loadUserData()
  }, [user])

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 0)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputValue.trim()

    if (!messageToSend) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageToSend,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Get AI response using real user data
      const aiResponseContent = await getAIResponse(messageToSend, userData, userAttempts)

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: aiResponseContent,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold">AI Learning Tutor</h1>
          <p className="text-foreground/60 mt-2">Get personalized help, recommendations, and explanations</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="flex flex-col h-[600px]">
              <CardHeader className="border-b">
                <CardTitle>Tutor Chat</CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1 overflow-y-auto">
                <CardContent className="p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                          message.type === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground border border-border"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${message.type === "user" ? "text-primary-foreground/70" : "text-foreground/50"}`}
                        >
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-4 rounded-lg border border-border">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </CardContent>
              </ScrollArea>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                  />
                  <Button onClick={() => handleSendMessage()} disabled={isLoading || !inputValue.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Suggested Questions */}
            {messages.length === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Suggested Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(question)}
                        className="p-3 text-left text-sm rounded-lg border border-border hover:bg-muted hover:border-primary transition"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recommendations Sidebar */}
          <div className="space-y-6">
            {/* Recommended Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Recommended Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-3 rounded-lg border border-border hover:bg-muted/50 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm">{course.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {course.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground/60 mb-2">{course.category}</p>
                    <p className="text-xs text-accent font-medium">{course.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Learning Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-primary">Today's Challenge</p>
                  <p className="text-xs text-foreground/70 mt-1">Complete 3 quizzes in different categories</p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-secondary">Learning Tip</p>
                  <p className="text-xs text-foreground/70 mt-1">
                    Study for 25 minutes then take a 5-minute break (Pomodoro)
                  </p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-accent">Motivation</p>
                  <p className="text-xs text-foreground/70 mt-1">
                    You're 28 days strong! Your consistency is paying off
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
