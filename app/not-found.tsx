export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="font-display text-6xl font-bold text-flow-green mb-4">404</h1>
      <p className="text-flow-text-muted mb-8">This page doesn&apos;t exist.</p>
      <a
        href="/"
        className="bg-flow-lime text-flow-green font-semibold px-6 py-3 rounded-full hover:bg-flow-lime-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-lime focus-visible:ring-offset-2"
      >
        Back to Home
      </a>
    </div>
  )
}
