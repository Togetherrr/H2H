"use client"

import { ReactNode } from "react"
import { NavLoadingProvider } from "@/components/nav-loading"

export function ClientProvider({ children }: { children: ReactNode }) {
  // This component ensures client-side hydration for Zustand stores
  // and other client-side features
  return <NavLoadingProvider>{children}</NavLoadingProvider>
}
