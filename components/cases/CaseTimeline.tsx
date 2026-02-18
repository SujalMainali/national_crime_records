'use client';

import { useState, useEffect } from 'react';

interface TimelineEvent {
    id: number;
    track_date_time: string;
    action_type: string;
    old_status?: string;
    new_status?: string;
    action_description?: string;
    username: string;
    first_name?: string;
    last_name?: string;
    rank?: string;
    badge_number?: string;
}

export default function CaseTimeline({ caseId }: { caseId: number }) {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const res = await fetch(`/api/cases/${caseId}/tracking`);
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data.data);
                }
            } catch (err) {
                console.error("Failed to load timeline", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTimeline();
    }, [caseId]);



    if (loading) return (
        <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            {events.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <div className="text-4xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-slate-700 mb-2">No History Recorded</h3>
                    <p className="text-slate-500">No tracking records for this case yet.</p>
                </div>
            ) : (
                <>
                    {/* Summary bar */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-700">{events.length} Event{events.length > 1 ? 's' : ''}</span>
                    </div>

                    {/* Timeline Table */}
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-100 text-slate-700 text-xs border-b border-slate-200">
                                    <th className="px-4 py-3 text-left font-semibold">Action</th>
                                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                                    <th className="px-4 py-3 text-left font-semibold">Change</th>
                                    <th className="px-4 py-3 text-left font-semibold">Date &amp; Time</th>
                                    <th className="px-4 py-3 text-left font-semibold">Performed By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {events.map((event) => (
                                    <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="text-xs px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700 whitespace-nowrap">
                                                {event.action_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700 max-w-sm">
                                            <p className="line-clamp-2">{event.action_description || '—'}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {event.old_status && event.new_status ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded border bg-slate-100 text-slate-400 line-through border-slate-200">
                                                        {event.old_status}
                                                    </span>
                                                    <svg className="w-3 h-3 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-300 bg-slate-50 text-slate-700 font-semibold uppercase">
                                                        {event.new_status}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                                            <span className="font-mono">
                                                {new Date(event.track_date_time).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 flex-shrink-0">
                                                    {event.first_name ? event.first_name.charAt(0) : event.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
                                                    {event.first_name ? `${event.rank || ''} ${event.first_name} ${event.last_name}` : event.username}
                                                </span>
                                            </div>
                                            {event.badge_number && (
                                                <p className="text-[10px] text-slate-400 mt-0.5 ml-8">Badge: {event.badge_number}</p>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
