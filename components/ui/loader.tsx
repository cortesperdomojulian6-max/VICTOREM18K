import { cn } from '@/lib/utils'

const sizes = { sm: 'size-5', md: 'size-8', lg: 'size-12' } as const

export function Loader({ size = 'md', className }: { size?: keyof typeof sizes; className?: string }) {
  return (
    <svg
      className={cn('animate-spin text-gold-400', sizes[size], className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Cargando"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-20" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="opacity-90"
      />
    </svg>
  )
}
