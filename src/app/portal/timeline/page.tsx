"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAllTasks, useProjects } from "@/hooks/useTasks";
import { CrossPhaseGantt } from "@/components/portal/CrossPhaseGantt";
import { TaskDialog } from "@/components/portal/TaskDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ArrowLeft, Users, CheckCircle2, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { TaskWithProject } from "@/hooks/useTasks";

export default function TimelinePage() {
  const { data: tasks = [], isLoading: tasksLoading, refetch: refetchTasks } = useAllTasks();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const [selectedTask, setSelectedTask] = useState<TaskWithProject | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "my-tasks">("all");
  const [currentMemberId, setCurrentMemberId] = useState<string | undefined>();

  // Get current user's team member id
  useEffect(() => {
    const fetchMember = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { data: member } = await (supabase as any)
          .from("team_members")
          .select("id")
          .eq("email", user.email)
          .single();
        if (member) {
          setCurrentMemberId(member.id);
        }
      }
    };
    fetchMember();
  }, []);

  const handleTaskClick = (task: TaskWithProject) => {
    setSelectedTask(task);
  };

  const handleTaskSave = async (taskData: any) => {
    try {
      if (selectedTask) {
        const { owner, blocked_by, blocks, ...updates } = taskData;
        const { error } = await (supabase as any)
          .from("portal_tasks")
          .update(updates)
          .eq("id", selectedTask.id);
        if (error) throw error;
        toast.success("Task updated");
      }
      setSelectedTask(null);
      refetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task");
    }
  };

  const handleDialogClose = () => {
    setSelectedTask(null);
    refetchTasks();
  };

  if (tasksLoading || projectsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading timeline...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/portal">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Timeline
            </h1>
            <p className="text-muted-foreground">
              View all tasks across all phases
            </p>
          </div>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "all" | "my-tasks")}>
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <Users className="h-4 w-4" />
              All Tasks
            </TabsTrigger>
            <TabsTrigger value="my-tasks" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              My Tasks
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 min-h-0">
        <CrossPhaseGantt
          tasks={tasks}
          projects={projects.map((p) => ({
            id: p.id,
            name: p.name,
            color: p.color,
            position: p.position,
          }))}
          onTaskClick={handleTaskClick}
          currentMemberId={currentMemberId}
          showMyTasksOnly={viewMode === "my-tasks"}
        />
      </div>

        {/* Task Dialog */}
        {selectedTask && (
          <TaskDialog
            task={selectedTask}
            projectId={selectedTask.project_id}
            open={!!selectedTask}
            onOpenChange={(open) => {
              if (!open) handleDialogClose();
            }}
            onSave={handleTaskSave}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
