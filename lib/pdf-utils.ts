import jsPDF from 'jspdf'
import * as pdfParse from 'pdf-parse'
import type { Question } from './firestore'

// Export questions to PDF
export const exportQuestionsToPDF = async (questions: Question[]): Promise<void> => {
  const pdf = new jsPDF()

  // Set up document
  pdf.setFontSize(20)
  pdf.text('Quiz Questions Export', 20, 30)

  pdf.setFontSize(12)
  pdf.text(`Total Questions: ${questions.length}`, 20, 45)
  pdf.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, 55)

  let yPosition = 70
  const pageHeight = pdf.internal.pageSize.height
  const margin = 20

  questions.forEach((question, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      pdf.addPage()
      yPosition = 30
    }

    // Question number and text
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    const questionText = `${index + 1}. ${question.question}`
    const lines = pdf.splitTextToSize(questionText, 170)
    pdf.text(lines, margin, yPosition)
    yPosition += lines.length * 7 + 5

    // Category and difficulty
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'italic')
    pdf.text(`Category: ${question.category} | Difficulty: ${question.difficulty}`, margin, yPosition)
    yPosition += 10

    // Options
    pdf.setFont('helvetica', 'normal')
    question.options.forEach((option, optionIndex) => {
      const optionText = `${String.fromCharCode(65 + optionIndex)}. ${option}`
      const optionLines = pdf.splitTextToSize(optionText, 160)
      pdf.text(optionLines, margin + 10, yPosition)

      // Mark correct answer
      if (optionIndex === question.correctAnswer) {
        pdf.setFont('helvetica', 'bold')
        pdf.text('✓', margin + 5, yPosition)
        pdf.setFont('helvetica', 'normal')
      }

      yPosition += optionLines.length * 6 + 3
    })

    // Explanation
    if (question.explanation) {
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'italic')
      const explanationLines = pdf.splitTextToSize(`Explanation: ${question.explanation}`, 160)
      pdf.text(explanationLines, margin, yPosition)
      yPosition += explanationLines.length * 6 + 10
    }

    yPosition += 10 // Space between questions
  })

  // Download the PDF
  pdf.save('quiz-questions.pdf')
}

// Parse questions from PDF (simplified - assumes structured format)
export const parseQuestionsFromPDF = async (file: File): Promise<Omit<Question, 'id' | 'createdAt'>[]> => {
  const arrayBuffer = await file.arrayBuffer()
  const data = await (pdfParse as any)(Buffer.from(arrayBuffer))
  const text = data.text

  const questions: Omit<Question, 'id' | 'createdAt'>[] = []
  const lines = text.split('\n').filter((line: string) => line.trim())

  let currentQuestion: Partial<Omit<Question, 'id' | 'createdAt'>> | null = null
  let parsingOptions = false
  let options: string[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Skip empty lines and headers
    if (!trimmedLine || trimmedLine.includes('Quiz Questions Export') ||
        trimmedLine.includes('Total Questions:') || trimmedLine.includes('Export Date:')) {
      continue
    }

    // Check if this is a question (starts with number followed by dot)
    const questionMatch = trimmedLine.match(/^(\d+)\.\s*(.+)$/)
    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion && currentQuestion.question && options.length >= 2) {
        questions.push({
          question: currentQuestion.question!,
          options: options.slice(0, 4), // Take first 4 options
          correctAnswer: currentQuestion.correctAnswer || 0,
          difficulty: currentQuestion.difficulty || 'medium',
          category: currentQuestion.category || 'General Knowledge',
          explanation: currentQuestion.explanation || ''
        })
      }

      // Start new question
      currentQuestion = {
        question: questionMatch[2],
        options: [],
        correctAnswer: 0,
        difficulty: 'medium',
        category: 'General Knowledge',
        explanation: ''
      }
      parsingOptions = false
      options = []
      continue
    }

    // Check for category and difficulty
    const categoryMatch = trimmedLine.match(/Category:\s*(.+?)\s*\|\s*Difficulty:\s*(.+)$/)
    if (categoryMatch && currentQuestion) {
      currentQuestion.category = categoryMatch[1].trim()
      currentQuestion.difficulty = categoryMatch[2].trim() as 'easy' | 'medium' | 'hard'
      parsingOptions = true
      continue
    }

    // Parse options
    if (parsingOptions && currentQuestion) {
      const optionMatch = trimmedLine.match(/^[A-D]\.\s*(.+)$/)
      if (optionMatch) {
        options.push(optionMatch[1].trim())

        // Check if this is the correct answer (has ✓)
        if (trimmedLine.includes('✓')) {
          currentQuestion.correctAnswer = options.length - 1
        }
        continue
      }
    }

    // Parse explanation
    if (trimmedLine.startsWith('Explanation:') && currentQuestion) {
      currentQuestion.explanation = trimmedLine.replace('Explanation:', '').trim()
      parsingOptions = false
    }
  }

  // Add the last question
  if (currentQuestion && currentQuestion.question && options.length >= 2) {
    questions.push({
      question: currentQuestion.question,
      options: options.slice(0, 4),
      correctAnswer: currentQuestion.correctAnswer || 0,
      difficulty: currentQuestion.difficulty || 'medium',
      category: currentQuestion.category || 'General Knowledge',
      explanation: currentQuestion.explanation || ''
    })
  }

  return questions
}
