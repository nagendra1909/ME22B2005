import { type NextRequest, NextResponse } from "next/server"

// Store for window states across requests
type WindowStore = {
  [key: string]: number[]
}

const windowStore: WindowStore = {
  p: [], // prime
  f: [], // fibonacci
  e: [], // even
  r: [], // random
}

// API endpoints for different number types
const API_ENDPOINTS = {
  p: "http://20.244.56.144/evaluation-service/primes",
  f: "http://20.244.56.144/evaluation-service/fibo",
  e: "http://20.244.56.144/evaluation-service/even",
  r: "http://20.244.56.144/evaluation-service/rand",
}

export async function GET(request: NextRequest, { params }: { params: { type: string } }) {
  const type = params.type

  // Validate number type
  if (!["p", "f", "e", "r"].includes(type)) {
    return NextResponse.json({ error: "Invalid number type. Use 'p', 'f', 'e', or 'r'." }, { status: 400 })
  }

  // Get window size from query params (default to 10)
  const searchParams = request.nextUrl.searchParams
  const windowSize = Number.parseInt(searchParams.get("windowSize") || "10")

  if (isNaN(windowSize) || windowSize < 1) {
    return NextResponse.json({ error: "Window size must be a positive number" }, { status: 400 })
  }

  try {
    // Store the previous state
    const windowPrevState = [...windowStore[type]]

    // Fetch numbers from the third-party API with timeout
    const numbers = await fetchNumbersWithTimeout(API_ENDPOINTS[type])

    // Update the window state
    updateWindowState(type, numbers, windowSize)

    // Calculate average
    const avg = calculateAverage(windowStore[type])

    // Return the response
    return NextResponse.json({
      windowPrevState,
      windowCurrState: windowStore[type],
      numbers,
      avg,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch or process numbers" }, { status: 500 })
  }
}

// Fetch numbers with a timeout of 500ms
async function fetchNumbersWithTimeout(url: string): Promise<number[]> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 500)

  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return data.numbers || []
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Request timed out")
      return []
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

// Update the window state with new numbers
function updateWindowState(type: string, newNumbers: number[], windowSize: number) {
  // Ensure the store for this type exists
  if (!windowStore[type]) {
    windowStore[type] = []
  }

  // Add new unique numbers
  for (const num of newNumbers) {
    if (!windowStore[type].includes(num)) {
      windowStore[type].push(num)

      // If we exceed the window size, remove the oldest number
      if (windowStore[type].length > windowSize) {
        windowStore[type].shift()
      }
    }
  }
}

// Calculate the average of numbers in the window
function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0

  const sum = numbers.reduce((acc, num) => acc + num, 0)
  return sum / numbers.length
}
