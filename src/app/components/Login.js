'use client'

import { supabase } from '../../lib/supabase'

export default function Login({ onClose, onBrowse }) {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-2xl p-8 mx-4 max-w-sm w-full text-center">
        <p className="text-6xl mb-4">🐱</p>
        <h2 className="text-2xl font-bold text-amber-800 mb-2">Welcome to CATlas!</h2>
        <p className="text-gray-500 text-sm mb-6">The neighborhood cat map. Log cats you find, see cats others have spotted, and build your CATalog.</p>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl p-3 font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm mb-3"
        >
          <img src="https://www.google.com/favicon.ico" width={20} height={20} alt="Google" />
          Sign in to add cats
        </button>
        <button
          onClick={onBrowse}
          className="w-full text-sm text-amber-700 font-bold border border-amber-200 rounded-xl p-3 hover:bg-amber-50 transition-all"
        >
          I just want to browse 🗺️
        </button>
      </div>
    </div>
  )
}