"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { startOfDay, addDays, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useGanttData, type ZoomLevel, type GanttTask } from "@/hooks/useGanttData";
import { GanttHeader } from "./GanttHeader";
import { GanttBar, ROW_HEIGHT } from "./GanttBar";
import { GanttDependencyLayer } from "./GanttDependencyLine";
import { GanttControls } from "./GanttControls";
import type { TaskWithProject } from "@/hooks/useTasks";

const TASK_PANEL_WIDTH = 280;
const PHASE_HEADER_HEIGHT = 40;

interface Project {
  id: string;
  name: string;
  color: string;
  position: number;
}

interface CrossPhaseGanttProps {
  tasks: TaskWithProject[];
  projects: Project[];
  onTaskClick: (task: TaskWithProject) => void;
  currentMemberId?: string;
  showMyTasksOnly?: boolean;
}

interface PhaseGroup {
  project: Project;
  tasks: TaskWithProject[];
  startRow: number;
}

export function CrossPhaseGantt({
  tasks,
  projects,
  onTaskClick,
  currentMemberId,
  showMyTasksOnly = false,
}: CrossPhaseGanttProps) {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("week");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  const timelineRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const taskPanelRef = useRef<HTMLDivElement>(null);

  // Filter tasks if showing only my tasks
  const filteredTasks = useMemo(() => {
    if (!showMyTasksOnly || !currentMemberId) return tasks;
    return tasks.filter((t) => t.owner_id === currentMemberId);
  }, [tasks, showMyTasksOnly, currentMemberId]);

  // Group tasks by phase/project
  const phaseGroups = useMemo((): PhaseGroup[] => {
    const sortedProjects = [...projects].sort((a, b) => a.position - b.position);
    let currentRow = 0;

    return sortedProjects.map((project) => {
      const projectTasks = filteredTasks
        .filter((t) => t.project_id === project.id)
        .sort((a, b) => (a.position || 0) - (b.position || 0));

      const group: PhaseGroup = {
        project,
        tasks: projectTasks,
        startRow: currentRow,
      };

      // Add 1 for the phase header + task count
      currentRow += 1 + projectTasks.length;

      return group;
    });
  }, [filteredTasks, projects]);

  // Flatten tasks for the gantt calculation with proper row indices
  const flatTasksWithRows = useMemo(() => {
    const result: (TaskWithProject & { row: number })[] = [];
    let currentRow = 0;

    phaseGroups.forEach((group) => {
      currentRow++; // Phase header row
      group.tasks.forEach((task) => {
        result.push({ ...task, row: currentRow });
        currentRow++;
      });
    });

    return result;
  }, [phaseGroups]);

  // Use the gantt data hook for calculations
  const ganttData = useGanttData(flatTasksWithRows, zoomLevel, customStartDate, customEndDate);
  const { tasks: ganttTasks, dependencies, dateColumns, totalWidth, columnWidth, startDate, endDate } = ganttData;

  // Calculate total height including phase headers
  const totalRows = phaseGroups.reduce(
    (acc, group) => acc + 1 + group.tasks.length, // 1 for header + tasks
    0
  );
  const totalHeight = totalRows * ROW_HEIGHT + 20;

  // Sync scroll between task panel and timeline
  const handleTimelineScroll = useCallback(() => {
    if (scrollContainerRef.current && taskPanelRef.current) {
      taskPanelRef.current.scrollTop = scrollContainerRef.current.scrollTop;
    }
  }, []);

  // Scroll to today on mount
  const scrollToToday = useCallback(() => {
    if (scrollContainerRef.current) {
      const today = startOfDay(new Date());
      const daysFromStart = differenceInDays(today, startDate);

      let scrollPosition: number;
      if (zoomLevel === "day") {
        scrollPosition = daysFromStart * columnWidth - 200;
      } else if (zoomLevel === "week") {
        scrollPosition = (daysFromStart / 7) * columnWidth - 200;
      } else {
        scrollPosition = (daysFromStart / 30) * columnWidth - 200;
      }

      scrollContainerRef.current.scrollLeft = Math.max(0, scrollPosition);
    }
  }, [startDate, zoomLevel, columnWidth]);

  // Scroll to today on initial load
  useEffect(() => {
    const timer = setTimeout(scrollToToday, 100);
    return () => clearTimeout(timer);
  }, [scrollToToday]);

  const handleTodayClick = () => {
    const today = startOfDay(new Date());
    setCustomStartDate(addDays(today, -14));
    setCustomEndDate(addDays(today, 60));
    setTimeout(scrollToToday, 100);
  };

  // Calculate today line position
  const today = startOfDay(new Date());
  const todayOffset = (() => {
    const daysFromStart = differenceInDays(today, startDate);
    if (zoomLevel === "day") {
      return daysFromStart * columnWidth + columnWidth / 2;
    } else if (zoomLevel === "week") {
      return (daysFromStart / 7) * columnWidth;
    } else {
      return (daysFromStart / 30) * columnWidth;
    }
  })();

  const showTodayLine = todayOffset >= 0 && todayOffset <= totalWidth;

  // Create a map of task id to gantt task for quick lookups
  const ganttTaskMap = useMemo(() => {
    const map = new Map<string, GanttTask>();
    ganttTasks.forEach((t) => map.set(t.id, t));
    return map;
  }, [ganttTasks]);

  if (filteredTasks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">No tasks found</p>
          <p className="text-sm mt-1">
            Create tasks to see them in the timeline
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border overflow-hidden">
      {/* Controls */}
      <GanttControls
        zoomLevel={zoomLevel}
        onZoomLevelChange={setZoomLevel}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setCustomStartDate}
        onEndDateChange={setCustomEndDate}
        onTodayClick={handleTodayClick}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Task names panel (fixed) */}
        <div
          className="flex-shrink-0 border-r bg-white z-20 flex flex-col"
          style={{ width: TASK_PANEL_WIDTH }}
        >
          {/* Header */}
          <div className="h-[52px] border-b bg-slate-50 flex items-center px-3 flex-shrink-0">
            <span className="font-medium text-sm text-slate-600">Phase / Task</span>
          </div>

          {/* Task list with phase headers */}
          <div
            ref={taskPanelRef}
            className="overflow-y-auto flex-1"
            style={{ overflowX: "hidden" }}
          >
            {phaseGroups.map((group) => (
              <div key={group.project.id}>
                {/* Phase header */}
                <div
                  className="flex items-center px-3 border-b font-medium sticky top-0 z-10"
                  style={{
                    height: ROW_HEIGHT,
                    backgroundColor: `${group.project.color}15`,
                    borderLeft: `4px solid ${group.project.color}`,
                  }}
                >
                  <span
                    className="text-sm truncate"
                    style={{ color: group.project.color }}
                  >
                    {group.project.name}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({group.tasks.length})
                  </span>
                </div>

                {/* Tasks in this phase */}
                {group.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center px-3 pl-6 border-b cursor-pointer",
                      "hover:bg-slate-50 transition-colors"
                    )}
                    style={{ height: ROW_HEIGHT }}
                    onClick={() => onTaskClick(task)}
                  >
                    <span className="text-sm truncate">{task.title}</span>
                    {task.owner && (
                      <span className="ml-auto text-xs text-muted-foreground truncate max-w-[80px]">
                        {task.owner.name}
                      </span>
                    )}
                  </div>
                ))}

                {/* Empty state for phase with no tasks */}
                {group.tasks.length === 0 && (
                  <div
                    className="flex items-center px-3 pl-6 border-b text-muted-foreground italic"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <span className="text-sm">No tasks</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline panel (scrollable) */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="h-full overflow-auto"
            onScroll={handleTimelineScroll}
          >
            <div style={{ width: totalWidth, minWidth: "100%" }}>
              {/* Date headers */}
              <GanttHeader
                dateColumns={dateColumns}
                columnWidth={columnWidth}
                zoomLevel={zoomLevel}
              />

              {/* Timeline grid and bars */}
              <div
                ref={timelineRef}
                className="relative"
                style={{ height: totalHeight }}
              >
                {/* Grid lines */}
                <div className="absolute inset-0 flex">
                  {dateColumns.map((column, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex-shrink-0 border-r h-full",
                        column.isToday && "bg-blue-50/50",
                        column.isWeekend && !column.isToday && "bg-slate-50/50"
                      )}
                      style={{ width: columnWidth }}
                    />
                  ))}
                </div>

                {/* Phase rows and task rows */}
                {phaseGroups.map((group, groupIndex) => {
                  let rowOffset = 0;
                  for (let i = 0; i < groupIndex; i++) {
                    rowOffset += 1 + phaseGroups[i].tasks.length;
                    if (phaseGroups[i].tasks.length === 0) rowOffset += 1;
                  }

                  return (
                    <div key={group.project.id}>
                      {/* Phase header row */}
                      <div
                        className="border-b"
                        style={{
                          height: ROW_HEIGHT,
                          position: "absolute",
                          top: rowOffset * ROW_HEIGHT,
                          left: 0,
                          right: 0,
                          backgroundColor: `${group.project.color}08`,
                        }}
                      />

                      {/* Task rows */}
                      {group.tasks.map((task, taskIndex) => {
                        const ganttTask = ganttTaskMap.get(task.id);
                        return (
                          <div
                            key={task.id}
                            className="border-b border-slate-100"
                            style={{
                              height: ROW_HEIGHT,
                              position: "absolute",
                              top: (rowOffset + 1 + taskIndex) * ROW_HEIGHT,
                              left: 0,
                              right: 0,
                            }}
                          />
                        );
                      })}

                      {/* Empty state row */}
                      {group.tasks.length === 0 && (
                        <div
                          className="border-b border-slate-100"
                          style={{
                            height: ROW_HEIGHT,
                            position: "absolute",
                            top: (rowOffset + 1) * ROW_HEIGHT,
                            left: 0,
                            right: 0,
                          }}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Today marker line */}
                {showTodayLine && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
                    style={{ left: todayOffset }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                  </div>
                )}

                {/* Dependency lines */}
                <GanttDependencyLayer
                  dependencies={dependencies}
                  width={totalWidth}
                  height={totalHeight}
                />

                {/* Task bars - positioned according to phase groups */}
                {phaseGroups.map((group, groupIndex) => {
                  let rowOffset = 0;
                  for (let i = 0; i < groupIndex; i++) {
                    rowOffset += 1 + phaseGroups[i].tasks.length;
                    if (phaseGroups[i].tasks.length === 0) rowOffset += 1;
                  }

                  return group.tasks.map((task, taskIndex) => {
                    const ganttTask = ganttTaskMap.get(task.id);
                    if (!ganttTask) return null;

                    // Create a modified gantt task with the correct row
                    const taskWithRow = {
                      ...ganttTask,
                      row: rowOffset + 1 + taskIndex,
                    };

                    return (
                      <GanttBar
                        key={task.id}
                        task={taskWithRow}
                        onClick={() => onTaskClick(task)}
                        color={group.project.color}
                      />
                    );
                  });
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
