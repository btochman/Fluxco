"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, Calendar, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays, startOfDay, addDays, parseISO, isValid } from "date-fns";

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: string;
  position: number;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  project_id: string;
  owner_id: string | null;
  start_date: string | null;
  due_date: string | null;
}

export default function PortalDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load projects
      const { data: projectsData, error: projectsError } = await (supabase as any)
        .from("portal_projects")
        .select("*")
        .order("position", { ascending: true });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Load tasks with dates
      const { data: tasksData, error: tasksError } = await (supabase as any)
        .from("portal_tasks")
        .select("*");

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const getTasksByProject = (projectId: string) => {
    return tasks.filter((t) => t.project_id === projectId);
  };

  const getTaskStats = (projectTasks: Task[]) => {
    const total = projectTasks.length;
    const done = projectTasks.filter((t) => t.status === "done").length;
    const inProgress = projectTasks.filter((t) => t.status === "in_progress").length;
    const blocked = projectTasks.filter((t) => t.status === "blocked").length;
    return { total, done, inProgress, blocked };
  };

  const totalStats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
  };

  // Calculate Gantt chart data
  const ganttData = useMemo(() => {
    const tasksWithDates = tasks.filter(t => t.start_date || t.due_date);
    if (tasksWithDates.length === 0) return null;

    const today = startOfDay(new Date());
    let minDate = today;
    let maxDate = addDays(today, 90); // Default 3 month view

    tasksWithDates.forEach(task => {
      if (task.start_date) {
        const start = parseISO(task.start_date);
        if (isValid(start) && start < minDate) minDate = start;
      }
      if (task.due_date) {
        const end = parseISO(task.due_date);
        if (isValid(end) && end > maxDate) maxDate = end;
      }
    });

    // Add padding
    minDate = addDays(minDate, -7);
    maxDate = addDays(maxDate, 14);

    const totalDays = differenceInDays(maxDate, minDate);

    return { minDate, maxDate, totalDays, tasksWithDates };
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">FluxCo Task Tracker</h1>
          <p className="text-muted-foreground">
            Manage tasks across all company phases
          </p>
        </div>

        <Link href="/portal/timeline">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Full Timeline
          </Button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalStats.total}</div>
            <p className="text-xs text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{totalStats.done}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{totalStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{totalStats.blocked}</div>
            <p className="text-xs text-muted-foreground">Blocked</p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Gantt Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Project Timeline</CardTitle>
            <Link href="/portal/timeline">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                View Full Timeline
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {ganttData && ganttData.tasksWithDates.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Timeline header */}
                <div className="flex border-b pb-2 mb-2 text-xs text-muted-foreground">
                  <div className="w-48 flex-shrink-0 font-medium">Phase / Task</div>
                  <div className="flex-1 flex justify-between px-2">
                    <span>{format(ganttData.minDate, "MMM d")}</span>
                    <span>Today</span>
                    <span>{format(ganttData.maxDate, "MMM d")}</span>
                  </div>
                </div>

                {/* Phases and tasks */}
                {projects.map((project) => {
                  const projectTasks = tasks.filter(t => t.project_id === project.id);
                  const tasksWithDates = projectTasks.filter(t => t.start_date || t.due_date);

                  return (
                    <div key={project.id} className="mb-4">
                      {/* Phase row */}
                      <Link href={`/portal/${project.id}`}>
                        <div className="flex items-center hover:bg-muted/50 rounded py-1 cursor-pointer group">
                          <div className="w-48 flex-shrink-0 flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            <span className="font-medium text-sm truncate group-hover:text-primary">
                              {project.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {projectTasks.length}
                            </Badge>
                          </div>
                          <div className="flex-1 h-6 relative mx-2 bg-muted/30 rounded">
                            {/* Today marker */}
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
                              style={{
                                left: `${(differenceInDays(new Date(), ganttData.minDate) / ganttData.totalDays) * 100}%`
                              }}
                            />
                            {/* Phase bar showing span of all tasks */}
                            {tasksWithDates.length > 0 && (() => {
                              const starts = tasksWithDates
                                .map(t => t.start_date ? parseISO(t.start_date) : null)
                                .filter((d): d is Date => d !== null && isValid(d));
                              const ends = tasksWithDates
                                .map(t => t.due_date ? parseISO(t.due_date) : null)
                                .filter((d): d is Date => d !== null && isValid(d));

                              if (starts.length === 0 && ends.length === 0) return null;

                              const phaseStart = starts.length > 0 ? Math.min(...starts.map(d => d.getTime())) : Math.min(...ends.map(d => d.getTime()));
                              const phaseEnd = ends.length > 0 ? Math.max(...ends.map(d => d.getTime())) : Math.max(...starts.map(d => d.getTime()));

                              const startOffset = differenceInDays(new Date(phaseStart), ganttData.minDate);
                              const duration = differenceInDays(new Date(phaseEnd), new Date(phaseStart)) + 1;

                              return (
                                <div
                                  className="absolute top-1 bottom-1 rounded"
                                  style={{
                                    left: `${(startOffset / ganttData.totalDays) * 100}%`,
                                    width: `${(duration / ganttData.totalDays) * 100}%`,
                                    backgroundColor: project.color,
                                    opacity: 0.7,
                                  }}
                                />
                              );
                            })()}
                          </div>
                        </div>
                      </Link>

                      {/* Task rows */}
                      {tasksWithDates.slice(0, 3).map((task) => {
                        const start = task.start_date ? parseISO(task.start_date) : null;
                        const end = task.due_date ? parseISO(task.due_date) : null;
                        const taskStart = start && isValid(start) ? start : end;
                        const taskEnd = end && isValid(end) ? end : start;

                        if (!taskStart || !taskEnd) return null;

                        const startOffset = differenceInDays(taskStart, ganttData.minDate);
                        const duration = Math.max(1, differenceInDays(taskEnd, taskStart) + 1);

                        return (
                          <div key={task.id} className="flex items-center py-0.5 ml-5">
                            <div className="w-43 flex-shrink-0 text-xs text-muted-foreground truncate">
                              {task.title}
                            </div>
                            <div className="flex-1 h-4 relative mx-2">
                              <div
                                className="absolute top-0.5 bottom-0.5 rounded-sm"
                                style={{
                                  left: `${(startOffset / ganttData.totalDays) * 100}%`,
                                  width: `${(duration / ganttData.totalDays) * 100}%`,
                                  backgroundColor: project.color,
                                  opacity: task.status === "done" ? 0.4 : 0.9,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {tasksWithDates.length > 3 && (
                        <div className="ml-5 text-xs text-muted-foreground">
                          +{tasksWithDates.length - 3} more tasks
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No tasks with dates yet</p>
              <p className="text-sm">Add start and due dates to tasks to see the timeline</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const projectTasks = getTasksByProject(project.id);
          const stats = getTaskStats(projectTasks);
          const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

          return (
            <Link key={project.id} href={`/portal/${project.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                    </div>
                    <Badge variant={project.status === "active" ? "default" : "secondary"}>
                      {project.status}
                    </Badge>
                  </div>
                  {project.description && (
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{progress}% complete</span>
                        <span>{stats.done}/{stats.total} tasks</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Task counts */}
                    <div className="flex gap-4 text-sm">
                      {stats.inProgress > 0 && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Clock className="h-3 w-3" />
                          {stats.inProgress} active
                        </div>
                      )}
                      {stats.blocked > 0 && (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          {stats.blocked} blocked
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}

      </div>
    </div>
  );
}
