'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-iron tracking-wide">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          'w-full px-3.5 py-3 bg-white border text-sm font-body text-iron min-h-[120px] resize-y',
          'transition-all duration-200',
          'placeholder:text-stone/50',
          'focus:outline-none focus:border-gold-400 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.08)]',
          error ? 'border-red-400 focus:border-red-500 focus:shadow-red-100' : 'border-pearl',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  ),
)
Textarea.displayName = 'Textarea'

export { Textarea, type TextareaProps }
