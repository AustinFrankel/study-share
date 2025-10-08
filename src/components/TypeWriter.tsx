'use client'

import { useState, useEffect, useRef, ElementType, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface TypeWriterProps {
  text: string | string[]
  as?: ElementType
  typingSpeed?: number
  initialDelay?: number
  pauseDuration?: number
  deletingSpeed?: number
  loop?: boolean
  className?: string
  showCursor?: boolean
  hideCursorWhileTyping?: boolean
  cursorCharacter?: string | ReactNode
  cursorBlinkDuration?: number
  cursorClassName?: string
  textColors?: string[]
  variableSpeed?: { min: number; max: number }
  onSentenceComplete?: (sentence: string, index: number) => void
  startOnVisible?: boolean
  reverseMode?: boolean
}

export default function TypeWriter({
  text,
  as: Component = 'div',
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = '',
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = '|',
  cursorBlinkDuration = 0.5,
  cursorClassName = '',
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false
}: TypeWriterProps) {
  const texts = Array.isArray(text) ? text : [text]
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [showCursorState, setShowCursorState] = useState(true)
  const [hasStarted, setHasStarted] = useState(!startOnVisible)
  const elementRef = useRef<HTMLDivElement>(null)

  // Intersection observer for startOnVisible
  useEffect(() => {
    if (!startOnVisible || hasStarted) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true)
        }
      },
      { threshold: 0.1 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [startOnVisible, hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    const currentText = texts[currentIndex]
    
    if (isWaiting) {
      const timeout = setTimeout(() => {
        setIsWaiting(false)
        if (texts.length > 1 || loop) {
          setIsDeleting(true)
        }
      }, pauseDuration)
      return () => clearTimeout(timeout)
    }

    if (isDeleting) {
      if (displayText === '') {
        setIsDeleting(false)
        setCurrentIndex((prev) => {
          if (loop) {
            return (prev + 1) % texts.length
          }
          return prev < texts.length - 1 ? prev + 1 : prev
        })
        return
      }

      const speed = variableSpeed
        ? Math.random() * (variableSpeed.max - variableSpeed.min) + variableSpeed.min
        : deletingSpeed

      const timeout = setTimeout(() => {
        if (reverseMode) {
          setDisplayText((prev) => prev.slice(1))
        } else {
          setDisplayText((prev) => prev.slice(0, -1))
        }
      }, speed)

      return () => clearTimeout(timeout)
    }

    if (displayText === currentText) {
      if (onSentenceComplete) {
        onSentenceComplete(currentText, currentIndex)
      }
      if (texts.length > 1 || loop) {
        setIsWaiting(true)
      }
      return
    }

    const speed = variableSpeed
      ? Math.random() * (variableSpeed.max - variableSpeed.min) + variableSpeed.min
      : typingSpeed

    const timeout = setTimeout(() => {
      if (reverseMode) {
        const remainingText = currentText.slice(displayText.length)
        setDisplayText(remainingText[remainingText.length - 1] + displayText)
      } else {
        setDisplayText(currentText.slice(0, displayText.length + 1))
      }
    }, displayText === '' ? initialDelay : speed)

    return () => clearTimeout(timeout)
  }, [
    displayText,
    currentIndex,
    isDeleting,
    isWaiting,
    texts,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    initialDelay,
    loop,
    variableSpeed,
    onSentenceComplete,
    hasStarted,
    reverseMode
  ])

  const currentColor = textColors[currentIndex % textColors.length]

  return (
    <Component 
      ref={elementRef}
      className={className}
      style={currentColor ? { color: currentColor } : undefined}
    >
      {displayText}
      {showCursor && (!hideCursorWhileTyping || showCursorState) && (
        <motion.span
          className={cursorClassName}
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: cursorBlinkDuration,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        >
          {cursorCharacter}
        </motion.span>
      )}
    </Component>
  )
}
