"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { TimeZone } from "@/components/navbar"

type TimeZoneState = {
  timeZone: TimeZone
  setTimeZone: (timeZone: TimeZone) => void
}

export const useTimeZoneStore = create<TimeZoneState>()(
  persist(
    (set) => ({
      timeZone: "KST",
      setTimeZone: (timeZone) => set({ timeZone }),
    }),
    { name: "h2h.timeZone" },
  ),
)

