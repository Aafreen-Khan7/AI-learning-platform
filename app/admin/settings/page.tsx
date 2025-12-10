'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Download, Upload, Database, Settings as SettingsIcon } from 'lucide-react'
import { getSettings, updateSettings, exportQuestions, importQuestions, type AppSettings } from '@/lib/firestore'
import { exportQuestionsToPDF, parseQuestionsFromPDF } from '@/lib/pdf-utils'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    appName: 'LearnAI',
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
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await getSettings()
      setSettings(data)
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSettings(settings)
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleExportQuestions = async () => {
    try {
      const questions = await exportQuestions()
      await exportQuestionsToPDF(questions)
      toast.success(`Exported ${questions.length} questions to PDF successfully!`)
    } catch (error) {
      console.error('Error exporting questions:', error)
      toast.error('Failed to export questions')
    }
  }

  const handleImportQuestions = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      let questions: any[]

      if (file.type === 'application/pdf') {
        questions = await parseQuestionsFromPDF(file)
      } else {
        // Assume JSON format
        const text = await file.text()
        questions = JSON.parse(text)
      }

      if (!Array.isArray(questions)) {
        throw new Error('Invalid file format')
      }

      await importQuestions(questions)
      toast.success(`Imported ${questions.length} questions successfully!`)
    } catch (error) {
      console.error('Error importing questions:', error)
      toast.error('Failed to import questions. Please check the file format.')
    }

    // Reset the input
    event.target.value = ''
  }

  const handleResetDatabase = () => {
    if (confirm('Are you sure you want to reset the database? This will delete all questions!')) {
      toast.error('Database reset not implemented yet!')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your quiz application</p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="h-5 w-5 mr-2" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic application configuration - Set the app name, description, and maximum questions per quiz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appName">Application Name</Label>
                <Input
                  id="appName"
                  value={settings.appName}
                  onChange={(e) => setSettings(prev => ({ ...prev, appName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="maxQuestions">Max Questions per Quiz</Label>
                <Input
                  id="maxQuestions"
                  type="number"
                  value={settings.maxQuestionsPerQuiz}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxQuestionsPerQuiz: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="appDescription">Application Description</Label>
              <Textarea
                id="appDescription"
                value={settings.appDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, appDescription: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quiz Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Settings</CardTitle>
            <CardDescription>
              Configure quiz behavior and rules - Control timers, explanations, guest access, and adaptive difficulty
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableTimer">Enable Timer</Label>
                <p className="text-sm text-muted-foreground">Add time limits to quiz questions</p>
              </div>
              <Switch
                id="enableTimer"
                checked={settings.enableTimer}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableTimer: checked }))}
              />
            </div>

            {settings.enableTimer && (
              <div>
                <Label htmlFor="timerDuration">Timer Duration (seconds)</Label>
                <Input
                  id="timerDuration"
                  type="number"
                  value={settings.timerDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, timerDuration: parseInt(e.target.value) }))}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showExplanations">Show Explanations</Label>
                <p className="text-sm text-muted-foreground">Display answer explanations after each question</p>
              </div>
              <Switch
                id="showExplanations"
                checked={settings.showExplanations}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showExplanations: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowGuestPlay">Allow Guest Play</Label>
                <p className="text-sm text-muted-foreground">Let users play quizzes without signing up</p>
              </div>
              <Switch
                id="allowGuestPlay"
                checked={settings.allowGuestPlay}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowGuestPlay: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="adaptiveDifficulty">Adaptive Difficulty</Label>
                <p className="text-sm text-muted-foreground">Automatically adjust question difficulty based on user performance</p>
              </div>
              <Switch
                id="adaptiveDifficulty"
                checked={settings.adaptiveDifficultyEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, adaptiveDifficultyEnabled: checked }))}
              />
            </div>

            {settings.adaptiveDifficultyEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="easyThreshold">Easy Threshold (%)</Label>
                  <Input
                    id="easyThreshold"
                    type="number"
                    value={settings.difficultyThresholdEasy}
                    onChange={(e) => setSettings(prev => ({ ...prev, difficultyThresholdEasy: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="hardThreshold">Hard Threshold (%)</Label>
                  <Input
                    id="hardThreshold"
                    type="number"
                    value={settings.difficultyThresholdHard}
                    onChange={(e) => setSettings(prev => ({ ...prev, difficultyThresholdHard: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable the application for maintenance</p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Data Management
            </CardTitle>
            <CardDescription>
              Import, export, and manage your quiz data - Download questions as PDF or upload PDF/JSON files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={handleExportQuestions} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Export to PDF
              </Button>

              <div className="w-full">
                <input
                  type="file"
                  accept=".pdf,.json"
                  onChange={handleImportQuestions}
                  className="hidden"
                  id="import-file"
                />
                <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Import from PDF/JSON
                </Button>
              </div>

              <Button variant="destructive" onClick={handleResetDatabase} className="w-full">
                Reset Database
              </Button>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>Import Instructions:</strong> Upload a PDF file exported from this system, or a JSON file with the correct question format.
                Each question should have: question, options (array), correctAnswer (index), difficulty, category, and explanation.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Resetting the database will permanently delete all questions and user progress.
                Make sure to export your data first if you want to keep it.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}
