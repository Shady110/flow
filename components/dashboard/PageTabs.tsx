'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ds/tabs'

export interface PageTab {
  value: string
  label: string
  content: React.ReactNode
}

/**
 * Splits one very long page into sections. The sections are rendered on the
 * server and passed in; only the active one is shown. Pill tabs scroll sideways
 * on a phone instead of wrapping.
 */
export function PageTabs({ tabs }: { tabs: PageTab[] }) {
  const [value, setValue] = useState(tabs[0]?.value)
  return (
    <Tabs value={value} onValueChange={setValue} className="gap-5">
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <TabsList className="h-auto w-max gap-1 rounded-full bg-card p-1 shadow-[var(--shadow-xs)]">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="min-h-10 rounded-full px-5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="space-y-6">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
