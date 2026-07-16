"use client";

import { Trash2 } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { LoadingScreen } from "@/components/loading-screen";
import { TrashedTaskItem } from "@/components/trashed-task-item";
import { useTodos } from "@/hooks/use-todos";

export function TrashedTaskListView() {
  return (
    <AuthGuard>
      <TrashedTaskListContent />
    </AuthGuard>
  );
}

function TrashedTaskListContent() {
  const { todos, loading, saving, error, successMessage, updateTodo, deleteTodo, emptyTrash } = useTodos();
  const trashedTasks = todos.filter((task) => task.status === "trashed");

  if (loading) {
    return <LoadingScreen label="ゴミ箱を読み込んでいます..." />;
  }

  return (
    <AppShell>
      <div className="relative">
        <div className="sticky top-0 flex justify-end bg-slate-100 px-10 py-5">
          <button
            onClick={() => void emptyTrash()}
            className="flex items-center gap-1 rounded-md p-2 text-sm text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed"
            disabled={trashedTasks.length === 0 || saving}
          >
            <Trash2 className="size-4" />
            ゴミ箱を空にする
          </button>
        </div>

        <div className="space-y-3 px-10 pb-10">
          {error && <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          {successMessage && <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>}
          {trashedTasks.length === 0 ? (
            <p className="text-center text-sm">ゴミ箱にタスクがありません</p>
          ) : (
            trashedTasks.map((task) => (
              <TrashedTaskItem key={task.id} task={task} onRestore={updateTodo} onDelete={deleteTodo} />
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
