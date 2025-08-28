"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  Area,
  AreaChart,
} from "recharts"
import { ArrowLeft, Download, TrendingUp, Users, Award, Target } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AnalyticsData {
  overview: {
    totalSubmissions: number
    totalUsers: number
    averageScore: number
    excellentPerformers: number
    averagePercentage: number
  }
  categoryPerformance: {
    category: string
    totalQuestions: number
    correctAnswers: number
    accuracy: number
  }[]
  difficultyAnalysis: {
    difficulty: string
    totalQuestions: number
    correctAnswers: number
    accuracy: number
  }[]
  timeSeriesData: {
    date: string
    submissions: number
    averageScore: number
  }[]
  questionPerformance: {
    questionId: string
    question: string
    category: string
    difficulty: string
    totalAttempts: number
    correctAttempts: number
    accuracy: number
  }[]
  userPerformance: {
    scoreRange: string
    count: number
    percentage: number
  }[]
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")

  useEffect(() => {
    // Check admin authentication
    const adminToken = sessionStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/admin")
      return
    }

    fetchAnalytics()
  }, [router, timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/export?timeRange=${timeRange}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `maitexa-analytics-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error exporting analytics:", error)
      alert("Failed to export analytics. Please try again.")
    }
  }

  const COLORS = ["#164e63", "#8b5cf6", "#059669", "#dc2626", "#d97706"]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading analytics...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">No analytics data available.</p>
            <Link href="/admin/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
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
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">M</span>
                </div>
                <h1 className="text-2xl font-bold text-card-foreground">Analytics Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportAnalytics} variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">{analytics.overview.totalUsers} unique users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.averageScore.toFixed(1)}/10</div>
              <p className="text-xs text-muted-foreground">
                {analytics.overview.averagePercentage.toFixed(1)}% average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Excellence Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.excellentPerformers}</div>
              <p className="text-xs text-muted-foreground">
                {((analytics.overview.excellentPerformers / analytics.overview.totalSubmissions) * 100).toFixed(1)}%
                scored 90%+
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance Trend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">↗ +12%</div>
              <p className="text-xs text-muted-foreground">vs previous period</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                  <CardDescription>Distribution of user scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.userPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="scoreRange" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#164e63" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Difficulty Analysis</CardTitle>
                  <CardDescription>Performance by question difficulty</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.difficultyAnalysis}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ difficulty, accuracy }) => `${difficulty}: ${accuracy.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="accuracy"
                      >
                        {analytics.difficultyAnalysis.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Accuracy rates by question category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics.categoryPerformance} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="category" type="category" width={100} />
                    <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, "Accuracy"]} />
                    <Bar dataKey="accuracy" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Statistics</CardTitle>
                <CardDescription>Detailed breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Total Questions</TableHead>
                      <TableHead>Correct Answers</TableHead>
                      <TableHead>Accuracy Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.categoryPerformance.map((category) => (
                      <TableRow key={category.category}>
                        <TableCell className="font-medium">{category.category}</TableCell>
                        <TableCell>{category.totalQuestions}</TableCell>
                        <TableCell>{category.correctAnswers}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              category.accuracy >= 80
                                ? "default"
                                : category.accuracy >= 60
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {category.accuracy.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Question Performance</CardTitle>
                <CardDescription>Individual question accuracy and difficulty analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Accuracy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.questionPerformance.map((question) => (
                      <TableRow key={question.questionId}>
                        <TableCell className="max-w-md">
                          <p className="font-medium text-balance line-clamp-2">{question.question}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{question.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              question.difficulty === "easy"
                                ? "secondary"
                                : question.difficulty === "medium"
                                  ? "default"
                                  : "destructive"
                            }
                          >
                            {question.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>{question.totalAttempts}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              question.accuracy >= 70
                                ? "default"
                                : question.accuracy >= 50
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {question.accuracy.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submission Trends</CardTitle>
                <CardDescription>Quiz submissions and performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={analytics.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="submissions"
                      stackId="1"
                      stroke="#164e63"
                      fill="#164e63"
                      fillOpacity={0.6}
                    />
                    <Line yAxisId="right" type="monotone" dataKey="averageScore" stroke="#8b5cf6" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
