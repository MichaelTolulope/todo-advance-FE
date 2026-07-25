export type Status = "todo" | "in-progress" | "done"
export type Priority = "low" | "medium" | "high"

export type Task = {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  createdAt: number
  updatedAt: number
}

/** The fields a client may set. `id` and the timestamps belong to the server. */
export type TaskInput = Pick<Task, "title" | "description" | "status" | "priority">

export const STATUSES: { value: Status; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
]

export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
]

export const PRIORITY_CLASS: Record<Priority, string> = {
  low: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  high: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
}
