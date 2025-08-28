import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Demo credentials for prototype
    const validCredentials = {
      email: "admin@maitexa.com",
      password: "admin123",
    }

    if (email !== validCredentials.email || password !== validCredentials.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate mock token for session
    const mockToken = `mock-admin-token-${Date.now()}`

    return NextResponse.json({
      message: "Login successful",
      token: mockToken,
      admin: {
        id: "admin-1",
        email: "admin@maitexa.com",
        name: "Admin User",
      },
    })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
