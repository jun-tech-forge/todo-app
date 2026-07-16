"use client";

import { useEffect, useState } from "react";

import apiClient from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import type { MessageResponse, TodoCreatePayload, TodoItem, TodoUpdatePayload } from "@/lib/types";

export function useTodos() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<TodoItem[]>("/todos");
      setTodos(response.data);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "ToDo の取得に失敗しました。"));
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (payload: TodoCreatePayload) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await apiClient.post<TodoItem>("/todos", payload);
      setTodos((prev) => [response.data, ...prev]);
      setSuccessMessage("ToDo を追加しました。");
    } catch (createError) {
      setError(getErrorMessage(createError, "ToDo の追加に失敗しました。"));
      throw createError;
    } finally {
      setSaving(false);
    }
  };

  const updateTodo = async (todoId: number, payload: TodoUpdatePayload) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await apiClient.patch<TodoItem>(`/todos/${todoId}`, payload);
      setTodos((prev) => prev.map((todo) => (todo.id === todoId ? response.data : todo)));
      setSuccessMessage("ToDo を更新しました。");
    } catch (updateError) {
      setError(getErrorMessage(updateError, "ToDo の更新に失敗しました。"));
      throw updateError;
    } finally {
      setSaving(false);
    }
  };

  const deleteTodo = async (todoId: number) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await apiClient.delete(`/todos/${todoId}`);
      setTodos((prev) => prev.filter((todo) => todo.id !== todoId));
      setSuccessMessage("ToDo を削除しました。");
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "ToDo の削除に失敗しました。"));
      throw deleteError;
    } finally {
      setSaving(false);
    }
  };

  const emptyTrash = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await apiClient.delete<MessageResponse>("/todos/trash/all");
      setTodos((prev) => prev.filter((todo) => todo.status !== "trashed"));
      setSuccessMessage(response.data.message);
    } catch (emptyError) {
      setError(getErrorMessage(emptyError, "ゴミ箱の削除に失敗しました。"));
      throw emptyError;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    void loadTodos();
  }, []);

  return {
    todos,
    loading,
    saving,
    error,
    successMessage,
    loadTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    emptyTrash,
  };
}
