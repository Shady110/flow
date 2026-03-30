export default function Loading() {
  return (
    <div className="min-h-screen pt-24 max-w-7xl mx-auto px-6">
      <div className="h-48 bg-flow-bg-soft rounded-2xl animate-pulse mb-8" />
      <div className="columns-2 md:columns-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="break-inside-avoid mb-3 rounded-xl bg-flow-bg-soft animate-pulse"
            style={{ height: `${200 + (i % 3) * 80}px` }}
          />
        ))}
      </div>
    </div>
  )
}
