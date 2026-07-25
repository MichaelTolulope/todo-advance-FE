"use client"

import { useState } from "react"
import { Edit2, Trash } from "iconsax-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PRIORITY_CLASS, STATUSES, type Status, type Task } from "@/lib/types"
import { cn } from "@/lib/utils"

type Props = {
  tasks: Task[]
  onMove: (id: string, status: Status) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function KanbanBoard({ tasks, onMove, onEdit, onDelete }: Props) {
  const [dragOver, setDragOver] = useState<Status | null>(null)

  function handleDrop(e: React.DragEvent, status: Status) {
    e.preventDefault()
    const id = e.dataTransfer.getData("text/plain")
    if (id) onMove(id, status)
    setDragOver(null)
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {STATUSES.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.value)

        return (
          <div
            key={column.value}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(column.value)
            }}
            onDragLeave={() => setDragOver((s) => (s === column.value ? null : s))}
            onDrop={(e) => handleDrop(e, column.value)}
            className={cn(
              "flex min-h-64 flex-col gap-2 rounded-xl bg-muted/50 p-3 transition-colors",
              dragOver === column.value && "bg-muted ring-2 ring-primary/40"
            )}
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium">{column.label}</span>
              <Badge variant="secondary">{columnTasks.length}</Badge>
            </div>

            {columnTasks.map((task) => (
              <Card
                key={task.id}
                size="sm"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", task.id)}
                className="group cursor-grab gap-2 px-3 active:cursor-grabbing"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 text-sm font-medium">{task.title}</p>
                  <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => onEdit(task)}
                      aria-label="Edit task"
                    >
                      <Edit2 size={14} color="currentColor" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(task.id)}
                      aria-label="Delete task"
                    >
                      <Trash size={14} color="currentColor" />
                    </Button>
                  </div>
                </div>

                {task.description && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {task.description}
                  </p>
                )}

                <Badge className={cn("w-fit", PRIORITY_CLASS[task.priority])}>
                  {task.priority}
                </Badge>
              </Card>
            ))}

            {columnTasks.length === 0 && (
              <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                Drop tasks here
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
