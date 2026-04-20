"use client"

import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store"

export function CounterDemo() {
  const count = useAppStore((state) => state.count)
  const inc = useAppStore((state) => state.inc)
  const dec = useAppStore((state) => state.dec)
  const reset = useAppStore((state) => state.reset)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-xl font-semibold">Count: {count}</div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={dec}>
          -1
        </Button>
        <Button onClick={inc}>+1</Button>
        <Button variant="secondary" onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  )
}
