'use client'

import { useState, useEffect } from 'react'

export default function MapWrapper({ location }) {
  const [ClientOnly, setClientOnly] = useState(null)

  useEffect(() => {
    // Import and set the component on the client side
    setClientOnly(() => require('./Location').default)
  }, [])

  if (!ClientOnly) {
    return <div>Loading map...</div>
  }

  return <ClientOnly location={location} />
}