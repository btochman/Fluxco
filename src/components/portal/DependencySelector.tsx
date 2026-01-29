"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, ArrowRight, Link2, Plus, Search, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { wouldCreateCycle } from "@/lib/dependency-graph";
import { useAddDependency, useRemoveDependency } from "@/hooks/useDependencies";
import type { TaskWithDependencies } from "@/hooks/useTasks";

interface DependencySelectorProps {
  task: TaskWithDependencies;
  allTasks: TaskWithDependencies[];
  projectId: string;
}

export function DependencySelector({
  task,
  allTasks,
  projectId,
}: DependencySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [cycleWarning, setCycleWarning] = useState<string | null>(null);

  const addDependency = useAddDependency(projectId);
  const removeDependency = useRemoveDependency(projectId);

  // Get current blockers and blocked tasks
  const blockedByIds = useMemo(
    () => new Set(task.blocked_by?.map((d) => d.blocked_by_id) || []),
    [task.blocked_by]
  );

  const blocksIds = useMemo(
    () => new Set(task.blocks?.map((d) => d.task_id) || []),
    [task.blocks]
  );

  // Map of task IDs to tasks for quick lookup
  const taskMap = useMemo(
    () => new Map(allTasks.map((t) => [t.id, t])),
    [allTasks]
  );

  // Available tasks that can be added as dependencies (excluding self and current dependencies)
  const availableTasks = useMemo(() => {
    return allTasks.filter(
      (t) =>
        t.id !== task.id &&
        !blockedByIds.has(t.id) &&
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allTasks, task.id, blockedByIds, searchQuery]);

  // Get the actual task objects for current dependencies
  const blockedByTasks = useMemo(
    () =>
      Array.from(blockedByIds)
        .map((id) => taskMap.get(id))
        .filter((t): t is TaskWithDependencies => !!t),
    [blockedByIds, taskMap]
  );

  const blocksTasks = useMemo(
    () =>
      Array.from(blocksIds)
        .map((id) => taskMap.get(id))
        .filter((t): t is TaskWithDependencies => !!t),
    [blocksIds, taskMap]
  );

  const handleAddDependency = async (blockedById: string) => {
    setCycleWarning(null);

    // Check if this would create a cycle
    const cyclePath = wouldCreateCycle(task.id, blockedById, allTasks);
    if (cyclePath) {
      const cycleNames = cyclePath
        .map((id) => taskMap.get(id)?.title || id.slice(0, 8))
        .join(" -> ");
      setCycleWarning(
        `Adding this dependency would create a cycle: ${cycleNames}`
      );
      return;
    }

    try {
      await addDependency.mutateAsync({
        taskId: task.id,
        blockedById,
      });
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to add dependency:", error);
    }
  };

  const handleRemoveDependency = async (blockedById: string) => {
    setCycleWarning(null);
    try {
      await removeDependency.mutateAsync({
        taskId: task.id,
        blockedById,
      });
    } catch (error) {
      console.error("Failed to remove dependency:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "review":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const isLoading = addDependency.isPending || removeDependency.isPending;

  return (
    <div className="space-y-4">
      {/* Cycle Warning */}
      {cycleWarning && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{cycleWarning}</AlertDescription>
        </Alert>
      )}

      {/* Current "Blocked By" relationships */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Link2 className="h-4 w-4" />
          <span>Blocked by</span>
          {blockedByTasks.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {blockedByTasks.length}
            </Badge>
          )}
        </div>

        {blockedByTasks.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {blockedByTasks.map((blocker) => (
              <Badge
                key={blocker.id}
                variant="outline"
                className={cn(
                  "flex items-center gap-1.5 pr-1",
                  blocker.status === "done" && "line-through opacity-60"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    getStatusColor(blocker.status)
                  )}
                />
                <span className="max-w-[150px] truncate">{blocker.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-destructive/20"
                  onClick={() => handleRemoveDependency(blocker.id)}
                  disabled={isLoading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No blocking tasks
          </p>
        )}
      </div>

      {/* Current "Blocking" relationships (read-only) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ArrowRight className="h-4 w-4" />
          <span>Blocking</span>
          {blocksTasks.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {blocksTasks.length}
            </Badge>
          )}
        </div>

        {blocksTasks.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {blocksTasks.map((blocked) => (
              <Badge
                key={blocked.id}
                variant="secondary"
                className="flex items-center gap-1.5"
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    getStatusColor(blocked.status)
                  )}
                />
                <span className="max-w-[150px] truncate">{blocked.title}</span>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Not blocking any tasks
          </p>
        )}
      </div>

      {/* Add dependency selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Plus className="h-4 w-4" />
          <span>Add blocker</span>
        </div>

        <Command className="border rounded-md">
          <CommandInput
            placeholder="Search tasks..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No tasks found.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[150px]">
                {availableTasks.map((availableTask) => (
                  <CommandItem
                    key={availableTask.id}
                    value={availableTask.title}
                    onSelect={() => handleAddDependency(availableTask.id)}
                    disabled={isLoading}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full flex-shrink-0",
                          getStatusColor(availableTask.status)
                        )}
                      />
                      <span className="flex-1 truncate">
                        {availableTask.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs flex-shrink-0",
                          getStatusColor(availableTask.status)
                        )}
                      >
                        {availableTask.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </div>
  );
}
