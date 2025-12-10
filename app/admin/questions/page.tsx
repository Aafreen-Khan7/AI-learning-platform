'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getQuestions, addQuestion, updateQuestion, deleteQuestion } from '@/lib/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Question {
  id?: string
  question: string
  options: string[]
  correctAnswer: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  explanation: string
  createdAt?: any
}

const categories = [
  'Math', 'Science', 'Geography', 'History', 'Literature', 'Programming',
  'Art', 'Music', 'Sports', 'General Knowledge'
]

const difficulties = [
  { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800' }
]

export default function AdminQuestionsPage() {
  const { user, loading: authLoading } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [formData, setFormData] = useState<Question>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'easy',
    category: 'Math',
    explanation: ''
  })

  useEffect(() => {
    if (!authLoading && user) {
      loadQuestions()
    }
  }, [user, authLoading])

  const loadQuestions = async () => {
    try {
      const data = await getQuestions()
      setQuestions(data)
    } catch (error) {
      console.error('Error loading questions:', error)
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.question.trim()) {
      toast.error('Question is required')
      return
    }

    if (formData.options.some(opt => !opt.trim())) {
      toast.error('All options must be filled')
      return
    }

    if (!formData.explanation.trim()) {
      toast.error('Explanation is required')
      return
    }

    try {
      if (editingQuestion?.id) {
        await updateQuestion(editingQuestion.id, formData)
        toast.success('Question updated successfully')
      } else {
        await addQuestion(formData)
        toast.success('Question added successfully')
      }

      setDialogOpen(false)
      setEditingQuestion(null)
      resetForm()
      loadQuestions()
    } catch (error) {
      console.error('Error saving question:', error)
      toast.error('Failed to save question')
    }
  }

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
    setFormData({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      difficulty: question.difficulty,
      category: question.category,
      explanation: question.explanation
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      await deleteQuestion(id)
      toast.success('Question deleted successfully')
      loadQuestions()
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('Failed to delete question')
    }
  }

  const resetForm = () => {
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'easy',
      category: 'Math',
      explanation: ''
    })
  }

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) {
      toast.error('Must have at least 2 options')
      return
    }

    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      correctAnswer: prev.correctAnswer >= index && prev.correctAnswer > 0 ? prev.correctAnswer - 1 : prev.correctAnswer
    }))
  }

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You must be logged in to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Question Management</h1>
          <p className="text-muted-foreground">Manage quiz questions in your database</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingQuestion(null); resetForm() }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question</label>
                <Textarea
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Enter your question here..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: 'easy' | 'medium' | 'hard') => setFormData(prev => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(diff => (
                        <SelectItem key={diff.value} value={diff.value}>{diff.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Options</label>
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    Add Option
                  </Button>
                </div>
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formData.correctAnswer === index}
                      onChange={() => setFormData(prev => ({ ...prev, correctAnswer: index }))}
                      className="mt-1"
                    />
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                    {formData.options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">Select the radio button next to the correct answer</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Explanation</label>
                <Textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explain why this is the correct answer..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingQuestion ? 'Update' : 'Add'} Question
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {questions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No questions found. Add your first question!</p>
              </CardContent>
            </Card>
          ) : (
            questions.map((question) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{question.question}</CardTitle>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{question.category}</Badge>
                        <Badge className={difficulties.find(d => d.value === question.difficulty)?.color}>
                          {difficulties.find(d => d.value === question.difficulty)?.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(question)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(question.id!)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded ${
                          index === question.correctAnswer
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                        {index === question.correctAnswer && (
                          <Badge className="ml-2 bg-green-100 text-green-800">Correct</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
