"use client";

import { useState } from "react";

import { CreateTaskForm } from "@/components/create-task-form";
import { TaskItem } from "@/components/task-item";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { LoadingScreen } from "@/components/loading-screen";
import { useTodos } from "@/hooks/use-todos";

export function TaskListView() {
  return (
    <AuthGuard>
      <TaskListContent />
    </AuthGuard>
  );
}

function TaskListContent() {
  const { todos, loading, saving, error, successMessage, createTodo, updateTodo, trashTodo } = useTodos();
  const [markedForDeletionIds, setMarkedForDeletionIds] = useState<number[]>([]);
  const activeTasks = todos.filter((task) => task.status !== "trashed");

  const handleToggleMarkedForDeletion = (todoId: number, checked: boolean) => {
    setMarkedForDeletionIds((prev) => {
      if (checked) {
        return prev.includes(todoId) ? prev : [...prev, todoId];
      }
      return prev.filter((id) => id !== todoId);
    });
  };

  const handleDelete = async (todoId: number) => {
    await trashTodo(todoId);
    setMarkedForDeletionIds((prev) => prev.filter((id) => id !== todoId));
  };

  if (loading) {
    return <LoadingScreen label="ToDo を読み込んでいます..." />;
  }

  return (
    <AppShell>
      <div className="relative">
        <div className="sticky top-0 flex flex-col items-end gap-2 bg-slate-100 px-10 py-5">
          <CreateTaskForm onSubmit={(title) => createTodo({ title })} disabled={saving} />
          {error && <div className="w-full rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          {successMessage && <div className="w-full rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>}
        </div>

        <div className="space-y-3 px-10 pb-10">
          {activeTasks.length === 0 ? (
            <p className="text-center text-sm">タスクがありません</p>
          ) : (
            activeTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                markedForDeletion={markedForDeletionIds.includes(task.id)}
                onToggleMarkedForDeletion={handleToggleMarkedForDeletion}
                onChange={updateTodo}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
