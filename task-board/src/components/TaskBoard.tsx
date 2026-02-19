"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

type Task = {
  _id: Id<"tasks">;
  _creationTime: number;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  assignee: "user" | "assistant";
  createdAt: number;
  updatedAt: number;
};

const statusColumns = [
  { key: "todo", label: "📋 To Do", color: "bg-slate-100" },
  { key: "in_progress", label: "🔄 In Progress", color: "bg-amber-100" },
  { key: "done", label: "✅ Done", color: "bg-emerald-100" },
] as const;

export default function TaskBoard() {
  const tasks = useQuery(api.tasks.getTasks);
  const createTask = useMutation(api.tasks.createTask);
  const updateStatus = useMutation(api.tasks.updateTaskStatus);
  const updateAssignee = useMutation(api.tasks.updateTaskAssignee);
  const deleteTask = useMutation(api.tasks.deleteTask);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState<"user" | "assistant">("user");
  const [isAdding, setIsAdding] = useState(false);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await createTask({
      title: newTaskTitle,
      assignee: newTaskAssignee,
    });
    setNewTaskTitle("");
    setIsAdding(false);
  };

  const getTasksByStatus = (status: string) => {
    return tasks?.filter((t) => t.status === status) || [];
  };

  if (tasks === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📋 Task Board</h1>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isAdding ? "Cancel" : "+ Add Task"}
          </button>
        </div>

        {/* Add task form */}
        {isAdding && (
          <form onSubmit={handleCreateTask} className="mb-8 bg-white rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium mb-1 text-gray-600">Task title</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Assign to</label>
              <select
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value as "user" | "assistant")}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">👤 Me</option>
                <option value="assistant">🤖 Assistant</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </form>
        )}

        {/* Board columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusColumns.map((column) => (
            <div key={column.key} className={`${column.color} rounded-xl p-4 min-h-[300px]`}>
              <h2 className="font-semibold text-lg mb-4 flex items-center justify-between text-gray-700">
                {column.label}
                <span className="bg-white/60 px-3 py-1 rounded-full text-sm">
                  {getTasksByStatus(column.key).length}
                </span>
              </h2>

              <div className="space-y-3">
                {getTasksByStatus(column.key).map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onStatusChange={updateStatus}
                    onAssigneeChange={updateAssignee}
                    onDelete={deleteTask}
                  />
                ))}
                {getTasksByStatus(column.key).length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
  onAssigneeChange,
  onDelete,
}: {
  task: Task;
  onStatusChange: any;
  onAssigneeChange: any;
  onDelete: any;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-800 pr-2">{task.title}</h3>
        <button
          onClick={() => {
            if (confirm("Delete this task?")) {
              onDelete({ id: task._id });
            }
          }}
          className="text-gray-300 hover:text-red-500 transition-colors text-xl leading-none"
        >
          ×
        </button>
      </div>

      {task.description && (
        <p className="text-sm text-gray-500 mb-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
        <select
          value={task.assignee}
          onChange={(e) =>
            onAssigneeChange({
              id: task._id,
              assignee: e.target.value as "user" | "assistant",
            })
          }
          className={`text-xs border-0 bg-transparent cursor-pointer rounded px-2 py-1 ${
            task.assignee === "user" 
              ? "text-blue-600 bg-blue-50" 
              : "text-pink-600 bg-pink-50"
          }`}
        >
          <option value="user">👤 Me</option>
          <option value="assistant">🤖 Assistant</option>
        </select>

        <select
          value={task.status}
          onChange={(e) =>
            onStatusChange({
              id: task._id,
              status: e.target.value as "todo" | "in_progress" | "done",
            })
          }
          className={`text-xs border-0 bg-transparent cursor-pointer rounded px-2 py-1 ${
            task.status === "done"
              ? "text-green-600"
              : task.status === "in_progress"
              ? "text-amber-600"
              : "text-gray-500"
          }`}
        >
          <option value="todo">📋 To Do</option>
          <option value="in_progress">🔄 In Progress</option>
          <option value="done">✅ Done</option>
        </select>
      </div>

      <div className="text-xs text-gray-400 mt-2 text-right">
        {new Date(task.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
