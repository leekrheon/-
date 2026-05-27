import React from 'react'
import { motion } from 'motion/react'
import { Idea, TAG_MAP } from '../types'
import { Pencil, Trash2, Star } from 'lucide-react'

interface Props {
  idea: Idea
  onEdit: (idea: Idea) => void
  onDelete: (id: string) => void
}

export default function IdeaDetail({ idea, onEdit, onDelete }: Props) {
  const tag = TAG_MAP[idea.tag] ?? TAG_MAP.other

  const handleDelete = () => {
    if (confirm('이 아이디어를 삭제할까요?')) onDelete(idea.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="flex flex-col flex-1 mt-6 text-white"
    >
      {/* Action grid */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="col-span-2 flex flex-col items-center justify-center p-3 rounded-2xl border border-neutral-800 bg-neutral-900 gap-1 select-none">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#111] ${tag.color}`}>
            {tag.label}
          </span>
          <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mt-1">카테고리</span>
        </div>

        <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-neutral-800 bg-neutral-900 gap-1 select-none">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[10px] font-black tracking-wider uppercase text-neutral-300">
            {idea.score != null ? `${idea.score}/10` : '—'}
          </span>
        </div>

        <button
          onClick={() => onEdit(idea)}
          className="flex flex-col items-center justify-center p-3 rounded-2xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 active:scale-95 transition gap-1 select-none"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Pencil className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-[10px] font-black tracking-wider uppercase text-neutral-300">수정</span>
        </button>
      </div>

      {/* Body */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 mb-6 flex-1 overflow-y-auto">
        <div className="pb-4 border-b border-neutral-800">
          <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">아이디어 내용</span>
          <p className="mt-3 text-[14px] leading-relaxed text-neutral-200 whitespace-pre-wrap break-words">
            {idea.body || <span className="text-neutral-600 italic">내용이 없습니다</span>}
          </p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-neutral-300">Supabase Vault</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-500">{idea.date}</span>
        </div>
      </div>

      {/* Delete */}
      <div className="mb-4">
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 active:scale-95 transition text-rose-400"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-[11px] font-black uppercase tracking-widest">아이디어 삭제</span>
        </button>
      </div>
    </motion.div>
  )
}
