import type { LucideIcon } from 'lucide-react'

export interface ServiceItem {
  icon: LucideIcon
  title: string
  description: string
  features: string[]
}

export interface WorkflowStep {
  num: string
  title: string
  description: string
}

export interface ProblemItem {
  icon: LucideIcon
  title: string
  description: string
}
