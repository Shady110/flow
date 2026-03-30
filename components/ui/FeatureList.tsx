import { Check } from 'lucide-react'

interface FeatureListProps {
  features: string[]
  columns?: 1 | 2
  checkColor?: string
}

export default function FeatureList({
  features,
  columns = 1,
  checkColor = 'text-flow-green',
}: FeatureListProps) {
  return (
    <ul
      className={
        columns === 2
          ? 'grid grid-cols-2 gap-x-6 gap-y-2'
          : 'space-y-3'
      }
    >
      {features.map((f) => (
        <li key={f} className="flex items-start gap-2 text-sm text-flow-text-muted">
          <Check size={14} className={`${checkColor} mt-0.5 shrink-0`} />
          {f}
        </li>
      ))}
    </ul>
  )
}
