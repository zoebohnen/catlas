'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import AddCatForm from './components/AddCatForm'
import CATalog from './components/CATalog'
import Login from './components/Login'
import { supabase } from '../lib/supabase'

const Map = dynamic(() => import('./components/Map'), { ssr: false })

export default function Home() {
  const [showAddCat, setShowAddCat] = useState(false)
  const [showCatalog, setShowCatalog] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [focusedCatId, setFocusedCatId] = useState(null)
  const [refresh, setRefresh] = useState(0)
  const [user, setUser] = useState(null)
const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setHasCheckedAuth(true)
      if (!session?.user) setShowLogin(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAddCat = () => {
    if (user) {
      setShowAddCat(true)
    } else {
      setShowLogin(true)
    }
  }

  return (
    <main className="flex flex-col h-screen">
      <div className="bg-amber-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐱</span>
          <h1 className="text-xl font-bold">CATlas</h1>
        </div>
        {user ? (
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-xs text-amber-200 hover:text-white"
          >
            Sign out
          </button>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="text-xs bg-white text-amber-800 font-bold px-3 py-1 rounded-full hover:bg-amber-50"
          >
            Sign in
          </button>
        )}
      </div>
      <div className="flex-1">
        <Map
          refresh={refresh}
          onCatClick={(id) => { setFocusedCatId(id); setShowCatalog(true) }}
        />
      </div>
      {showLogin && <Login onClose={() => setShowLogin(false)} onBrowse={() => setShowLogin(false)} />}
      {showAddCat && <AddCatForm onClose={() => { setShowAddCat(false); setRefresh(r => r + 1) }} />}
      {showCatalog && <CATalog onClose={() => { setShowCatalog(false); setFocusedCatId(null) }} focusedCatId={focusedCatId} />}
      <div className="bg-amber-800 border-t border-amber-900 p-4 flex justify-around relative z-50">
        <button className="flex flex-col items-center justify-center bg-white text-amber-800 rounded-xl w-24 h-16 font-bold shadow-md active:opacity-60 hover:bg-amber-50 transition-all">
          <span className="text-2xl">🗺️</span>
          <span className="text-xs font-bold">Map</span>
        </button>
        <button
          onClick={handleAddCat}
          className="flex flex-col items-center justify-center bg-white text-amber-800 rounded-xl w-24 h-16 font-bold shadow-md active:opacity-60 hover:bg-amber-50 transition-all">
          <span className="text-2xl">🐾</span>
          <span className="text-xs font-bold">Add Cat</span>
        </button>
        <button
          onClick={() => setShowCatalog(true)}
          className="flex flex-col items-center justify-center bg-white text-amber-800 rounded-xl w-24 h-16 font-bold shadow-md active:opacity-60 hover:bg-amber-50 transition-all">
          <span className="text-2xl">📖</span>
          <span className="text-xs font-bold">My CATalog</span>
        </button>
      </div>
    </main>
  )
}