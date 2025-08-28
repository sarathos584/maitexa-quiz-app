export interface CertificateData {
  userName: string
  userEmail: string
  company: string
  college: string
  score: number
  percentage: number
  totalQuestions: number
  completedAt: Date
  submissionId: string
}

export function generateCertificateId(completedAt: Date): string {
  const year = completedAt.getFullYear()
  const randomId = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `MTX-${year}-${randomId}`
}

export function formatCertificateDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function validateCertificateEligibility(percentage: number): boolean {
  return percentage >= 90
}

export function generateCertificateFileName(userName: string): string {
  const sanitizedName = userName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()
  return `maitexa-certificate-${sanitizedName}.pdf`
}
