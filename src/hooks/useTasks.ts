"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Task, TaskStatus, TaskPriority } from "@/types/portal";

export interface TaskWithDependencies extends Task {
  blocked_by?: { blocked_by_id: string }[];
  blocks?: { task_id: string }[];
  owner?: { id: string; name: string; avatar_url: string | null } | null;
}

type TaskInsert = Omit<Task, "id" | "created_at" | "updated_at" | "completed_at" | "project_id" | "position">;
type TaskUpdate = Partial<Omit<Task, "id" | "created_at" | "updated_at" | "project_id">>;

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("portal_tasks")
        .select(`
          *,
          owner:team_members!portal_tasks_owner_id_fkey (
            id,
            name,
            avatar_url
          ),
          blocked_by:portal_task_dependencies!portal_task_dependencies_task_id_fkey (
            blocked_by_id
          ),
          blocks:portal_task_dependencies!portal_task_dependencies_blocked_by_id_fkey (
            task_id
          )
        `)
        .eq("project_id", projectId)
        .order("position", { ascending: true });

      if (error) throw error;
      return data as TaskWithDependencies[];
    },
    staleTime: 30 * 1000,
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("portal_tasks")
        .select(`
          *,
          owner:team_members!portal_tasks_owner_id_fkey (
            id,
            name,
            avatar_url
          ),
          blocked_by:portal_task_dependencies!portal_task_dependencies_task_id_fkey (
            blocked_by_id
          ),
          blocks:portal_task_dependencies!portal_task_dependencies_blocked_by_id_fkey (
            task_id
          )
        `)
        .eq("id", taskId)
        .single();

      if (error) throw error;
      return data as TaskWithDependencies;
    },
    enabled: !!taskId,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: TaskInsert) => {
      // Get max position for the status column
      const { data: existingTasks } = await (supabase as any)
        .from("portal_tasks")
        .select("position")
        .eq("project_id", projectId)
        .eq("status", task.status || "backlog")
        .order("position", { ascending: false })
        .limit(1);

      const maxPosition = existingTasks?.[0]?.position ?? -1;

      const { data, error } = await (supabase as any)
        .from("portal_tasks")
        .insert({
          ...task,
          project_id: projectId,
          position: maxPosition + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      updates,
    }: {
      taskId: string;
      updates: TaskUpdate;
    }) => {
      const { data, error } = await (supabase as any)
        .from("portal_tasks")
        .update(updates)
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateTaskStatus(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      status,
      newPosition,
    }: {
      taskId: string;
      status: TaskStatus;
      newPosition?: number;
    }) => {
      const updates: TaskUpdate = {
        status,
        ...(newPosition !== undefined && { position: newPosition }),
        ...(status === "done" && { completed_at: new Date().toISOString() }),
        ...(status !== "done" && { completed_at: null }),
      };

      const { data, error } = await (supabase as any)
        .from("portal_tasks")
        .update(updates)
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ taskId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks", projectId] });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<TaskWithDependencies[]>([
        "tasks",
        projectId,
      ]);

      // Optimistically update
      queryClient.setQueryData<TaskWithDependencies[]>(
        ["tasks", projectId],
        (old) =>
          old?.map((task) =>
            task.id === taskId ? { ...task, status } : task
          )
      );

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", projectId], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await (supabase as any).from("portal_tasks").delete().eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// Reorder tasks within a column
export function useReorderTasks(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tasks: { id: string; position: number }[]) => {
      // Update positions in batch (cast to any since types haven't been regenerated)
      const updates = tasks.map((task) =>
        (supabase as any)
          .from("portal_tasks")
          .update({ position: task.position })
          .eq("id", task.id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

// Fetch ALL tasks across ALL projects (for cross-phase views)
export interface TaskWithProject extends TaskWithDependencies {
  project?: {
    id: string;
    name: string;
    color: string;
    position: number;
  } | null;
}

export function useAllTasks() {
  return useQuery({
    queryKey: ["all-tasks"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("portal_tasks")
        .select(`
          *,
          owner:team_members!portal_tasks_owner_id_fkey (
            id,
            name,
            avatar_url
          ),
          blocked_by:portal_task_dependencies!portal_task_dependencies_task_id_fkey (
            blocked_by_id
          ),
          blocks:portal_task_dependencies!portal_task_dependencies_blocked_by_id_fkey (
            task_id
          ),
          project:portal_projects!portal_tasks_project_id_fkey (
            id,
            name,
            color,
            position
          )
        `)
        .order("position", { ascending: true });

      if (error) throw error;
      return data as TaskWithProject[];
    },
    staleTime: 30 * 1000,
  });
}

// Fetch all projects
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("portal_projects")
        .select("*")
        .order("position", { ascending: true });

      if (error) throw error;
      return data as Array<{
        id: string;
        name: string;
        description: string | null;
        color: string;
        status: string;
        position: number;
      }>;
    },
    staleTime: 30 * 1000,
  });
}

export type { TaskStatus, TaskPriority };
