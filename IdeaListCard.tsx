import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Idea, TAG_MAP } from '../types';

interface IdeaCardProps {
  idea: Idea;
  index: number;
  isActive: boolean;
  isStacked: boolean;
  onClick: () => void;
}

export default function IdeaCard({ idea, index, isActive, isStacked, onClick }: IdeaCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(100);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);
  const sheenX = useTransform(x, [-150, 150], ['100%', '0%']);

  const tag = TAG_MAP[idea.tag] ?? TAG_MAP.other;

  return (
    <motion.div
      ref={cardRef}
      layoutId={`idea-card-${idea.id}`}
      style={{
        zIndex: isActive ? 40 : index + 10,
        rotateX: isStacked ? 0 : rotateX,
        rotateY: isStacked ? 0 : rotateY,
        transformStyle: 'preserve-3d',
        background: tag.gradient,
      }}
      whileHover={isStacked ? { y: -14, scale: 1.02 } : { scale: 1.05, y: -4 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        layout: { type: 'spring', stiffness: 350, damping: 28 },
      }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`relative w-full aspect-[1.586/1] rounded-2xl cursor-pointer shadow-2xl overflow-hidden select-none touch-none
        ${isStacked ? 'mb-[-115px]' : 'mb-0'} border border-white/40`}
    >
      {/* Glass shine */}
      <motion.div
        style={{ x: sheenX }}
        className="absolute inset-x-0 top-0 h-full w-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-[25deg] pointer-events-none"
      />
      {/* Glass top highlight */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(145deg,rgba(255,255,255,0.38)0%,rgba(255,255,255,0.04)60%,transparent 100%)' }} />

      {/* Score watermark */}
      {idea.score != null && (
        <div className="absolute right-[-8px] bottom-[-10px] text-[234px] font-black leading-none text-white/25 pointer-events-none select-none"
          style={{ letterSpacing: '-6px', filter: 'blur(1px)' }}>
          {idea.score}
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between text-[#111]">
        {/* Top */}
        <div className="flex flex-col flex-1">
          <span className="text-[9px] font-black tracking-[0.14em] uppercase opacity-50 mb-3">
            {tag.label}
          </span>
          <span className="text-2xl font-black leading-tight tracking-tight break-words line-clamp-3">
            {idea.title}
          </span>
          {idea.body && (
            <span className="mt-3 text-[13px] leading-relaxed opacity-55 line-clamp-2 font-normal">
              {idea.body}
            </span>
          )}
        </div>
        {/* Footer */}
        <div className="flex justify-between items-end mt-4">
          <span className="text-[22px] font-black tracking-tight opacity-35 leading-none">
            {idea.date}
          </span>
          <span className="text-lg opacity-0 group-hover:opacity-45 transition-opacity" style={{ opacity: isActive ? 0 : 0.45 }}>
            →
          </span>
        </div>
      </div>
    </motion.div>
  );
}
