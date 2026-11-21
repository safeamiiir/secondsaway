"use client"

import { useEffect, useState } from 'react'
import didarha from '../../didarha.json'
import { isOver } from '../Countdown'
import LocationWrapper from './LocationWrapper'

// Every distinct place we've met, one marker each.
const allLocations = () => {
  const seen = new Set()
  return Object.values(didarha)
    .map((didar) => didar.location)
    .filter((loc) => {
      if (!loc?.position) return false
      const key = loc.position.join(',')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export default function HomeMap() {
  // Decided on the client so the server and the browser agree on first render.
  const [over, setOver] = useState(false)

  useEffect(() => {
    setOver(isOver())
  }, [])

  if (over) {
    return <LocationWrapper locations={allLocations()} fitAll />
  }

  return <LocationWrapper locations={[didarha.THIRTEENTH.location]} zoom={15} />
}
