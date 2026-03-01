// frontend/components/HospitalCard.js
'use client';
import { MapPin, Star } from 'lucide-react';

export default function HospitalCard({ hospital }) {
  const openInGoogleMaps = () => {
    const query = encodeURIComponent(`${hospital.name}, ${hospital.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="bg-card border border-border text-white rounded-lg p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <h3 className="font-bold text-card-foreground">{hospital.name}</h3>
        <p className="text-sm text-muted-foreground mt-1 flex items-start gap-2">
          <MapPin size={16} className="mt-0.5 flex-shrink-0" />
          <span>{hospital.address}</span>
        </p>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Star size={16} className="text-yellow-500 fill-current" />
          <span>{hospital.rating} ({hospital.total_ratings} ratings)</span>
        </div>
        <button
          onClick={openInGoogleMaps}
          className="text-sm text-primary hover:underline"
        >
          View on Map
        </button>
      </div>
    </div>
  );
}