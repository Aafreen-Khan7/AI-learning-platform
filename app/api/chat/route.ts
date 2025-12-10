import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Static response function as fallback
const getStaticResponse = (userMessage: string, user: any, attempts: any[]): string => {
  if (!userMessage || typeof userMessage !== 'string') {
    return "Hello! I'm your AI learning tutor. I can help you with explanations, study tips, course recommendations, and learning strategies. What would you like help with today?"
  }

  const lowerMessage = userMessage.toLowerCase()

  // Personalized greeting based on user data
  const totalQuizzes = user?.quizzesTaken || 0
  const averageScore = user?.averageScore || 0
  const currentStreak = user?.streak || 0

  console.log('Static response debug:', { totalQuizzes, averageScore, currentStreak, message: userMessage })

  // Greeting responses
  if (lowerMessage.includes("hi") || lowerMessage.includes("hello") || lowerMessage.includes("hey")) {
    if (totalQuizzes === 0) {
      return `Welcome to your learning journey! I'm here to help you succeed. You haven't taken any quizzes yet - would you like to start with a general knowledge quiz to get familiar with the platform?`
    } else {
      return `Hello! Great to see you back! With ${totalQuizzes} quizzes completed and a ${averageScore}% average, you're doing fantastic! How can I help you with your learning today?`
    }
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

  // Specific topic responses
  if (lowerMessage.includes("improve") && lowerMessage.includes("math")) {
    const mathAttempts = attempts.filter(a => a.category.toLowerCase().includes('math'))
    const mathAverage = mathAttempts.length > 0 ?
      mathAttempts.reduce((sum, a) => sum + a.score, 0) / mathAttempts.length : averageScore

    return `To improve your math scores, I recommend:\n\n1. **Focus on fundamentals** - Review basic concepts before moving to advanced topics\n2. **Practice regularly** - Solve 5-10 problems daily\n3. **Understand, don't memorize** - Make sure you understand the 'why' behind each formula\n4. **Use our adaptive quizzes** - They adjust to your level automatically\n\nBased on your ${totalQuizzes} quizzes with ${Math.round(mathAverage)}% math average, you're doing great! Would you like me to recommend specific math topics to focus on?`
  }

  if (lowerMessage.includes("what topics") || lowerMessage.includes("study next")) {
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

    return `Based on your excellent performance (${totalQuizzes} quizzes, ${averageScore}% average), I recommend:\n\n1. **Challenge yourself** - Try expert-level quizzes\n2. **Explore new categories** - Branch out to subjects you haven't tried\n3. **Maintain consistency** - Keep your ${currentStreak}-day streak going!\n\nWhat category interests you most?`
  }

  if (lowerMessage.includes("quantum") || lowerMessage.includes("physics")) {
    return `**Quantum Mechanics Explained Simply:**\n\nQuantum mechanics is the science of the very small - atoms and subatomic particles. Here are key concepts:\n\n- **Superposition** - Particles can exist in multiple states simultaneously until observed\n- **Entanglement** - Particles can be mysteriously connected across distances\n- **Wave-particle duality** - Things can behave like both waves and particles\n\nIt's counterintuitive but amazing! With your ${averageScore}% average across ${totalQuizzes} quizzes, you're well-prepared to explore this further with our quantum mechanics course?`
  }

  if (lowerMessage.includes("streak")) {
    const recentDates = attempts.slice(0, 10).map(a => new Date(a.completedAt.seconds * 1000).toDateString())
    const uniqueDates = [...new Set(recentDates)]
    const actualStreak = uniqueDates.length

    return `Great question! Here are tips to maintain your learning streak:\n\n1. **Set a daily goal** - Even 15-20 minutes counts\n2. **Schedule learning time** - Make it part of your routine\n3. **Start with easier quizzes** - Build momentum gradually\n4. **Take a break if needed** - Rest is part of learning\n5. **Share your goal** - Tell friends about your streak for motivation\n\nYou're currently on a ${actualStreak}-day streak${actualStreak > 0 ? ' - keep it up!' : ' - start today!'}`
  }

  if (lowerMessage.includes("study") && (lowerMessage.includes("strategy") || lowerMessage.includes("technique") || lowerMessage.includes("method"))) {
    return `Excellent question! Here are proven study strategies to boost your learning:\n\n**📚 Active Recall**\n- Test yourself on material before looking at answers\n- Use flashcards or quiz yourself regularly\n\n**🔄 Spaced Repetition**\n- Review material at increasing intervals (1 day, 3 days, 1 week, etc.)\n- Our platform uses this automatically!\n\n**🎯 Focused Sessions**\n- Use the Pomodoro technique: 25 minutes study + 5 minute break\n- Avoid multitasking - focus on one topic at a time\n\n**📝 Active Learning**\n- Take notes in your own words\n- Teach concepts to someone else (or imagine teaching)\n- Create mind maps and diagrams\n\n**🎮 Gamification**\n- Turn learning into a game with rewards\n- Set daily goals and track progress\n\nBased on your ${totalQuizzes} quizzes with ${averageScore}% average, I'd recommend starting with active recall techniques. What specific subject are you working on?`
  }

  if (lowerMessage.includes("how am i doing") || lowerMessage.includes("my progress")) {
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

  // Default personalized response
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = body.message
    const user = body.user
    const attempts = body.attempts || []

    console.log('API received:', { message, user: user ? { quizzesTaken: user.quizzesTaken, averageScore: user.averageScore } : null, attemptsCount: attempts?.length })

    // Check for OpenAI API key first
    const openaiApiKey = process.env.OPENAI_API_KEY
    const isValidOpenAIKey = openaiApiKey && openaiApiKey.startsWith('sk-')

    // Check for Anthropic API key as alternative
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY
    const isValidAnthropicKey = anthropicApiKey && anthropicApiKey.startsWith('sk-ant-')

    if (!isValidOpenAIKey && !isValidAnthropicKey) {
      console.log('No valid AI API keys configured, using static responses')
      return NextResponse.json({ response: getStaticResponse(message, user, attempts) })
    }

    // Prepare user context for personalized responses
    const userContext = user ? `
User Profile:
- Name: ${user.name}
- Total Quizzes: ${user.quizzesTaken || 0}
- Average Score: ${user.averageScore || 0}%
- Current Streak: ${user.streak || 0} days
- Total Points: ${user.totalPoints || 0}
- Level: ${user.level || 1}
    ` : 'New user, no quiz history yet.'

    // Include recent quiz attempts for context
    const recentAttempts = attempts.slice(0, 5).map((attempt: any) =>
      `- ${attempt.category}: ${attempt.score}% (${new Date(attempt.completedAt.seconds * 1000).toLocaleDateString()})`
    ).join('\n')

    const systemPrompt = `You are an AI learning tutor for a quiz platform. Provide helpful, personalized responses based on the user's profile and quiz history.

${userContext}

Recent Quiz Attempts:
${recentAttempts || 'No recent attempts'}

Guidelines:
- Be encouraging and supportive
- Provide specific, actionable advice
- Reference their actual performance data when relevant
- Suggest next steps based on their progress
- Keep responses conversational but informative
- If they ask about improving scores, analyze their weak areas
- If they ask about study topics, recommend based on their performance
- Always end with a question to continue the conversation`

    let response = ''

    // Try OpenAI first if available
    if (isValidOpenAIKey) {
      try {
        console.log('Trying OpenAI API...')
        const openai = new OpenAI({
          apiKey: openaiApiKey
        })

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          max_tokens: 500,
          temperature: 0.7,
        })

        response = completion.choices[0].message.content || ''
        console.log('OpenAI response successful')
      } catch (openaiError: any) {
        console.log('OpenAI failed, trying Anthropic...', openaiError.message)
      }
    }

    // Try Anthropic if OpenAI failed or wasn't available
    if (!response && isValidAnthropicKey) {
      try {
        console.log('Trying Anthropic API...')
        const anthropic = new Anthropic({
          apiKey: anthropicApiKey
        })

        const completion = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 500,
          temperature: 0.7,
          system: systemPrompt,
          messages: [
            { role: "user", content: message }
          ]
        })

        response = completion.content[0].type === 'text' ? completion.content[0].text : ''
        console.log('Anthropic response successful')
      } catch (anthropicError: any) {
        console.log('Anthropic failed:', anthropicError.message)
      }
    }

    // Try Together AI if both OpenAI and Anthropic failed or weren't available
    if (!response) {
      const togetherApiKey = process.env.TOGETHER_API_KEY
      const isValidTogetherKey = togetherApiKey && togetherApiKey.startsWith('sk-')

      if (isValidTogetherKey) {
        try {
          console.log('Trying Together AI API...')
          const openai = new OpenAI({
            apiKey: togetherApiKey,
            baseURL: "https://api.together.xyz/v1",
          })

          const completion = await openai.chat.completions.create({
            model: "meta-llama/Llama-2-70b-chat-hf",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message }
            ],
            max_tokens: 500,
            temperature: 0.7,
          })

          response = completion.choices[0].message.content || ''
          console.log('Together AI response successful')
        } catch (togetherError: any) {
          console.log('Together AI failed:', togetherError.message)
        }
      }
    }

    if (!response) {
      console.log('All AI services failed, using static responses')
      return NextResponse.json({ response: getStaticResponse(message, user, attempts) })
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('API error:', error)
    // Fallback to static response when AI fails
    const { message, user, attempts } = await request.json().catch(() => ({ message: '', user: null, attempts: [] }))
    return NextResponse.json({ response: getStaticResponse(message, user, attempts) })
  }
}
