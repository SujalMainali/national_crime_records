'use client';

import { useState, useRef } from 'react';

export default function AddEvidenceForm({ caseId, onSuccess, onCancel }: { caseId: number, onSuccess: () => void, onCancel: () => void }) {
    const [submitting, setSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        evidence_code: '',
        evidence_type: 'Physical',
        description: '',
        file_path: ''
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setPreviewType(file.type.split('/')[0]); // image, video, audio, application
        }
    };

    const clearFile = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setSelectedFile(null);
        setPreviewUrl(null);
        setPreviewType('');
        setFormData(prev => ({ ...prev, file_path: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (!formData.description) return;
        setSubmitting(true);
        try {
            // Upload file first if selected
            let uploadedFilePath = '';
            if (selectedFile) {
                const uploadForm = new FormData();
                uploadForm.append('file', selectedFile);
                uploadForm.append('category', 'evidence');
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadForm });
                const uploadData = await uploadRes.json();
                if (!uploadData.success) {
                    throw new Error(uploadData.message || 'Failed to upload file');
                }
                uploadedFilePath = uploadData.data.url;
            }

            const res = await fetch('/api/evidence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    case_id: caseId,
                    ...formData,
                    file_path: uploadedFilePath || formData.file_path || null,
                    collected_by: null
                })
            });

            if (res.ok) {
                onSuccess();
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to add evidence');
            }
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Error adding evidence');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-xs text-slate-500 font-bold uppercase">Evidence Code</span>
                    <input
                        type="text"
                        placeholder="Auto-generated if empty"
                        className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[#1e3a5f] text-sm focus:ring-2 focus:ring-[#0c2340]/30"
                        value={formData.evidence_code}
                        onChange={e => setFormData({ ...formData, evidence_code: e.target.value })}
                    />
                </label>
                <label className="block">
                    <span className="text-xs text-slate-500 font-bold uppercase">Type</span>
                    <select
                        className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[#1e3a5f] text-sm focus:ring-2 focus:ring-[#0c2340]/30"
                        value={formData.evidence_type}
                        onChange={e => setFormData({ ...formData, evidence_type: e.target.value })}
                    >
                        <option value="Physical">Physical Object</option>
                        <option value="Digital">Digital / File</option>
                        <option value="Document">Document</option>
                        <option value="Forensic">Forensic Sample</option>
                        <option value="Photo">Photograph</option>
                        <option value="Video">Video Recording</option>
                        <option value="Audio">Audio Recording</option>
                        <option value="Other">Other</option>
                    </select>
                </label>
            </div>

            <label className="block">
                <span className="text-xs text-slate-500 font-bold uppercase">Description <span className="text-red-500">*</span></span>
                <textarea
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[#1e3a5f] text-sm h-24 resize-none focus:ring-2 focus:ring-[#0c2340]/30"
                    placeholder="Describe the evidence item..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
            </label>

            {/* File Upload */}
            <div>
                <span className="text-xs text-slate-500 font-bold uppercase">Attach File (Optional)</span>
                <div className="mt-1 flex items-center gap-3">
                    {previewUrl ? (
                        <div className="relative">
                            {previewType === 'image' ? (
                                <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                            ) : previewType === 'video' ? (
                                <div className="w-20 h-20 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl">🎥</span>
                                </div>
                            ) : previewType === 'audio' ? (
                                <div className="w-20 h-20 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl">🎵</span>
                                </div>
                            ) : (
                                <div className="w-20 h-20 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl">📄</span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={clearFile}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs"
                            >
                                ✕
                            </button>
                        </div>
                    ) : null}
                    <div className="flex-1">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                            onChange={handleFileChange}
                            className="hidden"
                            id="inline-evidence-upload"
                        />
                        <label
                            htmlFor="inline-evidence-upload"
                            className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-white border border-dashed border-slate-300 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-[#0c2340] cursor-pointer text-sm transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            {selectedFile ? 'Change File' : 'Upload Image / Video / Audio / Document'}
                        </label>
                        {selectedFile && (
                            <p className="text-xs text-green-600 mt-1 truncate">✓ {selectedFile.name}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-2">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm text-slate-500 hover:text-[#0c2340]"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={submitting || !formData.description}
                    className="px-6 py-2 bg-[#d4a853] hover:bg-[#b8923f] text-white rounded-lg text-sm font-bold shadow-lg disabled:opacity-50"
                >
                    {submitting ? 'Uploading & Adding...' : 'Add Evidence'}
                </button>
            </div>
        </div>
    );
}
