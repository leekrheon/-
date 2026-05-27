import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './supabase';
import { Idea, IdeaTag, TAG_MAP } from './types';
import IphoneContainer from './components/IphoneContainer';
import IdeaCard from './components/IdeaCard';
import IdeaListCard from './components/IdeaListCard';
import IdeaDetail from './components/IdeaDetail';
import ComposeModal from './components/ComposeModal';
import {
  Plus,
  LayoutGrid,
  List,
  Lightbulb,
  PlusCircle,
  Info,
} from 'lucide-react';

// ── 스택 드래그 상태 ──────────────────────────────────────
const dragState = { active: false, startY: 0, totalMoved: 0 };

export default function App() {
  // ── 인증 상태 ──────────────────────────────────────────
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── 데이터 상태 ────────────────────────────────────────
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // ── UI 상태 ────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'stack' | 'all'>('stack');
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  // Stack 카드 인덱스
  const [stackIndex, setStackIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const stackSceneRef = useRef<HTMLDivElement>(null);

  // ── 인증: Anonymous Sign-in ──────────────────────────────
  // 로그인 없이도 사용 가능하되, auth.uid()로 데이터를 격리
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        // 익명 로그인 (Supabase Anonymous Auth)
        const { data, error } = await supabase.auth.signInAnonymously();
        if (!error && data.user) {
          setUserId(data.user.id);
        }
      }
      setAuthLoading(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // ── 데이터 로드 ────────────────────────────────────────
  // RLS가 설정되어 있으면 자신의 데이터만 반환됨
  const loadIdeas = useCallback(async () => {
    if (!userId) return;
    setDataLoading(true);
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setIdeas(
        data.map((d: any) => ({
          ...d,
          body: d.body ?? '',
          tag: d.tag ?? 'other',
          date: new Date(d.created_at).toLocaleDateString('ko-KR'),
        }))
      );
      setStackIndex(0);
    } else if (error) {
      triggerToast('불러오기 실패: ' + error.message);
    }
    setDataLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) loadIdeas();
  }, [userId, loadIdeas]);

  // ── Supabase Realtime 구독 ────────────────────────────
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('ideas_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'ideas', filter: `user_id=eq.${userId}` },
        () => { loadIdeas(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, loadIdeas]);

  // ── CRUD ──────────────────────────────────────────────

  const handleSaveIdea = async (
    data: Omit<Idea, 'id' | 'created_at' | 'date' | 'user_id'>
  ) => {
    if (!userId) return;

    if (editingIdea) {
      // 수정
      const { error } = await supabase
        .from('ideas')
        .update({ title: data.title, body: data.body, tag: data.tag, score: data.score })
        .eq('id', editingIdea.id)
        .eq('user_id', userId);    // user_id 검증 (이중 보안)

      if (error) { triggerToast('수정 실패'); return; }
      triggerToast('수정되었습니다');
    } else {
      // 새 아이디어
      const { error } = await supabase
        .from('ideas')
        .insert({ ...data, user_id: userId });

      if (error) { triggerToast('저장 실패'); return; }
      triggerToast('아이디어가 저장되었습니다');
    }

    setIsComposeOpen(false);
    setEditingIdea(null);
    setActiveIdeaId(null);
  };

  const handleDeleteIdea = async (id: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);     // user_id 검증 (이중 보안)

    if (error) { triggerToast('삭제 실패'); return; }
    setActiveIdeaId(null);
    triggerToast('삭제되었습니다');
  };

  const handleEditIdea = (idea: Idea) => {
    setEditingIdea(idea);
    setActiveIdeaId(null);
    setIsComposeOpen(true);
  };

  const openCompose = () => {
    setEditingIdea(null);
    setIsComposeOpen(true);
  };

  // ── Toast ──────────────────────────────────────────────
  const triggerToast = (msg: string) => {
    setShowSuccessToast(msg);
    setTimeout(() => setShowSuccessToast(null), 2800);
  };

  // ── Stack Navigation ──────────────────────────────────
  const navNext = useCallback(() => {
    if (isAnimating || ideas.length < 2) return;
    setIsAnimating(true);
    setTimeout(() => {
      setStackIndex(i => (i + 1) % ideas.length);
      setIsAnimating(false);
    }, 460);
  }, [isAnimating, ideas.length]);

  const navPrev = useCallback(() => {
    if (isAnimating || ideas.length < 2) return;
    setStackIndex(i => (i - 1 + ideas.length) % ideas.length);
  }, [isAnimating, ideas.length]);

  // ── Keyboard ──────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isComposeOpen || activeIdeaId) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') navNext();
      if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  navPrev();
      if (e.key === 'Escape') { setActiveIdeaId(null); setIsComposeOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isComposeOpen, activeIdeaId, navNext, navPrev]);

  // ── 스택 뷰 렌더 ──────────────────────────────────────
  const stackedIdeas = React.useMemo(() => {
    if (!ideas.length) return [];
    const n = ideas.length;
    const count = Math.min(4, n);
    return Array.from({ length: count }, (_, i) => ({
      idea: ideas[(stackIndex + i) % n],
      layer: i,
    })).reverse();
  }, [ideas, stackIndex]);

  const activeIdea = ideas.find(c => c.id === activeIdeaId);

  const formattedDate = new Date().toLocaleDateString('ko-KR', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  // ── 로딩 화면 ─────────────────────────────────────────
  if (authLoading || dataLoading) {
    return (
      <IphoneContainer>
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <div className="w-10 h-10 border-2 border-neutral-700 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs text-neutral-500 font-semibold">IdeaVault 로딩 중…</p>
        </div>
      </IphoneContainer>
    );
  }

  return (
    <IphoneContainer>

      {/* ── Toast ── */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-14 inset-x-4 bg-zinc-900/95 border border-zinc-800 text-white text-xs font-bold px-4 py-3 rounded-xl z-50 flex items-center gap-2.5 shadow-2xl backdrop-blur-md"
          >
            <span className="text-base text-emerald-400">✓</span>
            <span className="flex-1 text-left">{showSuccessToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header (App.tsx 원본 구조 그대로) ── */}
      <div className="flex flex-col shrink-0 mb-4 select-none">
        <div className="flex justify-between items-center mt-2 px-1">
          {activeIdeaId ? (
            <button
              onClick={() => setActiveIdeaId(null)}
              className="group flex items-center gap-1.5 text-sm font-semibold text-neutral-400 hover:text-white transition"
            >
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-0.5"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              IdeaVault
            </button>
          ) : (
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                {formattedDate}
              </span>
              <h2 className="text-2xl font-black tracking-tight mt-0.5 font-sans">IdeaVault</h2>
            </div>
          )}

          {/* 헤더 우측 버튼 그룹 */}
          <div className="flex items-center gap-2">
            {!activeIdeaId && (
              <button
                onClick={openCompose}
                className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 transition flex items-center justify-center text-white"
              >
                <Plus className="w-5 h-5 stroke-[2.5px]" />
              </button>
            )}
            {/* Avatar badge */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 font-bold text-[11px] text-white flex items-center justify-center border border-white/20 select-none cursor-pointer">
              IV
            </div>
          </div>
        </div>

        {/* Tab bar (STACK / ALL) */}
        {!activeIdeaId && (
          <div className="flex bg-neutral-900/60 border border-neutral-850/60 p-1 rounded-xl mt-4">
            <button
              onClick={() => setActiveTab('stack')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition
                ${activeTab === 'stack'
                  ? 'bg-neutral-800 text-white shadow-md'
                  : 'text-neutral-500 hover:text-white'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Stack ({ideas.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition
                ${activeTab === 'all'
                  ? 'bg-neutral-800 text-white shadow-md'
                  : 'text-neutral-500 hover:text-white'}`}
            >
              <List className="w-3.5 h-3.5" />
              All ({ideas.length})
            </button>
          </div>
        )}
      </div>

      {/* ── Main Content (App.tsx 원본 flex-1 구조 그대로) ── */}
      <div className="flex-1 flex flex-col relative">
        <AnimatePresence mode="wait">

          {/* ─ STACK TAB ─ */}
          {activeTab === 'stack' && !activeIdeaId && (
            <motion.div
              key="stack-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col"
            >
              <div className="relative pt-2 pb-32">
                {ideas.length > 0 ? (
                  // 스택 카드들 — mb-[-115px] 겹침은 IdeaCard 내부에서 처리
                  stackedIdeas.map(({ idea, layer }) => {
                    // layer-0 = 맨 위, layer-3 = 맨 뒤
                    const layerStyles: React.CSSProperties[] = [
                      { transform: 'translateY(0) scale(1)',      opacity: 1,    zIndex: 10, boxShadow: '0 18px 48px rgba(0,0,0,0.16)' },
                      { transform: 'translateY(12px) scale(0.958)', opacity: 1,  zIndex: 9,  boxShadow: '0 6px 18px rgba(0,0,0,0.08)' },
                      { transform: 'translateY(22px) scale(0.916)', opacity: 0.8,zIndex: 8 },
                      { transform: 'translateY(30px) scale(0.876)', opacity: 0.45,zIndex: 7 },
                    ];
                    const style = layerStyles[layer] ?? layerStyles[3];

                    return (
                      <div
                        key={idea.id}
                        style={{
                          position: 'absolute',
                          top: 0, left: 0, right: 0,
                          ...style,
                          transition: 'transform 0.48s cubic-bezier(0.32,0.72,0,1), opacity 0.38s cubic-bezier(0.32,0.72,0,1)',
                          willChange: 'transform, opacity',
                        }}
                      >
                        <IdeaCard
                          idea={idea}
                          index={layer}
                          isActive={false}
                          isStacked={true}
                          onClick={() => {
                            if (layer === 0 && Math.abs(dragState.totalMoved) < 8) {
                              setActiveIdeaId(idea.id);
                            } else if (layer !== 0) {
                              navNext();
                            }
                          }}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 px-4 bg-neutral-900/40 rounded-3xl border border-neutral-800 flex flex-col items-center gap-3 mt-4">
                    <div className="w-12 h-12 rounded-full bg-neutral-800/80 flex items-center justify-center text-neutral-500">
                      <Lightbulb className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold">아이디어가 없습니다</h4>
                      <p className="text-[11px] text-neutral-500 max-w-[220px] mx-auto leading-normal">
                        + 버튼으로 첫 번째 캠페인 아이디어를 기록해보세요.
                      </p>
                    </div>
                    <button
                      onClick={openCompose}
                      className="px-5 py-2 hover:bg-neutral-800 transition text-[11px] font-bold text-blue-500 flex items-center gap-1 rounded-full border border-neutral-800 mt-2"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      아이디어 추가
                    </button>
                  </div>
                )}
              </div>

              {/* Drag/swipe tip banner */}
              {ideas.length > 0 && (
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-start gap-3 mt-4 select-none">
                  <div className="bg-blue-500/10 text-blue-400 p-2 rounded-xl">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black tracking-wider uppercase text-neutral-300">Stack 탐색 팁</h5>
                    <p className="text-[10px] text-neutral-500 mt-0.5 leading-normal">
                      카드를 위로 드래그하거나 탭해서 넘기세요. 맨 위 카드를 탭하면 상세 내용을 확인할 수 있습니다.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ─ ACTIVE IDEA DETAIL ─ */}
          {activeIdeaId && activeIdea && (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col flex-1"
            >
              {/* 확장 카드 */}
              <div className="flex justify-center py-2 select-none">
                <IdeaCard
                  idea={activeIdea}
                  index={0}
                  isActive={true}
                  isStacked={false}
                  onClick={() => {}}
                />
              </div>

              {/* 상세 내용 — CardDetails 자리 */}
              <IdeaDetail
                idea={activeIdea}
                onClose={() => setActiveIdeaId(null)}
                onEdit={handleEditIdea}
                onDelete={handleDeleteIdea}
              />
            </motion.div>
          )}

          {/* ─ ALL (LIST) TAB ─ */}
          {activeTab === 'all' && !activeIdeaId && (
            <motion.div
              key="all-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-2 pb-16"
            >
              {/* List header */}
              <div className="flex justify-between items-baseline px-1 mb-2">
                <h3 className="text-base font-black text-white">모든 아이디어</h3>
                <span className="text-[11px] text-neutral-500 font-bold">{ideas.length}개</span>
              </div>

              {ideas.length > 0 ? (
                ideas.map((idea, i) => (
                  <IdeaListCard
                    key={idea.id}
                    idea={idea}
                    index={i}
                    onClick={() => setActiveIdeaId(idea.id)}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-neutral-600 bg-neutral-900/20 rounded-2xl border border-neutral-800">
                  <p className="text-xs font-semibold">아직 기록된 아이디어가 없습니다</p>
                  <p className="text-[10px] opacity-70 mt-1">+ 버튼으로 추가하세요</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── ComposeModal (AddCardModal 자리) ── */}
      <AnimatePresence>
        {isComposeOpen && (
          <ComposeModal
            editingIdea={editingIdea}
            onSave={handleSaveIdea}
            onClose={() => { setIsComposeOpen(false); setEditingIdea(null); }}
          />
        )}
      </AnimatePresence>

    </IphoneContainer>
  );
}
