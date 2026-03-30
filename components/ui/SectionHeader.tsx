interface SectionHeaderProps {
  eyebrow: string
  title: string
  subtitle?: string
  centered?: boolean
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  centered = false,
}: SectionHeaderProps) {
  return (
    <div className={centered ? 'text-center mb-16' : 'mb-16'}>
      <span className="text-xs font-semibold uppercase tracking-widest text-flow-lime bg-flow-green px-3 py-1 rounded-full inline-block mb-4">
        {eyebrow}
      </span>
      <h2 className="font-display text-4xl md:text-5xl font-bold text-flow-green mt-4 mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-flow-text-muted text-base leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  )
}
