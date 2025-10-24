import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getLocationName } from '../../utils/locationUtils';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, onLocationSelect }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({ 
  coordinates, 
  onLocationChange, 
  isOpen, 
  onClose 
}) {
  const [position, setPosition] = useState(null);
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    if (coordinates && coordinates.length === 2 && coordinates[0] !== 0 && coordinates[1] !== 0) {
      // coordinates is [longitude, latitude], but position needs [latitude, longitude]
      setPosition([parseFloat(coordinates[1]), parseFloat(coordinates[0])]);
    } else {
      // Default to Colombo, Sri Lanka
      setPosition([6.9271, 79.8612]);
    }
  }, [coordinates]);

  const handleLocationSelect = (lat, lng) => {
    const newPosition = [lat, lng];
    setPosition(newPosition);
    
    // Get location name and update both coordinates and location name
    getLocationName(lat, lng).then(name => {
      setLocationName(name);
      onLocationChange(lat.toFixed(6), lng.toFixed(6), name);
    }).catch(() => {
      setLocationName(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      onLocationChange(lat.toFixed(6), lng.toFixed(6), `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    });
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationSelect(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please select manually on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Select Station Location
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Click on the map to select the station location
            </p>
            <button
              onClick={handleCurrentLocation}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Use Current Location</span>
            </button>
          </div>
          
          <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
            <MapContainer
              center={position || [6.9271, 79.8612]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker
                position={position}
                onLocationSelect={handleLocationSelect}
              />
            </MapContainer>
          </div>
          
          {position && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                <div>
                  <span className="font-medium text-gray-700">Latitude:</span>
                  <span className="ml-2 text-gray-900">{position[0].toFixed(6)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Longitude:</span>
                  <span className="ml-2 text-gray-900">{position[1].toFixed(6)}</span>
                </div>
              </div>
              {locationName && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Address:</span>
                  <span className="ml-2 text-gray-900">{locationName}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            disabled={!position}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}