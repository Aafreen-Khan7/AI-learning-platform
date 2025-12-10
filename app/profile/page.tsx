"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, MapPin, Trophy, Edit2, Save, X } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { getUser, getUserProgress } from "@/lib/firestore"
import { User, UserProgress } from "@/lib/firestore"

interface UserProfile {
  name: string
  email: string
  bio: string
  joinDate: string
  location: string
  avatar: string
  totalPoints: number
  level: number
  streak: number
  quizzesTaken: number
  averageScore: number
  favoriteCategories: string[]
  achievements: number
}

interface Friend {
  id: string
  name: string
  points: number
  rank: number
  status: "accepted" | "pending" | "blocked"
}

const defaultUserProfile: UserProfile = {
  name: "Loading...",
  email: "",
  bio: "",
  joinDate: "",
  location: "",
  avatar: "",
  totalPoints: 0,
  level: 0,
  streak: 0,
  quizzesTaken: 0,
  averageScore: 0,
  favoriteCategories: [],
  achievements: 0,
}

const friendsList: Friend[] = [
  { id: "1", name: "Alex Chen", points: 5420, rank: 1, status: "accepted" },
  { id: "2", name: "Mike Williams", points: 4620, rank: 3, status: "accepted" },
  { id: "3", name: "Emma Davis", points: 4390, rank: 4, status: "pending" },
  { id: "4", name: "James Brown", points: 4150, rank: 5, status: "accepted" },
]

const defaultLearningStats = [
  { category: "Mathematics", timeSpent: "0 hours", quizzes: 0, averageScore: 0 },
  { category: "Science", timeSpent: "0 hours", quizzes: 0, averageScore: 0 },
  { category: "History", timeSpent: "0 hours", quizzes: 0, averageScore: 0 },
  { category: "Language", timeSpent: "0 hours", quizzes: 0, averageScore: 0 },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile)
  const [learningStats, setLearningStats] = useState(defaultLearningStats)
  const [editedProfile, setEditedProfile] = useState(userProfile)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const userData = await getUser(user.uid)
        if (userData) {
          const profile: UserProfile = {
            name: userData.name,
            email: userData.email,
            bio: userData.bio || "",
            joinDate: userData.createdAt ? userData.createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown',
            location: userData.location || "",
            avatar: userData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
            totalPoints: userData.totalPoints,
            level: userData.level,
            streak: userData.streak,
            quizzesTaken: userData.quizzesTaken,
            averageScore: userData.averageScore,
            favoriteCategories: userData.favoriteCategories,
            achievements: userData.achievements.length,
          }
          setUserProfile(profile)
          setEditedProfile(profile)
        }

        // Fetch user progress for learning stats
        const progress = await getUserProgress(user.uid)
        if (progress.length > 0) {
          const stats = progress.map(p => ({
            category: p.category,
            timeSpent: `${Math.floor((p.timeSpent || 0) / 3600)} hours`,
            quizzes: p.totalQuizzes || 0,
            averageScore: Math.round(p.averageScore),
          }))
          setLearningStats(stats)
        } else {
          // If no progress data, show default stats
          setLearningStats(defaultLearningStats)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  const handleSave = () => {
    setIsEditing(false)
    // In a real app, this would save to a database
  }

  const handleCancel = () => {
    setEditedProfile(userProfile)
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-foreground/60 mt-2">Manage your account and view your learning journey</p>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-8">Loading profile...</div>
        ) : !user ? (
          <Card className="mb-8">
            <CardContent className="text-center py-8">
              <p className="text-foreground/60">Please sign in to view your profile</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Profile Header */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                  <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                    {userProfile.avatar}
                  </div>

              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <>
                    <Input
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      placeholder="Full Name"
                      className="text-2xl font-bold"
                    />
                    <Input
                      value={editedProfile.location}
                      onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                      placeholder="Location"
                    />
                    <Textarea
                      value={editedProfile.bio}
                      onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                      placeholder="Bio"
                      rows={3}
                    />
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                    <div className="flex gap-4 text-foreground/70">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{userProfile.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {userProfile.joinDate}</span>
                      </div>
                    </div>
                    <p className="text-foreground/80">{userProfile.bio}</p>
                  </>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Trophy className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">{userProfile.level}</p>
                  <p className="text-xs text-foreground/60">Level</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-primary">{userProfile.totalPoints}</p>
                  <p className="text-xs text-foreground/60">Points</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full md:w-fit md:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Current Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-secondary mb-2">{userProfile.streak} days</div>
                  <p className="text-xs text-foreground/60">Keep going! You're on fire</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Quizzes Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent mb-2">{userProfile.quizzesTaken}</div>
                  <p className="text-xs text-foreground/60">Average score: {userProfile.averageScore}%</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">{userProfile.achievements}</div>
                  <p className="text-xs text-foreground/60">Badges earned</p>
                </CardContent>
              </Card>
            </div>

            {/* Favorite Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Favorite Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {userProfile.favoriteCategories.map((category) => (
                    <Badge key={category} variant="secondary" className="px-3 py-1 text-sm">
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Completed Advanced Math Quiz</p>
                      <p className="text-xs text-foreground/60">Today at 2:30 PM - Score: 95%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Achieved 30-Day Streak Badge</p>
                      <p className="text-xs text-foreground/60">Yesterday at 5:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Reached Level 15</p>
                      <p className="text-xs text-foreground/60">2 days ago - 1000 points earned</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningStats.map((stat) => (
                    <div key={stat.category} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold">{stat.category}</h3>
                        <Badge variant="outline">{stat.averageScore}%</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-foreground/60">Time Spent</p>
                          <p className="font-semibold">{stat.timeSpent}</p>
                        </div>
                        <div>
                          <p className="text-foreground/60">Quizzes</p>
                          <p className="font-semibold">{stat.quizzes}</p>
                        </div>
                        <div>
                          <p className="text-foreground/60">Avg Score</p>
                          <p className="font-semibold">{stat.averageScore}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Complete 150 quizzes</span>
                      <span className="text-sm text-foreground/60">65%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "65%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Reach 5000 points</span>
                      <span className="text-sm text-foreground/60">97%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: "97%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Maintain 60-day streak</span>
                      <span className="text-sm text-foreground/60">47%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: "47%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>My Friends ({friendsList.filter((f) => f.status === "accepted").length})</span>
                  <Button asChild size="sm">
                    <Link href="#">Add Friend</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {friendsList.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {friend.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-semibold">{friend.name}</p>
                          <p className="text-sm text-foreground/60">
                            Rank #{friend.rank} • {friend.points} points
                          </p>
                        </div>
                      </div>
                      <div>
                        {friend.status === "accepted" ? (
                          <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Friends</Badge>
                        ) : (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Accept
                            </Button>
                            <Button size="sm" variant="ghost">
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Email & Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email Address</label>
                  <Input value={userProfile.email} disabled className="mt-2" />
                  <Button variant="outline" className="mt-2 bg-transparent" size="sm">
                    Change Email
                  </Button>
                </div>
                <div className="border-t pt-4">
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Email Notifications</p>
                    <p className="text-xs text-foreground/60">Receive updates about achievements</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="font-medium text-sm">Public Profile</p>
                    <p className="text-xs text-foreground/60">Make your profile visible to others</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70 mb-4">Delete your account and all associated data</p>
                <Button variant="destructive">Delete Account</Button>
              </CardContent>
            </Card>
          </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}
