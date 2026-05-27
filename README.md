import { createClient } from '@supabase/supabase-js';

// ── 환경변수 (Vite: import.meta.env.VITE_*) ──────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[IdeaWallet] Supabase 환경변수가 없습니다. .env 파일을 확인하세요.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // 세션을 localStorage에 유지 (브라우저 재시작 후에도 로그인 유지)
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ── 타입 헬퍼 ───────────────────────────────────────────
export type SupabaseIdea = {
  id: string;
  title: string;
  body: string | null;
  tag: string;
  score: number | null;
  created_at: string;
  user_id: string;
};
