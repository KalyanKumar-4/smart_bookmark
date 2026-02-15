"use client"

import { supabase } from "./lib/supabase"
import { useEffect, useState } from "react"
import Dashboard from "./dashboard"

export default function Home() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center">
        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "google",
            })
          }
          className="px-6 py-3 bg-black text-white rounded-lg"
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  return <Dashboard session={session} />
}
