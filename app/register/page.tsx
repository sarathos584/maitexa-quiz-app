"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    college: "",
    university: "",
    course: "",
    graduationYear: "",
    phone: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const { userId } = await response.json()
        // Store user ID and basic info in session storage for the quiz
        sessionStorage.setItem("userId", userId)
        sessionStorage.setItem("userName", formData.fullName)
        sessionStorage.setItem("userEmail", formData.email)
        router.push("/quiz")
      } else {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert((error as Error).message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <h1 className="text-2xl font-bold text-card-foreground">Maitexa</h1>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Register for Assessment</CardTitle>
              <CardDescription>Please provide your details to begin the assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="college">College</Label>
                  <Input
                    id="college"
                    type="text"
                    placeholder="Your college"
                    value={formData.college}
                    onChange={(e) => handleInputChange("college", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    type="text"
                    placeholder="Your university"
                    value={formData.university}
                    onChange={(e) => handleInputChange("university", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Input
                    id="course"
                    type="text"
                    placeholder="e.g., B.Tech CSE"
                    value={formData.course}
                    onChange={(e) => handleInputChange("course", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    placeholder="e.g., 2026"
                    value={formData.graduationYear}
                    onChange={(e) => handleInputChange("graduationYear", e.target.value)}
                    required
                    min="1900"
                    max="2100"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Proceed"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
