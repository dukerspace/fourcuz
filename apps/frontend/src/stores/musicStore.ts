import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MusicState {
  isPlaying: boolean
  volume: number
}

interface MusicStore extends MusicState {
  toggle: () => void
  setVolume: (volume: number) => void
}

export const useMusicStore = create<MusicStore>()(
  persist(
    (set) => ({
      isPlaying: false,
      volume: 0,

      toggle: () => {
        set((state) => ({ isPlaying: !state.isPlaying }))
      },

      setVolume: (volume: number) => {
        set({ volume: Math.max(0, Math.min(1, volume)) })
      },
    }),
    {
      name: 'music-state',
    }
  )
)
