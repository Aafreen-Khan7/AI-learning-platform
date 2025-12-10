"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, TrendingUp, Users, BookOpen } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User is authenticated, staying on landing page')
      } else {
        console.log('User is not authenticated, showing landing page')
      }
    })

    return () => unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-primary">LearnAI</div>
            <div className="flex gap-4 items-center">
              {user ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/quiz">Quiz</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/leaderboard">Leaderboard</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth">Get Started</Link>
                  </Button>
                  <Link href="/profile">
                    <Avatar className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || user.email || ""} />
                      <AvatarFallback>
                        {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/auth">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Master Any Subject with AI
          </h1>
          <p className="text-xl text-foreground/70 mb-8 max-w-3xl mx-auto">
            Experience personalized learning powered by artificial intelligence. Take adaptive quizzes,
            track your progress, and compete with learners worldwide.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth">Start Learning Today</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/leaderboard">View Leaderboard</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Brain className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>AI-Powered Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get personalized recommendations and explanations tailored to your learning style.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <CardTitle>Adaptive Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Questions adjust to your skill level, ensuring optimal challenge and learning.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-accent" />
              <CardTitle>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor your improvement with detailed analytics and achievement badges.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Global Community</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Compete with learners worldwide and climb the global leaderboard.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-foreground/70">Active Learners</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary mb-2">50,000+</div>
                <div className="text-foreground/70">Quizzes Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">25+</div>
                <div className="text-foreground/70">Subject Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">95%</div>
                <div className="text-foreground/70">Satisfaction Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-foreground/60">
            <p>&copy; 2024 LearnAI. Empowering learners worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
