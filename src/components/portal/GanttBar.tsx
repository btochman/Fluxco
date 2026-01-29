"use client";

import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, Calendar, Clock } from "lucide-react";
import type { GanttTask } from "@/hooks/useGanttData";
import type { TaskStatus } from "@/types/portal";

const ROW_HEIGHT = 40;

// Status colors matching Kanban board
const statusColors: Record<TaskStatus, string> = {
  backlog: "bg-slate-400",
  todo: "bg-blue-500",
  in_progress: "bg-yellow-500",
  review: "bg-purple-500",
  done: "bg-green-500",
};

const statusBgColors: Record<TaskStatus, string> = {
  backlog: "bg-slate-200 hover:bg-slate-300",
  todo: "bg-blue-200 hover:bg-blue-300",
  in_progress: "bg-yellow-200 hover:bg-yellow-300",
  review: "bg-purple-200 hover:bg-purple-300",
  done: "bg-green-200 hover:bg-green-300",
};

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

interface GanttBarProps {
  task: GanttTask;
  onClick: () => void;
  color?: string; // Optional phase/project color
}

export function GanttBar({ task, onClick, color }: GanttBarProps) {
  const isBlocked =
    task.blocked_by &&
    task.blocked_by.length > 0 &&
    task.status !== "done";

  const isOverdue =
    task.due_date &&
    isPast(new Date(task.due_date)) &&
    !isToday(new Date(task.due_date)) &&
    task.status !== "done";

  const ownerInitials = task.owner?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "absolute h-7 rounded-md cursor-pointer transition-all",
            "flex items-center px-2 gap-1 overflow-hidden",
            "border shadow-sm",
            !color && statusBgColors[task.status],
            isOverdue && "ring-2 ring-red-400 ring-offset-1",
            isBlocked && "opacity-70"
          )}
          style={{
            left: task.barLeft,
            width: Math.max(task.barWidth, 24),
            top: task.row * ROW_HEIGHT + 6,
            ...(color && {
              backgroundColor: `${color}30`,
              borderColor: `${color}60`,
            }),
          }}
          onClick={onClick}
        >
          {/* Status indicator dot */}
          <div
            className={cn("w-2 h-2 rounded-full flex-shrink-0", statusColors[task.status])}
          />

          {/* Task title */}
          <span className="text-xs font-medium truncate flex-1 text-slate-700">
            {task.title}
          </span>

          {/* Owner avatar (if space allows) */}
          {task.owner && task.barWidth > 80 && (
            <Avatar className="h-4 w-4 flex-shrink-0">
              <AvatarImage src={task.owner.avatar_url || undefined} />
              <AvatarFallback className="text-[8px]">
                {ownerInitials}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Blocked indicator */}
          {isBlocked && (
            <AlertTriangle className="h-3 w-3 text-red-600 flex-shrink-0" />
          )}
        </div>
      </TooltipTrigger>

      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-2">
          {/* Title */}
          <div className="font-medium">{task.title}</div>

          {/* Status and Priority */}
          <div className="flex gap-2">
            <Badge
              variant="secondary"
              className={cn("text-xs", statusBgColors[task.status])}
            >
              {task.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {priorityLabels[task.priority]}
            </Badge>
          </div>

          {/* Dates */}
          <div className="text-xs text-muted-foreground space-y-1">
            {task.start_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Start: {format(new Date(task.start_date), "MMM d, yyyy")}
              </div>
            )}
            {task.due_date && (
              <div
                className={cn(
                  "flex items-center gap-1",
                  isOverdue && "text-red-600 font-medium"
                )}
              >
                <Calendar className="h-3 w-3" />
                Due: {format(new Date(task.due_date), "MMM d, yyyy")}
                {isOverdue && " (Overdue)"}
              </div>
            )}
            {task.estimated_hours && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Estimated: {task.estimated_hours}h
              </div>
            )}
          </div>

          {/* Owner */}
          {task.owner && (
            <div className="flex items-center gap-2 pt-1 border-t">
              <Avatar className="h-5 w-5">
                <AvatarImage src={task.owner.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">
                  {ownerInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{task.owner.name}</span>
            </div>
          )}

          {/* Dependencies */}
          {isBlocked && (
            <div className="text-xs text-red-600 pt-1 border-t flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Blocked by {task.blocked_by?.length} task(s)
            </div>
          )}

          {/* Description preview */}
          {task.description && (
            <p className="text-xs text-muted-foreground pt-1 border-t line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export { ROW_HEIGHT };
