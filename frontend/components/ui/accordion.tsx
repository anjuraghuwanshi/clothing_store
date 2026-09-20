import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Accordion({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full divide-y divide-border border-b border-t border-border", className)}>
      {children}
    </div>
  )
}

export function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group">
      <summary className="flex w-full cursor-pointer list-none items-center justify-between py-4 text-sm font-medium transition-all hover:underline hover:underline-offset-4 [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180 text-muted-foreground" />
      </summary>
      <div className="pb-4 pt-0 text-sm text-muted-foreground animate-in slide-in-from-top-1 fade-in-0 duration-200">
        {children}
      </div>
    </details>
  )
}
