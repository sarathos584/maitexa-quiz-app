"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, Download, Home } from "lucide-react"
import { jsPDF } from "jspdf"

interface CertificateViewData {
  userName: string
  userEmail: string
  company?: string
  college?: string
  totalQuestions: number
  percentage: number
  completedAt: string
  certificateId: string
  excellence: boolean
}

export default function CertificatePreviewById() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const certificateId = searchParams.get("certificateId") || ""
  const [data, setData] = useState<CertificateViewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      const id = certificateId
      if (id) {
        try {
          const res = await fetch(`/api/certificate/preview?certificateId=${encodeURIComponent(id)}`)
          if (res.ok) {
            const json = await res.json()
            setData(json.certificate)
            setIsLoading(false)
            return
          }
        } catch {}
      }
      // Fallback to session
      const fromSession = sessionStorage.getItem("mockResults")
      if (fromSession) {
        try {
          const r = JSON.parse(fromSession)
          const d: CertificateViewData = {
            userName: r.userName,
            userEmail: r.userEmail,
            company: "",
            college: r.college || "",
            totalQuestions: r.totalQuestions,
            percentage: Math.round((r.correctAnswers / r.totalQuestions) * 100),
            completedAt: r.submittedAt,
            certificateId: r.certificateId || id || "",
            excellence: r.isExcellent,
          }
          setData(d)
        } catch {}
      }
      setIsLoading(false)
    }
    load()
  }, [certificateId])

  const copyUrl = async () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      console.error("Failed to copy URL", e)
    }
  }

  const download = () => {
    if (!data) return

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 10
    const innerMargin = 5

    // Background
    doc.setFillColor(248, 250, 252)
    doc.rect(0, 0, pageWidth, pageHeight, "F")

    // Outer border
    doc.setDrawColor(22, 78, 99)
    doc.setLineWidth(2)
    doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2)

    // Inner border
    doc.setDrawColor(139, 92, 246)
    doc.setLineWidth(0.5)
    doc.rect(margin + innerMargin, margin + innerMargin, pageWidth - (margin + innerMargin) * 2, pageHeight - (margin + innerMargin) * 2)

    // Header bar
    doc.setFillColor(22, 78, 99)
    doc.rect(margin + innerMargin + 5, margin + innerMargin + 5, pageWidth - (margin + innerMargin + 5) * 2, 25, "F")

    // Logo
    doc.setFillColor(255, 255, 255)
    doc.circle(margin + innerMargin + 20, margin + innerMargin + 17.5, 8, "F")
    doc.setTextColor(22, 78, 99)
    doc.setFontSize(16)
    doc.setFont("times", "bold")
    doc.text("M", margin + innerMargin + 17, margin + innerMargin + 21)

    // Company
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("MAITEXA", margin + innerMargin + 35, margin + innerMargin + 15)
    doc.setFontSize(12)
    doc.setFont("courier", "normal")
    doc.text("Professional Coding Assessments", margin + innerMargin + 35, margin + innerMargin + 23)

    // Title
    doc.setTextColor(22, 78, 99)
    doc.setFontSize(30)
    doc.setFont("times", "bold")
    const title = data.excellence ? "CERTIFICATE OF EXCELLENCE" : "CERTIFICATE OF PARTICIPATION"
    const titleWidth = doc.getTextWidth(title)
    doc.text(title, (pageWidth - titleWidth) / 2, 70)

    // Subtitle & name
    doc.setFontSize(14)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(71, 85, 105)
    const subtitle = "This certifies that"
    const subtitleWidth = doc.getTextWidth(subtitle)
    doc.text(subtitle, (pageWidth - subtitleWidth) / 2, 85)

    doc.setFontSize(28)
    doc.setFont("courier", "bold")
    doc.setTextColor(139, 92, 246)
    const nameWidth = doc.getTextWidth(data.userName)
    doc.text(data.userName, (pageWidth - nameWidth) / 2, 105)

    doc.setFontSize(14)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(71, 85, 105)
    const line1 = data.excellence
      ? "has successfully completed the Maitexa Coding Assessment"
      : "has successfully participated in the Maitexa Coding Assessment"
    const wrappedLine1 = doc.splitTextToSize(line1, pageWidth - 40)
    doc.text(wrappedLine1, 20, 120)

    // Details (responsive)
    doc.setFontSize(12)
    doc.setTextColor(22, 78, 99)
    doc.setFont("helvetica", "bold")
    const colGap = 15
    const colWidth = (pageWidth - 40 - colGap) / 2
    const leftX = 20
    const rightX = leftX + colWidth + colGap
    let y = 150

    // Institution
    doc.text("Institution:", leftX, y)
    doc.setFont("helvetica", "normal")
    const collegeText = (data.college && data.college.trim()) ? data.college : "-"
    const wrappedCollege = doc.splitTextToSize(collegeText, colWidth)
    doc.text(wrappedCollege, leftX, y + 8)

    // Date & Certificate ID on right
    doc.setFont("helvetica", "bold")
    doc.text("Date of Completion:", rightX, y)
    doc.setFont("helvetica", "normal")
    const dateStr = new Date(data.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    const wrappedDate = doc.splitTextToSize(dateStr, colWidth)
    doc.text(wrappedDate, rightX, y + 8)

    y = y + Math.max(wrappedCollege.length, wrappedDate.length) * 6 + 10

    doc.setFont("helvetica", "bold")
    doc.text("Certificate ID:", rightX, y)
    doc.setFont("courier", "bold")
    const certText = data.certificateId || "-"
    const wrappedCert = doc.splitTextToSize(certText, colWidth)
    doc.text(wrappedCert, rightX, y + 8)

    // Footer badge
    doc.setFillColor(139, 92, 246)
    doc.circle(pageWidth - 40, 60, 15, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.text(data.excellence ? "EXCELLENCE" : "PARTICIPATION", pageWidth - 54, 58)
    doc.text(data.excellence ? "90%+" : "THANK YOU", pageWidth - 47, 65)

    doc.save(`maitexa-certificate-${data.userName.replace(/\s+/g, "-")}.pdf`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">Certificate data not found.</p>
            <Button onClick={() => router.push("/")}>Back to Home</Button>
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
            <h1 className="text-2xl font-bold">Certificate Preview</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={copyUrl}>{copied ? "Copied!" : "Copy URL"}</Button>
              <Button variant="outline" onClick={() => router.push("/")}> <Home className="h-4 w-4 mr-2"/> Home</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="text-center pb-8">
              <div className="inline-flex items-center gap-3 mb-4 bg-primary/10 border border-primary/20 px-4 py-2 rounded">
                <Award className="h-5 w-5 text-primary"/>
                <span className="font-semibold text-primary">Maitexa Technologies</span>
              </div>
              <CardTitle className="text-3xl text-primary mb-2">
                {data.excellence ? "Certificate of Excellence" : "Certificate of Participation"}
              </CardTitle>
              <CardDescription className="text-lg">
                This certifies that <span className="font-bold text-secondary">{data.userName}</span> has {data.excellence ? "successfully completed the assessment with distinction" : "participated in the assessment"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Removed score from preview for cleaner certificate */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Institution</p>
                  <p className="font-medium break-words">{data.college || "-"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Date of Completion</p>
                  <p className="font-medium">
                    {new Date(data.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Certificate ID</p>
                  <p className="font-medium font-mono break-all">{data.certificateId}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Verification</p>
                  <p className="font-medium">maitexa.com/verify</p>
                </div>
              </div>

              <div className="text-center pt-6 border-t border-border">
                <Button onClick={download} size="lg" className="gap-2">
                  <Download className="h-5 w-5"/>
                  Download PDF Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
