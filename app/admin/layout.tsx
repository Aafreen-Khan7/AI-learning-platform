'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LogOut, Settings, FileQuestion } from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              You must be logged in to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <span className="text-sm text-gray-500">Quiz Management System</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <Link
              href="/admin/questions"
              className="flex items-center px-3 py-4 text-sm font-medium text-gray-900 border-b-2 border-blue-500"
            >
              <FileQuestion className="h-5 w-5 mr-2" />
              Questions
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center px-3 py-4 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 border-b-2 border-transparent"
            >
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
