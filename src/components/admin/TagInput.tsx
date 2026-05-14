import { useState, KeyboardEvent } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TagInputProps {
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  label?: string
}

export function TagInput({ items, onChange, placeholder = "Add tag and press Enter...", label }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const addTag = () => {
    const trimmed = inputValue.trim()
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed])
      setInputValue("")
    }
  }

  const removeTag = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    onChange(newItems)
  }

  return (
    <div className="grid gap-2">
      {label && <label className="text-sm font-medium leading-none text-slate-300">{label}</label>}
      <div className="flex flex-wrap gap-2 p-2 rounded-xl border border-slate-800 bg-slate-950/50 min-h-[44px]">
        {items.map((item, index) => (
          <span 
            key={index} 
            className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors"
          >
            <span className="text-[12px] font-medium">{item}</span>
            <button 
              type="button" 
              onClick={() => removeTag(index)}
              className="text-slate-400 hover:text-red-400 transition-colors"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <div className="flex-1 min-w-[150px] flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={items.length === 0 ? placeholder : "+ Add more..."}
            className="h-8 border-none bg-transparent text-white focus-visible:ring-0 px-1 placeholder:text-slate-500"
          />
          {inputValue.trim() && (
            <button 
              type="button" 
              onClick={addTag}
              className="p-1 rounded-md bg-sky-500/20 text-sky-400 hover:bg-sky-500/40 transition-colors"
            >
              <Plus className="size-4" />
            </button>
          )}
        </div>
      </div>
      <p className="text-[10px] text-slate-500 italic flex items-center gap-1.5">
        <Plus className="size-3" /> Press Enter or click + to add multiple items.
      </p>
    </div>
  )
}
