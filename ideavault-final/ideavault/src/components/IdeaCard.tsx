import React from 'react'
import { motion } from 'motion/react'
import { Idea, TAG_MAP } from '../types'

interface Props {
  idea: Idea
  index: number
  isActive: boolean
  isStacked: boolean
  onClick: () => void
}

export default function IdeaCard({ idea, index, isActive, isStacked, onClick }: Props) {
  const tag = TAG_MAP[idea.tag] ?? TAG_MAP.other

  return (
    <motion.div
      layoutId={`idea-${idea.id}`}
      style={{ zIndex: isActive ? 40 : index + 10, background: tag.gradient, aspectRatio: '1.586/1' }}
      whileHover={isStacked ? { y: -14, scale: 1.02 } : { scale: 1.05, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, layout: { type: 'spring', stiffness: 350, damping: 28 } }}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={`relative w-full rounded-2xl cursor-pointer shadow-2xl overflow-hidden select-none border border-white/40 ${isStacked ? 'mb-[-115px]' : 'mb-0'}`}
    >
      {/* Glass shine */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(145deg,rgba(255,255,255,0.38)0%,rgba(255,255,255,0.04)60%,transparent 100%)' }} />

      {/* Score watermark */}
      {idea.score != null && (
        <div className="absolute right-[-8px] bottom-[-10px] pointer-events-none select-none text-white/25 font-black"
          style={{ fontSize: '200px', lineHeight: 1, letterSpacing: '-6px', filter: 'blur(1px)' }}>
          {idea.score}
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between text-[#111]">
        <div className="flex flex-col flex-1">
          <span className="text-[9px] font-black tracking-[0.14em] uppercase opacity-50 mb-3">{tag.label}</span>
          <span className="text-2xl font-black leading-tight tracking-tight break-words" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {idea.title}
          </span>
          {idea.body && (
            <span className="mt-3 text-[13px] leading-relaxed opacity-55 font-normal" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {idea.body}
            </span>
          )}
        </div>
        <div className="flex justify-between items-end mt-4">
          <span className="text-[20px] font-black tracking-tight opacity-35 leading-none">{idea.date}</span>
          <span className="text-lg opacity-45">→</span>
        </div>
      </div>
    </motion.div>
  )
}
