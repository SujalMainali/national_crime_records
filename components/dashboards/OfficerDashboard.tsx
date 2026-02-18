'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SessionUser } from '@/lib/types';

// Dynamic import for map (no SSR)
const NepalDistrictMap = dynamic(
  () => import('./NepalDistrictMap'),
  {
    ssr: false, loading: () => (
      <div className="h-[400px] bg-slate-100 rounded-2xl flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading map...
        </div>
      </div>
    )
  }
);

interface DashboardProps {
  user: SessionUser;
  stats: any;
}

interface StationInfo {
  id: number;
  station_code: string;
  station_name: string;
  state_province: string;
  district: string;
  municipality: string;
  ward_no: string;
  phone: string;
  email: string;
  jurisdiction_area: string;
  established_date: string;
  is_active: boolean;
  photo: string;
  incharge_name: string;
  incharge_rank: string;
}

export default function OfficerDashboard({ user, stats }: DashboardProps) {
  const [station, setStation] = useState<StationInfo | null>(null);
  const [loadingStation, setLoadingStation] = useState(true);
  const [mapStatusFilter, setMapStatusFilter] = useState('all');

  useEffect(() => {
    if (user.station_id) {
      fetch(`/api/stations/${user.station_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setStation(data.data);
        })
        .catch(err => console.error('Failed to load station:', err))
        .finally(() => setLoadingStation(false));
    }
  }, [user.station_id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] p-6 rounded-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Officer Dashboard</h1>
            <p className="text-slate-300 mt-2">
              {station ? station.station_name : `Station ID: ${user.station_id}`}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl">
            <div className="w-10 h-10 bg-[#d4a853] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user.username}</p>
              <p className="text-slate-300 text-xs">Police Officer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Station Info Banner */}
      {!loadingStation && station && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {station.photo ? (
              <img src={station.photo} alt={station.station_name} className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
            ) : (
              <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-[#0c2340]">{station.station_name}</h2>
              <p className="text-sm text-slate-500">{station.district}, {station.state_province}</p>
              {station.incharge_name && (
                <p className="text-sm text-slate-600 mt-1">Incharge: <span className="font-medium">{station.incharge_rank} {station.incharge_name}</span></p>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              {station.phone && (
                <span className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {station.phone}
                </span>
              )}
              {station.email && (
                <span className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {station.email}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0c2340] to-[#1e3a5f] rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">Station Cases</div>
              <div className="text-3xl font-bold text-[#0c2340] mt-1">{stats?.totalCases || 0}</div>
            </div>
          </div>
        </div>

        {stats?.casesByStatus?.slice(0, 3).map((item: any) => (
          <div key={item.status} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0c2340] to-[#1e3a5f] rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500">{item.status}</div>
                <div className="text-3xl font-bold text-[#0c2340] mt-1">{parseInt(item.count)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions - Case focused */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6">
        <h2 className="text-lg font-semibold text-[#0c2340] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/cases/new" className="bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#2d4a6f] p-4 rounded-xl flex items-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg">
            <div className="p-2 bg-white/10 rounded-lg text-[#d4a853]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <div>
              <div className="font-bold text-white">Register FIR</div>
              <div className="text-xs text-slate-300">New Incident Report</div>
            </div>
          </Link>

          <Link href="/evidence/new" className="bg-slate-50 hover:bg-slate-100 p-4 rounded-xl border border-slate-200 flex items-center gap-3 transition-colors">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <div>
              <div className="font-semibold text-[#0c2340]">Log Evidence</div>
              <div className="text-xs text-slate-500">Add items to case</div>
            </div>
          </Link>

          <Link href="/persons/new" className="bg-slate-50 hover:bg-slate-100 p-4 rounded-xl border border-slate-200 flex items-center gap-3 transition-colors">
            <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            </div>
            <div>
              <div className="font-semibold text-[#0c2340]">Add Person</div>
              <div className="text-xs text-slate-500">Suspects/Victims/Witnesses</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Cases */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0c2340]">Recent Cases at My Station</h2>
          <Link href="/cases" className="text-sm font-medium text-[#0c2340] hover:text-[#1e3a5f]">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">FIR No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentCases?.length > 0 ? stats.recentCases.map((caseItem: any) => (
                <tr key={caseItem.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-[#0c2340]">{caseItem.fir_number}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{caseItem.crime_type}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#0c2340]/10 text-[#0c2340]">
                      {caseItem.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      caseItem.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                      caseItem.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                      caseItem.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {caseItem.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(caseItem.registered_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <Link href={`/cases/${caseItem.id}`} className="text-[#0c2340] hover:text-[#1e3a5f] font-medium">Details</Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No cases found. Register a new FIR to get started.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nepal District Map */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0c2340]">Nepal Crime Map</h2>
            <p className="text-sm text-slate-500 mt-1">Cases distribution across districts</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Filter:</span>
            <select
              value={mapStatusFilter}
              onChange={(e) => setMapStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-[#0c2340] focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30"
            >
              <option value="all">All Cases</option>
              <option value="Registered">Registered</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Charge Sheet Filed">Charge Sheet Filed</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="p-4">
          <NepalDistrictMap
            casesByDistrict={stats?.casesByDistrict || []}
            statusFilter={mapStatusFilter}
          />
        </div>
      </div>
    </div>
  );
}
