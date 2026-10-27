'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'

type CategoryFilter = 'todos' | 'espuma' | 'resortes' | 'latex' | 'premium'

interface FilterBarProps {
  activeFilter: CategoryFilter
  onFilterChange: (f: CategoryFilter) => void
}

const FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'espuma', label: 'Espuma' },
  { value: 'resortes', label: 'Resortes' },
  { value: 'latex', label: 'Látex' },
  { value: 'premium', label: 'Premium' },
]

export function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  const barRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={barRef}
      className="sticky top-[4.5rem] z-20 border-b border-white/10 bg-[#0A1B54]/95 backdrop-blur-md"
    >
      <div className="flex items-center gap-0 overflow-x-auto px-8 lg:px-16">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={`relative flex-shrink-0 py-4 pr-8 font-body text-xs uppercase tracking-widest transition-colors duration-200 ${
              activeFilter === value ? 'text-white' : 'text-white/30 hover:text-white/60'
            }`}
          >
            {label}
            {activeFilter === value && (
              <motion.div
                layoutId="filter-underline"
                className="absolute bottom-0 left-0 right-8 h-px bg-[#C5A059]"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
