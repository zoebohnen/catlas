'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap, Marker, Popup, CircleMarker } from 'react-leaflet'
import { supabase } from '../../lib/supabase'
import 'leaflet/dist/leaflet.css'

function LocationMarker() {
  const map = useMap()
  const [position, setPosition] = useState(null)

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 16 })
    map.on('locationfound', (e) => {
      setPosition(e.latlng)
      map.setView(e.latlng, 16)
    })
  }, [map])

  return position ? (
    <CircleMarker
      center={position}
      radius={10}
      fillColor="#4A90E2"
      color="#fff"
      weight={2}
      fillOpacity={0.9}
    />
  ) : null
}

function CatMarkers({ cats, onCatClick, aliasCounts }) {
  const L = require('leaflet')
  const [hoveredId, setHoveredId] = useState(null)

  return cats.map((cat) => {
    const isHovered = hoveredId === cat.id
    const icon = new L.DivIcon({
      html: `<div style="font-size: ${isHovered ? '45px' : '30px'}; line-height: 1; transition: font-size 0.15s ease; filter: ${isHovered ? 'drop-shadow(0 0 8px rgba(0,0,0,0.4))' : 'none'};">🐱</div>`,
      className: '',
      iconSize: isHovered ? [50, 50] : [35, 35],
      iconAnchor: isHovered ? [25, 25] : [17, 17],
    })

    return (
      <Marker
        key={cat.id}
        position={[cat.latitude, cat.longitude]}
        icon={icon}
        eventHandlers={{
          mouseover: () => setHoveredId(cat.id),
          mouseout: () => setHoveredId(null),
        }}
      >
        <Popup>
          <div>
            <button
              onClick={() => onCatClick(cat.id)}
              style={{ fontWeight: 'bold', color: '#92400e', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontSize: '14px' }}
            >
              🐱 {cat.name}
            </button>
            {cat.description && <p style={{ margin: '4px 0 0', fontSize: '13px' }}>{cat.description}</p>}
            {cat.friendly && <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Friendly cat</p>}
            {aliasCounts[cat.id] > 0 && (
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#92400e' }}>
                {aliasCounts[cat.id]} alias{aliasCounts[cat.id] !== 1 ? 'es' : ''}
              </p>
            )}
          </div>
        </Popup>
      </Marker>
    )
  })
}

export default function Map({ refresh, onCatClick }) {
  const [cats, setCats] = useState([])
  const [aliasCounts, setAliasCounts] = useState({})

  useEffect(() => {
    const fetchCats = async () => {
      const { data, error } = await supabase
        .from('cats')
        .select('*')
        .not('latitude', 'is', null)
      if (!error) setCats(data)
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
  }, [refresh])

  return (
    <MapContainer
      center={[40.7128, -74.006]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
      <CatMarkers cats={cats} onCatClick={onCatClick} aliasCounts={aliasCounts} />
    </MapContainer>
  )
}