'use client'

import { useState, Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  className?: string
}

function SearchBarContent({ placeholder = "Search by class or teacher...", className }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const debounceRef = useRef<number | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  // Real-time navigation with debounce (non-intrusive, no inline autocompletion)
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      const q = query.trim()
      if (q.length > 1) {
        router.replace(`/search?q=${encodeURIComponent(q)}`)
      }
    }, 250)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [query, router])

  return (
    <form onSubmit={handleSearch} className={`flex gap-2 sm:gap-3 ${className}`} role="search" aria-label="Search study resources">
      <div className="relative flex-1 rounded-xl sm:rounded-2xl bg-white/90 backdrop-blur shadow-sm">
        <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 sm:pl-12 h-11 sm:h-14 text-sm sm:text-base md:text-lg rounded-xl sm:rounded-2xl border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
          aria-label="Search for study resources"
        />
      </div>
      <Button type="submit" className="h-11 sm:h-14 px-4 sm:px-6 text-sm sm:text-base rounded-xl whitespace-nowrap" aria-label="Submit search">
        Search
      </Button>
    </form>
  )
}

export default function SearchBar(props: SearchBarProps) {
  return (
    <Suspense fallback={
      <form className={`flex gap-2 sm:gap-3 ${props.className}`} role="search" aria-label="Search study resources">
        <div className="relative flex-1 rounded-xl sm:rounded-2xl bg-white/90 backdrop-blur shadow-sm">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          <Input
            type="search"
            placeholder={props.placeholder || "Search by class or teacher..."}
            disabled
            className="pl-10 sm:pl-12 h-11 sm:h-14 text-sm sm:text-base md:text-lg rounded-xl sm:rounded-2xl border-2 border-gray-200"
            aria-label="Search for study resources"
          />
        </div>
        <Button type="submit" disabled className="h-11 sm:h-14 px-4 sm:px-6 text-sm sm:text-base rounded-xl whitespace-nowrap" aria-label="Submit search">
          Search
        </Button>
      </form>
    }>
      <SearchBarContent {...props} />
    </Suspense>
  )
}
