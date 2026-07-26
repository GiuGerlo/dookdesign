'use client'

import { motion, MotionConfig } from 'motion/react'

interface RevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

// Fade + subida al entrar en viewport. `reducedMotion="user"` desactiva el transform
// (queda solo el fade) si el usuario prefiere menos movimiento.
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay }}
        className={className}
      >
        {children}
      </motion.div>
    </MotionConfig>
  )
}
