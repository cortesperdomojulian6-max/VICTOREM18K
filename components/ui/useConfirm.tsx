'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './button'

interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmOptions & { resolve: (value: boolean) => void } | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...opts, resolve })
    })
  }, [])

  const cleanup = useCallback(() => setState(null), [])

  const dialog = state ? (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) { state.resolve(false); cleanup() } }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-sm p-8 mx-4 border border-gold-400/20 shadow-2xl"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <h3 id="confirm-title" className="font-heading text-lg font-semibold text-ebony mb-2">
            {state.title || 'Confirmar'}
          </h3>
          <p className="text-sm text-stone mb-6 leading-relaxed">{state.message}</p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => { state.resolve(false); cleanup() }}
            >
              {state.cancelLabel || 'Cancelar'}
            </Button>
            <Button
              variant={state.variant === 'danger' ? 'danger' : 'primary'}
              onClick={() => { state.resolve(true); cleanup() }}
            >
              {state.confirmLabel || 'Confirmar'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  ) : null

  return { confirm, dialog }
}
