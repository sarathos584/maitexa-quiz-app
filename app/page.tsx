import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <h1 className="text-2xl font-bold text-card-foreground">Maitexa</h1>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">Welcome To Maitexa</h2>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Start your coding journey with our comprehensive assessment platform. Test your skills and earn
              certificates for excellence.
            </p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Begin?</CardTitle>
              <CardDescription>
                Take our coding assessment and showcase your technical skills. High performers (90%+) receive
                downloadable certificates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Multiple choice questions</p>
                <p>• Instant results and feedback</p>
                <p>• Certificate for top performers</p>
              </div>
              <Link href="/register">
                <Button size="lg" className="w-full">
                  Start Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border bg-muted mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Maitexa. Professional coding assessments for technical excellence.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
