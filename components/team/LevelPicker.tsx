'use client'

import { cn } from '@/lib/utils'
import { LEVELS, type Level } from '@/lib/org'

/** Member / Lead / Head as one segmented control. */
export function LevelPicker({ value, onChange }: { value: Level; onChange: (l: Level) => void }) {
  return (
    <div role="radiogroup" aria-label="Level" className="flex gap-1 rounded-xl bg-muted p-1 text-sm">
      {LEVELS.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={value === l}
          onClick={() => onChange(l)}
          className={cn(
            'flex-1 rounded-lg py-2 font-medium capitalize transition-colors',
            value === l ? 'bg-flow-green text-flow-lime' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
