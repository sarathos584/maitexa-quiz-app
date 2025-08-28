"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Award, Calendar, User, Building, GraduationCap } from "lucide-react"
import Link from "next/link"

interface CertificatePreview {
  userName: string
  userEmail: string
  company: string
  college: string
  score: number
  percentage: number
  totalQuestions: number
  completedAt: string
  certificateId: string
}

export default function CertificatePreviewPage({ params }: { params: { id: string } }) {
  const [certificate, setCertificate] = useState<CertificatePreview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCertificatePreview()
  }, [params.id])

  const fetchCertificatePreview = async () => {
    try {
      const response = await fetch(`/api/certificate/${params.id}/preview`)
      if (response.ok) {
        const data = await response.json()
        setCertificate(data.certificate)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Certificate not found")
      }
    } catch (error) {
      console.error("Error fetching certificate preview:", error)
      setError("Failed to load certificate")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadCertificate = async () => {
    try {
      const response = await fetch(`/api/certificate/${params.id}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `maitexa-certificate-${certificate?.userName.replace(/\s+/g, "-")}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        throw new Error("Failed to download certificate")
      }
    } catch (error) {
      console.error("Error downloading certificate:", error)
      alert("Failed to download certificate. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading certificate...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">Certificate not found.</p>
            <Link href="/">
              <Button>Back to Home</Button>
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
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <h1 className="text-2xl font-bold text-card-foreground">Certificate Preview</h1>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Certificate Preview Card */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-2xl">M</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-card-foreground">MAITEXA</h2>
                  <p className="text-sm text-muted-foreground">Professional Coding Assessments</p>
                </div>
              </div>
              <CardTitle className="text-3xl text-primary mb-2">Certificate of Excellence</CardTitle>
              <CardDescription className="text-lg">
                This certifies that <span className="font-bold text-secondary">{certificate.userName}</span> has
                successfully completed the Maitexa Coding Assessment
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Score Section */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-lg border border-primary/20">
                  <Award className="h-6 w-6 text-primary" />
                  <span className="text-2xl font-bold text-primary">
                    {certificate.score}/{certificate.totalQuestions} ({certificate.percentage}%)
                  </span>
                  <Badge variant="default" className="ml-2">
                    Excellence
                  </Badge>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Candidate</p>
                      <p className="font-medium">{certificate.userName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{certificate.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Institution</p>
                      <p className="font-medium">{certificate.college}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Completion</p>
                      <p className="font-medium">
                        {new Date(certificate.completedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Certificate ID</p>
                      <p className="font-medium font-mono">{certificate.certificateId}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Section */}
              <div className="text-center pt-6 border-t border-border">
                <Button onClick={downloadCertificate} size="lg" className="gap-2">
                  <Download className="h-5 w-5" />
                  Download PDF Certificate
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  This certificate can be verified at maitexa.com/verify
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
