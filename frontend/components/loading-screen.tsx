export function LoadingScreen({ label = "読み込み中..." }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="rounded-3xl border border-white/60 bg-white/80 px-8 py-6 text-center shadow-panel backdrop-blur">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
        <p className="text-sm text-slate-600">{label}</p>
      </div>
    </div>
  );
}
