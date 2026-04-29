import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DynamicListInputProps {
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  label?: string
}

export function DynamicListInput({ items, onChange, placeholder = "Add item...", label }: DynamicListInputProps) {
  const handleAdd = () => {
    onChange([...items, ""])
  }

  const handleChange = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index] = value
    onChange(newItems)
  }

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    onChange(newItems)
  }

  return (
    <div className="grid gap-2">
      {label && <label className="text-sm font-medium leading-none text-slate-700">{label}</label>}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={item}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={placeholder}
              className="bg-white/50 border-sky-100 focus-visible:ring-sky-200"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(index)}
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="w-full mt-1 border-dashed border-sky-200 text-sky-600 hover:bg-sky-50 hover:text-sky-700"
      >
        <Plus className="size-4 mr-1" /> Add
      </Button>
    </div>
  )
}
