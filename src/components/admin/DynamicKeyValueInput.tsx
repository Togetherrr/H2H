import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface KV {
  key: string
  value: string
}

interface DynamicKeyValueInputProps {
  items: KV[]
  onChange: (items: KV[]) => void
  label?: string
}

export function DynamicKeyValueInput({ items, onChange, label }: DynamicKeyValueInputProps) {
  const handleAdd = () => {
    onChange([...items, { key: "", value: "" }])
  }

  const handleChange = (index: number, field: "key" | "value", val: string) => {
    const newItems = [...items]
    newItems[index][field] = val
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
              value={item.key}
              onChange={(e) => handleChange(index, "key", e.target.value)}
              placeholder="e.g. Color"
              className="w-1/3 bg-white/50 border-sky-100 focus-visible:ring-sky-200"
            />
            <Input
              value={item.value}
              onChange={(e) => handleChange(index, "value", e.target.value)}
              placeholder="e.g. Sky Blue, White"
              className="flex-1 bg-white/50 border-sky-100 focus-visible:ring-sky-200"
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
        <Plus className="size-4 mr-1" /> Add Favorite
      </Button>
    </div>
  )
}
