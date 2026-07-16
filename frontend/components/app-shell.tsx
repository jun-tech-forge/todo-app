"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookCheck, LogOut, Trash2 } from "lucide-react";
import { cva } from "class-variance-authority";

import { useSession } from "@/hooks/use-session";

const linkVariants = cva("flex items-center gap-2 rounded px-5 py-3", {
  variants: {
    active: {
      true: "bg-blue-400 text-white",
      false: "hover:bg-slate-100",
    },
  },
});

const sideMenu = [
  {
    path: "/",
    label: "タスク一覧",
    icon: BookCheck,
  },
  {
    path: "/trash",
    label: "ゴミ箱",
    icon: Trash2,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, submitting } = useSession();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="flex min-w-64 flex-col justify-between gap-5 p-6">
        <div>
          <div>
            <h1 className="text-3xl">Todo App</h1>
          </div>

          <nav className="mt-5">
            <ul className="flex flex-col gap-2">
              {sideMenu.map(({ path, label, icon: Icon }) => (
                <li key={path}>
                  <Link href={path} className={linkVariants({ active: pathname === path })}>
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={submitting}
          className="flex items-center gap-2 rounded px-5 py-3 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </button>
      </aside>

      <main className="mx-auto h-screen flex-1 overflow-y-auto overscroll-none bg-slate-100">{children}</main>
    </div>
  );
}
