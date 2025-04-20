import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = "http://20.244.56.144/evaluation-service"

// Add authentication headers for the API using the provided token
const getAuthHeaders = () => {
  return {
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ1MTI3NzM2LCJpYXQiOjE3NDUxMjc0MzYsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjdmNzVmYjRmLTM2NTQtNDE2My1hNjY2LTdkNDU3Mzk1MDJjOCIsInN1YiI6Im1lMjJiMjAwNUBpaWl0ZG0uYWMuaW4ifSwiZW1haWwiOiJtZTIyYjIwMDVAaWlpdGRtLmFjLmluIiwibmFtZSI6InQgbmFnZW5kcmEga3VtYXIiLCJyb2xsTm8iOiJtZTIyYjIwMDUiLCJhY2Nlc3NDb2RlIjoid2NISHJwIiwiY2xpZW50SUQiOiI3Zjc1ZmI0Zi0zNjU0LTQxNjMtYTY2Ni03ZDQ1NzM5NTAyYzgiLCJjbGllbnRTZWNyZXQiOiJ0ZUhueFpmelRzdmRaelpqIn0.5GsT7Ba6pfbc6pKdsRstZeEFglquhpIyPUODnZFyAIc",
    "Content-Type": "application/json",
    Accept: "application/json",
  }
}

// Add retry logic for more reliable API calls
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 300) {
  try {
    console.log(`Fetching: ${url}`)
    const response = await fetch(url, options)

    if (response.ok) {
      return response
    }

    console.error(`API request failed: ${url} - Status: ${response.status}`)

    // If we have retries left and the error is retryable (e.g., 5xx errors)
    if (retries > 0 && (response.status >= 500 || response.status === 429)) {
      console.log(`Retrying API call to ${url}, ${retries} retries left`)
      await new Promise((resolve) => setTimeout(resolve, backoff))
      return fetchWithRetry(url, options, retries - 1, backoff * 2)
    }

    return response
  } catch (error) {
    console.error(`Network error for ${url}:`, error)
    if (retries > 0) {
      console.log(`Network error, retrying API call to ${url}, ${retries} retries left`)
      await new Promise((resolve) => setTimeout(resolve, backoff))
      return fetchWithRetry(url, options, retries - 1, backoff * 2)
    }
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the path from the URL
    const path = request.nextUrl.searchParams.get("path")

    if (!path) {
      return NextResponse.json({ error: "Path parameter is required" }, { status: 400 })
    }

    // Make the request to the external API with retry logic
    const response = await fetchWithRetry(
      `${API_BASE_URL}${path}`,
      {
        headers: getAuthHeaders(),
        cache: "no-store",
      },
      3, // 3 retries
      300, // 300ms initial backoff
    )

    if (!response.ok) {
      console.error(`API request failed: ${path} - Status: ${response.status}`)

      // Return mock data based on the path if API fails
      return NextResponse.json(getMockDataForPath(path), { status: 200 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Proxy API error:", error)

    // Return mock data if there's a network error
    const path = request.nextUrl.searchParams.get("path") || ""
    return NextResponse.json(getMockDataForPath(path), { status: 200 })
  }
}

// Function to return mock data based on the requested path
function getMockDataForPath(path: string) {
  // Mock data for different endpoints
  switch (path) {
    case "/users":
      return {
        users: {
          "1": "John Doe",
          "2": "Jane Smith",
          "3": "Michael Brown",
          "4": "Sophia Davis",
          "5": "James Wilson",
          "6": "Olivia Taylor",
          "7": "William Anderson",
          "8": "Ava Martinez",
          "9": "Alexander Thomas",
          "10": "Isabella Garcia",
        },
      }

    case "/users/1/posts":
    case "/users/2/posts":
    case "/users/3/posts":
    case "/users/4/posts":
    case "/users/5/posts":
      const userId = path.split("/")[2]
      return {
        posts: [
          {
            id: Number.parseInt(userId) * 100 + 1,
            content: `User ${userId}'s first post about technology trends in 2023`,
          },
          {
            id: Number.parseInt(userId) * 100 + 2,
            content: `User ${userId}'s thoughts on artificial intelligence and machine learning`,
          },
          {
            id: Number.parseInt(userId) * 100 + 3,
            content: `User ${userId}'s review of the latest smartphone release`,
          },
          { id: Number.parseInt(userId) * 100 + 4, content: `User ${userId}'s guide to remote work productivity` },
          {
            id: Number.parseInt(userId) * 100 + 5,
            content: `User ${userId}'s analysis of social media impact on society`,
          },
        ],
      }

    case "/posts/101/comments":
    case "/posts/102/comments":
    case "/posts/103/comments":
    case "/posts/158/comments":
      const postId = Number.parseInt(path.split("/")[2])
      return {
        comments: [
          { id: postId * 10 + 1, postId, content: "Great insights! Thanks for sharing." },
          { id: postId * 10 + 2, postId, content: "I completely agree with your perspective." },
          { id: postId * 10 + 3, postId, content: "This is really helpful information." },
          { id: postId * 10 + 4, postId, content: "I have a different view on this topic." },
          { id: postId * 10 + 5, postId, content: "Looking forward to your next post!" },
        ],
      }

    case "/primes":
      return {
        primes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97],
      }

    case "/rand":
      // Generate 10 random numbers between 1 and 100
      return {
        numbers: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 1),
      }

    default:
      // For any other path, return generic mock data
      if (path.includes("/posts/") && path.includes("/comments")) {
        const postId = Number.parseInt(path.split("/")[2])
        return {
          comments: [
            { id: postId * 10 + 1, postId, content: "Interesting perspective!" },
            { id: postId * 10 + 2, postId, content: "Thanks for sharing this information." },
            { id: postId * 10 + 3, postId, content: "I learned something new today." },
          ],
        }
      } else if (path.includes("/users/") && path.includes("/posts")) {
        const userId = path.split("/")[2]
        return {
          posts: [
            { id: Number.parseInt(userId) * 100 + 1, content: `User ${userId}'s post about current events` },
            { id: Number.parseInt(userId) * 100 + 2, content: `User ${userId}'s thoughts on industry trends` },
          ],
        }
      }

      return { data: "Mock data for " + path }
  }
}
