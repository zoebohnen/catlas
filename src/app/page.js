'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import AddCatForm from './components/AddCatForm'
import CATalog from './components/CATalog'

const Map = dynamic(() => import('./components/Map'), { ssr: false })

export default function Home() {
  const [showAddCat, setShowAddCat] = useState(false)
  const [showCatalog, setShowCatalog] = useState(false)
  const [focusedCatId, setFocusedCatId] = useState(null)
  const [refresh, setRefresh] = useState(0)

  return (
    <main className="flex flex-col h-screen">
      <div className="bg-amber-800 text-white p-4 flex items-center gap-2">
        <span className="text-2xl">🐱</span>
        <h1 className="text-xl font-bold">CATlas</h1>
      </div>
      <div className="flex-1">
        <Map
          refresh={refresh}
          onCatClick={(id) => { setFocusedCatId(id); setShowCatalog(true) }}
        />
      </div>
      {showAddCat && <AddCatForm onClose={() => { setShowAddCat(false); setRefresh(r => r + 1) }} />}
      {showCatalog && <CATalog onClose={() => { setShowCatalog(false); setFocusedCatId(null) }} focusedCatId={focusedCatId} />}
      <div className="bg-amber-800 border-t border-amber-900 p-4 flex justify-around relative z-50">
        <button className="flex flex-col items-center justify-center bg-white text-amber-800 rounded-xl w-24 h-16 font-bold shadow-md active:opacity-60 hover:bg-amber-50 transition-all">
          <span className="text-2xl">🗺️</span>
          <span className="text-xs font-bold">Map</span>
        </button>
        <button
          onClick={() => setShowAddCat(true)}
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