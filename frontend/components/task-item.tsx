"use client";

import { KeyboardEvent } from "react";
import { Trash2 } from "lucide-react";
import { cva } from "class-variance-authority";

import type { TodoItem } from "@/lib/types";

const inputVariants = cva("flex-1 border border-gray-300 bg-white px-2 py-1", {
  variants: {
    completed: {
      true: "text-gray-400 line-through disabled:cursor-not-allowed",
      false: "",
    },
  },
});

export function TaskItem({
  task,
  markedForDeletion,
  onToggleMarkedForDeletion,
  onChange,
  onDelete,
}: {
  task: TodoItem;
  markedForDeletion: boolean;
  onToggleMarkedForDeletion: (todoId: number, checked: boolean) => void;
  onChange: (todoId: number, payload: { title?: string; status?: "not_started" | "completed" | "trashed" }) => Promise<void>;
  onDelete: (todoId: number) => Promise<void>;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.key !== "Enter") {
      return;
    }
    event.currentTarget.blur();
  };

  return (
    <div className="flex items-center gap-3 rounded bg-white px-4 py-2">
      <input
        type="checkbox"
        className="size-5 cursor-pointer"
        checked={markedForDeletion}
        onChange={(event) => onToggleMarkedForDeletion(task.id, event.target.checked)}
      />
      <input
        type="text"
        className={inputVariants({ completed: false })}
        defaultValue={task.title}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          const nextTitle = event.target.value.trim();
          if (nextTitle && nextTitle !== task.title) {
            void onChange(task.id, { title: nextTitle });
          }
        }}
      />
      <button
        type="button"
        className="rounded p-2 transition-colors disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 enabled:bg-gray-200 enabled:hover:bg-gray-300"
        onClick={() => void onDelete(task.id)}
        disabled={!markedForDeletion}
        aria-label={`タスク「${task.title}」をゴミ箱へ移動する`}
      >
        <Trash2 className="size-5 text-gray-500" />
      </button>
    </div>
  );
}
