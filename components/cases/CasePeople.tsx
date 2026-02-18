'use client';

import { useState, useEffect } from 'react';

interface Person {
    link_id: number;
    person_id: number;
    first_name: string;
    last_name: string;
    role: string;
    is_primary: boolean;
    photo?: string;
    gender?: string;
    contact_number?: string;
    statement?: string; // Initial statement from case_persons
    signature?: string; // Base64 signature blob
}

interface SupplementaryStatement {
    id: number;
    case_person_id: number;
    statement: string;
    statement_date: string;
    remarks?: string;
    recorded_by_username?: string;
    recorded_by_first_name?: string;
    recorded_by_last_name?: string;
    recorded_by_rank?: string;
}

export default function CasePeople({ caseId }: { caseId: number }) {
    const [people, setPeople] = useState<Person[]>([]);
    const [supplementaryStatements, setSupplementaryStatements] = useState<SupplementaryStatement[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedStatements, setExpandedStatements] = useState<number[]>([]);

    const fetchPeople = async () => {
        try {
            const res = await fetch(`/api/cases/${caseId}/persons`);
            if (res.ok) {
                const data = await res.json();
                setPeople(data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSupplementaryStatements = async () => {
        try {
            const res = await fetch(`/api/cases/${caseId}/supplementary-statements`);
            if (res.ok) {
                const data = await res.json();
                setSupplementaryStatements(data.data || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchPeople(), fetchSupplementaryStatements()]);
            setLoading(false);
        };
        loadData();
    }, [caseId]);

    const toggleStatements = (linkId: number) => {
        setExpandedStatements(prev => 
            prev.includes(linkId) 
                ? prev.filter(id => id !== linkId)
                : [...prev, linkId]
        );
    };

    // Get supplementary statements for a specific case_person
    const getSupplementaryForPerson = (linkId: number) => {
        return supplementaryStatements.filter(s => s.case_person_id === linkId);
    };

    const complainants = people.filter(p => p.role === 'Complainant');
    const others = people.filter(p => p.role !== 'Complainant');

    if (loading) return <div className="p-8 text-center text-slate-500">Loading people...</div>;

    return (
        <div className="space-y-6">
            {people.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <div className="text-4xl mb-4">👥</div>
                    <h3 className="text-lg font-medium text-slate-700 mb-2">No People Recorded</h3>
                    <p className="text-slate-500">Use &ldquo;Modify FIR&rdquo; → &ldquo;Add Person&rdquo; to add people to this case</p>
                </div>
            ) : (
                <>
                    {/* Summary bar */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-700">{people.length} Person{people.length > 1 ? 's' : ''}</span>
                    </div>

                    {/* People Table */}
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-100 text-slate-700 text-xs border-b border-slate-200">
                                    <th className="px-4 py-3 text-left font-semibold">Photo</th>
                                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                                    <th className="px-4 py-3 text-left font-semibold">Role</th>
                                    <th className="px-4 py-3 text-left font-semibold">Gender</th>
                                    <th className="px-4 py-3 text-left font-semibold">Contact</th>
                                    <th className="px-4 py-3 text-left font-semibold">Statements</th>
                                    <th className="px-4 py-3 text-left font-semibold">Signature</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {people.map((person) => {
                                    const personSupplementary = getSupplementaryForPerson(person.link_id);
                                    const hasInitial = !!person.statement;
                                    const totalStatements = (hasInitial ? 1 : 0) + personSupplementary.length;
                                    const isExpanded = expandedStatements.includes(person.link_id);

                                    return (
                                        <tr key={person.link_id} className="hover:bg-slate-50 transition-colors align-top">
                                            <td className="px-4 py-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden border border-slate-200">
                                                    {person.photo ? (
                                                        <img src={person.photo} alt="Person" className="w-full h-full object-cover" />
                                                    ) : '👤'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-slate-800">{person.first_name} {person.last_name}</p>
                                                {person.is_primary && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">Primary</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700">
                                                    {person.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600">{person.gender || '—'}</td>
                                            <td className="px-4 py-3 text-xs text-slate-600">{person.contact_number || '—'}</td>
                                            <td className="px-4 py-3 max-w-sm">
                                                {totalStatements === 0 ? (
                                                    <span className="text-xs text-slate-400 italic">None</span>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {hasInitial && (
                                                            <div className="bg-slate-50 p-2 rounded border border-slate-200">
                                                                <p className="text-[10px] text-slate-500 font-semibold uppercase mb-0.5">Initial Statement</p>
                                                                <p className="text-slate-700 text-xs italic line-clamp-2">&ldquo;{person.statement}&rdquo;</p>
                                                            </div>
                                                        )}
                                                        {(isExpanded ? personSupplementary : personSupplementary.slice(0, 1)).map((stmt) => (
                                                            <div key={stmt.id} className="bg-slate-50 p-2 rounded border border-slate-200">
                                                                <div className="flex items-center justify-between mb-0.5">
                                                                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Supplementary</p>
                                                                    <p className="text-[10px] text-slate-400 font-mono">{new Date(stmt.statement_date).toLocaleDateString()}</p>
                                                                </div>
                                                                <p className="text-slate-700 text-xs italic line-clamp-2">&ldquo;{stmt.statement}&rdquo;</p>
                                                                {stmt.recorded_by_first_name && (
                                                                    <p className="text-[10px] text-slate-500 mt-1">By: {stmt.recorded_by_rank} {stmt.recorded_by_first_name} {stmt.recorded_by_last_name}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {personSupplementary.length > 1 && (
                                                            <button
                                                                onClick={() => toggleStatements(person.link_id)}
                                                                className="text-[10px] text-slate-500 hover:text-slate-700 font-medium transition-colors"
                                                            >
                                                                {isExpanded ? 'Collapse' : `+ ${personSupplementary.length - 1} more`}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {person.signature ? (
                                                    <div className="border border-slate-200 rounded-lg p-1 bg-white inline-block">
                                                        <img src={person.signature} alt="Signature" className="h-8 object-contain" />
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
