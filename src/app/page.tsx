"use client"

import { useMemo, useState } from "react"
import {
  Add,
  Category,
  Clock,
  Danger,
  Refresh,
  RowVertical,
  SearchNormal1,
  TickCircle,
} from "iconsax-react"
import { KanbanBoard } from "@/components/kanban-board"
import { TaskDialog } from "@/components/task-dialog"
import { TaskList } from "@/components/task-list"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Task } from "@/lib/types"
import { useTasks } from "@/lib/use-tasks"

export default function Home() {
  const { tasks, ready, error, addTask, updateTask, removeTask, moveTask, refresh } = useTasks()
  const [query, setQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tasks
    return tasks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    )
  }, [tasks, query])

  const stats = useMemo(
    () => ({
      total: tasks.length,
      active: tasks.filter((t) => t.status !== "done").length,
      done: tasks.filter((t) => t.status === "done").length,
    }),
    [tasks]
  )

  function openNew() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(task: Task) {
    setEditing(task)
    setDialogOpen(true)
  }

  function handleSave(
    values: Pick<Task, "title" | "description" | "status" | "priority">
  ) {
    if (editing) updateTask(editing.id, values)
    else addTask(values)
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            A simple board, saved to your task API.
          </p>
        </div>
        <Button onClick={openNew}>
          <Add size={18} color="currentColor" />
          New task
        </Button>
      </header>

      {error && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3"
        >
          <Danger size={18} color="currentColor" className="mt-0.5 shrink-0 text-destructive" />
          <p className="flex-1 text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={() => refresh()}>
            <Refresh size={14} color="currentColor" />
            Retry
          </Button>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={<Category size={18} color="currentColor" />}
          label="Total"
          value={stats.total}
        />
        <StatCard
          icon={<Clock size={18} color="currentColor" />}
          label="Active"
          value={stats.active}
        />
        <StatCard
          icon={<TickCircle size={18} color="currentColor" />}
          label="Done"
          value={stats.done}
        />
      </div>

      <div className="relative mt-6">
        <SearchNormal1
          size={16}
          color="currentColor"
          className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks"
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="board" className="mt-6">
        <TabsList>
          <TabsTrigger value="board">
            <Category size={16} color="currentColor" />
            Board
          </TabsTrigger>
          <TabsTrigger value="list">
            <RowVertical size={16} color="currentColor" />
            List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-4">
          {ready ? (
            <KanbanBoard
              tasks={filtered}
              onMove={moveTask}
              onEdit={openEdit}
              onDelete={removeTask}
            />
          ) : (
            <LoadingTasks />
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          {ready ? (
            <TaskList
              tasks={filtered}
              onToggle={(task) =>
                updateTask(task.id, { status: task.status === "done" ? "todo" : "done" })
              }
              onEdit={openEdit}
              onDelete={removeTask}
            />
          ) : (
            <LoadingTasks />
          )}
        </TabsContent>
      </Tabs>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editing}
        onSave={handleSave}
      />
    </main>
  )
}

function LoadingTasks() {
  return (
    <Card className="items-center py-14 text-center">
      <p className="text-sm text-muted-foreground">Loading tasks…</p>
    </Card>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <Card size="sm" className="flex-row items-center gap-3 px-4">
      <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </Card>
  )
}
