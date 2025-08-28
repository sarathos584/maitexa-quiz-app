"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LogOut, Users, FileText, Award, Plus, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface DashboardStats {
  totalSubmissions: number
  totalUsers: number
  totalQuestions: number
  excellentPerformers: number
}

interface Submission {
  _id: string
  userName: string
  userEmail: string
  score: number
  percentage: number
  completedAt: string
  certificateGenerated: boolean
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check admin authentication
    const adminToken = sessionStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/admin")
      return
    }

    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, submissionsResponse] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/submissions"),
      ])

      if (statsResponse.ok && submissionsResponse.ok) {
        const statsData = await statsResponse.json()
        const submissionsData = await submissionsResponse.json()

        setStats(statsData.stats)
        setSubmissions(submissionsData.submissions)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken")
    router.push("/admin")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <h1 className="text-2xl font-bold text-card-foreground">Admin Dashboard</h1>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Excellent Performers</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.excellentPerformers}</div>
                <p className="text-xs text-muted-foreground">90%+ scores</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="submissions" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="submissions">Quiz Submissions</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
            </TabsList>
            <Link href="/admin/questions/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </Link>
          </div>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Quiz Submissions</CardTitle>
                <CardDescription>View and manage candidate assessment results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-muted-foreground">Recent submissions from candidates</div>
                  <Link href="/admin/analytics">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <TrendingUp className="h-4 w-4" />
                      View Analytics
                    </Button>
                  </Link>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Certificate</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission._id}>
                        <TableCell className="font-medium">{submission.userName}</TableCell>
                        <TableCell>{submission.userEmail}</TableCell>
                        <TableCell>{submission.score}/10</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              submission.percentage >= 90
                                ? "default"
                                : submission.percentage >= 70
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {submission.percentage}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {submission.certificateGenerated ? (
                            <Badge variant="default">Generated</Badge>
                          ) : (
                            <Badge variant="outline">Not Eligible</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(submission.completedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {submissions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No submissions found. Candidates will appear here after taking the quiz.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle>Question Management</CardTitle>
                <CardDescription>Manage quiz questions and categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Question management interface coming soon.</p>
                  <Link href="/admin/questions">
                    <Button>Manage Questions</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
