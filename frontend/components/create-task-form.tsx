"use client";

import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";

export function CreateTaskForm({
  onSubmit,
  disabled,
}: {
  onSubmit: (title: string) => Promise<void>;
  disabled: boolean;
}) {
  const [title, setTitle] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = title.trim();
    if (!normalized) {
      return;
    }

    await onSubmit(normalized);
    setTitle("");
  };

  return (
    <div className="w-full">
      <form className="flex gap-0.5" onSubmit={(event) => void handleSubmit(event)}>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="新しいタスクを入力してください"
          className="grow rounded-s border border-gray-300 bg-white p-2"
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded-e bg-blue-600 p-2 transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          aria-label="タスクを作成する"
        >
          <Plus className="text-white" />
        </button>
      </form>
    </div>
  );
}
