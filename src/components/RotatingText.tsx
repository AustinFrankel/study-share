'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface RotatingTextProps {
  texts: string[]
  rotationInterval?: number
  className?: string
  staggerDuration?: number
  loop?: boolean
  auto?: boolean
  splitBy?: 'characters' | 'words'
  reverseMode?: boolean
}

export default function RotatingText({
  texts,
  rotationInterval = 2000,
  className = '',
  staggerDuration = 0.03,
  loop = true,
  auto = true,
  splitBy = 'characters',
  reverseMode = false
}: RotatingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!auto) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (loop) {
          return (prevIndex + 1) % texts.length
        } else {
          return prevIndex < texts.length - 1 ? prevIndex + 1 : prevIndex
        }
      })
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [texts.length, rotationInterval, loop, auto])

  const currentText = texts[currentIndex]
  const splitText = splitBy === 'characters' 
    ? currentText.split('') 
    : currentText.split(' ')

  // For reverse mode, flip the array
  const displayText = reverseMode ? [...splitText].reverse() : splitText

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={currentIndex}
        className={`inline-block ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ whiteSpace: 'nowrap' }}
      >
        {displayText.map((char, index) => {
          const actualIndex = reverseMode ? splitText.length - 1 - index : index
          return (
            <motion.span
              key={`${currentIndex}-${actualIndex}`}
              initial={{ 
                y: reverseMode ? '-100%' : '100%', 
                opacity: 0,
                rotateX: reverseMode ? -20 : 20
              }}
              animate={{ 
                y: 0, 
                opacity: 1,
                rotateX: 0
              }}
              exit={{ 
                y: reverseMode ? '120%' : '-120%', 
                opacity: 0,
                rotateX: reverseMode ? 20 : -20
              }}
              transition={{
                duration: 0.5,
                delay: index * staggerDuration,
                ease: [0.25, 0.46, 0.45, 0.94] // Smoother easing
              }}
              style={{ 
                display: 'inline-block',
                transformOrigin: 'center',
                perspective: '1000px'
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          )
        })}
      </motion.span>
    </AnimatePresence>
  )
}
