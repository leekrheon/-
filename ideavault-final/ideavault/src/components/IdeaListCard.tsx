import React from 'react'
import { motion } from 'motion/react'
import { Idea, TAG_MAP } from '../types'

interface Props {
  idea: Idea
  index: number
  onClick: () => void
}

export default function IdeaListCard({ idea, index, onClick }: Props) {
  const tag = TAG_MAP[idea.tag] ?? TAG_MAP.other

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 280, damping: 26 }}
      onClick={onClick}
      whileTap={{ scale: 0.982 }}
      className="relative w-full rounded-2xl cursor-pointer overflow-hidden select-none border border-white/40 flex items-stretch min-h-[88px]"
      style={{ background: tag.gradient }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(145deg,rgba(255,255,255,0.30)0%,rgba(255,255,255,0.03)55%,transparent 100%)' }} />

      <div className="flex-1 min-w-0 px-5 py-4 flex flex-col justify-center relative z-10">
        <span className="text-[9px] font-black uppercase tracking-[0.13em] opacity-45 text-[#111] mb-1">{tag.label}</span>
        <span className="text-[18px] font-black leading-snug tracking-tight text-[#111]" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {idea.title}
        </span>
        {idea.body && (
          <span className="mt-1 text-[12px] leading-snug opacity-50 text-[#111]" style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {idea.body}
          </span>
        )}
        {idea.date && <span className="mt-1.5 text-[11px] font-semibold opacity-35 text-[#111]">{idea.date}</span>}
      </div>

      <div className="flex-shrink-0 flex items-center justify-end pr-4 relative z-10">
        <span className="font-black text-[#111] leading-none"
          style={{ fontSize: 'clamp(56px,15vw,80px)', opacity: idea.score != null ? 0.85 : 0.15, letterSpacing: '-4px' }}>
          {idea.score != null ? idea.score : '—'}
        </span>
      </div>
    </motion.div>
  )
}
