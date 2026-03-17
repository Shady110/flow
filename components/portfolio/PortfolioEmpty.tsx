import { Image as ImageIcon } from 'lucide-react'

export default function PortfolioEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-2xl bg-flow-bg-muted flex items-center justify-center mb-4">
        <ImageIcon className="w-8 h-8 text-flow-text-muted" />
      </div>
      <h3 className="font-display text-xl font-bold text-flow-green mb-2">
        No photos yet
      </h3>
      <p className="text-flow-text-muted text-sm max-w-xs">
        We&apos;re still uploading work for this category. Check back soon!
      </p>
    </div>
  )
}
