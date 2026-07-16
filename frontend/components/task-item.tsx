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
  onChange,
}: {
  task: TodoItem;
  onChange: (todoId: number, payload: { title?: string; status?: "not_started" | "completed" | "trashed" }) => Promise<void>;
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
        checked={task.status === "completed"}
        onChange={(event) => void onChange(task.id, { status: event.target.checked ? "completed" : "not_started" })}
      />
      <input
        type="text"
        className={inputVariants({ completed: task.status === "completed" })}
        defaultValue={task.title}
        disabled={task.status === "completed"}
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
        className="rounded bg-gray-200 p-2 transition-colors hover:bg-gray-300"
        onClick={() => void onChange(task.id, { status: "trashed" })}
        aria-label={`タスク「${task.title}」をゴミ箱へ移動する`}
      >
        <Trash2 className="size-5 text-gray-500" />
      </button>
    </div>
  );
}
