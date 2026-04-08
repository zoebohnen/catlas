'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AddCatForm({ onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [friendly, setFriendly] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [location, setLocation] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error('Location error:', err)
    )
  }, [])

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    let photo_url = null

    if (photo) {
      const fileExt = photo.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('cat-photos')
        .upload(fileName, photo)

      if (uploadError) {
        console.error('Photo upload error:', JSON.stringify(uploadError))
      } else {
        const { data } = supabase.storage
          .from('cat-photos')
          .getPublicUrl(fileName)
        photo_url = data.publicUrl
      }
    }

    const { error } = await supabase.from('cats').insert([{
      name,
      description,
      friendly,
      latitude: location?.lat,
      longitude: location?.lng,
      photo_url,
    }])

    if (error) {
      console.error('Error saving cat:', JSON.stringify(error))
    } else {
      setSuccess(true)
      setTimeout(() => onClose(), 1500)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[1000]">
      <div className="bg-white rounded-t-2xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-amber-800">🐾 Add a Cat!</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl">&times;</button>
        </div>
        {success ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">🐱</p>
            <p className="text-green-600 font-bold text-lg">Cat saved!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cat's Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Callie, Cinderblock..."
                className="w-full border border-gray-300 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="w-full text-sm text-gray-500"
              />
              {photoPreview && (
                <img src={photoPreview} alt="Preview" className="mt-2 rounded-lg h-32 w-full object-cover" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this cat like? Friendly? Loves scratches?"
                className="w-full border border-gray-300 rounded-lg p-2 h-24"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="friendly"
                checked={friendly}
                onChange={(e) => setFriendly(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="friendly" className="text-sm text-gray-700">This cat is friendly 😊</label>
            </div>
            {location ? (
              <p className="text-xs text-green-600">📍 Location captured!</p>
            ) : (
              <p className="text-xs text-gray-400">📍 Grabbing your location...</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-800 text-white rounded-lg p-3 font-bold"
            >
              {loading ? 'Saving...' : 'Save Cat 🐱'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}