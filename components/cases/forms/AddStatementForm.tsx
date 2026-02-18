'use client';

import { useState, useEffect } from 'react';

interface CasePerson {
    link_id: number;
    person_id: number;
    first_name: string;
    last_name: string;
    role: string;
    statement?: string;
    photo?: string;
}

export default function AddStatementForm({ 
    caseId, 
    onSuccess, 
    onCancel 
}: { 
    caseId: number, 
    onSuccess: () => void, 
    onCancel: () => void 
}) {
    const [casePersons, setCasePersons] = useState<CasePerson[]>([]);
    const [filteredPersons, setFilteredPersons] = useState<CasePerson[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPerson, setSelectedPerson] = useState<CasePerson | null>(null);
    const [statement, setStatement] = useState('');
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch persons linked to this case
    useEffect(() => {
        const fetchPersons = async () => {
            try {
                const res = await fetch(`/api/cases/${caseId}/persons`);
                if (res.ok) {
                    const data = await res.json();
                    setCasePersons(data.data);
                    setFilteredPersons(data.data);
                }
            } catch (err) {
                console.error('Failed to load case persons:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPersons();
    }, [caseId]);

    // Filter persons based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredPersons(casePersons);
        } else {
            const term = searchTerm.toLowerCase();
            setFilteredPersons(
                casePersons.filter(p => 
                    p.first_name.toLowerCase().includes(term) ||
                    p.last_name.toLowerCase().includes(term) ||
                    p.role.toLowerCase().includes(term)
                )
            );
        }
    }, [searchTerm, casePersons]);

    const handleSubmit = async () => {
        if (!selectedPerson || !statement.trim()) return;
        
        setSubmitting(true);
        try {
            const res = await fetch(`/api/cases/${caseId}/supplementary-statements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    case_person_id: selectedPerson.link_id,
                    statement: statement.trim(),
                    remarks: remarks.trim() || null
                })
            });

            if (res.ok) {
                onSuccess();
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to add supplementary statement');
            }
        } catch (err) {
            console.error(err);
            alert('Error adding supplementary statement');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="py-8 text-center text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0c2340] mx-auto mb-2"></div>
                Loading case persons...
            </div>
        );
    }

    if (casePersons.length === 0) {
        return (
            <div className="py-8 text-center">
                <div className="text-yellow-500 mb-2">⚠️</div>
                <p className="text-slate-600">No persons are linked to this case yet.</p>
                <p className="text-sm text-slate-400 mt-1">Add a person first before recording supplementary statements.</p>
                <button
                    onClick={onCancel}
                    className="mt-4 px-4 py-2 text-sm text-slate-500 hover:text-[#0c2340]"
                >
                    Close
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search Box */}
            <div>
                <label className="block text-xs text-slate-500 font-bold uppercase mb-2">
                    Search Person in Case
                </label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name or role..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-[#1e3a5f] focus:ring-2 focus:ring-[#0c2340]/30 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Person Selection */}
            <div>
                <label className="block text-xs text-slate-500 font-bold uppercase mb-3">
                    Select Person ({filteredPersons.length} found)
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {filteredPersons.map(person => (
                        <div
                            key={person.link_id}
                            onClick={() => setSelectedPerson(person)}
                            className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                                selectedPerson?.link_id === person.link_id
                                    ? 'bg-[#0c2340]/10 border-[#0c2340] ring-1 ring-[#0c2340]'
                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                    {person.photo ? (
                                        <img src={person.photo} className="w-full h-full rounded-full object-cover" alt="" />
                                    ) : '👤'}
                                </div>
                                <div>
                                    <p className="text-[#0c2340] font-medium">
                                        {person.first_name} {person.last_name}
                                    </p>
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                        person.role === 'Complainant' ? 'bg-red-100 text-red-700' :
                                        person.role === 'Accused' ? 'bg-orange-100 text-orange-700' :
                                        person.role === 'Witness' ? 'bg-green-100 text-green-700' :
                                        person.role === 'Victim' ? 'bg-purple-100 text-purple-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {person.role}
                                    </span>
                                </div>
                            </div>
                            {selectedPerson?.link_id === person.link_id && (
                                <svg className="w-5 h-5 text-[#0c2340]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Statement Input */}
            {selectedPerson && (
                <div className="animate-fade-in border-t border-slate-200 pt-4">
                    <div className="mb-3 p-3 bg-[#0c2340]/5 rounded-lg border border-[#0c2340]/20">
                        <p className="text-xs text-[#1e3a5f]">
                            Recording supplementary statement for: <strong className="text-[#0c2340]">{selectedPerson.first_name} {selectedPerson.last_name}</strong>
                            <span className="ml-2 text-slate-500">({selectedPerson.role})</span>
                        </p>
                    </div>

                    <label className="block mb-4">
                        <span className="text-xs text-slate-500 font-bold uppercase">Supplementary Statement <span className="text-red-500">*</span></span>
                        <textarea
                            className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#1e3a5f] focus:ring-2 focus:ring-[#0c2340]/30 outline-none h-32 resize-none"
                            placeholder="Enter the person's supplementary statement or testimony..."
                            value={statement}
                            onChange={e => setStatement(e.target.value)}
                        />
                    </label>

                    <label className="block">
                        <span className="text-xs text-slate-500 font-bold uppercase">Remarks (Optional)</span>
                        <input
                            type="text"
                            className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[#1e3a5f] focus:ring-2 focus:ring-[#0c2340]/30 outline-none"
                            placeholder="E.g., Follow-up interview, Additional details about incident..."
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                        />
                    </label>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm text-slate-500 hover:text-[#0c2340]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !statement.trim()}
                            className="px-6 py-2 bg-[#0c2340] hover:bg-[#1e3a5f] text-white rounded-lg text-sm font-bold shadow-lg disabled:opacity-50"
                        >
                            {submitting ? 'Recording...' : 'Record Supplementary Statement'}
                        </button>
                    </div>
                </div>
            )}

            {/* Cancel button when no person selected */}
            {!selectedPerson && (
                <div className="flex justify-end pt-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-slate-500 hover:text-[#0c2340]"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}
