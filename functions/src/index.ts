import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

// AI Recommendations Cloud Function
export const getAIRecommendations = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { userId, message, userHistory } = data

  try {
    // Get user data from Firestore
    const userDoc = await admin.firestore().collection('users').doc(userId).get()
    const userData = userDoc.data()

    // Get user's recent quiz attempts
    const recentAttempts = await admin.firestore()
      .collection('quizAttempts')
      .where('userId', '==', userId)
      .orderBy('completedAt', 'desc')
      .limit(10)
      .get()

    const attempts = recentAttempts.docs.map(doc => doc.data())

    // Simple AI logic for recommendations (can be enhanced with OpenAI API)
    const recommendations = generateRecommendations(userData, attempts, message)

    return {
      recommendations,
      timestamp: admin.firestore.Timestamp.now(),
    }
  } catch (error) {
    console.error('Error generating AI recommendations:', error)
    throw new functions.https.HttpsError('internal', 'Failed to generate recommendations')
  }
})

// Helper function to generate recommendations
function generateRecommendations(userData: any, attempts: any[], message: string) {
  const recommendations = []

  // Analyze performance by category
  const categoryPerformance = {}
  attempts.forEach(attempt => {
    if (!categoryPerformance[attempt.category]) {
      categoryPerformance[attempt.category] = { total: 0, count: 0 }
    }
    categoryPerformance[attempt.category].total += attempt.score
    categoryPerformance[attempt.category].count += 1
  })

  // Find weakest categories
  const weakCategories = Object.entries(categoryPerformance)
    .map(([category, data]: [string, any]) => ({
      category,
      average: data.total / data.count
    }))
    .filter(item => item.average < 70)
    .sort((a, b) => a.average - b.average)

  // Generate study recommendations
  if (weakCategories.length > 0) {
    recommendations.push({
      type: 'study',
      title: 'Focus on Weak Areas',
      content: `Based on your recent performance, consider reviewing ${weakCategories[0].category} concepts. Your average score in this area is ${Math.round(weakCategories[0].average)}%.`,
      priority: 'high'
    })
  }

  // Streak maintenance
  if (userData.streak < 7) {
    recommendations.push({
      type: 'motivation',
      title: 'Build Your Streak',
      content: 'You\'re close to a 7-day learning streak! Taking one quiz today will help maintain your momentum.',
      priority: 'medium'
    })
  }

  // Difficulty progression
  const recentScores = attempts.slice(0, 3).map(a => a.score)
  const averageRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length

  if (averageRecent > 85) {
    recommendations.push({
      type: 'progression',
      title: 'Ready for Harder Challenges',
      content: 'Your recent scores are excellent! Try some harder difficulty quizzes to continue growing.',
      priority: 'medium'
    })
  }

  // Personalized responses based on message content
  if (message.toLowerCase().includes('help') || message.toLowerCase().includes('improve')) {
    recommendations.push({
      type: 'tips',
      title: 'Study Tips',
      content: 'Try the Pomodoro technique: 25 minutes of focused study followed by a 5-minute break. Also, teach concepts to others to reinforce your understanding.',
      priority: 'low'
    })
  }

  // Default recommendation if none generated
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'general',
      title: 'Keep Learning!',
      content: 'You\'re doing great! Continue taking quizzes regularly to maintain and improve your skills.',
      priority: 'low'
    })
  }

  return recommendations
}

// Quiz generation function (for dynamic quiz creation)
export const generateQuiz = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { category, difficulty, userId } = data

  try {
    // Get existing questions from Firestore
    const questionsRef = admin.firestore().collection('questions')
    const questionsQuery = questionsRef
      .where('category', '==', category)
      .where('difficulty', '==', difficulty)
      .limit(10)

    const questionsSnapshot = await questionsQuery.get()
    const questions = questionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // If not enough questions, get from other difficulties
    if (questions.length < 5) {
      const fallbackQuery = questionsRef
        .where('category', '==', category)
        .limit(10)

      const fallbackSnapshot = await fallbackQuery.get()
      const fallbackQuestions = fallbackSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      questions.push(...fallbackQuestions.slice(0, 10 - questions.length))
    }

    // Shuffle and select questions
    const shuffled = questions.sort(() => 0.5 - Math.random())
    const selectedQuestions = shuffled.slice(0, Math.min(10, shuffled.length))

    return {
      questions: selectedQuestions,
      totalQuestions: selectedQuestions.length,
      category,
      difficulty,
      generatedAt: admin.firestore.Timestamp.now()
    }
  } catch (error) {
    console.error('Error generating quiz:', error)
    throw new functions.https.HttpsError('internal', 'Failed to generate quiz')
  }
})

// User analytics function
export const getUserAnalytics = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { userId } = data

  try {
    // Get user attempts
    const attempts = await admin.firestore()
      .collection('quizAttempts')
      .where('userId', '==', userId)
      .orderBy('completedAt', 'desc')
      .get()

    const attemptData = attempts.docs.map(doc => doc.data())

    // Calculate analytics
    const analytics = {
      totalQuizzes: attemptData.length,
      averageScore: attemptData.reduce((sum, a) => sum + a.score, 0) / attemptData.length || 0,
      favoriteCategory: getMostFrequentCategory(attemptData),
      improvement: calculateImprovement(attemptData),
      weeklyProgress: getWeeklyProgress(attemptData),
    }

    return analytics
  } catch (error) {
    console.error('Error getting user analytics:', error)
    throw new functions.https.HttpsError('internal', 'Failed to get analytics')
  }
})

function getMostFrequentCategory(attempts: any[]): string {
  const categories = attempts.map(a => a.category)
  const frequency = categories.reduce((acc, cat) => {
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  return Object.entries(frequency).sort(([,a], [,b]) => b - a)[0]?.[0] || 'General'
}

function calculateImprovement(attempts: any[]): number {
  if (attempts.length < 2) return 0

  const recent = attempts.slice(0, 5).reduce((sum, a) => sum + a.score, 0) / Math.min(5, attempts.length)
  const older = attempts.slice(-5).reduce((sum, a) => sum + a.score, 0) / Math.min(5, attempts.length)

  return recent - older
}

function getWeeklyProgress(attempts: any[]): any[] {
  const weeklyData = {}
  attempts.forEach(attempt => {
    const week = new Date(attempt.completedAt.seconds * 1000).toISOString().slice(0, 10).slice(0, 7) // YYYY-MM
    if (!weeklyData[week]) {
      weeklyData[week] = { quizzes: 0, totalScore: 0 }
    }
    weeklyData[week].quizzes += 1
    weeklyData[week].totalScore += attempt.score
  })

  return Object.entries(weeklyData)
    .map(([week, data]: [string, any]) => ({
      week,
      quizzes: data.quizzes,
      averageScore: data.totalScore / data.quizzes
    }))
    .sort((a, b) => a.week.localeCompare(b.week))
}
