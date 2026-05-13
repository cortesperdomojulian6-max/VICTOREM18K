'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  primary:
    'bg-ebony text-white hover:bg-gold-400 hover:text-ebony active:bg-gold-500',
  outline:
    'border border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-ebony',
  ghost: 'text-stone hover:text-ebony hover:bg-snow',
  danger: 'bg-red-600 text-white hover:bg-red-700',
} as const

const sizes = {
  sm: 'px-4 py-2 text-[0.6875rem] tracking-[0.12em]',
  md: 'px-8 py-3 text-[0.6875rem] tracking-[0.12em]',
  lg: 'px-12 py-4 text-[0.75rem] tracking-[0.125em]',
  icon: 'size-10',
} as const

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex items-center justify-center font-semibold uppercase transition-all duration-300 overflow-hidden',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none',
        'hover:-translate-y-0.5 hover:shadow-lg',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit">
          <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </span>
      )}
      <span className={loading ? 'invisible' : undefined}>{children}</span>
    </button>
  ),
)
Button.displayName = 'Button'

export { Button, type ButtonProps }
