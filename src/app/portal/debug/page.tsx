"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAllTasks, useProjects } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface TestResult {
  name: string;
  status: "pass" | "fail" | "warning" | "running";
  message: string;
  data?: any;
}

export default function PortalDebugPage() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const { data: allTasks, isLoading: tasksLoading, error: tasksError } = useAllTasks();
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects();

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Supabase connection
    try {
      const { data, error } = await (supabase as any)
        .from("portal_projects")
        .select("count")
        .limit(1);

      if (error) throw error;
      results.push({
        name: "Supabase Connection",
        status: "pass",
        message: "Connected successfully",
      });
    } catch (e: any) {
      results.push({
        name: "Supabase Connection",
        status: "fail",
        message: e.message || "Failed to connect",
      });
    }

    // Test 2: Projects table
    try {
      const { data, error } = await (supabase as any)
        .from("portal_projects")
        .select("*");

      if (error) throw error;
      results.push({
        name: "Projects Table",
        status: data.length > 0 ? "pass" : "warning",
        message: `Found ${data.length} projects`,
        data: data,
      });
    } catch (e: any) {
      results.push({
        name: "Projects Table",
        status: "fail",
        message: e.message || "Failed to query",
      });
    }

    // Test 3: Tasks table
    try {
      const { data, error } = await (supabase as any)
        .from("portal_tasks")
        .select("*");

      if (error) throw error;

      const tasksWithDates = data.filter((t: any) => t.start_date || t.due_date);

      results.push({
        name: "Tasks Table",
        status: data.length > 0 ? "pass" : "warning",
        message: `Found ${data.length} tasks (${tasksWithDates.length} with dates)`,
        data: data,
      });
    } catch (e: any) {
      results.push({
        name: "Tasks Table",
        status: "fail",
        message: e.message || "Failed to query",
      });
    }

    // Test 4: Tasks with project join (what timeline uses)
    try {
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

      results.push({
        name: "Tasks with Joins (Timeline Query)",
        status: data.length > 0 ? "pass" : "warning",
        message: `Query returned ${data.length} tasks`,
        data: data,
      });
    } catch (e: any) {
      results.push({
        name: "Tasks with Joins (Timeline Query)",
        status: "fail",
        message: e.message || "Failed to query - this is likely the timeline issue",
      });
    }

    // Test 5: useAllTasks hook result
    results.push({
      name: "useAllTasks Hook",
      status: tasksError ? "fail" : (allTasks && allTasks.length > 0) ? "pass" : "warning",
      message: tasksError
        ? `Error: ${tasksError}`
        : `Hook returned ${allTasks?.length || 0} tasks`,
      data: allTasks,
    });

    // Test 6: useProjects hook result
    results.push({
      name: "useProjects Hook",
      status: projectsError ? "fail" : (projects && projects.length > 0) ? "pass" : "warning",
      message: projectsError
        ? `Error: ${projectsError}`
        : `Hook returned ${projects?.length || 0} projects`,
      data: projects,
    });

    // Test 7: Team members table
    try {
      const { data, error } = await (supabase as any)
        .from("team_members")
        .select("*");

      if (error) throw error;
      results.push({
        name: "Team Members Table",
        status: "pass",
        message: `Found ${data.length} team members`,
        data: data,
      });
    } catch (e: any) {
      results.push({
        name: "Team Members Table",
        status: e.message.includes("does not exist") ? "warning" : "fail",
        message: e.message || "Failed to query",
      });
    }

    // Test 8: Dependencies table
    try {
      const { data, error } = await (supabase as any)
        .from("portal_task_dependencies")
        .select("*");

      if (error) throw error;
      results.push({
        name: "Dependencies Table",
        status: "pass",
        message: `Found ${data.length} dependencies`,
        data: data,
      });
    } catch (e: any) {
      results.push({
        name: "Dependencies Table",
        status: "fail",
        message: e.message || "Failed to query",
      });
    }

    setTests(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, [allTasks, projects]);

  const getIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "fail":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/portal">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Portal Diagnostics</h1>
          <p className="text-muted-foreground">Test each component of the portal system</p>
        </div>
        <Button onClick={runTests} disabled={isRunning} className="ml-auto">
          {isRunning ? "Running..." : "Re-run Tests"}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {tests.filter((t) => t.status === "pass").length}
            </div>
            <p className="text-sm text-muted-foreground">Passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {tests.filter((t) => t.status === "warning").length}
            </div>
            <p className="text-sm text-muted-foreground">Warnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {tests.filter((t) => t.status === "fail").length}
            </div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tests.map((test, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center gap-3">
                {getIcon(test.status)}
                <div className="flex-1">
                  <div className="font-medium">{test.name}</div>
                  <div className="text-sm text-muted-foreground">{test.message}</div>
                </div>
                <Badge variant={
                  test.status === "pass" ? "default" :
                  test.status === "fail" ? "destructive" : "secondary"
                }>
                  {test.status}
                </Badge>
              </div>

              {/* Show data preview for debugging */}
              {test.data && (
                <details className="mt-3">
                  <summary className="text-sm text-blue-600 cursor-pointer hover:underline">
                    View data ({Array.isArray(test.data) ? test.data.length : 1} items)
                  </summary>
                  <pre className="mt-2 p-3 bg-slate-100 rounded text-xs overflow-auto max-h-64">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            <Link href="/portal">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/portal/timeline">
              <Button variant="outline">Timeline</Button>
            </Link>
            <Button
              variant="outline"
              onClick={async () => {
                // Create a test task with dates
                const projectId = projects?.[0]?.id;
                if (!projectId) {
                  alert("No projects found - create a project first");
                  return;
                }

                const today = new Date();
                const nextWeek = new Date(today);
                nextWeek.setDate(nextWeek.getDate() + 7);

                const { data, error } = await (supabase as any)
                  .from("portal_tasks")
                  .insert({
                    project_id: projectId,
                    title: `Test Task ${Date.now()}`,
                    description: "Created by diagnostic tool",
                    status: "todo",
                    priority: "medium",
                    position: 0,
                    start_date: today.toISOString().split("T")[0],
                    due_date: nextWeek.toISOString().split("T")[0],
                  })
                  .select()
                  .single();

                if (error) {
                  alert(`Error: ${error.message}`);
                } else {
                  alert(`Created task: ${data.title}`);
                  runTests();
                }
              }}
            >
              Create Test Task (with dates)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading states */}
      {(tasksLoading || projectsLoading) && (
        <div className="text-center text-muted-foreground">
          Loading data from hooks...
        </div>
      )}
    </div>
  );
}
