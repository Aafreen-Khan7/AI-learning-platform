"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Trophy, Medal, Star, TrendingUp, Search, Lock } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { getLeaderboard, getUser } from "@/lib/firestore"
import { User } from "@/lib/firestore"

interface LeaderboardUser {
  rank: number
  name: string
  points: number
  streak: number
  quizzesTaken: number
  averageScore: number
  avatar: string
}

const leaderboardData: LeaderboardUser[] = [
  { rank: 1, name: "Alex Chen", points: 5420, streak: 45, quizzesTaken: 120, averageScore: 91, avatar: "AC" },
  { rank: 2, name: "Sarah Johnson", points: 4850, streak: 28, quizzesTaken: 98, averageScore: 88, avatar: "SJ" },
  { rank: 3, name: "Mike Williams", points: 4620, streak: 35, quizzesTaken: 112, averageScore: 85, avatar: "MW" },
  { rank: 4, name: "Emma Davis", points: 4390, streak: 22, quizzesTaken: 85, averageScore: 87, avatar: "ED" },
  { rank: 5, name: "James Brown", points: 4150, streak: 18, quizzesTaken: 75, averageScore: 82, avatar: "JB" },
  { rank: 6, name: "Lisa Martinez", points: 3890, streak: 14, quizzesTaken: 68, averageScore: 80, avatar: "LM" },
  { rank: 7, name: "David Wilson", points: 3650, streak: 10, quizzesTaken: 55, averageScore: 78, avatar: "DW" },
  { rank: 8, name: "Rachel Garcia", points: 3420, streak: 8, quizzesTaken: 50, averageScore: 76, avatar: "RG" },
  { rank: 9, name: "Tom Anderson", points: 3180, streak: 5, quizzesTaken: 42, averageScore: 74, avatar: "TA" },
  { rank: 10, name: "Jessica Lee", points: 2950, streak: 3, quizzesTaken: 38, averageScore: 72, avatar: "JL" },
]

const allBadges = [
  {
    id: "1",
    name: "Quiz Master",
    description: "Complete 50 quizzes",
    icon: "🎓",
    requirement: "50 quizzes",
    earned: true,
    earnedDate: "2025-01-15",
  },
  {
    id: "2",
    name: "Perfect Score",
    description: "Score 100% on any quiz",
    icon: "💯",
    requirement: "100% accuracy",
    earned: true,
    earnedDate: "2025-01-10",
  },
  {
    id: "3",
    name: "Streak Warrior",
    description: "Maintain a 30-day learning streak",
    icon: "🔥",
    requirement: "30-day streak",
    earned: false,
  },
  {
    id: "4",
    name: "Rising Star",
    description: "Reach top 100 learners",
    icon: "⭐",
    requirement: "Top 100 rank",
    earned: true,
    earnedDate: "2025-01-05",
  },
  {
    id: "5",
    name: "Speed Learner",
    description: "Complete 5 quizzes in one day",
    icon: "⚡",
    requirement: "5 daily quizzes",
    earned: false,
  },
  {
    id: "6",
    name: "Category Master",
    description: "Achieve 90%+ in all categories",
    icon: "🏆",
    requirement: "90% all categories",
    earned: false,
  },
  {
    id: "7",
    name: "First Step",
    description: "Complete your first quiz",
    icon: "👣",
    requirement: "1 quiz",
    earned: true,
    earnedDate: "2024-12-01",
  },
  {
    id: "8",
    name: "Knowledge Seeker",
    description: "Take 100 quizzes",
    icon: "📚",
    requirement: "100 quizzes",
    earned: false,
  },
]

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [leaderboardData, setLeaderboardData] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const leaderboard = await getLeaderboard(50)
        setLeaderboardData(leaderboard)

        if (user) {
          const userData = await getUser(user.uid)
          setCurrentUser(userData)
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [user])

  const filteredLeaderboard = leaderboardData.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />
    return <div className="w-5 h-5 text-center text-sm font-bold text-foreground/60">{rank}</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold">Leaderboard & Achievements</h1>
          <p className="text-foreground/60 mt-2">Compete globally and earn badges for your accomplishments</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full md:w-fit md:grid-cols-3">
            <TabsTrigger value="leaderboard">Global Rankings</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>

          {/* Global Leaderboard */}
          <TabsContent value="leaderboard" className="space-y-6 mt-6">
            {loading ? (
              <div className="text-center py-8">Loading leaderboard...</div>
            ) : (
              <>
                {/* Current User Card */}
                {currentUser && (
                  <Card className="border-primary/50 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-sm">Your Rank</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-5 gap-4">
                        <div className="text-center">
                          <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
                          <p className="text-2xl font-bold">#{leaderboardData.findIndex(u => u.uid === currentUser.uid) + 1}</p>
                          <p className="text-xs text-foreground/60">Position</p>
                        </div>
                        <div className="text-center">
                          <Star className="w-8 h-8 mx-auto mb-2 text-accent" />
                          <p className="text-2xl font-bold">{currentUser.totalPoints}</p>
                          <p className="text-xs text-foreground/60">Total Points</p>
                        </div>
                        <div className="text-center">
                          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-secondary" />
                          <p className="text-2xl font-bold">{currentUser.streak}</p>
                          <p className="text-xs text-foreground/60">Day Streak</p>
                        </div>
                        <div className="text-center">
                          <Medal className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                          <p className="text-2xl font-bold">{currentUser.averageScore}%</p>
                          <p className="text-xs text-foreground/60">Avg Score</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{currentUser.quizzesTaken}</p>
                          <p className="text-xs text-foreground/60">Quizzes</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

            {/* Search and Filter */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
                <Input
                  placeholder="Search learners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

                {/* Leaderboard Table */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/70">Rank</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground/70">Name</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-foreground/70">Points</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-foreground/70">Streak</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-foreground/70">Avg Score</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-foreground/70">Quizzes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLeaderboard.map((user, index) => (
                            <tr
                              key={user.uid}
                              className={`border-b hover:bg-muted/50 transition ${user.uid === currentUser?.uid ? "bg-primary/5" : ""}`}
                            >
                              <td className="px-6 py-4 text-sm">
                                <div className="flex items-center gap-2">
                                  {getRankIcon(index + 1)}
                                  <span className="font-semibold">{index + 1}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </div>
                                  <span className="font-medium">{user.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-right font-semibold">{user.totalPoints}</td>
                              <td className="px-6 py-4 text-sm text-right">
                                <span className="text-secondary">{user.streak}</span>
                                <span className="text-foreground/50"> days</span>
                              </td>
                              <td className="px-6 py-4 text-sm text-right">{user.averageScore}%</td>
                              <td className="px-6 py-4 text-sm text-right text-foreground/70">{user.quizzesTaken}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Friends Leaderboard */}
          <TabsContent value="friends" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Friends Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/60 mb-4">
                  Connect with friends to see how you rank against each other. Add friends to get started!
                </p>
                <Button asChild>
                  <Link href="/profile">Manage Friends</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6 mt-6">
            {currentUser ? (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Earned Badges */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Earned Badges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {allBadges
                        .filter((badge) => badge.earned)
                        .map((badge) => (
                          <div key={badge.id} className="text-center p-4 rounded-lg bg-accent/10 border border-accent/30">
                            <div className="text-4xl mb-2">{badge.icon}</div>
                            <h3 className="font-semibold text-sm mb-1">{badge.name}</h3>
                            <p className="text-xs text-foreground/60 mb-2">{badge.description}</p>
                            <p className="text-xs text-accent font-medium">{badge.earnedDate}</p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Locked Badges */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Locked Badges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {allBadges
                        .filter((badge) => !badge.earned)
                        .map((badge) => (
                          <div
                            key={badge.id}
                            className="text-center p-4 rounded-lg bg-muted border border-border opacity-50"
                          >
                            <div className="text-4xl mb-2 filter grayscale">{badge.icon}</div>
                            <h3 className="font-semibold text-sm mb-1">{badge.name}</h3>
                            <p className="text-xs text-foreground/60 mb-2">{badge.description}</p>
                            <p className="text-xs text-foreground/50 font-medium">Unlock: {badge.requirement}</p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-foreground/60">Please sign in to view your badges</p>
                </CardContent>
              </Card>
            )}

            {/* Badge Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Your Badge Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-accent">{allBadges.filter((b) => b.earned).length}</p>
                    <p className="text-sm text-foreground/60">Badges Earned</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">{allBadges.filter((b) => !b.earned).length}</p>
                    <p className="text-sm text-foreground/60">Badges Locked</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-secondary">
                      {Math.round((allBadges.filter((b) => b.earned).length / allBadges.length) * 100)}%
                    </p>
                    <p className="text-sm text-foreground/60">Completion</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-orange-600">{allBadges.length}</p>
                    <p className="text-sm text-foreground/60">Total Badges</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
