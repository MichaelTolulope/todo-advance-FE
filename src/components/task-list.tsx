"use client"

import { Edit2, Trash, TaskSquare } from "iconsax-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { PRIORITY_CLASS, STATUSES, type Task } from "@/lib/types"
import { cn } from "@/lib/utils"

type Props = {
  tasks: Task[]
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskList({ tasks, onToggle, onEdit, onDelete }: Props) {
  if (tasks.length === 0) {
    return (
      <Card className="items-center gap-3 py-14 text-center">
        <TaskSquare size={32} color="currentColor" className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No tasks yet. Add your first one.</p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <Card key={task.id} size="sm" className="flex-row items-start gap-3 px-3">
          <Checkbox
            checked={task.status === "done"}
            onCheckedChange={() => onToggle(task)}
            className="mt-0.5"
            aria-label={`Mark "${task.title}" as done`}
          />

          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate font-medium",
                task.status === "done" && "text-muted-foreground line-through"
              )}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {task.description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Badge className={PRIORITY_CLASS[task.priority]}>{task.priority}</Badge>
            <Badge variant="outline">
              {STATUSES.find((s) => s.value === task.status)?.label}
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => onEdit(task)} aria-label="Edit task">
              <Edit2 size={16} color="currentColor" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task.id)}
              aria-label="Delete task"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash size={16} color="currentColor" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
