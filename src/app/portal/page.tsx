"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronRight, Users, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { TaskCardOverlay } from "@/components/portal/TaskCard";
import { QuickAddTask } from "@/components/portal/kanban/QuickAddTask";
import { STATUS_CONFIG, KANBAN_COLUMNS } from "@/lib/kanban-constants";
import { TaskDialog } from "@/components/portal/TaskDialog";
import {
  useAllTasks,
  useProjects,
  useTeamMembers,
  type TaskWithProject,
} from "@/hooks/useTasks";
import type { TaskStatus } from "@/types/portal";

// Cross-project task card with inline editing
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Link2, MessageCircle, MoreHorizontal } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  InlineTextEdit,
  InlineStatusPicker,
  InlinePriorityPicker,
  InlineOwnerPicker,
  InlineDatePicker,
} from "@/components/portal/inline-editors";
import type { TaskPriority } from "@/types/portal";

interface CrossProjectTaskCardProps {
  task: TaskWithProject;
  onOpenDetails?: () => void;
  onUpdate: (updates: Record<string, any>) => Promise<void>;
  teamMembers: { id: string; name: string; email: string; avatar_url: string | null }[];
}

function CrossProjectTaskCard({ task, onOpenDetails, onUpdate, teamMembers }: CrossProjectTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isBlocked = task.blocked_by && task.blocked_by.length > 0 && task.status !== "done";
  const blocksOthers = task.blocks && task.blocks.length > 0;
  const isDone = task.status === "done";

  const handleTitleSave = async (title: string) => {
    await onUpdate({ title });
  };

  const handleStatusChange = async (status: TaskStatus) => {
    await onUpdate({ status });
  };

  const handlePriorityChange = async (priority: TaskPriority) => {
    await onUpdate({ priority });
  };

  const handleOwnerChange = async (owner_id: string | null) => {
    await onUpdate({ owner_id });
  };

  const handleDueDateChange = async (date: Date | null) => {
    await onUpdate({ due_date: date?.toISOString().split("T")[0] || null });
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group transition-all duration-200",
        "hover:shadow-md hover:border-muted-foreground/20",
        isDragging ? "opacity-50 shadow-lg scale-[1.02]" : "",
        isBlocked && "border-l-4 border-l-red-400 bg-red-50/30",
        isDone && "opacity-60"
      )}
    >
      {/* Project indicator */}
      {task.project && (
        <div
          className="h-1 rounded-t-lg"
          style={{ backgroundColor: task.project.color }}
        />
      )}

      {/* Header: Drag handle + Title + Avatar */}
      <div className="flex items-start gap-2 p-3 pb-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing pt-0.5 -ml-1 px-1 touch-none"
        >
          <MoreHorizontal className="h-4 w-4 text-muted-foreground/40 hover:text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <InlineTextEdit
            value={task.title}
            onSave={handleTitleSave}
            className={cn(
              "text-sm font-medium leading-tight",
              isDone && "line-through text-muted-foreground"
            )}
          />
          {task.project && (
            <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: task.project.color }}
              />
              {task.project.name}
            </div>
          )}
        </div>

        <InlineOwnerPicker
          owner={task.owner || null}
          onOwnerChange={handleOwnerChange}
          teamMembers={teamMembers}
        />
      </div>

      {/* Body: Status, Priority, Date */}
      <div className="flex flex-wrap items-center gap-2 px-3 pb-2">
        <InlineStatusPicker
          status={task.status as TaskStatus}
          onStatusChange={handleStatusChange}
        />
        <InlinePriorityPicker
          priority={task.priority as TaskPriority}
          onPriorityChange={handlePriorityChange}
          compact
        />
        <InlineDatePicker
          date={task.due_date ? new Date(task.due_date) : null}
          onDateChange={handleDueDateChange}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 pb-2 pt-1 border-t border-border/50">
        <div className="flex items-center gap-1">
          {isBlocked && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="destructive" className="gap-1 text-[10px] px-1.5 py-0">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  Blocked
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Blocked by {task.blocked_by?.length} task(s)</TooltipContent>
            </Tooltip>
          )}
          {blocksOthers && !isBlocked && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0 text-orange-600 border-orange-300">
                  <Link2 className="h-2.5 w-2.5" />
                  Blocking
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Blocking {task.blocks?.length} task(s)</TooltipContent>
            </Tooltip>
          )}
        </div>

        {onOpenDetails && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails();
            }}
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Details
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function PortalDashboard() {
  const { data: tasks = [], isLoading: tasksLoading, refetch } = useAllTasks();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: teamMembers = [] } = useTeamMembers();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<TaskStatus>>(new Set());
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<TaskWithProject | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (ownerFilter !== "all") {
      result = ownerFilter === "unassigned"
        ? result.filter((t) => !t.owner_id)
        : result.filter((t) => t.owner_id === ownerFilter);
    }
    if (projectFilter !== "all") {
      result = result.filter((t) => t.project_id === projectFilter);
    }
    return result;
  }, [tasks, ownerFilter, projectFilter]);

  // Group by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, TaskWithProject[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };
    filteredTasks.forEach((task) => {
      if (grouped[task.status as TaskStatus]) {
        grouped[task.status as TaskStatus].push(task);
      }
    });
    Object.keys(grouped).forEach((status) => {
      grouped[status as TaskStatus].sort((a, b) => a.position - b.position);
    });
    return grouped;
  }, [filteredTasks]);

  // Progress
  const totalTasks = filteredTasks.length;
  const doneTasks = filteredTasks.filter((t) => t.status === "done").length;
  const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  const toggleColumnCollapse = (columnId: TaskStatus) => {
    setCollapsedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) next.delete(columnId);
      else next.add(columnId);
      return next;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // Check if dropped on column
    const targetColumn = KANBAN_COLUMNS.find((col) => col.id === over.id);
    if (targetColumn && activeTask.status !== targetColumn.id) {
      await handleTaskUpdate(activeTask.id, { status: targetColumn.id });
      return;
    }

    // Check if dropped on another task
    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask && activeTask.status !== overTask.status) {
      await handleTaskUpdate(activeTask.id, { status: overTask.status });
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Record<string, any>) => {
    try {
      const finalUpdates = { ...updates };
      if (updates.status === "done") {
        finalUpdates.completed_at = new Date().toISOString();
      } else if (updates.status) {
        finalUpdates.completed_at = null;
      }

      const { error } = await (supabase as any)
        .from("portal_tasks")
        .update(finalUpdates)
        .eq("id", taskId);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleTaskSave = async (taskData: any) => {
    if (!selectedTask) return;
    try {
      const { owner, blocked_by, blocks, ...updates } = taskData;
      if (updates.start_date instanceof Date) {
        updates.start_date = updates.start_date.toISOString().split("T")[0];
      }
      if (updates.due_date instanceof Date) {
        updates.due_date = updates.due_date.toISOString().split("T")[0];
      }

      const { error } = await (supabase as any)
        .from("portal_tasks")
        .update(updates)
        .eq("id", selectedTask.id);

      if (error) throw error;
      toast.success("Task updated");
      setSelectedTask(null);
      refetch();
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task");
    }
  };

  const handleTaskDelete = async () => {
    if (!selectedTask) return;
    try {
      const { error } = await (supabase as any)
        .from("portal_tasks")
        .delete()
        .eq("id", selectedTask.id);

      if (error) throw error;
      toast.success("Task deleted");
      setSelectedTask(null);
      refetch();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const getOwnerName = (ownerId: string | null) => {
    if (!ownerId) return null;
    return teamMembers.find((m) => m.id === ownerId)?.name || null;
  };

  if (tasksLoading || projectsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">FluxCo Task Tracker</h1>
            <p className="text-sm text-muted-foreground">
              {ownerFilter === "all" && projectFilter === "all"
                ? "All tasks"
                : [
                    ownerFilter !== "all" &&
                      (ownerFilter === "unassigned"
                        ? "Unassigned"
                        : getOwnerName(ownerFilter)),
                    projectFilter !== "all" &&
                      projects.find((p) => p.id === projectFilter)?.name,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Project Filter */}
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-40">
                <Folder className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Owner Filter */}
            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger className="w-40">
                <Users className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owners</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Progress bar */}
        {totalTasks > 0 && (
          <div className="flex items-center gap-4 px-1">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {doneTasks}/{totalTasks} completed
            </span>
          </div>
        )}

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 h-[calc(100vh-220px)] min-h-[400px] overflow-x-auto pb-4">
            {KANBAN_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasksByStatus[column.id]}
                projects={projects}
                teamMembers={teamMembers}
                isOver={overId === column.id}
                isCollapsed={collapsedColumns.has(column.id)}
                onToggleCollapse={() => toggleColumnCollapse(column.id)}
                onTaskClick={(task) => setSelectedTask(task)}
                onTaskUpdate={handleTaskUpdate}
                defaultProjectId={projectFilter !== "all" ? projectFilter : projects[0]?.id}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && <TaskCardOverlay task={activeTask} />}
          </DragOverlay>
        </DndContext>

        {/* Task Dialog */}
        {selectedTask && (
          <TaskDialog
            open={!!selectedTask}
            onOpenChange={(open) => !open && setSelectedTask(null)}
            task={{
              ...selectedTask,
              status: selectedTask.status as TaskStatus,
              priority: selectedTask.priority as TaskPriority,
              blocked_by: selectedTask.blocked_by || [],
              blocks: selectedTask.blocks || [],
              completed_at: selectedTask.completed_at || null,
              created_at: selectedTask.created_at || "",
              updated_at: selectedTask.updated_at || "",
            }}
            projectId={selectedTask.project_id}
            onSave={handleTaskSave}
            onDelete={handleTaskDelete}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

// Column component
interface KanbanColumnProps {
  column: { id: TaskStatus; title: string };
  tasks: TaskWithProject[];
  projects: { id: string; name: string; color: string }[];
  teamMembers: { id: string; name: string; email: string; avatar_url: string | null }[];
  isOver: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onTaskClick: (task: TaskWithProject) => void;
  onTaskUpdate: (taskId: string, updates: Record<string, any>) => Promise<void>;
  defaultProjectId?: string;
}

function KanbanColumn({
  column,
  tasks,
  projects,
  teamMembers,
  isOver,
  isCollapsed,
  onToggleCollapse,
  onTaskClick,
  onTaskUpdate,
  defaultProjectId,
}: KanbanColumnProps) {
  const { setNodeRef, isOver: isOverColumn } = useDroppable({ id: column.id });
  const config = STATUS_CONFIG[column.id];

  if (isCollapsed) {
    return (
      <div
        ref={setNodeRef}
        onClick={onToggleCollapse}
        className={cn(
          "flex-shrink-0 w-12 flex flex-col items-center py-3 rounded-lg cursor-pointer",
          "bg-muted/50 hover:bg-muted transition-colors",
          (isOver || isOverColumn) && "ring-2 ring-blue-400"
        )}
      >
        <div className={cn("w-2 h-2 rounded-full mb-2", config.bg)} />
        <span className="text-xs font-medium text-muted-foreground [writing-mode:vertical-lr] rotate-180">
          {column.title}
        </span>
        <span className="text-xs text-muted-foreground mt-2 bg-background px-1.5 py-0.5 rounded">
          {tasks.length}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground mt-2" />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0 w-72 flex flex-col rounded-lg overflow-hidden",
        "bg-muted/30 border border-border/50",
        (isOver || isOverColumn) && "ring-2 ring-blue-400 ring-offset-2"
      )}
    >
      <div className={cn("h-1", config.bg)} />

      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <button onClick={onToggleCollapse} className="p-0.5 hover:bg-muted rounded">
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          <h3 className={cn("font-medium text-sm", config.text)}>{column.title}</h3>
          <span className="text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded">
            {tasks.length}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <CrossProjectTaskCard
                key={task.id}
                task={task}
                teamMembers={teamMembers}
                onOpenDetails={() => onTaskClick(task)}
                onUpdate={(updates) => onTaskUpdate(task.id, updates)}
              />
            ))}
          </SortableContext>

          {tasks.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">No tasks</div>
          )}
        </div>
      </ScrollArea>

      {defaultProjectId && (
        <div className="border-t border-border/50 p-1">
          <QuickAddTask projectId={defaultProjectId} status={column.id} />
        </div>
      )}
    </div>
  );
}
