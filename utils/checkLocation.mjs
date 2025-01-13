// Haversine Formula to calculate distance between two coordinates
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180; // Convert latitude to radians
  const φ2 = (lat2 * Math.PI) / 180; // Convert latitude to radians
  const Δφ = ((lat2 - lat1) * Math.PI) / 180; // Difference in latitudes
  const Δλ = ((lon2 - lon1) * Math.PI) / 180; // Difference in longitudes

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const checkLocation = (latitude, longitude) => {
  // Office coordinates from environment variables
  const officeLatitude = parseFloat(process.env.LATITUDE);
  const officeLongitude = parseFloat(process.env.LONGITUDE);

  // Calculate the distance from the office
  const distance = haversineDistance(
    officeLatitude,
    officeLongitude,
    latitude,
    longitude
  );

  return distance;
};
