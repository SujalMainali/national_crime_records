'use client';

import { useState, useEffect } from 'react';

interface Evidence {
    id: number;
    evidence_code: string;
    evidence_type: string;
    description: string;
    collected_date_time: string;
    collected_by_name?: string;
    collected_by_rank?: string;
    file_path?: string;
    status: string;
}

function getMediaType(filePath: string): 'image' | 'video' | 'audio' | 'document' | 'unknown' {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg', 'aac', 'webm', 'm4a'].includes(ext)) return 'audio';
    if (['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'].includes(ext)) return 'document';
    return 'unknown';
}

function getFileName(filePath: string): string {
    return filePath.split('/').pop() || filePath;
}

export default function CaseEvidence({ caseId }: { caseId: number }) {
    const [evidence, setEvidence] = useState<Evidence[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewItem, setPreviewItem] = useState<Evidence | null>(null);

    useEffect(() => {
        const fetchEvidence = async () => {
            try {
                const res = await fetch(`/api/evidence?case_id=${caseId}`);
                if (res.ok) {
                    const data = await res.json();
                    setEvidence(data.data || []);
                }
            } catch (err) {
                console.error('Failed to load evidence:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvidence();
    }, [caseId]);



    // Render preview modal content
    const renderPreviewContent = (item: Evidence) => {
        if (!item.file_path) return null;
        const mediaType = getMediaType(item.file_path);
        const effectiveType = mediaType !== 'unknown' ? mediaType
            : item.evidence_type === 'Photo' ? 'image'
            : item.evidence_type === 'Video' ? 'video'
            : item.evidence_type === 'Audio' ? 'audio'
            : item.evidence_type === 'Document' ? 'document'
            : mediaType;

        switch (effectiveType) {
            case 'image':
                return <img src={item.file_path} alt={item.description} className="max-w-full max-h-[75vh] object-contain rounded-lg" />;
            case 'video':
                return <video src={item.file_path} controls className="max-w-full max-h-[75vh] rounded-lg" />;
            case 'audio':
                return (
                    <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-700">{getFileName(item.file_path)}</p>
                        <audio src={item.file_path} controls className="w-80" />
                    </div>
                );
            case 'document':
                const ext = item.file_path.split('.').pop()?.toLowerCase();
                if (ext === 'pdf') {
                    return <iframe src={item.file_path} className="w-[80vw] max-w-4xl h-[75vh] rounded-lg border-0" title={item.evidence_code} />;
                }
                return (
                    <div className="bg-white rounded-xl p-8 text-center">
                        <p className="text-slate-600 mb-4">Preview not available for this file type.</p>
                        <a href={item.file_path} target="_blank" rel="noopener noreferrer" className="text-slate-700 font-medium hover:text-slate-900 underline">Open in new tab</a>
                    </div>
                );
            default:
                return (
                    <div className="bg-white rounded-xl p-8 text-center">
                        <p className="text-slate-600 mb-4">Preview not available for this file type.</p>
                        <a href={item.file_path} target="_blank" rel="noopener noreferrer" className="text-slate-700 font-medium hover:text-slate-900 underline">Open in new tab</a>
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Preview Modal */}
            {previewItem && previewItem.file_path && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setPreviewItem(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/40 rounded-full p-2 z-10"
                        onClick={() => setPreviewItem(null)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div onClick={(e) => e.stopPropagation()}>
                        {renderPreviewContent(previewItem)}
                    </div>
                </div>
            )}

            {evidence.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-slate-700 mb-2">No Evidence Recorded</h3>
                    <p className="text-slate-500">Use &ldquo;Modify FIR&rdquo; → &ldquo;Add Evidence&rdquo; to log evidence for this case</p>
                </div>
            ) : (
                <>
                    {/* Summary bar */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-700">{evidence.length} Evidence Item{evidence.length > 1 ? 's' : ''}</span>
                    </div>

                    {/* Evidence Table */}
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-100 text-slate-700 text-xs border-b border-slate-200">
                                    <th className="px-4 py-3 text-left font-semibold">Code</th>
                                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold">Collected</th>
                                    <th className="px-4 py-3 text-left font-semibold">File</th>
                                    <th className="px-4 py-3 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {evidence.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-800">{item.evidence_code}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700">
                                                {item.evidence_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700 max-w-xs">
                                            <p className="line-clamp-2">{item.description}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 font-medium">
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                                            {item.collected_date_time
                                                ? new Date(item.collected_date_time).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                                : '—'}
                                            {item.collected_by_name && (
                                                <p className="text-[10px] text-slate-400 mt-0.5">{item.collected_by_rank} {item.collected_by_name}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">
                                            {item.file_path ? (
                                                <span className="text-slate-600 truncate block max-w-[120px]" title={getFileName(item.file_path)}>
                                                    {getFileName(item.file_path)}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic">No file</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.file_path ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setPreviewItem(item)}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                                                        title="Preview"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        Preview
                                                    </button>
                                                    <a
                                                        href={item.file_path}
                                                        download
                                                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                                                        title="Download"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        Download
                                                    </a>
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 text-xs text-center block">—</span>
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
