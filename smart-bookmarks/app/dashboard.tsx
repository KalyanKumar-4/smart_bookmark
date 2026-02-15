"use client"

import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"

export default function Dashboard({ session }: any) {
    const [bookmarks, setBookmarks] = useState<any[]>([])
    const [title, setTitle] = useState("")
    const [url, setUrl] = useState("")

    const user = session.user

    // Fetch bookmarks
    const fetchBookmarks = async () => {
        const { data } = await supabase
            .from("bookmarks")
            .select("*")
            .order("created_at", { ascending: false })

        setBookmarks(data || [])
    }

    useEffect(() => {
        fetchBookmarks()

        const channel = supabase
            .channel("realtime-bookmarks")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "bookmarks" },
                () => {
                    fetchBookmarks()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // Add bookmark
    const addBookmark = async () => {
        if (!title || !url) return

        await supabase.from("bookmarks").insert({
            title,
            url,
            user_id: user.id,
        })

        setTitle("")
        setUrl("")
        fetchBookmarks()
    }

    // Delete bookmark
    const deleteBookmark = async (id: string) => {
        await supabase.from("bookmarks").delete().eq("id", id)
        fetchBookmarks()
    }

    return (
        <div className="max-w-xl mx-auto mt-10 p-6">
            <div className="flex justify-between mb-6">
                <h1 className="text-xl font-bold">My Bookmarks</h1>
                <button onClick={() => supabase.auth.signOut()}>
                    Logout
                </button>
            </div>

            <div className="flex gap-2 mb-6">
                <input
                    className="border p-2 w-full"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    className="border p-2 w-full"
                    placeholder="URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <button
                    onClick={addBookmark}
                    className="bg-black text-white px-4"
                >
                    Add
                </button>
            </div>

            <ul className="space-y-3">
                {bookmarks.map((bookmark) => (
                    <li
                        key={bookmark.id}
                        className="flex justify-between border p-3 rounded"
                    >
                        <a
                            href={bookmark.url}
                            target="_blank"
                            className="text-blue-600"
                        >
                            {bookmark.title}
                        </a>
                        <button
                            onClick={() => deleteBookmark(bookmark.id)}
                            className="text-red-500"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
