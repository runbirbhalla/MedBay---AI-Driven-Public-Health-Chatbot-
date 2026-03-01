'use client';

import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import Sidebar from '@/components/sidebar';

const containerStyle = {
  width: '100%',
  height: 'calc(100vh - 140px)'
};

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_MAPS_JAVASCRIPT_API_KEY || process.env.MAPS_JAVASCRIPT_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || process.env.GOOGLE_PLACES_API_KEY;

export default function MapsPage() {
  console.log('Google Maps API Key:', GOOGLE_MAPS_API_KEY ? 'Found' : 'Missing');
  const { location, error: locationError, loading, permissionStatus, requestLocation } = useGeoLocation();
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);

  useEffect(() => {
    if (location) {
      setMapCenter(location);
      searchNearbyHospitals(location);
    }
  }, [location]);

  const searchNearbyHospitals = async (location) => {
    setHospitalsLoading(true);
    try {
      const { lat, lng } = location;
      const response = await fetch(
        `/api/places/nearby?lat=${lat}&lng=${lng}&type=hospital&radius=5000`
      );
      const data = await response.json();
      setHospitals(data.results || []);
    } catch (error) {
      console.error('Error fetching nearby hospitals:', error);
    } finally {
      setHospitalsLoading(false);
    }
  };

  // Enhanced Error Component
  const ErrorDisplay = ({ title, message, action, children }) => (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-[#0a0f1d]">
      <Sidebar />
      <div className="text-center text-white p-8 max-w-md">
        <div className="bg-red-500/20 p-6 rounded-full w-fit mx-auto mb-6">
          <svg className="h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">{title}</h2>
        <p className="text-gray-300 mb-6 text-lg">{message}</p>
        {action}
        {children}
      </div>
    </div>
  );

  // Enhanced Loading Component
  const LoadingDisplay = () => (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-[#0a0f1d]">
      <div className="text-center text-white">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-green-500 mb-6 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-xl font-semibold mb-2">Finding Your Location</p>
        <p className="text-gray-400">Please allow location access when prompted</p>
        <div className="mt-4 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <ErrorDisplay
        title="Maps API Key Missing"
        message="Google Maps API key is not configured. Please check your environment variables."
        action={
          <button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 mt-4">
            Check Configuration
          </button>
        }
      >
        <div className="bg-gray-800/50 p-4 rounded-xl text-left text-sm mt-6 border border-gray-700/50">
          <p className="text-gray-400 mb-2 font-semibold">Required environment variable:</p>
          <code className="text-green-400 bg-gray-900/50 px-2 py-1 rounded">NEXT_PUBLIC_MAPS_JAVASCRIPT_API_KEY</code>
        </div>
      </ErrorDisplay>
    );
  }

  if (locationError && permissionStatus === 'denied') {
    return (
      <ErrorDisplay
        title="Location Access Required"
        message="We need your location to find hospitals near you. Please enable location access to continue."
        action={
          <button
            onClick={requestLocation}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105"
          >
            Enable Location Access
          </button>
        }
      >
        <div className="mt-6 text-sm text-gray-400 bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
          <p className="font-semibold mb-2">How to enable location:</p>
          <p>• Look for the location icon 📍 in your address bar</p>
          <p>• Click "Allow" when prompted</p>
          <p>• Or enable location in your browser settings</p>
        </div>
      </ErrorDisplay>
    );
  }

  if (loading || (!location && !locationError)) {
    return <LoadingDisplay />;
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 to-[#0a0f1d] flex flex-col">
      {/* Enhanced Header */}
      <Sidebar/>
      <div className="flex-1 ml-18 h-full flex flex-col">
        {/* Premium Header Section */}
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-green-400 to-emerald-300 bg-clip-text text-transparent">
                🏥 Hospital Locator
              </h1>
              <p className="text-gray-400 mt-2 flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Finding the best healthcare facilities near you
              </p>
            </div>
            
            {hospitalsLoading && (
              <div className="flex items-center text-green-400 bg-gray-800/50 px-4 py-2 rounded-xl border border-green-500/30">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-500 mr-3"></div>
                <span className="text-sm font-medium">Discovering hospitals...</span>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mt-6 max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/30 p-4 rounded-xl text-center border border-gray-700/50">
              <div className="text-2xl font-bold text-green-400">{hospitals.length}</div>
              <div className="text-xs text-gray-400">Hospitals Found</div>
            </div>
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/30 p-4 rounded-xl text-center border border-gray-700/50">
              <div className="text-2xl font-bold text-blue-400">24/7</div>
              <div className="text-xs text-gray-400">Emergency Ready</div>
            </div>
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/30 p-4 rounded-xl text-center border border-gray-700/50">
              <div className="text-2xl font-bold text-purple-400">{hospitals.filter(h => h.opening_hours?.open_now).length}</div>
              <div className="text-xs text-gray-400">Open Now</div>
            </div>
          </div>
        </div>

        {/* Main content with enhanced layout */}
        <div className="flex-1 flex gap-6 px-8 pb-6">
          {/* Enhanced Map Container */}
          <div className={`bg-gradient-to-br from-gray-800/50 to-gray-900/30 rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50 transition-all duration-500 ${
            selectedHospital ? 'w-3/4' : 'w-full'
          }`}>
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={14}
                options={{
                  styles: [
                    {
                      featureType: 'all',
                      elementType: 'geometry',
                      stylers: [{ color: '#1a202c' }]
                    },
                    {
                      featureType: 'all',
                      elementType: 'labels.text.stroke',
                      stylers: [{ color: '#1a202c' }]
                    },
                    {
                      featureType: 'all',
                      elementType: 'labels.text.fill',
                      stylers: [{ color: '#8a94a6' }]
                    },
                    {
                      featureType: 'poi',
                      elementType: 'labels',
                      stylers: [{ visibility: 'off' }]
                    }
                  ]
                }}
              >
                {/* Enhanced User Marker */}
                <Marker
                  position={mapCenter}
                  icon={{
                    url: 'data:image/svg+xml;base64,' + btoa(`
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="15" fill="#10B981" fill-opacity="0.2" stroke="#10B981" stroke-width="2"/>
                        <circle cx="20" cy="20" r="6" fill="#10B981"/>
                        <circle cx="20" cy="20" r="2" fill="white"/>
                      </svg>
                    `),
                    scaledSize: { width: 40, height: 40 }
                  }}
                />

                {/* Enhanced Hospital Markers */}
                {hospitals.map((hospital) => (
                  <Marker
                    key={hospital.place_id}
                    position={{
                      lat: hospital.geometry.location.lat,
                      lng: hospital.geometry.location.lng
                    }}
                    onClick={() => setSelectedHospital(hospital)}
                    icon={{
                      url: 'data:image/svg+xml;base64,' + btoa(`
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="32" height="32" rx="16" fill="${selectedHospital?.place_id === hospital.place_id ? '#EF4444' : '#3B82F6'}" fill-opacity="0.9"/>
                          <path d="M16 8L8 12V22L16 26L24 22V12L16 8Z" fill="white"/>
                          <path d="M14 16H18V20H14V16Z" fill="${selectedHospital?.place_id === hospital.place_id ? '#EF4444' : '#3B82F6'}"/>
                          <path d="M12 14H20V18H12V14Z" fill="white" fill-opacity="0.8"/>
                        </svg>
                      `),
                      scaledSize: { width: 32, height: 32 }
                    }}
                  />
                ))}
              </GoogleMap>
            </LoadScript>
          </div>

          {/* Enhanced Hospital Details Panel */}
          {selectedHospital && (
            <div className="w-1/4 bg-gradient-to-br from-gray-800/70 to-gray-900/40 rounded-2xl shadow-2xl p-6 overflow-y-auto border border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">🏥 Hospital Details</h2>
                <button
                  onClick={() => setSelectedHospital(null)}
                  className="text-gray-400 hover:text-white transition-all duration-300 p-2 hover:bg-gray-700/50 rounded-lg"
                  aria-label="Close details"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Enhanced Hospital Header */}
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4 rounded-xl border border-green-500/20">
                  <h3 className="text-xl font-bold text-white mb-2">{selectedHospital.name}</h3>
                  <p className="text-gray-300 flex items-start gap-2 text-sm">
                    <span className="text-green-400">📍</span>
                    {selectedHospital.vicinity}
                  </p>
                </div>

                {/* Enhanced Rating */}
                {selectedHospital.rating && (
                  <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(selectedHospital.rating)
                                ? 'text-yellow-400'
                                : 'text-gray-600'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-white font-bold text-lg">{selectedHospital.rating}</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Based on {selectedHospital.user_ratings_total || 0} reviews
                    </p>
                  </div>
                )}

                {/* Enhanced Status */}
                <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/30">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span className="text-green-400">📊</span>
                    Current Status
                  </h4>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedHospital.business_status === 'OPERATIONAL' 
                        ? 'bg-green-500 animate-pulse' 
                        : 'bg-gray-500'
                    }`}></div>
                    <span className="text-gray-300 capitalize font-medium">
                      {selectedHospital.business_status?.toLowerCase().replace('_', ' ') || 'Unknown'}
                    </span>
                  </div>
                  {selectedHospital.opening_hours && (
                    <p className={`text-sm font-medium ${
                      selectedHospital.opening_hours.open_now ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedHospital.opening_hours.open_now ? '✅ Open now' : '❌ Currently closed'}
                    </p>
                  )}
                </div>

                {/* Enhanced Action Buttons */}
                <div className="space-y-3">
                  <a
                    href={`https://www.google.com/maps/place/?q=place_id:${selectedHospital.place_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
                  >
                    <span>🗺️</span>
                    View on Maps
                  </a>
                  
                  <button
                    onClick={() => {
                      const lat = selectedHospital.geometry.location.lat;
                      const lng = selectedHospital.geometry.location.lng;
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                      window.open(url, '_blank');
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
                  >
                    <span>🚗</span>
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}