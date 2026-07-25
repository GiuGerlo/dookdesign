// Skeleton nativo de Next mientras cargan los server components del panel.
export default function PanelLoading() {
  return (
    <div className="animate-pulse space-y-5" aria-hidden>
      <div className="h-6 w-40 rounded-md bg-white/10" />
      <div className="h-10 w-full rounded-lg bg-white/[0.06]" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 w-full rounded-lg bg-white/[0.06]" />
        ))}
      </div>
    </div>
  )
}
