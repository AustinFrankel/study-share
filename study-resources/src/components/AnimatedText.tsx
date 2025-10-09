'use client'

import { useState, useEffect } from 'react'

interface AnimatedTextProps {
  words: string[]
  interval?: number
  className?: string
}

export default function AnimatedText({ words, interval = 3000, className = '' }: AnimatedTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length)
        setIsAnimating(false)
      }, 500) // Half of animation duration for smooth transition
    }, interval)

    return () => clearInterval(timer)
  }, [words.length, interval])

  return (
    <span 
      className={`inline-block transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'} ${className}`}
      style={{
        minWidth: '120px',
        textAlign: 'center',
        whiteSpace: 'nowrap'
      }}
      aria-live="polite"
    >
      {words[currentIndex]}
    </span>
  )
}
