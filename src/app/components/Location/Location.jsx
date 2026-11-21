import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import didarha from '../../didarha.json';

// Passed to each Marker explicitly: patching L.Icon.Default doesn't reach the
// Leaflet instance react-leaflet uses, so the default icon 404s.
const markerIcon = L.icon({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
})

export default function MapClient({ locations, zoom, fitAll = false }) {
  const locationList = Array.isArray(locations) ? locations : [locations || didarha.THIRTEENTH.location];
  const center = locationList[0]?.position || [0, 0];
  const mapZoom = zoom === undefined ? 15 : zoom;
  // Plain [[south, west], [north, east]] so it works whichever Leaflet instance reads it.
  const lats = locationList.map((loc) => loc.position[0]);
  const lngs = locationList.map((loc) => loc.position[1]);
  const bounds = fitAll && locationList.length > 1
    ? [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ]
    : undefined;

  return (
    <MapContainer
      {...(bounds
        ? { bounds, boundsOptions: { padding: [40, 40] } }
        : { center, zoom: mapZoom })}
      scrollWheelZoom={true}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {locationList.map((loc, index) => (
        <Marker key={index} position={loc.position} icon={markerIcon}>
          <Popup>
            {`${loc.pre_marker} ${loc.name}`}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
