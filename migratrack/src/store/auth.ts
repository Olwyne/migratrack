import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../data/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  setSession: (s: Session | null) => void
  signOut: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  setSession: (s) => set({ session: s, user: s?.user ?? null, loading: false }),
  signOut: async () => {
    await supabase?.auth.signOut()
    set({ session: null, user: null })
  },
}))

// Initialize auth listener once
if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    useAuth.getState().setSession(data.session)
  })
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuth.getState().setSession(session)
  })
} else {
  useAuth.setState({ loading: false })
}
