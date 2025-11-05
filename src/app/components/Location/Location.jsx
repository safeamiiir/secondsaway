import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import didarha from '../../didarha.json';

// Fix the icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function MapClient({ locations, zoom }) {
  const locationList = Array.isArray(locations) ? locations : [locations || didarha.EIGHTH.location];
  const center = locationList[0]?.position || [0, 0];
  const mapZoom = zoom === undefined ? 15 : zoom;

  return (
    <MapContainer 
      center={center} 
      zoom={mapZoom}
      scrollWheelZoom={true}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {locationList.map((loc, index) => (
        <Marker key={index} position={loc.position}>
          <Popup>
            {`${loc.pre_marker} ${loc.name}`}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
