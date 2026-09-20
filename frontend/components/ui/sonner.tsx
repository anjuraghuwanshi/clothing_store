'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from 'lucide-react'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" strokeWidth={1.5} />,
        info: <InfoIcon className="size-4" strokeWidth={1.5} />,
        warning: <TriangleAlertIcon className="size-4" strokeWidth={1.5} />,
        error: <OctagonXIcon className="size-4" strokeWidth={1.5} />,
        loading: <Loader2Icon className="size-4 animate-spin" strokeWidth={1.5} />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': '0px',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            'group font-sans !rounded-none !border !border-border !bg-popover !text-popover-foreground',
          title: '!text-sm !font-medium',
          description: '!text-xs !text-muted-foreground',
          actionButton: '!rounded-none !bg-primary !text-primary-foreground',
          cancelButton: '!rounded-none !bg-secondary !text-secondary-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
export { toast } from 'sonner'
