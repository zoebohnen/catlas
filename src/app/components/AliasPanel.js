'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AliasPanel({ cat, onClose }) {
  const [aliases, setAliases] = useState([])
  const [loading, setLoading] = useState(true)
  const [aliasName, setAliasName] = useState('')
  const [aliasNotes, setAliasNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  useEffect(() => {
    fetchAliases()
  }, [cat.id])

  const fetchAliases = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('cat_aliases')
      .select('*')
      .eq('cat_id', cat.id)
      .order('created_at', { ascending: true })
    if (!error) setAliases(data)
    setLoading(false)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!aliasName.trim() || !user) return
    setSaving(true)

    const { error } = await supabase.from('cat_aliases').insert([{
      cat_id: cat.id,
      user_id: user.id,
      alias_name: aliasName.trim(),
      notes: aliasNotes.trim() || null,
    }])

    if (!error) {
      setAliasName('')
      setAliasNotes('')
      fetchAliases()
    } else {
      console.error('Error adding alias:', error)
    }
    setSaving(false)
  }

  const handleDelete = async (aliasId) => {
    const { error } = await supabase
      .from('cat_aliases')
      .delete()
      .eq('id', aliasId)
    if (!error) {
      setAliases(aliases.filter(a => a.id !== aliasId))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[2000]">
      <div className="bg-white rounded-t-2xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-amber-800">
              Also known as...
            </h2>
            <p className="text-sm text-gray-400">
              What do other people call <span className="font-bold text-gray-600">{cat.name}</span>?
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 text-2xl">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto mb-4">
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-4">Loading aliases...</p>
          ) : aliases.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">🐱</p>
              <p className="text-gray-400 text-sm">
                No aliases yet. Be the first to share what you call this cat.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {aliases.map((alias) => (
                <div key={alias.id} className="bg-amber-50 rounded-xl p-3 flex justify-between items-start">
                  <div>
                    <p className="font-bold text-amber-800">&ldquo;{alias.alias_name}&rdquo;</p>
                    {alias.notes && (
                      <p className="text-sm text-gray-500 mt-1">{alias.notes}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-1">
                      {new Date(alias.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  </div>
                  {user && alias.user_id === user.id && (
                    <button
                      onClick={() => handleDelete(alias.id)}
                      className="text-xs text-red-400 hover:text-red-600 ml-2"
                    >
                      remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {user ? (
          <form onSubmit={handleAdd} className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-2">Add your name for this cat</p>
            <input
              type="text"
              value={aliasName}
              onChange={(e) => setAliasName(e.target.value)}
              placeholder="What do you call this cat?"
              className="w-full border border-gray-300 rounded-lg p-2 mb-2 text-sm"
              required
            />
            <textarea
              value={aliasNotes}
              onChange={(e) => setAliasNotes(e.target.value)}
              placeholder="Any notes? (optional)"
              className="w-full border border-gray-300 rounded-lg p-2 h-16 text-sm mb-2"
            />
            <button
              type="submit"
              disabled={saving || !aliasName.trim()}
              className="w-full bg-amber-800 text-white rounded-lg p-2 font-bold text-sm disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Alias'}
            </button>
          </form>
        ) : (
          <div className="border-t border-gray-100 pt-4 text-center">
            <p className="text-sm text-gray-400">Sign in to add your own alias for this cat.</p>
          </div>
        )}
      </div>
    </div>
  )
}
