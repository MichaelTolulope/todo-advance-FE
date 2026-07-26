"use client"

import { useSyncExternalStore } from "react"

import { ApiError, tasksApi } from "./api"
import type { Status, Task, TaskInput } from "./types"

type State = {
  tasks: Task[]
  ready: boolean
  error: string | null
}

// Stable reference: also serves as the SSR/hydration snapshot.
const INITIAL: State = { tasks: [], ready: false, error: null }

let state: State = INITIAL
const listeners = new Set<() => void>()

function getSnapshot(): State {
  return state
}

function getServerSnapshot(): State {
  return INITIAL
}

function setState(patch: Partial<State>) {
  state = { ...state, ...patch }
  listeners.forEach((notify) => notify())
}

function messageFor(error: unknown): string {
  if (error instanceof ApiError) {
    // Field-level messages ("title cannot be empty") beat the generic wrapper.
    if (error.details?.length) return error.details.map((detail) => detail.message).join(", ")
    return error.message
  }
  return "Something went wrong. Please try again."
}

// Matches the server's ordering, so a rolled-back delete lands back in place.
function byNewestFirst(a: Task, b: Task) {
  return b.createdAt - a.createdAt || a.id.localeCompare(b.id)
}

let inFlightLoad: Promise<void> | null = null

function load(): Promise<void> {
  inFlightLoad ??= tasksApi
    .list()
    .then((tasks) => setState({ tasks, ready: true, error: null }))
    .catch((error) => setState({ ready: true, error: messageFor(error) }))
    .finally(() => {
      inFlightLoad = null
    })
  return inFlightLoad
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  if (!state.ready) void load()
  return () => {
    listeners.delete(onChange)
  }
}

/**
 * A task added optimistically has a placeholder id until the POST resolves.
 * Editing or deleting one in that window has to wait for its real id.
 */
const pendingCreates = new Map<string, Promise<Task>>()

async function resolveId(id: string): Promise<string> {
  const pending = pendingCreates.get(id)
  if (!pending) return id
  try {
    return (await pending).id
  } catch {
    return id
  }
}

async function addTask(input: TaskInput): Promise<void> {
  const now = Date.now()
  const optimistic: Task = {
    ...input,
    id: `temp-${crypto.randomUUID()}`,
    createdAt: now,
    updatedAt: now,
  }

  setState({ tasks: [optimistic, ...state.tasks], error: null })

  const request = tasksApi.create(input)
  pendingCreates.set(optimistic.id, request)

  try {
    const created = await request
    // Read state fresh so a concurrent change isn't clobbered.
    setState({ tasks: state.tasks.map((task) => (task.id === optimistic.id ? created : task)) })
  } catch (error) {
    setState({
      tasks: state.tasks.filter((task) => task.id !== optimistic.id),
      error: messageFor(error),
    })
  } finally {
    pendingCreates.delete(optimistic.id)
  }
}

async function updateTask(id: string, patch: Partial<TaskInput>): Promise<void> {
  const original = state.tasks.find((task) => task.id === id)
  if (!original) return

  setState({
    tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)),
    error: null,
  })

  try {
    const updated = await tasksApi.update(await resolveId(id), patch)
    setState({ tasks: state.tasks.map((task) => (task.id === id ? updated : task)) })
  } catch (error) {
    // Roll back just this task, leaving any other edits intact.
    setState({
      tasks: state.tasks.map((task) => (task.id === id ? original : task)),
      error: messageFor(error),
    })
  }
}

async function removeTask(id: string): Promise<void> {
  const removed = state.tasks.find((task) => task.id === id)
  if (!removed) return

  setState({ tasks: state.tasks.filter((task) => task.id !== id), error: null })

  try {
    await tasksApi.remove(await resolveId(id))
  } catch (error) {
    setState({
      tasks: [...state.tasks, removed].sort(byNewestFirst),
      error: messageFor(error),
    })
  }
}

function moveTask(id: string, status: Status): Promise<void> {
  return updateTask(id, { status })
}

function refresh(): Promise<void> {
  return load()
}

export function useTasks() {
  const { tasks, ready, error } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  return { tasks, ready, error, addTask, updateTask, removeTask, moveTask, refresh }
}
