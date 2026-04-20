import { create } from "zustand"

type AppState = {
  count: number
  inc: () => void
  dec: () => void
  reset: () => void
}

export const useAppStore = create<AppState>((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
  dec: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))