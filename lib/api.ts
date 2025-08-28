import { NextResponse } from "next/server"

const env = (process.env.NODE_ENV || "").toLowerCase()
const isDebugEnv = env === "development" || env === "dev" || env === "test" || env === "testing"

export function jsonErrorResponse(
  err: unknown,
  status: number = 500,
  message: string = "Internal server error",
  extra?: Record<string, unknown>,
) {
  const base: Record<string, unknown> = { error: message }

  if (isDebugEnv) {
    const anyErr = err as any
    base.debug = {
      name: anyErr?.name,
      message: anyErr?.message,
      stack: anyErr?.stack,
      cause: anyErr?.cause,
      ...extra,
    }
  }

  return NextResponse.json(base, { status })
}

export function jsonSuccess<T extends Record<string, unknown>>(body: T, init?: number | ResponseInit) {
  const responseInit: ResponseInit | undefined = typeof init === "number" ? { status: init } : init
  return NextResponse.json(body, responseInit)
}
