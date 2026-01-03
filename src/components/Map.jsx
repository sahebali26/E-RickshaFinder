import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import React, { useEffect } from 'react'
import L from 'leaflet'

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center);
        }
    }, [center, map]);
    return null;
}

export default function MapComponent({ center, vehicles, selectedVehicle, onVehicleSelect }) {
    // Custom icon for e-rickshaw
    const rickshawIcon = new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png', // Temporary placeholder icon
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });

    return (
        <MapContainer 
            center={center} 
            zoom={15} 
            scrollWheelZoom={true} 
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <RecenterMap center={center} />

            {vehicles.map(vehicle => (
                <Marker
                    key={vehicle.id}
                    position={[vehicle.lat, vehicle.lng]}
                    icon={rickshawIcon}
                    eventHandlers={{
                        click: () => onVehicleSelect(vehicle),
                    }}
                >
                </Marker>
            ))}

            {/* User location marker (mocked as center) */}
            <Marker position={center}>
                <Popup>You are here</Popup>
            </Marker>

        </MapContainer>
    )
}
