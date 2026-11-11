'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'

type CategoryFilter = 'todos' | 'colchones' | 'colchonetas' | 'bases' | 'almohadas' | 'protectores' | 'sabanas'

interface FilterBarProps {
  activeFilter: CategoryFilter
  onFilterChange: (f: CategoryFilter) => void
}

const FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: 'todos', label: 'Todos los Productos' },
  { value: 'colchones', label: 'Colchones' },
  { value: 'colchonetas', label: 'Colchonetas' },
  { value: 'bases', label: 'Bases & Espaldares' },
  { value: 'almohadas', label: 'Almohadas' },
  { value: 'protectores', label: 'Protectores' },
  { value: 'sabanas', label: 'Sábanas' },
]

export function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  const barRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={barRef}
      className="sticky top-[4.5rem] z-20 border-b border-[#0A1B54]/10 bg-white/95 backdrop-blur-md"
    >
      <div className="flex items-center gap-0 overflow-x-auto px-8 lg:px-16 scrollbar-none">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={`relative flex-shrink-0 py-4 pr-8 font-body text-xs uppercase tracking-widest transition-colors duration-200 ${
              activeFilter === value ? 'text-[#0A1B54] font-semibold' : 'text-[#0A1B54]/40 hover:text-[#0A1B54]/80'
            }`}
          >
            {label}
            {activeFilter === value && (
              <motion.div
                layoutId="filter-underline"
                className="absolute bottom-0 left-0 right-8 h-[2px] bg-[#C5A059]"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
