'use client'
import React from 'react'
import { motion } from 'framer-motion'

interface TextSplitRevealProps {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
  delay?: number
  stagger?: number
  italicText?: string
}

export function TextSplitReveal({
  text,
  className = '',
  as = 'h1',
  delay = 0,
  stagger = 0.05,
  italicText,
}: TextSplitRevealProps) {
  const words = text.split(' ')
  const Tag = as as React.ElementType

  return (
    <Tag className={className}>
      <span className="inline-block flex-wrap">
        {words.map((word, wordIndex) => (
          <span
            key={`${word}-${wordIndex}`}
            className="inline-block overflow-hidden align-top mr-[0.25em] last:mr-0"
          >
            <motion.span
              className="inline-block"
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{
                duration: 0.85,
                delay: delay + wordIndex * stagger,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
        ))}
        {italicText && (
          <span className="inline-block overflow-hidden align-top italic text-[#C5A059]">
            <motion.span
              className="inline-block"
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{
                duration: 0.85,
                delay: delay + words.length * stagger,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {italicText}
            </motion.span>
          </span>
        )}
      </span>
    </Tag>
  )
}

