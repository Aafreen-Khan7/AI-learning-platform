import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileQuestion, BarChart3, Users, Settings } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your quiz application</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileQuestion className="h-5 w-5 mr-2" />
              Questions
            </CardTitle>
            <CardDescription>
              Manage quiz questions and categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/questions">
              <Button className="w-full">
                Manage Questions
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Analytics
            </CardTitle>
            <CardDescription>
              View quiz statistics and user performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Users
            </CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </CardTitle>
            <CardDescription>
              Configure application settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full">
                Open Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Overview of your quiz system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">35+</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">6</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">3</div>
                <div className="text-sm text-muted-foreground">Difficulty Levels</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">∞</div>
                <div className="text-sm text-muted-foreground">Scalability</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
