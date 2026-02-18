'use client';

import { useState } from 'react';

interface Person {
    id: number;
    first_name: string;
    last_name: string;
    contact_number: string;
    photo?: string;
}

export default function AddPersonForm({ caseId, onSuccess, onCancel }: { caseId: number, onSuccess: () => void, onCancel: () => void }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Person[]>([]);
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [newLink, setNewLink] = useState({
        role: '',
        is_primary: false,
        statement: ''
    });

    const searchPersons = async () => {
        if (!searchTerm.trim()) return;
        try {
            const res = await fetch(`/api/persons/search?q=${encodeURIComponent(searchTerm)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLinkPerson = async () => {
        if (!selectedPerson || !newLink.role) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/cases/${caseId}/persons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    person_id: selectedPerson.id,
                    ...newLink
                })
            });

            if (res.ok) {
                onSuccess();
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to link person');
            }
        } catch (err) {
            console.error(err);
            alert('Error linking person');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Search Section */}
            <div>
                <label className="block text-xs text-slate-500 font-bold uppercase mb-2">Search Existing Persons</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search by name, citizenship, or phone..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#1e3a5f] focus:ring-2 focus:ring-[#0c2340]/30 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        onClick={searchPersons}
                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-[#0c2340] rounded-xl font-bold border border-slate-200 transition-all"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Results Grid */}
            {searchResults.length > 0 && (
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {searchResults.map(p => (
                        <div
                            key={p.id}
                            onClick={() => setSelectedPerson(p)}
                            className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${selectedPerson?.id === p.id
                                ? 'bg-[#0c2340]/10 border-[#0c2340] ring-1 ring-[#0c2340]'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                {p.photo ? <img src={p.photo} className="w-full h-full rounded-full object-cover" /> : '👤'}
                            </div>
                            <div>
                                <p className="text-[#0c2340] text-sm font-bold">{p.first_name} {p.last_name}</p>
                                <p className="text-xs text-slate-500">{p.contact_number}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Selection Form */}
            {selectedPerson && (
                <div className="space-y-4 animate-fade-in border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                        <span>Selected: <strong className="text-[#0c2340]">{selectedPerson.first_name} {selectedPerson.last_name}</strong></span>
                        <button onClick={() => setSelectedPerson(null)} className="text-xs hover:text-[#0c2340]">Change</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-xs text-slate-500 font-bold uppercase">Role</span>
                            <select
                                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[#1e3a5f] text-sm focus:ring-2 focus:ring-[#0c2340]/30 outline-none"
                                value={newLink.role}
                                onChange={e => setNewLink({ ...newLink, role: e.target.value })}
                            >
                                <option value="">Select Role...</option>
                                <option value="Complainant">Complainant</option>
                                <option value="Accused">Accused</option>
                                <option value="Suspect">Suspect</option>
                                <option value="Witness">Witness</option>
                                <option value="Victim">Victim</option>
                            </select>
                        </label>
                        <label className="block flex items-center h-full pt-6">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-slate-300 bg-slate-50 text-[#0c2340] focus:ring-[#0c2340]/30"
                                checked={newLink.is_primary}
                                onChange={e => setNewLink({ ...newLink, is_primary: e.target.checked })}
                            />
                            <span className="ml-3 text-[#0c2340] font-medium text-sm">Is Primary?</span>
                        </label>
                    </div>
                    <label className="block">
                        <span className="text-xs text-slate-500 font-bold uppercase">Statement (Optional)</span>
                        <textarea
                            className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[#1e3a5f] text-sm focus:ring-2 focus:ring-[#0c2340]/30 outline-none h-20 resize-none"
                            placeholder="Initial statement..."
                            value={newLink.statement}
                            onChange={e => setNewLink({ ...newLink, statement: e.target.value })}
                        ></textarea>
                    </label>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm text-slate-500 hover:text-[#0c2340]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleLinkPerson}
                            disabled={submitting || !newLink.role}
                            className="px-6 py-2 bg-[#0c2340] hover:bg-[#1e3a5f] text-white rounded-lg text-sm font-bold shadow-lg disabled:opacity-50"
                        >
                            {submitting ? 'Adding...' : 'Add Person'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
