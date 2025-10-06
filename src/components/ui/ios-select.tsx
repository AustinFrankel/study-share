'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IOSSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  options: Array<{ id: string; name: string }>
  disabled?: boolean
  className?: string
  triggerClassName?: string
  footer?: React.ReactNode
}

export function IOSSelect({
  value,
  onValueChange,
  placeholder,
  options,
  disabled = false,
  className,
  triggerClassName,
  footer
}: IOSSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find(opt => opt.id === value)
  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleSelect = (optionId: string) => {
    onValueChange(optionId)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-2.5 py-2 text-xs sm:text-sm font-medium rounded-lg border-2 transition-all duration-200 ease-out",
          "focus:outline-none focus:ring-2 focus:ring-offset-1",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-[0.98]",
          isOpen && "scale-[1.01]",
          triggerClassName || "bg-white border-gray-300 hover:border-gray-400 focus:ring-gray-500"
        )}
      >
        <span className={cn(
          "truncate text-left",
          (!value || value === 'all') && "text-gray-500"
        )}>
          {selectedOption?.name || placeholder || 'Select...'}
        </span>
        <ChevronDown 
          className={cn(
            "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ease-out flex-shrink-0 ml-1.5",
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden animate-fade-in" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dropdown content */}
          <div className={cn(
            'absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl',
            'border border-gray-200 overflow-hidden',
            'max-h-[60vh] flex flex-col',
            'animate-dropdown-open',
            // Mobile: Fixed at bottom with animation
            'md:relative md:max-h-80'
          )}>
            {/* Search input */}
            {options.length > 5 && (
              <div className="p-3 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white sticky top-0 z-10">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200"
                />
              </div>
            )}

            {/* Options list */}
            <div className="overflow-y-auto flex-1 py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  const isSelected = option.id === value
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(option.id)}
                      style={{ animationDelay: `${index * 20}ms` }}
                      className={cn(
                        'w-full px-4 py-3.5 flex items-center justify-between',
                        'text-left text-base transition-all duration-200',
                        'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50',
                        'active:scale-[0.98]',
                        'animate-slide-in',
                        isSelected && 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-semibold shadow-inner'
                      )}
                    >
                      <span className="truncate">{option.name}</span>
                      {isSelected && (
                        <Check className="w-5 h-5 ml-2 flex-shrink-0 text-blue-600 animate-scale-in" />
                      )}
                    </button>
                  )
                })
              ) : (
                <div className="px-4 py-8 text-center text-gray-500 animate-fade-in">
                  No results found
                </div>
              )}
            </div>

            {/* Footer (for add buttons, etc) */}
            {footer && (
              <div className="border-t border-gray-200 bg-gradient-to-t from-gray-50 to-white">
                {footer}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
