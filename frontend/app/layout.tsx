import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Todo App",
  description: "Next.js x FastAPI x PostgreSQL の ToDo アプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
