'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import MapContainer with no SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

interface DistrictCaseData {
  district: string;
  total: number;
  registered: number;
  under_investigation: number;
  chargesheet: number;
  closed: number;
}

interface MapProps {
  casesByDistrict: DistrictCaseData[];
  statusFilter: string;
}

export default function NepalDistrictMap({ casesByDistrict, statusFilter }: MapProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load nepal geojson from public folder
    const loadGeoJson = async () => {
      try {
        const response = await fetch('/nepal-districts.geojson');
        const geoData = await response.json();
        setGeoData(geoData);
      } catch (error) {
        console.error('Failed to load Nepal GeoJSON:', error);
      }
    };
    loadGeoJson();
  }, []);

  // District name mapping to handle differences between GeoJSON and database
  // GeoJSON uses TARGET property with 77 districts
  const normalizeDistrictName = (name: string): string => {
    const normalized = name?.toUpperCase()?.trim();
    const mapping: Record<string, string> = {
      // Database name variations -> GeoJSON TARGET name
      'SINDHUPALCHOWK': 'SINDHUPALCHOK',
      'KAVREPALANCHOK': 'KABHREPALANCHOK',
      'KAVREPALANCHOWK': 'KABHREPALANCHOK',
      'KAVRE': 'KABHREPALANCHOK',
      'CHITWAN': 'CHITAWAN',
      'MAKWANPUR': 'MAKAWANPUR',
      'DHANUSA': 'DHANUSHA',
      'KAPILVASTU': 'KAPILBASTU',
      // Nawalparasi split districts
      'NAWALPARASI': 'NAWALPARASI4', // Default to East
      'NAWALPARASI (BARDAGHAT SUSTA EAST)': 'NAWALPARASI4',
      'NAWALPARASI (BARDAGHAT SUSTA WEST)': 'NAWALPARASI5',
      'PARASI': 'NAWALPARASI4',
      'NAWALPUR': 'NAWALPARASI5',
      // Rukum split districts
      'RUKUM': 'RUKUM5', // Default to West
      'RUKUM EAST': 'RUKUM6',
      'RUKUM WEST': 'RUKUM5',
      'RUKUM (EAST)': 'RUKUM6',
      'RUKUM (WEST)': 'RUKUM5',
    };
    return mapping[normalized] || normalized;
  };

  // Create a map of district name to case count
  const districtCaseMap = useMemo(() => {
    const map: Record<string, DistrictCaseData> = {};
    casesByDistrict.forEach(item => {
      // Normalize district name for matching
      const normalized = normalizeDistrictName(item.district);
      // If district already exists, aggregate the counts
      if (map[normalized]) {
        map[normalized] = {
          district: normalized,
          total: (map[normalized].total || 0) + (item.total || 0),
          registered: (map[normalized].registered || 0) + (item.registered || 0),
          under_investigation: (map[normalized].under_investigation || 0) + (item.under_investigation || 0),
          chargesheet: (map[normalized].chargesheet || 0) + (item.chargesheet || 0),
          closed: (map[normalized].closed || 0) + (item.closed || 0),
        };
      } else {
        map[normalized] = { ...item, district: normalized };
      }
    });
    return map;
  }, [casesByDistrict]);

  // Get case count for a district based on filter
  const getCaseCount = (districtName: string): number => {
    const normalized = normalizeDistrictName(districtName);
    const data = districtCaseMap[normalized];
    if (!data) return 0;
    
    switch (statusFilter) {
      case 'Registered':
        return data.registered || 0;
      case 'Under Investigation':
        return data.under_investigation || 0;
      case 'Charge Sheet Filed':
        return data.chargesheet || 0;
      case 'Closed':
        return data.closed || 0;
      default:
        return data.total || 0;
    }
  };

  // Get color based on case count
  const getColor = (count: number): string => {
    if (count === 0) return '#e2e8f0'; // slate-200
    if (count <= 2) return '#bfdbfe'; // blue-200
    if (count <= 5) return '#93c5fd'; // blue-300
    if (count <= 10) return '#60a5fa'; // blue-400
    if (count <= 20) return '#3b82f6'; // blue-500
    if (count <= 50) return '#2563eb'; // blue-600
    return '#1d4ed8'; // blue-700
  };

  // Style function for each district
  const styleFeature = (feature: any) => {
    const districtName = feature?.properties?.TARGET || feature?.properties?.DISTRICT || feature?.properties?.name;
    const count = getCaseCount(districtName);
    const isHovered = hoveredDistrict === districtName;
    
    return {
      fillColor: getColor(count),
      weight: isHovered ? 2 : 1,
      opacity: 1,
      color: isHovered ? '#0c2340' : '#64748b',
      fillOpacity: isHovered ? 0.9 : 0.7,
    };
  };

  // Event handlers for each feature
  const onEachFeature = (feature: any, layer: any) => {
    const districtName = feature?.properties?.TARGET || feature?.properties?.DISTRICT || feature?.properties?.name;
    const normalized = normalizeDistrictName(districtName);
    const caseData = districtCaseMap[normalized];
    const count = getCaseCount(districtName);

    layer.on({
      mouseover: () => {
        setHoveredDistrict(districtName);
        layer.setStyle({
          weight: 2,
          color: '#0c2340',
          fillOpacity: 0.9,
        });
      },
      mouseout: () => {
        setHoveredDistrict(null);
        layer.setStyle(styleFeature(feature));
      },
    });

    // Tooltip content
    const tooltipContent = `
      <div class="p-2">
        <div class="font-bold text-[#0c2340]">${districtName}</div>
        <div class="text-sm text-slate-600 mt-1">
          ${statusFilter === 'all' ? `Total Cases: ${count}` : `${statusFilter}: ${count}`}
        </div>
        ${caseData ? `
          <div class="text-xs text-slate-500 mt-1 border-t pt-1">
            <div>Registered: ${caseData.registered || 0}</div>
            <div>Under Investigation: ${caseData.under_investigation || 0}</div>
            <div>Charge Sheet Filed: ${caseData.chargesheet || 0}</div>
            <div>Closed: ${caseData.closed || 0}</div>
          </div>
        ` : ''}
      </div>
    `;

    layer.bindTooltip(tooltipContent, {
      permanent: false,
      direction: 'auto',
      className: 'district-tooltip',
    });
  };

  if (!isClient) {
    return (
      <div className="h-[400px] bg-slate-100 rounded-2xl flex items-center justify-center">
        <div className="text-slate-500">Loading map...</div>
      </div>
    );
  }

  if (!geoData) {
    return (
      <div className="h-[400px] bg-slate-100 rounded-2xl flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading Nepal map...
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Legend */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-xl shadow-lg p-3 border border-slate-200">
        <div className="text-xs font-semibold text-[#0c2340] mb-2">Cases Count</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#e2e8f0' }}></div>
            <span className="text-xs text-slate-600">0</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#bfdbfe' }}></div>
            <span className="text-xs text-slate-600">1-2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#93c5fd' }}></div>
            <span className="text-xs text-slate-600">3-5</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#60a5fa' }}></div>
            <span className="text-xs text-slate-600">6-10</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
            <span className="text-xs text-slate-600">11-20</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2563eb' }}></div>
            <span className="text-xs text-slate-600">21-50</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1d4ed8' }}></div>
            <span className="text-xs text-slate-600">50+</span>
          </div>
        </div>
      </div>

      {/* Hovered District Info */}
      {hoveredDistrict && (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-xl shadow-lg p-3 border border-slate-200">
          <div className="font-semibold text-[#0c2340]">{hoveredDistrict}</div>
          <div className="text-sm text-slate-600">
            Cases: {getCaseCount(hoveredDistrict)}
          </div>
        </div>
      )}

      <MapContainer
        center={[28.3949, 84.124]}
        zoom={7}
        style={{ height: '400px', width: '100%', borderRadius: '1rem', zIndex: 1 }}
        scrollWheelZoom={false}
        dragging={true}
        doubleClickZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          key={`${statusFilter}-${JSON.stringify(casesByDistrict)}`}
          data={geoData}
          style={styleFeature}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      <style jsx global>{`
        .district-tooltip {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
          padding: 0 !important;
        }
        .district-tooltip .leaflet-tooltip-tip {
          display: none;
        }
      `}</style>
    </div>
  );
}
