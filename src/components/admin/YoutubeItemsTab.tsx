"use client"

import { useState, useTransition } from "react"
import {
    addYoutubeItem,
    deleteYoutubeItem,
    toggleYoutubeItem,
} from "@/app/admin/actions"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type YoutubeItem = {
    id: string
    platform_id: string
    title: string | null
    cover_url: string | null
    is_active: boolean
    release_date: string | null
    source_updated_at: string | null
}

interface YoutubeItemsTabProps {
    items: YoutubeItem[]
}

export function YoutubeItemsTab({
    items: initialItems,
}: YoutubeItemsTabProps) {
    const [items, setItems] = useState(initialItems)
    const [url, setUrl] = useState("")
    const [releaseDate, setReleaseDate] = useState("")
    const [pending, startTransition] = useTransition()

    async function handleAdd() {
        if (!url.trim()) return

        startTransition(async () => {
            const result = await addYoutubeItem({
                url,
                release_date: releaseDate || null,
            })

            if (result?.error) {
                alert(result.error)
                return
            }

            window.location.reload()
        })
    }

    async function handleToggle(id: string, current: boolean) {
        startTransition(async () => {
            const result = await toggleYoutubeItem(id, !current)

            if (result?.error) {
                alert(result.error)
                return
            }

            setItems((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            is_active: !current,
                        }
                        : item
                )
            )
        })
    }

    async function handleDelete(id: string) {
        const ok = confirm("Delete this video?")
        if (!ok) return

        startTransition(async () => {
            const result = await deleteYoutubeItem(id)

            if (result?.error) {
                alert(result.error)
                return
            }

            setItems((prev) => prev.filter((item) => item.id !== id))
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-light text-white">
                    YouTube Items
                </h1>

                <p className="mt-2 text-slate-400">
                    Manage tracked YouTube videos.
                </p>
            </div>

            <Card className="border-slate-800 bg-slate-900">
                <CardHeader>
                    <CardTitle className="text-white">
                        Add Video
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                    <Input
                        placeholder="https://youtube.com/watch?v=..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />

                    <Input
                        type="date"
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                    />

                    <Button
                        onClick={handleAdd}
                        disabled={pending}
                    >
                        Add Video
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900">
                <CardHeader>
                    <CardTitle className="text-white">
                        Videos ({items.length})
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 rounded-lg border border-slate-800 p-3"
                            >
                                {item.cover_url && (
                                    <img
                                        src={item.cover_url}
                                        alt={item.title ?? ""}
                                        className="h-16 w-28 rounded object-cover"
                                    />
                                )}

                                <div className="flex-1">
                                    <p className="font-medium text-white">
                                        {item.title || "Untitled"}
                                    </p>

                                    <p className="text-sm text-slate-400">
                                        {item.platform_id}
                                    </p>

                                    {item.release_date && (
                                        <p className="text-xs text-slate-500">
                                            Release: {item.release_date}
                                        </p>
                                    )}
                                </div>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs ${item.is_active
                                            ? "bg-emerald-500/20 text-emerald-400"
                                            : "bg-red-500/20 text-red-400"
                                        }`}
                                >
                                    {item.is_active ? "Active" : "Inactive"}
                                </span>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handleToggle(item.id, item.is_active)
                                    }
                                >
                                    {item.is_active ? "Disable" : "Enable"}
                                </Button>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}