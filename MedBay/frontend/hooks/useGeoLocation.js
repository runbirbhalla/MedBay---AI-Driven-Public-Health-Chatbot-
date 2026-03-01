'use client';

import { useState, useEffect } from 'react';

export const useGeoLocation = (requestOnMount = true) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt');

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    // Check permission status
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(permission.state);
        
        permission.addEventListener('change', () => {
          setPermissionStatus(permission.state);
        });
      } catch (err) {
        console.error('Error checking geolocation permission:', err);
      }
    }

    const success = (position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      setLocation({ lat, lng, accuracy: position.coords.accuracy });
      setLoading(false);
      setPermissionStatus('granted');
    };

    const errorHandler = (err) => {
      setLoading(false);
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setError('Location access denied. Please enable location access in your browser settings.');
          setPermissionStatus('denied');
          break;
        case err.POSITION_UNAVAILABLE:
          setError('Location information is unavailable.');
          break;
        case err.TIMEOUT:
          setError('Location request timed out.');
          break;
        default:
          setError('An unknown error occurred while retrieving location.');
          break;
      }
    };

    navigator.geolocation.getCurrentPosition(success, errorHandler, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    });
  };

  useEffect(() => {
    if (requestOnMount) {
      requestLocation();
    }
  }, [requestOnMount]);

  return { 
    location, 
    error, 
    loading, 
    permissionStatus, 
    requestLocation 
  };
};
