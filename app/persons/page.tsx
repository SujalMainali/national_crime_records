'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PersonsPage() {
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPersons();
  }, [search]);

  const fetchPersons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await fetch(`/api/persons?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setPersons(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch persons:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0c2340]">Persons</h1>
          <p className="text-slate-500 mt-1">Manage all persons in the system</p>
        </div>
        <Link
          href="/persons/new"
          className="flex items-center gap-2 bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#2d4a6f] text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-lg hover:scale-[1.02]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add New Person
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, national ID, or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[#0c2340] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100"
          />
        </div>
      </div>

      {/* Persons Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 text-slate-500">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading persons...
            </div>
          </div>
        ) : persons.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No persons found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    National ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {persons.map((person) => (
                  <tr key={person.id} className="hover:bg-slate-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/persons/${person.id}`}
                        className="text-sm font-medium text-[#0c2340] hover:text-[#1e3a5f] transition-colors flex items-center gap-2"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-[#0c2340] to-[#1e3a5f] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                          {person.first_name.charAt(0)}{person.last_name.charAt(0)}
                        </div>
                        {person.first_name} {person.middle_name} {person.last_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0c2340]">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        person.gender === 'Male' ? 'bg-blue-500/20 text-[#1e3a5f] border border-blue-400/30' :
                        person.gender === 'Female' ? 'bg-pink-100 text-pink-700 border border-pink-200' :
                        'bg-purple-100 text-purple-700 border border-purple-200'
                      }`}>
                        {person.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {person.national_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {person.contact_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {person.city || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <Link
                        href={`/persons/${person.id}`}
                        className="text-[#0c2340] hover:text-[#1e3a5f] transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        href={`/persons/${person.id}/edit`}
                        className="text-green-600 hover:text-green-700 transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}





