"use client"
import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/progress-bar"
import { Brain, TrendingUp, BookOpen, Clock, Award } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { getUser, getUserAttempts, getUserProgress } from "@/lib/firestore"
import { User, QuizAttempt, UserProgress } from "@/lib/firestore"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<User | null>(null)
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        const [userInfo, attempts, progress] = await Promise.all([
          getUser(user.uid),
          getUserAttempts(user.uid, 10),
          getUserProgress(user.uid)
        ])

        setUserData(userInfo)
        setRecentAttempts(attempts)
        setUserProgress(progress)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Please log in to view your dashboard.</p>
          <Button asChild className="mt-4">
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Calculate progress data for charts
  const progressData = recentAttempts
    .slice()
    .reverse()
    .map((attempt, index) => ({
      week: `Week ${index + 1}`,
      score: attempt.score as number
    }))

  // Calculate category distribution
  const categoryStats = userProgress.reduce((acc, progress) => {
    acc[progress.category] = {
      value: progress.averageScore as number,
      count: progress.totalQuizzes as number
    }
    return acc
  }, {} as Record<string, { value: number; count: number }>)

  const categoryData = Object.entries(categoryStats).map(([name, data]) => ({
    name,
    value: data.value,
    quizzes: data.count
  }))

  // Recent activities from attempts
  const recentActivities = recentAttempts.slice(0, 4).map((attempt, index) => ({
    id: `${attempt.id}_${index}`,
    type: "quiz" as const,
    title: `${attempt.category} Quiz`,
    score: attempt.score as number,
    date: attempt.completedAt.toLocaleDateString()
  }))

  // Recommended courses based on progress
  const recommendedCourses = userProgress
    .filter(progress => (progress.averageScore as number) < 75)
    .slice(0, 3)
    .map(progress => ({
      id: `${progress.userId}_${progress.category}`,
      title: `${progress.category} Mastery`,
      category: progress.category,
      difficulty: (progress.averageScore as number) < 50 ? "Beginner" : (progress.averageScore as number) < 70 ? "Intermediate" : "Advanced",
      progress: Math.round(progress.averageScore as number)
    }))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {userData.name}!</h1>
              <p className="text-foreground/60 mt-2">Here's your learning summary for today</p>
            </div>
            <Button onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70">Total Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold">{userData.totalPoints.toLocaleString()}</div>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs text-foreground/50 mt-2">+{recentAttempts.length > 0 ? (recentAttempts[0].score as number) : 0} this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70">Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold">{userData.streak} days</div>
                <Award className="w-5 h-5 text-secondary" />
              </div>
              <p className="text-xs text-foreground/50 mt-2">Keep it going!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold">{userData.averageScore}%</div>
                <Brain className="w-5 h-5 text-accent" />
              </div>
              <p className="text-xs text-foreground/50 mt-2">Across {userData.quizzesTaken} quizzes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70">Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold">{userData.level}</div>
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs text-foreground/50 mt-2">Next level at {userData.level * 1000} points</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {progressData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                      name="Quiz Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-foreground/60">
                  Complete some quizzes to see your progress chart
                </div>
              )}
            </CardContent>
          </Card>

          {/* Learning Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Learning by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${Math.round(value)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-foreground/60">
                  Take quizzes in different categories to see your distribution
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommended Courses */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recommended for You</span>
                <BookOpen className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendedCourses.length > 0 ? (
                <div className="space-y-4">
                  {recommendedCourses.map((course) => (
                    <div key={course.id} className="p-4 border rounded-lg hover:bg-muted/50 transition">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{course.title}</h3>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {course.category}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {course.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-foreground/70">
                          <span>Current Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <ProgressBar value={course.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-foreground/60">
                  Great job! You're performing well across all categories.
                </div>
              )}
              <Button className="w-full mt-4 bg-transparent" variant="outline" asChild>
                <Link href="/quiz">Take More Quizzes</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Activity</span>
                <Clock className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="pb-4 border-b last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{activity.title}</h4>
                          <p className="text-xs text-foreground/60">
                            Score: {activity.score as number}%
                          </p>
                          <p className="text-xs text-foreground/50 mt-1">{activity.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-foreground/60">
                  No recent activity. Start taking quizzes to see your progress!
                </div>
              )}
              <Button className="w-full mt-4 bg-transparent" variant="outline" asChild>
                <Link href="/activity">View All Activity</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-auto flex-col py-4 bg-transparent">
                <Link href="/quiz">
                  <Brain className="w-6 h-6 mb-2" />
                  <span>Take Quiz</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto flex-col py-4 bg-transparent">
                <Link href="/profile">
                  <Award className="w-6 h-6 mb-2" />
                  <span>View Badges</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto flex-col py-4 bg-transparent">
                <Link href="/leaderboard">
                  <TrendingUp className="w-6 h-6 mb-2" />
                  <span>Leaderboard</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto flex-col py-4 bg-transparent">
                <Link href="/chat">
                  <BookOpen className="w-6 h-6 mb-2" />
                  <span>AI Tutor</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
