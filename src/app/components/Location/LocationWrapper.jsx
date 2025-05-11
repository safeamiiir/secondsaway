'use client'

import { useState, useEffect } from 'react'

export default function MapWrapper({ locations, zoom }) {
  const [ClientOnly, setClientOnly] = useState(null)

  useEffect(() => {
    // Import and set the component on the client side
    setClientOnly(() => require('./Location').default)
  }, [])

  if (!ClientOnly) {
    return <div>Loading map...</div>
  }

  return <ClientOnly locations={locations} zoom={zoom} />
}