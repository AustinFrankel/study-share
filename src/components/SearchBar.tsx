'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  className?: string
}

export default function SearchBar({ placeholder = "Search resources, classes, teachers...", className }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className={`flex gap-2 sm:gap-3 ${className}`}>
      <div className="relative flex-1 rounded-xl sm:rounded-2xl bg-white/90 backdrop-blur shadow-sm">
        <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 sm:pl-12 h-11 sm:h-14 text-sm sm:text-base md:text-lg rounded-xl sm:rounded-2xl border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
        />
      </div>
      <Button type="submit" className="h-11 sm:h-14 px-4 sm:px-6 text-sm sm:text-base rounded-xl whitespace-nowrap">
        Search
      </Button>
    </form>
  )
}
