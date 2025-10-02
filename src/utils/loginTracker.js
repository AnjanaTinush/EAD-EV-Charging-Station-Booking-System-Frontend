// Utility function to track login attempts
export const trackLogin = (status = 'Success', username = null) => {
  const currentUser = username || (JSON.parse(localStorage.getItem('user') || '{}').username) || 'Unknown';

  const newLogin = {
    id: Date.now().toString(),
    loginTime: new Date().toISOString(),
    ipAddress: generateRandomIP(),
    device: detectDevice(),
    location: getRandomLocation(),
    status: status,
    username: currentUser
  };

  const existingHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
  const updatedHistory = [newLogin, ...existingHistory].slice(0, 100); // Keep last 100 entries

  localStorage.setItem('loginHistory', JSON.stringify(updatedHistory));

  return newLogin;
};

const generateRandomIP = () => {
  return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

const detectDevice = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Mac')) return 'Mac';
  if (userAgent.includes('Windows')) return 'Windows PC';
  return 'Unknown Device';
};

const getRandomLocation = () => {
  const locations = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Berlin', 'Toronto', 'Mumbai'];
  return locations[Math.floor(Math.random() * locations.length)];
};