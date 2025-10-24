// Example of how the enhanced station data will look with coordinates array format

// Backend API Format (MongoDB compatible):
const stationDataFormat = {
  "id": "STN001",
  "name": "Central Mall EV Station", 
  "location": "Central Mall, No. 2, Sir Chittampalam A. Gardiner Mawatha, Colombo 00200, Sri Lanka",
  "coordinates": [79.861244, 6.927079], // [longitude, latitude] - MongoDB standard
  "type": "DC",
  "availableSlots": 8,
  "isActive": true
};

// Frontend Form Data (sent to backend):
const frontendFormData = {
  name: "Central Mall EV Station",
  location: "Central Mall, Colombo 3", 
  coordinates: [79.861244, 6.927079], // [longitude, latitude]
  type: "DC",
  availableSlots: 8,
  isActive: true
};

// Example of how to display station on Leaflet map:
const displayStationOnMap = (stationData) => {
  const { coordinates, name, location } = stationData;
  const [longitude, latitude] = coordinates; // MongoDB: [lng, lat]
  
  const mapMarker = {
    position: [latitude, longitude], // Leaflet: [lat, lng]
    title: name,
    description: location,
    popup: `
      <div>
        <h3>${name}</h3>
        <p>${location}</p>
        <p>Type: ${stationData.type}</p>
        <p>Available Slots: ${stationData.availableSlots}</p>
        <p>Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
      </div>
    `
  };
  
  return mapMarker;
};

// Example of calculating distance between stations:
const calculateDistance = (station1, station2) => {
  const R = 6371; // Earth's radius in kilometers
  
  const [lng1, lat1] = station1.coordinates;
  const [lng2, lat2] = station2.coordinates;
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * 
    Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance; // Distance in kilometers
};

// Example of finding nearest stations:
const findNearestStations = (userCoordinates, stations, maxResults = 5) => {
  const userStation = { coordinates: userCoordinates };
  
  return stations
    .map(station => ({
      ...station,
      distance: calculateDistance(userStation, station)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults);
};

// MongoDB Geospatial Query Examples (for backend reference):
const mongoQueries = {
  // Find stations within 5km radius
  findNearby: {
    "coordinates": {
      "$near": {
        "$geometry": {
          "type": "Point",
          "coordinates": [79.861244, 6.927079] // [lng, lat]
        },
        "$maxDistance": 5000 // meters
      }
    }
  },
  
  // Find stations within a polygon area
  findInArea: {
    "coordinates": {
      "$geoWithin": {
        "$geometry": {
          "type": "Polygon",
          "coordinates": [[[lng1, lat1], [lng2, lat2], [lng3, lat3], [lng1, lat1]]]
        }
      }
    }
  }
};

export {
  stationDataFormat,
  frontendFormData,
  displayStationOnMap,
  calculateDistance,
  findNearestStations,
  mongoQueries
};