"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { createUser, getUser } from "@/lib/firestore"

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"student" | "admin">("student")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!email || !password) {
        setError("Please fill in all fields")
        return
      }
      if (isSignUp && !name) {
        setError("Please enter your name")
        return
      }

      if (isSignUp) {
        // Create new user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Create user document in Firestore
        await createUser({
          uid: user.uid,
          email: user.email!,
          name: name,
          role: role,
          totalPoints: 0,
          level: 1,
          streak: 0,
          quizzesTaken: 0,
          averageScore: 0,
          favoriteCategories: [],
          achievements: []
        })

        // Redirect based on role
        if (role === "admin") {
          router.push("/admin")
        } else {
          router.push("/")
        }
      } else {
        // Sign in existing user
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Check if user document exists in Firestore, create if not
        const existingUser = await getUser(user.uid)
        if (!existingUser) {
          await createUser({
            uid: user.uid,
            email: user.email!,
            name: user.email!.split('@')[0], // Use email prefix as name for existing users
            role: "student", // Default to student for existing users
            totalPoints: 0,
            level: 1,
            streak: 0,
            quizzesTaken: 0,
            averageScore: 0,
            favoriteCategories: [],
            achievements: []
          })
        }

        // Redirect based on role
        const userData = existingUser || await getUser(user.uid)
        if (userData?.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/")
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err)

      // Handle Firebase auth errors with user-friendly messages
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists")
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters")
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address")
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email")
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password")
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later")
      } else {
        setError(err.message || "Authentication failed")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex justify-center mb-8">
          <div className="text-3xl font-bold text-primary">LearnAI</div>
        </Link>

        <Card className="border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
            <CardDescription>
              {isSignUp ? "Start your AI-powered learning journey" : "Sign in to your learning dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {isSignUp && (
                <>
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">I am a</Label>
                    <Select value={role} onValueChange={(value: "student" | "admin") => setRole(value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-foreground/60 text-sm">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setError("")
                    setRole("student") // Reset role when switching modes
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-foreground/60 text-sm mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
