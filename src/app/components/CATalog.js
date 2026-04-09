'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AliasPanel from './AliasPanel'

function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Are you sure?</h3>
        <p className="text-gray-500 text-sm mb-6">This cannot be undone. This cat will be permanently deleted from your CATalog.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-gray-300 text-gray-600 rounded-xl py-2 font-bold hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white rounded-xl py-2 font-bold hover:bg-red-600 transition-all">Delete</button>
        </div>
      </div>
    </div>
  )
}

function EditCatForm({ cat, onClose, onSave }) {
  const [description, setDescription] = useState(cat.description || '')
  const [friendly, setFriendly] = useState(cat.friendly || false)
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(cat.photo_url || null)
  const [loading, setLoading] = useState(false)

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setLoading(true)
    let photo_url = cat.photo_url

    if (photo) {
      const fileExt = photo.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('cat-photos')
        .upload(fileName, photo)

      if (!uploadError) {
        const { data } = supabase.storage.from('cat-photos').getPublicUrl(fileName)
        photo_url = data.publicUrl
      }
    }

    const { error } = await supabase
      .from('cats')
      .update({ description, friendly, photo_url })
      .eq('id', cat.id)

    if (!error) onSave({ ...cat, description, friendly, photo_url })
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[2000]">
      <div className="bg-white rounded-t-2xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-amber-800">Edit {cat.name}</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl">&times;</button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="mb-2 rounded-lg h-32 w-full object-cover" />
            )}
            <input type="file" accept="image/*" onChange={handlePhoto} className="w-full text-sm text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 h-24"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-friendly"
              checked={friendly}
              onChange={(e) => setFriendly(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="edit-friendly" className="text-sm text-gray-700">This cat is friendly</label>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-amber-800 text-white rounded-lg p-3 font-bold"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CatCard({ cat, onDelete, highlighted, aliasCount }) {
  const [confirming, setConfirming] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showAliases, setShowAliases] = useState(false)
  const [currentCat, setCurrentCat] = useState(cat)

  const date = new Date(currentCat.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <>
      {confirming && (
        <DeleteConfirm
          onConfirm={() => { setConfirming(false); onDelete(currentCat.id) }}
          onCancel={() => setConfirming(false)}
        />
      )}
      {editing && (
        <EditCatForm
          cat={currentCat}
          onClose={() => setEditing(false)}
          onSave={(updated) => setCurrentCat(updated)}
        />
      )}
      {showAliases && (
        <AliasPanel
          cat={currentCat}
          onClose={() => setShowAliases(false)}
        />
      )}
      <div
        className={`bg-white rounded-2xl shadow-md overflow-hidden flex flex-col ${highlighted ? 'ring-4 ring-amber-400' : ''}`}
        style={{ height: '460px' }}
      >
        <div className="bg-amber-100 flex-shrink-0 flex items-center justify-center" style={{ height: '220px' }}>
          {currentCat.photo_url ? (
            <img src={currentCat.photo_url} alt={currentCat.name} className="w-full h-full object-cover" />
          ) : (
            <span style={{ fontSize: 80 }}>🐱</span>
          )}
        </div>
        <div className="p-3 flex flex-col" style={{ height: '160px', overflow: 'hidden' }}>
          <h2 className="text-xl font-bold text-amber-800">{currentCat.name}</h2>
          <p className="text-xs text-gray-400 mt-1">Spotted on {date}</p>
          {currentCat.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{currentCat.description}</p>
          )}
          {currentCat.friendly && (
            <span className="inline-block mt-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full w-fit">Friendly</span>
          )}
          <div className="flex gap-2 mt-auto pt-2">
            <button
              onClick={() => setShowAliases(true)}
              className="text-xs text-amber-600 font-bold border border-amber-300 rounded-full px-3 py-1 hover:bg-amber-50 transition-all"
            >
              Aliases{aliasCount > 0 ? ` (${aliasCount})` : ''} →
            </button>
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-blue-500 font-bold border border-blue-300 rounded-full px-3 py-1 hover:bg-blue-50 transition-all">
              Edit
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="text-xs text-red-500 font-bold border border-red-300 rounded-full px-3 py-1 hover:bg-red-50 transition-all">
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function CATalog({ onClose, focusedCatId }) {
  const [cats, setCats] = useState([])
  const [aliasCounts, setAliasCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    const fetchCats = async () => {
      const { data, error } = await supabase
        .from('cats')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error) setCats(data)
      setLoading(false)
    }

    const fetchAliasCounts = async () => {
      const { data, error } = await supabase
        .from('cat_aliases')
        .select('cat_id')
      if (!error && data) {
        const counts = {}
        data.forEach(row => {
          counts[row.cat_id] = (counts[row.cat_id] || 0) + 1
        })
        setAliasCounts(counts)
      }
    }

    fetchCats()
    fetchAliasCounts()
  }, [])

  useEffect(() => {
    if (focusedCatId && !loading) {
      setTimeout(() => {
        const el = document.getElementById(`cat-${focusedCatId}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [focusedCatId, loading])

  const handleDelete = async (id) => {
    const { error } = await supabase.from('cats').delete().eq('id', id)
    if (!error) setCats(cats.filter(cat => cat.id !== id))
  }

  // Filter and sort
  const filtered = cats
    .filter(cat => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        cat.name.toLowerCase().includes(q) ||
        (cat.description && cat.description.toLowerCase().includes(q))
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'name':
          return a.name.localeCompare(b.name)
        case 'most-aliases':
          return (aliasCounts[b.id] || 0) - (aliasCounts[a.id] || 0)
        default:
          return 0
      }
    })

  return (
    <div className="fixed inset-0 bg-amber-50 z-[1000] flex flex-col">
      <div className="bg-amber-800 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">My CATalog</h1>
        <button onClick={onClose} className="text-white text-2xl">&times;</button>
      </div>

      {/* Search and sort bar */}
      <div className="bg-white border-b border-amber-100 px-4 py-3 flex gap-3 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cats..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-amber-400"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">A → Z</option>
          <option value="most-aliases">Most aliases</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-wrap gap-4">
        {loading ? (
          <p className="text-center text-gray-400 mt-8 w-full">Loading your cats...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 mt-8 w-full">
            {search ? 'No cats match your search.' : 'No cats yet — go find some!'}
          </p>
        ) : (
          filtered.map((cat) => (
            <div id={`cat-${cat.id}`} key={cat.id} style={{ width: 'calc(25% - 12px)' }}>
              <CatCard
                cat={cat}
                onDelete={handleDelete}
                highlighted={cat.id === focusedCatId}
                aliasCount={aliasCounts[cat.id] || 0}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
