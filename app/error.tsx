'use client'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ reset }: ErrorProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h2 className="font-display text-2xl font-bold text-flow-green mb-4">
        Something went wrong
      </h2>
      <button
        onClick={reset}
        className="bg-flow-lime text-flow-green font-semibold px-6 py-3 rounded-full hover:bg-flow-lime-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-lime focus-visible:ring-offset-2"
      >
        Try again
      </button>
    </div>
  )
}
