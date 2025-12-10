import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'

// Types
interface AppSettings {
  appName: string
  appDescription: string
  maxQuestionsPerQuiz: number
  enableTimer: boolean
  timerDuration: number
  showExplanations: boolean
  allowGuestPlay: boolean
  maintenanceMode: boolean
  adaptiveDifficultyEnabled: boolean
  difficultyThresholdEasy: number
  difficultyThresholdHard: number
}

interface User {
  id: string
  uid: string
  email: string
  name: string
  role: 'student' | 'admin'
  totalPoints: number
  level: number
  streak: number
  quizzesTaken: number
  averageScore: number
  favoriteCategories: string[]
  achievements: string[]
  bio?: string
  location?: string
  createdAt?: Date
  updatedAt?: Date
}

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  explanation: string
  createdAt?: Date
}

interface QuizAttempt {
  id: string
  userId: string
  score: number
  totalQuestions: number
  category: string
  difficulty: string
  timeSpent: number
  completedAt: Date
  answers: { questionId: string; selectedAnswer: number; correct: boolean }[]
}

interface UserProgress {
  id: string
  userId: string
  category: string
  totalAttempts: number
  averageScore: number
  bestScore: number
  timeSpent?: number
  totalQuizzes?: number
  lastAttemptAt: Date
}

// User operations
export const createUser = async (userData: {
  uid: string
  email: string
  name: string
  role: 'student' | 'admin'
  totalPoints: number
  level: number
  streak: number
  quizzesTaken: number
  averageScore: number
  favoriteCategories: string[]
  achievements: string[]
}): Promise<void> => {
  const userRef = doc(db, 'users', userData.uid)
  await setDoc(userRef, {
    ...userData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
}

export const getUser = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    return {
      id: userSnap.id,
      ...userSnap.data(),
      createdAt: userSnap.data().createdAt?.toDate(),
      updatedAt: userSnap.data().updatedAt?.toDate(),
    } as User
  }
  return null
}

// Question operations
export const getQuestions = async (category?: string, difficulty?: string, limitCount = 50): Promise<Question[]> => {
  let q

  if (category && difficulty) {
    // If both filters are provided, we need a composite index for category + difficulty + createdAt
    q = query(
      collection(db, 'questions'),
      where('category', '==', category),
      where('difficulty', '==', difficulty),
      orderBy('createdAt', 'desc')
    )
  } else if (category) {
    // If only category filter, use the composite index we created
    q = query(
      collection(db, 'questions'),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    )
  } else if (difficulty) {
    // If only difficulty filter, we need a different index for difficulty + createdAt
    q = query(
      collection(db, 'questions'),
      where('difficulty', '==', difficulty),
      orderBy('createdAt', 'desc')
    )
  } else {
    // No filters, just order by createdAt
    q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'))
  }

  if (limitCount > 0) {
    q = query(q, limit(limitCount))
  }

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Question[]
}

export const addQuestion = async (questionData: Omit<Question, 'id' | 'createdAt'>): Promise<string> => {
  const questionsRef = collection(db, 'questions')
  const newDocRef = doc(questionsRef)
  await setDoc(newDocRef, {
    ...questionData,
    createdAt: Timestamp.now(),
  })
  return newDocRef.id
}

export const updateQuestion = async (id: string, questionData: Partial<Omit<Question, 'id' | 'createdAt'>>): Promise<void> => {
  const questionRef = doc(db, 'questions', id)
  await setDoc(questionRef, questionData, { merge: true })
}

export const deleteQuestion = async (id: string): Promise<void> => {
  const questionRef = doc(db, 'questions', id)
  await setDoc(questionRef, { deleted: true }, { merge: true })
}

// Quiz operations
export const createQuizAttempt = async (attemptData: Omit<QuizAttempt, 'id' | 'completedAt'>): Promise<string> => {
  const attemptsRef = collection(db, 'quizAttempts')
  const newDocRef = doc(attemptsRef)
  await setDoc(newDocRef, {
    ...attemptData,
    completedAt: Timestamp.now(),
  })
  return newDocRef.id
}

export const getUserAttempts = async (userId: string, limitCount = 10): Promise<QuizAttempt[]> => {
  const q = query(
    collection(db, 'quizAttempts'),
    where('userId', '==', userId),
    orderBy('completedAt', 'desc'),
    limit(limitCount)
  )
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    completedAt: doc.data().completedAt?.toDate(),
  })) as QuizAttempt[]
}

export const getRandomQuestions = async (count: number = 10, category?: string, difficulty?: string): Promise<Question[]> => {
  const questions = await getQuestions(category, difficulty, 1000)
  const shuffled = questions.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Leaderboard operations
export const getLeaderboard = async (limitCount = 50): Promise<User[]> => {
  const q = query(
    collection(db, 'users'),
    orderBy('totalPoints', 'desc'),
    limit(limitCount)
  )
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as User[]
}

// User progress operations
export const getUserProgress = async (userId: string): Promise<UserProgress[]> => {
  const q = query(
    collection(db, 'userProgress'),
    where('userId', '==', userId)
  )
  const querySnapshot = await getDocs(q)
  const progress = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    lastAttemptAt: doc.data().lastAttemptAt?.toDate(),
  })) as UserProgress[]

  // Sort by lastAttemptAt in descending order (most recent first)
  return progress.sort((a, b) => {
    if (!a.lastAttemptAt && !b.lastAttemptAt) return 0
    if (!a.lastAttemptAt) return 1
    if (!b.lastAttemptAt) return -1
    return b.lastAttemptAt.getTime() - a.lastAttemptAt.getTime()
  })
}

export const updateUserProgress = async (userId: string, category: string, score: number): Promise<void> => {
  const progressRef = doc(db, `userProgress/${userId}_${category}`)
  const existingProgress = await getDoc(progressRef)

  if (existingProgress.exists()) {
    const data = existingProgress.data()
    const newTotalAttempts = data.totalAttempts + 1
    const newAverageScore = ((data.averageScore * data.totalAttempts) + score) / newTotalAttempts
    const newBestScore = Math.max(data.bestScore, score)

    await setDoc(progressRef, {
      totalAttempts: newTotalAttempts,
      averageScore: newAverageScore,
      bestScore: newBestScore,
      lastAttemptAt: Timestamp.now(),
    }, { merge: true })
  } else {
    await setDoc(progressRef, {
      userId,
      category,
      totalAttempts: 1,
      averageScore: score,
      bestScore: score,
      lastAttemptAt: Timestamp.now(),
    })
  }
}

export const updateUser = async (uid: string, userData: Partial<Omit<User, 'id' | 'uid' | 'createdAt'>>): Promise<void> => {
  const userRef = doc(db, 'users', uid)
  await setDoc(userRef, {
    ...userData,
    updatedAt: Timestamp.now(),
  }, { merge: true })
}

// Settings operations
export const getSettings = async (): Promise<AppSettings> => {
  const settingsRef = doc(db, 'settings', 'app')
  const settingsSnap = await getDoc(settingsRef)

  if (settingsSnap.exists()) {
    return settingsSnap.data() as AppSettings
  }

  // Return default settings if none exist
  return {
    appName: 'QuizMaster',
    appDescription: 'An interactive quiz application for learning and fun',
    maxQuestionsPerQuiz: 10,
    enableTimer: false,
    timerDuration: 30,
    showExplanations: true,
    allowGuestPlay: true,
    maintenanceMode: false,
    adaptiveDifficultyEnabled: true,
    difficultyThresholdEasy: 50,
    difficultyThresholdHard: 80,
  }
}

export const updateSettings = async (settings: Partial<AppSettings>): Promise<void> => {
  const settingsRef = doc(db, 'settings', 'app')
  await setDoc(settingsRef, settings, { merge: true })
}

// Import/Export operations
export const exportQuestions = async (): Promise<Question[]> => {
  return await getQuestions(undefined, undefined, 0) // Get all questions
}

export const importQuestions = async (questions: Omit<Question, 'id' | 'createdAt'>[]): Promise<void> => {
  const batch = writeBatch(db)
  const questionsRef = collection(db, 'questions')

  questions.forEach((question) => {
    const newDocRef = doc(questionsRef)
    batch.set(newDocRef, {
      ...question,
      createdAt: Timestamp.now(),
    })
  })

  await batch.commit()
}

// Export types
export type { User, Question, QuizAttempt, UserProgress, AppSettings }
