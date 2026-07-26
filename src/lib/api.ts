import type { Task, TaskInput } from "./types"

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "")

export type FieldError = { field: string; message: string }

export class ApiError extends Error {
  status: number
  details?: FieldError[]

  constructor(message: string, status: number, details?: FieldError[]) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

type Envelope<T> = { data: T }
type ErrorEnvelope = { error?: { message?: string; details?: FieldError[] } }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}/api${path}`, {
      ...init,
      headers: init?.body
        ? { "Content-Type": "application/json", ...init.headers }
        : init?.headers,
    })
  } catch {
    // Network-level failure: the server is down, unreachable, or blocked by CORS.
    throw new ApiError(`Can't reach the API at ${BASE_URL}. Is the backend running?`, 0)
  }

  if (response.status === 204) return undefined as T

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const error = (payload as ErrorEnvelope | null)?.error
    throw new ApiError(
      error?.message ?? `Request failed with status ${response.status}`,
      response.status,
      error?.details
    )
  }

  if (payload === null || typeof payload !== "object" || !("data" in payload)) {
    throw new ApiError("Unexpected response from the API", response.status)
  }

  return (payload as Envelope<T>).data
}

export const tasksApi = {
  list: () => request<Task[]>("/tasks"),

  create: (input: TaskInput) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(input) }),

  update: (id: string, patch: Partial<TaskInput>) =>
    request<Task>(`/tasks/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  remove: (id: string) =>
    request<void>(`/tasks/${encodeURIComponent(id)}`, { method: "DELETE" }),
}
