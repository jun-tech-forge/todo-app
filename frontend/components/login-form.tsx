"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { getErrorMessage } from "@/lib/errors";
import { useSession } from "@/hooks/use-session";

export function LoginForm() {
  const router = useRouter();
  const { login, submitting, error } = useSession();
  const [userId, setUserId] = useState("demo");
  const [password, setPassword] = useState("password123");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    try {
      await login({ user_id: userId, password });
      router.replace("/");
    } catch (submitError) {
      setLocalError(getErrorMessage(submitError, "ログインに失敗しました。"));
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className="flex min-w-64 flex-col gap-5 p-6">
        <h1 className="text-3xl">Todo App</h1>
      </aside>

      <main className="mx-auto flex h-screen flex-1 items-center justify-center overflow-y-auto overscroll-none bg-slate-100 px-6 py-10">
        <section className="w-full max-w-md rounded bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-3xl">ログイン</h2>
            <p className="mt-2 text-sm text-slate-600">ログインして ToDo を管理します。</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="userId" className="text-sm font-medium text-slate-700">ユーザーID</label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                className="w-full rounded border border-gray-300 bg-white p-3 outline-none"
                placeholder="ユーザーIDを入力"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">パスワード</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded border border-gray-300 bg-white p-3 outline-none"
                placeholder="パスワードを入力"
                autoComplete="current-password"
              />
            </div>

            {(localError || error) && (
              <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{localError ?? error}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <ArrowRight className="h-4 w-4" />
              {submitting ? "ログイン中..." : "ログイン"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
