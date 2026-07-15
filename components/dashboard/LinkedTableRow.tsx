'use client'

import { useRouter } from 'next/navigation'
import { TableRow } from '@/components/ds/table'
import { cn } from '@/lib/utils'

/**
 * A table row that navigates to `href` when clicked (or Enter is pressed).
 * Interactive controls inside a row (buttons, selects, links) should stop
 * click propagation so they don't also trigger navigation.
 */
export function LinkedTableRow({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  const router = useRouter()
  return (
    <TableRow
      onClick={() => router.push(href)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') router.push(href)
      }}
      className={cn('cursor-pointer focus:bg-muted/50 focus:outline-none', className)}
    >
      {children}
    </TableRow>
  )
}
